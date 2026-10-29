"use client";
import { useActionState, useRef, useState, type KeyboardEvent } from "react";
import { saveSettings, type FormState } from "@/lib/admin/actions";
import type { WebsiteSettings } from "@/types";
import { Card, Field, Notice, btn, inputClass } from "./ui";
import { ImageDropzone } from "./ImageDropzone";
import { useUnsavedGuard } from "./useUnsavedGuard";

const initial: FormState = { ok: false, message: "" };
const TABS = [
  { id: "general", label: "General" },
  { id: "brand", label: "Brand" },
  { id: "contact", label: "Contact" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "social", label: "Social media" },
] as const;
type Tab = (typeof TABS)[number]["id"];

export function SettingsForm({ s }: { s: WebsiteSettings }) {
  const [state, action, pending] = useActionState(saveSettings, initial);
  const [tab, setTab] = useState<Tab>("general");
  const [dirty, setDirty] = useState(false);
  const [lastState, setLastState] = useState(state);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  useUnsavedGuard(dirty && !pending);

  if (state !== lastState) {
    setLastState(state);
    if (state.ok) setDirty(false);
  }

  const t = (id: string, v: string | number | null, type = "text", extra: Record<string, unknown> = {}) => (
    <input id={id} name={id} type={type} defaultValue={v ?? ""} className={inputClass} {...extra} />
  );
  const area = (id: string, v: string, rows = 3) => <textarea id={id} name={id} rows={rows} defaultValue={v} className={inputClass} />;

  // Arrow keys move between tabs (WAI-ARIA tabs pattern).
  const onTabKey = (e: KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const next = (i + (e.key === "ArrowRight" ? 1 : -1) + TABS.length) % TABS.length;
    setTab(TABS[next].id);
    tabRefs.current[next]?.focus();
  };

  // Every panel stays in the form (hidden ones too), so one Save stores all tabs.
  const panel = (id: Tab, children: React.ReactNode) => (
    <div role="tabpanel" id={`panel-${id}`} aria-labelledby={`tab-${id}`} hidden={tab !== id} className="space-y-6">
      {children}
    </div>
  );

  return (
    <form action={action} onInput={() => setDirty(true)} onChange={() => setDirty(true)} className="space-y-6">
      <div className="sticky top-16 z-10 -mx-4 flex flex-wrap items-end gap-3 border-b border-stone-200 bg-stone-50/95 px-4 pt-3 backdrop-blur sm:-mx-8 sm:px-8">
        <div role="tablist" aria-label="Settings sections" className="flex flex-1 gap-5 overflow-x-auto">
          {TABS.map((x, i) => (
            <button
              key={x.id}
              ref={(el) => { tabRefs.current[i] = el; }}
              id={`tab-${x.id}`}
              type="button"
              role="tab"
              aria-selected={tab === x.id}
              aria-controls={`panel-${x.id}`}
              tabIndex={tab === x.id ? 0 : -1}
              onClick={() => setTab(x.id)}
              onKeyDown={(e) => onTabKey(e, i)}
              className={`whitespace-nowrap border-b-2 px-1 pb-3 text-sm transition-colors ${tab === x.id ? "border-brand font-medium text-stone-800" : "border-transparent text-stone-500 hover:text-stone-800"}`}
            >
              {x.label}
            </button>
          ))}
        </div>
        <div className="mb-2.5 flex items-center gap-3">
          {dirty && <span className="text-xs text-amber-700">Unsaved changes</span>}
          <button type="submit" disabled={pending} className={btn("primary")}>{pending ? "Saving…" : "Save settings"}</button>
        </div>
      </div>

      {state.message && <Notice tone={state.ok ? "success" : "error"}>{state.message}</Notice>}

      {panel("general", (
        <Card title="General" description="Used across the website: page titles, the footer, the About page and the homepage heritage section.">
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="site_name" label="Website name">{t("site_name", s.siteName)}</Field>
              <Field id="established_year" label="Year established" help="Leave empty to hide it.">{t("established_year", s.establishedYear, "text", { inputMode: "numeric", maxLength: 4 })}</Field>
            </div>
            <Field id="about_summary" label="About the gallery" help="Shown on the About page and the homepage. The footer uses its first sentence. Leave a blank line between paragraphs.">
              {area("about_summary", s.aboutSummary, 8)}
            </Field>
          </div>
        </Card>
      ))}

      {panel("brand", (
        <Card title="Logo" description="A PNG with a transparent background works best: it sits on the light header and the dark footer.">
          <div className="max-w-sm">
            <ImageDropzone name="logo" currentUrl={s.logoUrl || null} emptyHint="Until you upload one, the built-in logo is used." aspect="aspect-[16/9]" />
          </div>
        </Card>
      ))}

      {panel("contact", (
        <Card title="Contact details" description="Shown in the footer, on the Contact page and in the legal pages. Empty ones are hidden.">
          <div className="space-y-5">
            <Field id="primary_email" label="Main email">{t("primary_email", s.primaryEmail, "email")}</Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="additional_emails" label="Other emails" help="One per line.">{area("additional_emails", s.additionalEmails.join("\n"))}</Field>
              <Field id="phone_numbers" label="Phone numbers" help="One per line, with the country code.">{area("phone_numbers", s.phoneNumbers.join("\n"))}</Field>
            </div>
            <Field id="address" label="Gallery address" help="Line breaks are kept.">{area("address", s.address, 3)}</Field>
          </div>
        </Card>
      ))}

      {panel("whatsapp", (
        <Card title="WhatsApp" description="Powers the WhatsApp button and the artwork enquiry button.">
          <div className="space-y-5">
            <Field id="whatsapp_number" label="WhatsApp number" help="Digits only, with the country code, e.g. 2348012345678. Leave empty to hide all WhatsApp buttons.">
              {t("whatsapp_number", s.whatsappNumber, "tel")}
            </Field>
            <Field id="whatsapp_default_message" label="Default message" help="Pre-filled when someone taps the floating WhatsApp button.">{area("whatsapp_default_message", s.whatsappDefaultMessage)}</Field>
            <Field id="whatsapp_artwork_template" label="Artwork enquiry message" help="Use {title} for the artwork name and {artist} for the artist. Keep the words ' by {artist}' together.">
              {area("whatsapp_artwork_template", s.whatsappArtworkTemplate)}
            </Field>
          </div>
        </Card>
      ))}

      {panel("social", (
        <Card title="Social media" description="Full links starting with https://. Empty ones are hidden on the website.">
          <div className="grid gap-5 sm:grid-cols-2">
            {(["instagram", "facebook", "youtube", "tiktok", "linkedin"] as const).map((k) => (
              <Field key={k} id={`social_${k}`} label={k === "youtube" ? "YouTube" : k === "tiktok" ? "TikTok" : k === "linkedin" ? "LinkedIn" : k[0].toUpperCase() + k.slice(1)}>
                {t(`social_${k}`, s.social[k], "url", { placeholder: "https://" })}
              </Field>
            ))}
          </div>
        </Card>
      ))}
    </form>
  );
}
