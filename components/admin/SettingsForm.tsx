"use client";
import { useActionState } from "react";
import { saveSettings, type FormState } from "@/lib/admin/actions";
import type { WebsiteSettings } from "@/types";

const input = "w-full rounded border border-stone-300 bg-white px-3 py-2 text-sm";
const initial: FormState = { ok: false, message: "" };

function F({ id, label, help, children }: { id: string; label: string; help?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs text-stone-600">{label}</label>
      {children}
      {help && <p className="mt-1 text-xs text-stone-500">{help}</p>}
    </div>
  );
}

export function SettingsForm({ s }: { s: WebsiteSettings }) {
  const [state, action, pending] = useActionState(saveSettings, initial);
  const t = (id: string, v: string | number | null, type = "text") => <input id={id} name={id} type={type} defaultValue={v ?? ""} className={input} />;
  const area = (id: string, v: string, rows = 3) => <textarea id={id} name={id} rows={rows} defaultValue={v} className={input} />;

  return (
    <form action={action} className="max-w-2xl space-y-8">
      <section className="space-y-4">
        <h2 className="font-serif text-xl">WhatsApp</h2>
        <F id="whatsapp_number" label="WhatsApp number" help="Digits only, with the country code. Example: 2348012345678. Leave empty to hide all WhatsApp buttons.">{t("whatsapp_number", s.whatsappNumber)}</F>
        <F id="whatsapp_default_message" label="Default message (floating button)">{area("whatsapp_default_message", s.whatsappDefaultMessage)}</F>
        <F id="whatsapp_artwork_template" label="Artwork enquiry message" help="Use {title} for the artwork name and {artist} for the artist. Keep the words ' by {artist}' together.">{area("whatsapp_artwork_template", s.whatsappArtworkTemplate)}</F>
      </section>
      <section className="space-y-4">
        <h2 className="font-serif text-xl">Contact</h2>
        <F id="primary_email" label="Primary email">{t("primary_email", s.primaryEmail, "email")}</F>
        <F id="additional_emails" label="Other emails (one per line)">{area("additional_emails", s.additionalEmails.join("\n"))}</F>
        <F id="phone_numbers" label="Phone numbers (one per line)">{area("phone_numbers", s.phoneNumbers.join("\n"))}</F>
        <F id="address" label="Address">{area("address", s.address)}</F>
      </section>
      <section className="space-y-4">
        <h2 className="font-serif text-xl">Social media</h2>
        <p className="text-xs text-stone-500">Full links starting with https://. Empty ones are hidden on the website.</p>
        {(["instagram", "facebook", "youtube", "tiktok", "linkedin"] as const).map((k) => (
          <F key={k} id={`social_${k}`} label={k[0].toUpperCase() + k.slice(1)}>{t(`social_${k}`, s.social[k], "url")}</F>
        ))}
      </section>
      <section className="space-y-4">
        <h2 className="font-serif text-xl">Homepage and general</h2>
        <F id="site_name" label="Website name">{t("site_name", s.siteName)}</F>
        <F id="established_year" label="Year established (leave empty to hide)">{t("established_year", s.establishedYear)}</F>
        <F id="home_heading" label="Homepage heading">{t("home_heading", s.homeHeading)}</F>
        <F id="home_intro" label="Homepage introduction">{area("home_intro", s.homeIntro)}</F>
        <F id="about_summary" label="About text">{area("about_summary", s.aboutSummary, 6)}</F>
        <F id="logo" label="Logo" help="A PNG with a transparent background works best (the header is dark). If none is uploaded, the default logo is used.">
          {s.logoUrl && (
            <div className="mb-2 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.logoUrl} alt="Current logo" className="h-16 w-auto rounded bg-ink p-1" />
              <label className="text-xs"><input type="checkbox" name="remove:logo" /> Remove (use the default logo)</label>
            </div>
          )}
          <input id="logo" type="file" name="file:logo" accept="image/jpeg,image/png,image/webp" className="text-sm" />
        </F>
        <F id="hero_image" label="Homepage hero photo" help="JPEG, PNG or WebP, up to 5 MB. Wide photos work best. If none is uploaded, the default photo is used.">
          {s.heroImageUrl && (
            <div className="mb-2 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.heroImageUrl} alt="Current hero" className="h-16 w-28 rounded object-cover" />
              <label className="text-xs"><input type="checkbox" name="remove:hero_image" /> Remove (use the default photo)</label>
            </div>
          )}
          <input id="hero_image" type="file" name="file:hero_image" accept="image/jpeg,image/png,image/webp" className="text-sm" />
        </F>
        {([
          ["tile_auctions", "Auctions tile photo", s.tileImages.auctions],
          ["tile_exhibitions", "Exhibitions tile photo", s.tileImages.exhibitions],
          ["tile_artworks", "Featured Artworks tile photo", s.tileImages.artworks],
          ["tile_tour", "Virtual Tour tile photo", s.tileImages.tour],
        ] as const).map(([name, label, url]) => (
          <F key={name} id={name} label={label} help="Shown on the four tiles under the homepage hero. JPEG, PNG or WebP, up to 5 MB.">
            {url && (
              <div className="mb-2 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="Current" className="h-16 w-24 rounded object-cover" />
                <label className="text-xs"><input type="checkbox" name={`remove:${name}`} /> Remove</label>
              </div>
            )}
            <input id={name} type="file" name={`file:${name}`} accept="image/jpeg,image/png,image/webp" className="text-sm" />
          </F>
        ))}
        <F id="virtual_tour_url" label="Virtual tour link (leave empty to hide the tile)">{t("virtual_tour_url", s.virtualTourUrl, "url")}</F>
      </section>
      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending} className="rounded bg-ink px-5 py-2 text-sm text-white disabled:opacity-60">{pending ? "Saving..." : "Save settings"}</button>
        {state.message && <p role="alert" className={`text-sm ${state.ok ? "text-green-800" : "text-red-700"}`}>{state.message}</p>}
      </div>
    </form>
  );
}
