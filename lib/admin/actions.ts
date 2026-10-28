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

async function uploadImage(db: Db, folder: string, file: File): Promise<{ path?: string; error?: string }> {
  const ext = TYPES[file.type];
  if (!ext) return { error: `"${file.name}" is not a JPEG, PNG or WebP image.` };
  if (file.size > MAX_BYTES) return { error: `"${file.name}" is larger than 5 MB.` };
  const path = `${folder}/${randomUUID()}.${ext}`;
  const { error } = await db.storage.from("media").upload(path, file, { contentType: file.type });
  return error ? { error: `Upload failed: ${error.message}` } : { path };
}

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
      const file = form.get(`file:${f.name}`);
      if (file instanceof File && file.size > 0) {
        const up = await uploadImage(db, res.key, file);
        if (up.error) return fail(up.error);
        payload[f.name] = up.path;
      } else if (form.get(`remove:${f.name}`) === "on") payload[f.name] = null;
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
      const { count } = await db.from("artwork_images").select("id", { count: "exact", head: true }).eq("artwork_id", recordId);
      let order = count ?? 0;
      for (const file of files) {
        const up = await uploadImage(db, "artworks", file);
        if (up.error) return fail(`Artwork saved, but ${up.error}`);
        const { error: e } = await db.from("artwork_images").insert({
          artwork_id: recordId, storage_path: up.path, alt: String(payload.title ?? ""), is_main: order === 0, sort_order: order,
        });
        if (e) return fail(`Artwork saved, but image record failed: ${e.message}`);
        order += 1;
      }
    }
  }

  refresh();
  redirect(`/admin/${res.key}`);
}

export async function deleteRecord(form: FormData): Promise<void> {
  const { db } = await requireAdmin();
  const res = getResource(String(form.get("_resource")));
  if (!res) throw new Error("Unknown content type.");
  const { error } = await db.from(res.table).delete().eq("id", String(form.get("_id")));
  if (error) throw new Error(`Could not delete: ${error.message}`);
  refresh();
  redirect(`/admin/${res.key}`);
}

export async function setStatus(form: FormData): Promise<void> {
  const { db } = await requireAdmin();
  const res = getResource(String(form.get("_resource")));
  const status = form.get("_status") === "published" ? "published" : "draft";
  if (!res?.hasStatus) throw new Error("Unknown content type.");
  const { error } = await db.from(res.table).update({ status }).eq("id", String(form.get("_id")));
  if (error) throw new Error(`Could not change status: ${error.message}`);
  refresh();
  redirect(`/admin/${res.key}`);
}

export async function deleteArtworkImage(form: FormData): Promise<void> {
  const { db } = await requireAdmin();
  const imageId = String(form.get("_image"));
  const { data } = await db.from("artwork_images").select("storage_path").eq("id", imageId).maybeSingle();
  const { error } = await db.from("artwork_images").delete().eq("id", imageId);
  if (error) throw new Error(`Could not delete image: ${error.message}`);
  if (data?.storage_path) await db.storage.from("media").remove([data.storage_path as string]);
  refresh();
  redirect(`/admin/artworks/${String(form.get("_artwork"))}`);
}

export async function setMainImage(form: FormData): Promise<void> {
  const { db } = await requireAdmin();
  const artworkId = String(form.get("_artwork"));
  const a = await db.from("artwork_images").update({ is_main: false }).eq("artwork_id", artworkId);
  const b = await db.from("artwork_images").update({ is_main: true }).eq("id", String(form.get("_image")));
  if (a.error || b.error) throw new Error("Could not set the main image.");
  refresh();
  redirect(`/admin/artworks/${artworkId}`);
}

const URL_FIELDS = ["instagram", "facebook", "youtube", "tiktok", "linkedin"] as const;
const lines = (v: FormDataEntryValue | null) => String(v ?? "").split("\n").map((s) => s.trim()).filter(Boolean);

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
  const virtual = text("virtual_tour_url");
  if (virtual && !/^https?:\/\//.test(virtual)) return fail("Virtual tour link must start with https://");
  const year = text("established_year");
  if (year && !/^\d{4}$/.test(year)) return fail("Established year must be 4 digits.");
  const templ = text("whatsapp_artwork_template");
  if (!templ.includes("{title}")) return fail("The artwork message must contain {title}.");

  const imagePatch: Record<string, string | null> = {};
  for (const key of ["logo", "hero_image", "tile_auctions", "tile_exhibitions", "tile_artworks", "tile_tour"]) {
    const file = form.get(`file:${key}`);
    if (file instanceof File && file.size > 0) {
      const up = await uploadImage(db, "site", file);
      if (up.error) return fail(up.error);
      imagePatch[`${key}_path`] = up.path ?? null;
    } else if (form.get(`remove:${key}`) === "on") imagePatch[`${key}_path`] = null;
  }

  const { error } = await db.from("website_settings").update({
    site_name: text("site_name") || "Signature Beyond", established_year: year ? Number(year) : null,
    home_heading: text("home_heading"), home_intro: text("home_intro"), about_summary: text("about_summary"),
    whatsapp_number: whatsapp, whatsapp_default_message: text("whatsapp_default_message"), whatsapp_artwork_template: templ,
    primary_email: text("primary_email"), additional_emails: lines(form.get("additional_emails")),
    phone_numbers: lines(form.get("phone_numbers")), address: text("address"), virtual_tour_url: virtual, social, ...imagePatch,
  }).eq("id", 1);
  if (error) return fail(`Could not save settings: ${error.message}`);
  refresh();
  return { ok: true, message: "Settings saved." };
}

export async function login(_prev: { error: string }, form: FormData): Promise<{ error: string }> {
  if (isDemoMode) return { error: "Demo mode: connect Supabase to enable login." };
  const db = await createClient();
  const { error } = await db.auth.signInWithPassword({ email: String(form.get("email") ?? ""), password: String(form.get("password") ?? "") });
  if (error) return { error: "Wrong email or password." };
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
  redirect(`/admin/legal/${key}`);
}
