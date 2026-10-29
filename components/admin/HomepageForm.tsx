"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import { saveHomepage, type FormState } from "@/lib/admin/actions";
import type { WebsiteSettings } from "@/types";
import { HomeHero } from "@/components/home/HomeHero";
import { Card, Field, Notice, btn, inputClass } from "./ui";
import { ImageDropzone } from "./ImageDropzone";
import { useUnsavedGuard } from "./useUnsavedGuard";

const initial: FormState = { ok: false, message: "" };
const DEFAULT_LEFT = "/images/hero.jpg";

export function HomepageForm({ s }: { s: WebsiteSettings }) {
  const [state, action, pending] = useActionState(saveHomepage, initial);
  const [dirty, setDirty] = useState(false);
  const [lastState, setLastState] = useState(state);
  const formRef = useRef<HTMLFormElement>(null);
  useUnsavedGuard(dirty && !pending);

  // Live preview state. Text mirrors the inputs; images follow the drop zones.
  const [t, setT] = useState({
    eyebrow: s.heroEyebrow, heading: s.homeHeading, intro: s.homeIntro,
    primaryLabel: s.heroPrimaryLabel, primaryHref: s.heroPrimaryHref,
    secondaryLabel: s.heroSecondaryLabel, secondaryHref: s.heroSecondaryHref,
  });
  const [leftPreview, setLeftPreview] = useState<string | null>(null);
  const [rightPreview, setRightPreview] = useState<string | null>(null);
  const [leftRemoved, setLeftRemoved] = useState(false);
  const [rightRemoved, setRightRemoved] = useState(false);

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

  const leftSrc = leftPreview ?? (leftRemoved ? DEFAULT_LEFT : s.heroImageUrl || DEFAULT_LEFT);
  const rightSrc = rightPreview ?? (rightRemoved ? null : s.heroImageRightUrl || null);

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

      <Card title="Live preview" description="How the top of the homepage will look. On phones the right image sits below the left one." padded={false}>
        <div className="overflow-hidden rounded-b-lg">
          <HomeHero
            preview
            eyebrow={t.eyebrow || (s.establishedYear ? `Est. ${s.establishedYear}` : "")}
            heading={t.heading || "Your heading"}
            intro={t.intro}
            left={{ src: leftSrc, alt: "" }}
            right={rightSrc ? { src: rightSrc, alt: "" } : null}
            primary={t.primaryLabel ? { label: t.primaryLabel, href: "#" } : null}
            secondary={t.secondaryLabel ? { label: t.secondaryLabel, href: "#" } : { label: "Upcoming auction (automatic)", href: "#" }}
          />
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Left image" description="Full image. The heading, text and buttons sit on it, so choose a photo with a calm area at the bottom left.">
          <div className="space-y-4">
            <ImageDropzone
              name="hero_image"
              currentUrl={s.heroImageUrl || null}
              emptyHint="Until you upload one, the default gallery photo is used."
              aspect="aspect-[4/5]"
              onPreview={setLeftPreview}
              onRemove={setLeftRemoved}
            />
            <Field id="hero_image_alt" label="Image description" help="For screen readers and search engines, e.g. Bronze head on a plinth in the main gallery.">
              <input id="hero_image_alt" name="hero_image_alt" defaultValue={s.heroImageAlt} maxLength={300} className={inputClass} />
            </Field>
          </div>
        </Card>

        <Card title="Right image" description="Plain image, no text. Leave empty and the left image fills the whole width.">
          <div className="space-y-4">
            <ImageDropzone
              name="hero_image_right"
              currentUrl={s.heroImageRightUrl || null}
              emptyHint="Optional."
              aspect="aspect-[4/5]"
              onPreview={setRightPreview}
              onRemove={setRightRemoved}
            />
            <Field id="hero_image_right_alt" label="Image description">
              <input id="hero_image_right_alt" name="hero_image_right_alt" defaultValue={s.heroImageRightAlt} maxLength={300} className={inputClass} />
            </Field>
          </div>
        </Card>
      </div>

      <Card title="Hero text" description="Shown on the left image.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="hero_eyebrow" label="Small label above the heading" help={s.establishedYear ? `Leave empty to show "Est. ${s.establishedYear}".` : "Optional, e.g. Est. 1992."}>
            <input {...bind("eyebrow", "hero_eyebrow")} maxLength={60} className={inputClass} />
          </Field>
          <div className="sm:col-span-2">
            <Field id="home_heading" label="Heading" required>
              <input {...bind("heading", "home_heading")} required maxLength={160} className={`${inputClass} text-base`} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field id="home_intro" label="Introduction" help="One or two sentences.">
              <textarea {...bind("intro", "home_intro")} rows={3} maxLength={400} className={inputClass} />
            </Field>
          </div>
        </div>
      </Card>

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
        <Field id="virtual_tour_url" label="Virtual tour link" help="A full https:// address. Leave empty to hide the virtual tour button.">
          <input id="virtual_tour_url" name="virtual_tour_url" type="url" defaultValue={s.virtualTourUrl} placeholder="https://" className={inputClass} />
        </Field>
      </Card>
    </form>
  );
}
