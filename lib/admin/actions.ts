"use server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { getResource } from "@/lib/admin/resources";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { SITE_URL } from "@/lib/site";
import { isDemoMode } from "@/lib/services";
import { LEGAL_DEFAULTS, isLegalKey } from "@/lib/content/legal";

export interface FormState { ok: boolean; message: string }
const fail = (message: string): FormState => ({ ok: false, message });
const refresh = () => revalidatePath("/", "layout");

const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MAX_BYTES = 5 * 1024 * 1024;

type Db = Awaited<ReturnType<typeof createClient>>;

/** Where to go after an action: the page it came from (admin only), with a notice for the toast. */
function back(form: FormData, fallback: string, notice: string): string {
  const raw = String(form.get("_return") ?? "");
  const base = /^\/admin(\/|\?|$)/.test(raw) && !raw.startsWith("//") ? raw : fallback;
  return `${base}${base.includes("?") ? "&" : "?"}notice=${notice}`;
}

async function uploadImage(db: Db, folder: string, file: File): Promise<{ path?: string; error?: string }> {
  const ext = TYPES[file.type];
  if (!ext) return { error: `"${file.name}" is not a JPEG, PNG or WebP image.` };
  if (file.size > MAX_BYTES) return { error: `"${file.name}" is larger than 5 MB.` };
  const path = `${folder}/${randomUUID()}.${ext}`;
  const { error } = await db.storage.from("media").upload(path, file, { contentType: file.type });
  return error ? { error: `Upload failed: ${error.message}` } : { path };
}

/** Uploads file:<key> if one was chosen, or clears the column when remove:<key> is ticked. Returns the patch. */
async function imagePatch(db: Db, form: FormData, folder: string, keys: string[], column = (k: string) => `${k}_path`) {
  const patch: Record<string, string | null> = {};
  for (const key of keys) {
    const file = form.get(`file:${key}`);
    if (file instanceof File && file.size > 0) {
      const up = await uploadImage(db, folder, file);
      if (up.error) return { error: up.error };
      patch[column(key)] = up.path ?? null;
    } else if (form.get(`remove:${key}`) === "on") patch[column(key)] = null;
  }
  return { patch };
}

// Content records ------------------------------------------------------------

export async function saveRecord(_prev: FormState, form: FormData): Promise<FormState> {
  if (isDemoMode) return fail("Demo mode: nothing can be saved. Connect Supabase first.");
  const { db } = await requireAdmin();
  const res = getResource(String(form.get("_resource")));
  if (!res) return fail("Unknown content type.");
  const id = String(form.get("_id") || "");

  const payload: Record<string, unknown> = {};
  for (const f of res.fields) {
    if (f.type === "checkbox") { payload[f.name] = form.get(f.name) === "on"; continue; }
    if (f.type === "image") {
      const up = await imagePatch(db, form, res.key, [f.name], (k) => k);
      if (up.error) return fail(up.error);
      Object.assign(payload, up.patch);
      continue;
    }
    const raw = String(form.get(f.name) ?? "").trim();
    if (f.required && !raw) return fail(`${f.label} is required.`);
    if (raw && f.pattern && !new RegExp(f.pattern).test(raw)) return fail(f.patternMessage ?? `${f.label} is not in the right format.`);
    if (f.type === "number") {
      const n = Number(raw);
      if (raw && !Number.isFinite(n)) return fail(`${f.label} must be a number.`);
      payload[f.name] = raw ? n : null;
    } else payload[f.name] = raw || (f.notNull ? "" : null);
  }
  if (res.hasSlug) {
    const slug = slugify(String(payload.slug || payload[res.titleField] || ""));
    if (!slug) return fail("Could not create a web address. Please enter a title.");
    payload.slug = slug;
  }

  const query = id
    ? db.from(res.table).update(payload).eq("id", id).select("id").single()
    : db.from(res.table).insert(payload).select("id").single();
  const { data, error } = await query;
  if (error) return fail(error.code === "23505" ? "That web address (slug) is already used. Please change it." : `Could not save: ${error.message}`);
  const recordId = (data as { id: string }).id;

  for (const l of res.links ?? []) {
    const ids = form.getAll(`link:${l.table}`).map(String);
    const del = await db.from(l.table).delete().eq(l.parentCol, recordId);
    if (del.error) return fail(`Saved, but linking failed: ${del.error.message}`);
    if (ids.length) {
      const ins = await db.from(l.table).insert(ids.map((cid) => ({ [l.parentCol]: recordId, [l.childCol]: cid })));
      if (ins.error) return fail(`Saved, but linking failed: ${ins.error.message}`);
    }
  }

  if (res.gallery) {
    const files = form.getAll("gallery").filter((f): f is File => f instanceof File && f.size > 0);
    if (files.length) {
      const { data: existing } = await db.from("artwork_images").select("sort_order").eq("artwork_id", recordId).order("sort_order", { ascending: false }).limit(1);
      const hasImages = (existing ?? []).length > 0;
      let order = hasImages ? Number((existing as { sort_order: number }[])[0].sort_order) + 1 : 0;
      for (const file of files) {
        const up = await uploadImage(db, "artworks", file);
        if (up.error) return fail(`Saved, but ${up.error}`);
        const { error: e } = await db.from("artwork_images").insert({
          artwork_id: recordId, storage_path: up.path, alt: String(payload.title ?? ""), is_main: !hasImages && order === 0, sort_order: order,
        });
        if (e) return fail(`Saved, but the image record failed: ${e.message}`);
        order += 1;
      }
    }
  }

  refresh();
  redirect(`/admin/${res.key}/${recordId}?notice=${id ? "saved" : "created"}`);
}

