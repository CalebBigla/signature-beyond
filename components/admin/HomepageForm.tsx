"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import { saveHomepage, type FormState } from "@/lib/admin/actions";
import type { WebsiteSettings } from "@/types";
import { HomeHero, type HeroLayout, type HeroTone } from "@/components/home/HomeHero";
import { Card, Field, Notice, btn, inputClass } from "./ui";
import { ImageDropzone } from "./ImageDropzone";
import { useUnsavedGuard } from "./useUnsavedGuard";

const initial: FormState = { ok: false, message: "" };
const DEFAULT_IMAGE = "/images/hero.jpg";

const LAYOUTS: { value: HeroLayout; label: string; hint: string }[] = [
  { value: "image-right", label: "Text left, image right", hint: "Like the example: words first, picture second." },
  { value: "image-left", label: "Image left, text right", hint: "Picture first." },
];
const TONES: { value: HeroTone; label: string; swatch: string }[] = [
  { value: "light", label: "White", swatch: "bg-white" },
  { value: "bone", label: "Warm bone", swatch: "bg-bone" },
  { value: "dark", label: "Dark", swatch: "bg-[#14110f]" },
];

/** A row of selectable cards for a radio choice (keyboard: arrow keys, like any radio group). */
function Choice<T extends string>({ name, legend, value, onChange, options }: {
  name: string; legend: string; value: T; onChange: (v: T) => void;
  options: { value: T; label: string; hint?: string; swatch?: string }[];
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-stone-700">{legend}</legend>
      <div className="grid gap-3 sm:grid-cols-3">
        {options.map((o) => (
          <label
            key={o.value}
            className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand/40 ${
              value === o.value ? "border-ink bg-stone-50" : "border-stone-300 bg-white hover:border-stone-400"
            }`}
          >
            <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} className="sr-only" />
            {o.swatch && <span aria-hidden="true" className={`mt-0.5 h-5 w-5 shrink-0 rounded-full border border-stone-300 ${o.swatch}`} />}
            <span>
              <span className="block font-medium text-stone-800">{o.label}</span>
              {o.hint && <span className="block text-xs text-stone-500">{o.hint}</span>}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function HomepageForm({ s }: { s: WebsiteSettings }) {
  const [state, action, pending] = useActionState(saveHomepage, initial);
  const [dirty, setDirty] = useState(false);
  const [lastState, setLastState] = useState(state);
  const formRef = useRef<HTMLFormElement>(null);
  useUnsavedGuard(dirty && !pending);

  // Live preview state: text mirrors the inputs, the image follows the drop zone.
  const [t, setT] = useState({
    eyebrow: s.heroEyebrow, heading: s.homeHeading, intro: s.homeIntro,
    primaryLabel: s.heroPrimaryLabel, primaryHref: s.heroPrimaryHref,
    secondaryLabel: s.heroSecondaryLabel, secondaryHref: s.heroSecondaryHref,
  });
  const [layout, setLayout] = useState<HeroLayout>(s.heroLayout);
  const [tone, setTone] = useState<HeroTone>(s.heroTone);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const currentImage = s.heroImageRightUrl || s.heroImageUrl || null;

  // A successful save makes the current values the saved ones.
  if (state !== lastState) {
    setLastState(state);
    if (state.ok) setDirty(false);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") { e.preventDefault(); formRef.current?.requestSubmit(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const bind = (key: keyof typeof t, name: string) => ({
    id: name,
    name,
    defaultValue: t[key],
    onChange: (e: { target: { value: string } }) => setT((p) => ({ ...p, [key]: e.target.value })),
  });

  const imageSrc = imagePreview ?? (imageRemoved ? DEFAULT_IMAGE : currentImage || DEFAULT_IMAGE);

  return (
    <form ref={formRef} action={action} onInput={() => setDirty(true)} onChange={() => setDirty(true)} className="space-y-6">
      <div className="sticky top-16 z-10 -mx-4 flex flex-wrap items-center gap-3 border-b border-stone-200 bg-stone-50/95 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8">
        <p className="flex-1 text-sm text-stone-600">
          {dirty ? <span className="text-amber-700">Unsaved changes. The preview shows them; the live site does not yet.</span> : "Everything on this page is live on the homepage."}
        </p>
        <a href="/" target="_blank" rel="noopener noreferrer" className={btn("ghost", "sm")}>Open homepage</a>
        <button type="submit" disabled={pending} className={btn("primary")} title="Save (Ctrl+S)">{pending ? "Saving…" : "Save homepage"}</button>
      </div>

      {state.message && <Notice tone={state.ok ? "success" : "error"}>{state.message}</Notice>}

      <Card title="Live preview" description="How the top of the homepage will look. On phones the image sits below the text." padded={false}>
        <div className="site-preview overflow-hidden rounded-b-lg">
          <HomeHero
            preview
            eyebrow={t.eyebrow || (s.establishedYear ? `Est. ${s.establishedYear}` : "")}
            heading={t.heading || "Your heading"}
            intro={t.intro}
            image={{ src: imageSrc, alt: "" }}
            layout={layout}
            tone={tone}
            primary={t.primaryLabel ? { label: t.primaryLabel, href: "#" } : null}
            secondary={t.secondaryLabel ? { label: t.secondaryLabel, href: "#" } : { label: "Upcoming auction (automatic)", href: "#" }}
          />
        </div>
      </Card>

      <Card title="Layout">
        <div className="space-y-6">
          <Choice name="hero_layout" legend="Image position" value={layout} onChange={setLayout} options={LAYOUTS} />
          <Choice name="hero_tone" legend="Background behind the text" value={tone} onChange={setTone} options={TONES} />
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Hero text">
          <div className="space-y-5">
            <Field id="hero_eyebrow" label="Small label above the heading" help={s.establishedYear ? `Leave empty to show "Est. ${s.establishedYear}".` : "Optional, e.g. Est. 1992."}>
              <input {...bind("eyebrow", "hero_eyebrow")} maxLength={60} className={inputClass} />
            </Field>
            <Field id="home_heading" label="Heading" required>
              <input {...bind("heading", "home_heading")} required maxLength={160} className={`${inputClass} text-base`} />
            </Field>
            <Field id="home_intro" label="Introduction" help="One or two sentences.">
              <textarea {...bind("intro", "home_intro")} rows={4} maxLength={400} className={inputClass} />
            </Field>
          </div>
        </Card>

        <Card title="Hero image" description="A wide or tall photo both work; it is cropped to fill its half.">
          <div className="space-y-4">
            <ImageDropzone
              name="hero_image_right"
              currentUrl={currentImage}
              emptyHint="Until you upload one, the default gallery photo is used."
              aspect="aspect-[4/3]"
              onPreview={setImagePreview}
              onRemove={setImageRemoved}
            />
            <Field id="hero_image_right_alt" label="Image description" help="For screen readers and search engines, e.g. Glass facade of the gallery on Awolowo Road.">
              <input id="hero_image_right_alt" name="hero_image_right_alt" defaultValue={s.heroImageRightUrl ? s.heroImageRightAlt : s.heroImageAlt} maxLength={300} className={inputClass} />
            </Field>
          </div>
        </Card>
      </div>

      <Card title="Buttons" description="Links can be a page on this site (starting with /, e.g. /artworks) or a full https:// address.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="hero_primary_label" label="Main button text" help="Leave empty to hide the button.">
            <input {...bind("primaryLabel", "hero_primary_label")} maxLength={60} className={inputClass} />
          </Field>
          <Field id="hero_primary_href" label="Main button link">
            <input {...bind("primaryHref", "hero_primary_href")} placeholder="/artworks" className={inputClass} />
          </Field>
          <Field id="hero_secondary_label" label="Second button text" help="Leave empty to link automatically to the next upcoming auction (when there is one).">
            <input {...bind("secondaryLabel", "hero_secondary_label")} maxLength={60} className={inputClass} />
          </Field>
          <Field id="hero_secondary_href" label="Second button link">
            <input {...bind("secondaryHref", "hero_secondary_href")} placeholder="/auctions" className={inputClass} />
          </Field>
        </div>
      </Card>

      <Card title="Other homepage images" description="Used when the featured auction or exhibition has no image of its own, and behind the Visit section.">
        <div className="grid gap-6 sm:grid-cols-3">
          <ImageDropzone name="tile_auctions" label="Auction feature" currentUrl={s.tileImages.auctions || null} />
          <ImageDropzone name="tile_exhibitions" label="Exhibition feature" currentUrl={s.tileImages.exhibitions || null} />
          <ImageDropzone name="tile_tour" label="Visit section background" currentUrl={s.tileImages.tour || null} />
        </div>
      </Card>

      <Card title="Virtual tour">
        <Field id="virtual_tour_url" label="Virtual tour link" help="A full https:// address. The Virtual Tour menu item opens it.">
          <input id="virtual_tour_url" name="virtual_tour_url" type="url" defaultValue={s.virtualTourUrl} placeholder="https://" className={inputClass} />
        </Field>
      </Card>
    </form>
  );
}