export async function deleteRecord(form: FormData): Promise<void> {
  const { db } = await requireAdmin();
  const res = getResource(String(form.get("_resource")));
  if (!res) throw new Error("Unknown content type.");
  const { error } = await db.from(res.table).delete().eq("id", String(form.get("_id")));
  if (error) throw new Error(`Could not delete: ${error.message}`);
  refresh();
  redirect(`/admin/${res.key}?notice=deleted`);
}

export async function setStatus(form: FormData): Promise<void> {
  const { db } = await requireAdmin();
  const res = getResource(String(form.get("_resource")));
  const status = form.get("_status") === "published" ? "published" : "draft";
  if (!res?.hasStatus) throw new Error("Unknown content type.");
  const { error } = await db.from(res.table).update({ status }).eq("id", String(form.get("_id")));
  if (error) throw new Error(`Could not change status: ${error.message}`);
  refresh();
  redirect(back(form, `/admin/${res.key}`, status === "published" ? "published" : "unpublished"));
}

/** Publish, unpublish or delete several records at once (list page checkboxes). */
export async function bulkAction(form: FormData): Promise<void> {
  const { db } = await requireAdmin();
  const res = getResource(String(form.get("_resource")));
  if (!res) throw new Error("Unknown content type.");
  const ids = form.getAll("ids").map(String).filter(Boolean);
  const op = String(form.get("_op"));
  if (ids.length === 0) redirect(back(form, `/admin/${res.key}`, "bulk"));
  if (op === "delete") {
    const { error } = await db.from(res.table).delete().in("id", ids);
    if (error) throw new Error(`Could not delete: ${error.message}`);
  } else if ((op === "published" || op === "draft") && res.hasStatus) {
    const { error } = await db.from(res.table).update({ status: op }).in("id", ids);
    if (error) throw new Error(`Could not update: ${error.message}`);
  } else throw new Error("Unknown action.");
  refresh();
  redirect(back(form, `/admin/${res.key}`, "bulk"));
}

// Artwork images -------------------------------------------------------------

export async function deleteArtworkImage(form: FormData): Promise<void> {
  const { db } = await requireAdmin();
  const imageId = String(form.get("_image"));
  const artworkId = String(form.get("_artwork"));
  const { data } = await db.from("artwork_images").select("storage_path, is_main").eq("id", imageId).maybeSingle();
  const { error } = await db.from("artwork_images").delete().eq("id", imageId);
  if (error) throw new Error(`Could not delete image: ${error.message}`);
  if (data?.storage_path) await db.storage.from("media").remove([data.storage_path as string]);
  // Keep a main image: promote the first remaining one if the main image was deleted.
  if (data?.is_main) {
    const { data: next } = await db.from("artwork_images").select("id").eq("artwork_id", artworkId).order("sort_order").limit(1);
    if (next?.[0]) await db.from("artwork_images").update({ is_main: true }).eq("id", (next[0] as { id: string }).id);
  }
  refresh();
  redirect(`/admin/artworks/${artworkId}?notice=image-deleted#images`);
}

export async function setMainImage(form: FormData): Promise<void> {
  const { db } = await requireAdmin();
  const artworkId = String(form.get("_artwork"));
  const a = await db.from("artwork_images").update({ is_main: false }).eq("artwork_id", artworkId);
  const b = await db.from("artwork_images").update({ is_main: true }).eq("id", String(form.get("_image")));
  if (a.error || b.error) throw new Error("Could not set the main image.");
  refresh();
  redirect(`/admin/artworks/${artworkId}?notice=image-updated#images`);
}

export async function updateImageAlt(form: FormData): Promise<void> {
  const { db } = await requireAdmin();
  const artworkId = String(form.get("_artwork"));
  const alt = String(form.get("alt") ?? "").trim().slice(0, 300);
  const { error } = await db.from("artwork_images").update({ alt }).eq("id", String(form.get("_image")));
  if (error) throw new Error(`Could not save the description: ${error.message}`);
  refresh();
  redirect(`/admin/artworks/${artworkId}?notice=image-updated#images`);
}

/** Moves an image one place earlier or later by swapping sort_order with its neighbour. */
export async function moveImage(form: FormData): Promise<void> {
  const { db } = await requireAdmin();
  const artworkId = String(form.get("_artwork"));
  const imageId = String(form.get("_image"));
  const dir = form.get("_dir") === "up" ? -1 : 1;
  const { data } = await db.from("artwork_images").select("id, sort_order").eq("artwork_id", artworkId).order("sort_order");
  const list = ((data ?? []) as { id: string; sort_order: number }[]).map((r, i) => ({ ...r, sort_order: i }));
  const i = list.findIndex((r) => r.id === imageId);
  const j = i + dir;
  if (i >= 0 && j >= 0 && j < list.length) {
    [list[i], list[j]] = [list[j], list[i]];
    for (const [k, r] of list.entries()) await db.from("artwork_images").update({ sort_order: k }).eq("id", r.id);
    refresh();
  }
  redirect(`/admin/artworks/${artworkId}?notice=image-updated#images`);
}

// Settings and homepage -------------------------------------------------------

const URL_FIELDS = ["facebook", "twitter", "instagram", "youtube", "tiktok", "linkedin"] as const;
const lines = (v: FormDataEntryValue | null) => String(v ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
const isSiteOrHttps = (v: string) => /^(\/(?!\/)|https:\/\/)/.test(v);

/** Website settings: name, about text, logo, contact, WhatsApp and social links. The homepage has its own form. */
export async function saveSettings(_prev: FormState, form: FormData): Promise<FormState> {
  if (isDemoMode) return fail("Demo mode: nothing can be saved. Connect Supabase first.");
  const { db } = await requireAdmin();
  const text = (k: string) => String(form.get(k) ?? "").trim();

  const whatsapp = text("whatsapp_number").replace(/[\s+()-]/g, "");
  if (whatsapp && !/^\d{8,15}$/.test(whatsapp)) return fail("WhatsApp number must be digits only with the country code, e.g. 2348012345678.");
  const emails = [text("primary_email"), ...lines(form.get("additional_emails"))].filter(Boolean);
  if (emails.some((e) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))) return fail("One of the email addresses is not valid.");
  const social: Record<string, string> = {};
  for (const k of URL_FIELDS) {
    const v = text(`social_${k}`);
    if (v && !/^https?:\/\//.test(v)) return fail(`${k} link must start with https://`);
    social[k] = v;
  }
  const year = text("established_year");
  if (year && !/^\d{4}$/.test(year)) return fail("Established year must be 4 digits.");
  const templ = text("whatsapp_artwork_template");
  if (!templ.includes("{title}")) return fail("The artwork message must contain {title}.");

  const images = await imagePatch(db, form, "site", ["logo"]);
  if (images.error) return fail(images.error);

  const { error } = await db.from("website_settings").update({
    site_name: text("site_name") || "Signature Beyond", established_year: year ? Number(year) : null, about_summary: text("about_summary"),
    whatsapp_number: whatsapp, whatsapp_default_message: text("whatsapp_default_message"), whatsapp_artwork_template: templ,
    primary_email: text("primary_email"), additional_emails: lines(form.get("additional_emails")),
    phone_numbers: lines(form.get("phone_numbers")), address: text("address"), social, ...images.patch,
  }).eq("id", 1);
  if (error) return fail(`Could not save settings: ${error.message}`);
  refresh();
  return { ok: true, message: "Settings saved. The website is updated." };
}

/** Homepage: split hero (text, two images, buttons), section fallback images and the virtual tour link. */
export async function saveHomepage(_prev: FormState, form: FormData): Promise<FormState> {
  if (isDemoMode) return fail("Demo mode: nothing can be saved. Connect Supabase first.");
  const { db } = await requireAdmin();
  const text = (k: string, max = 300) => String(form.get(k) ?? "").trim().slice(0, max);

  const heading = text("home_heading", 160);
  if (!heading) return fail("The hero heading is required.");
  const links = [["hero_primary", "Main button"], ["hero_secondary", "Second button"]] as const;
  for (const [k, label] of links) {
    const l = text(`${k}_label`, 60);
    const h = text(`${k}_href`);
    if (l && !h) return fail(`${label}: add a link, or clear the button text.`);
    if (h && !isSiteOrHttps(h)) return fail(`${label}: the link must start with / (a page on this site) or https://`);
  }
  const tour = text("virtual_tour_url");
  if (tour && !/^https:\/\//.test(tour)) return fail("Virtual tour link must start with https://");

  const layout = form.get("hero_layout") === "image-left" ? "image-left" : "image-right";
  const tone = ["light", "bone", "dark"].includes(String(form.get("hero_tone"))) ? String(form.get("hero_tone")) : "light";

  const images = await imagePatch(db, form, "site", ["hero_image_right", "tile_auctions", "tile_exhibitions", "tile_tour"]);
  if (images.error) return fail(images.error);
  // The hero shows hero_image_right, falling back to the older hero_image. Removing it clears both,
  // so the default photo really comes back.
  if (images.patch && "hero_image_right_path" in images.patch && images.patch.hero_image_right_path === null) images.patch.hero_image_path = null;

  const { error } = await db.from("website_settings").update({
    hero_eyebrow: text("hero_eyebrow", 60), home_heading: heading, home_intro: text("home_intro", 400),
    hero_image_right_alt: text("hero_image_right_alt"), hero_layout: layout, hero_tone: tone,
    hero_primary_label: text("hero_primary_label", 60), hero_primary_href: text("hero_primary_href"),
    hero_secondary_label: text("hero_secondary_label", 60), hero_secondary_href: text("hero_secondary_href"),
    virtual_tour_url: tour, ...images.patch,
  }).eq("id", 1);
  if (error) {
    return fail(/column .* does not exist/i.test(error.message)
      ? "The database needs an update: run supabase/migrations/005_hero_layout.sql (and 003 if you have not) in the Supabase SQL Editor, then save again."
      : `Could not save the homepage: ${error.message}`);
  }
  refresh();
  return { ok: true, message: "Homepage saved. The live homepage is updated." };
}

// Authentication --------------------------------------------------------------

export async function login(_prev: { error: string }, form: FormData): Promise<{ error: string }> {
  if (isDemoMode) return { error: "Demo mode: connect Supabase to enable login." };
  const db = await createClient();
  const email = String(form.get("email") ?? "").trim();
  const { error } = await db.auth.signInWithPassword({ email, password: String(form.get("password") ?? "") });
  if (error) {
    // Name the cases an admin can fix; everything else stays generic so accounts cannot be probed.
    if (error.code === "email_not_confirmed") return { error: "This account's email is not confirmed yet. Run supabase/migrations/002_make_first_admin.sql (it confirms the account), or confirm the user in Supabase > Authentication > Users." };
    if (error.status === 429) return { error: "Too many attempts. Please wait a minute and try again." };
    if (error.code !== "invalid_credentials") return { error: `Sign-in failed: ${error.message}` };
    return { error: "Wrong email or password." };
  }
  redirect("/admin");
}

export async function logout(): Promise<void> {
  const db = await createClient();
  await db.auth.signOut();
  redirect("/admin/login");
}

export async function requestPasswordReset(_prev: FormState, form: FormData): Promise<FormState> {
  if (isDemoMode) return fail("Demo mode: connect Supabase to enable password reset.");
  const email = String(form.get("email") ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Please enter a valid email address.");
  const origin = (await headers()).get("origin") ?? SITE_URL;
  const db = await createClient();
  const { error } = await db.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/admin/auth/callback` });
  if (error) return fail(`Could not send the email: ${error.message}`);
  // Same message whether or not the email has an account, so nobody can probe for accounts.
  return { ok: true, message: "If that email belongs to an account, a reset link has been sent. Check your inbox and spam folder." };
}

/** The reset email also contains a one-time code; entering it signs the person in to choose a new password. */
export async function verifyResetCode(_prev: FormState, form: FormData): Promise<FormState> {
  if (isDemoMode) return fail("Demo mode: connect Supabase to enable password reset.");
  const email = String(form.get("email") ?? "").trim();
  const token = String(form.get("code") ?? "").replace(/\s/g, "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Please enter the email the code was sent to.");
  if (!/^\d{6,10}$/.test(token)) return fail("The code is the number in the email (usually 6 digits).");
  const db = await createClient();
  const { error } = await db.auth.verifyOtp({ email, token, type: "recovery" });
  if (error) return fail("That code is wrong or has expired. Request a new email and use the newest code.");
  redirect("/admin/reset-password");
}

export async function updatePassword(_prev: { error: string }, form: FormData): Promise<{ error: string }> {
  const password = String(form.get("password") ?? "");
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== String(form.get("confirm") ?? "")) return { error: "The two passwords do not match." };
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return { error: "This reset link has expired. Please request a new one." };
  const { error } = await db.auth.updateUser({ password });
  if (error) return { error: error.message };
  await db.auth.signOut();
  redirect("/admin/login?reset=1");
}

// Enquiries ---------------------------------------------------------------------

export async function markEnquiryRead(id: string): Promise<void> {
  const { db } = await requireAdmin();
  const { error } = await db.from("enquiries").update({ handled: true }).eq("id", id);
  if (error) throw new Error(`Could not update the notification: ${error.message}`);
  revalidatePath("/admin", "layout");
}

export async function markAllEnquiriesRead(): Promise<void> {
  const { db } = await requireAdmin();
  const { error } = await db.from("enquiries").update({ handled: true }).eq("handled", false);
  if (error) throw new Error(`Could not update notifications: ${error.message}`);
  revalidatePath("/admin", "layout");
}

export async function setEnquiryHandled(form: FormData): Promise<void> {
  const { db } = await requireAdmin();
  const handled = form.get("_handled") === "true";
  const { error } = await db.from("enquiries").update({ handled }).eq("id", String(form.get("_id")));
  if (error) throw new Error(`Could not update the enquiry: ${error.message}`);
  revalidatePath("/admin", "layout");
  redirect(back(form, "/admin/enquiries", "saved"));
}

export async function deleteEnquiry(form: FormData): Promise<void> {
  const { db } = await requireAdmin();
  const { error } = await db.from("enquiries").delete().eq("id", String(form.get("_id")));
  if (error) throw new Error(`Could not delete the enquiry: ${error.message}`);
  revalidatePath("/admin", "layout");
  redirect(back(form, "/admin/enquiries", "deleted"));
}

// Legal pages -------------------------------------------------------------------

export async function saveLegalPage(_prev: FormState, form: FormData): Promise<FormState> {
  if (isDemoMode) return fail("Demo mode: nothing can be saved. Connect Supabase first.");
  const { db } = await requireAdmin();
  const key = String(form.get("_key") ?? "");
  if (!isLegalKey(key)) return fail("Unknown page.");

  const title = String(form.get("title") ?? "").trim();
  const content = String(form.get("content") ?? "").replace(/\r\n?/g, "\n").trim();
  const date = String(form.get("last_updated") ?? "").trim();
  if (!title) return fail("Title is required.");
  if (!content) return fail("The page text cannot be empty. To go back to the original wording, use \"Restore original wording\".");
  if (content.length > 60000) return fail("The page text is too long (limit 60,000 characters).");
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return fail("Last updated must be a valid date.");

  // "upsert" = update the page if it exists, create it if it does not. Either way the page ends up saved.
  const { error } = await db.from("legal_pages").upsert({
    page_key: key, title, content, last_updated: date || null,
    show_draft_notice: form.get("show_draft_notice") === "on", updated_at: new Date().toISOString(),
  }, { onConflict: "page_key" });
  if (error) return fail(`Could not save: ${error.message}`);
  refresh();
  return { ok: true, message: "Saved. The live page now shows this text." };
}

/** Removes the saved version, so the page goes back to the wording built into the website. */
export async function restoreLegalPage(form: FormData): Promise<void> {
  const { db } = await requireAdmin();
  const key = String(form.get("_key") ?? "");
  if (!isLegalKey(key) || !LEGAL_DEFAULTS[key]) throw new Error("Unknown page.");
  const { error } = await db.from("legal_pages").delete().eq("page_key", key);
  if (error) throw new Error(`Could not restore: ${error.message}`);
  refresh();
  redirect(`/admin/legal/${key}?notice=saved`);
}
