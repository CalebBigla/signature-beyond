import type { Metadata } from "next";
import Image from "next/image";
import { getSettings } from "@/lib/services";
import { PageBanner } from "@/components/ui/PageBanner";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "About", description: "About Signature Beyond." };

export default async function AboutPage() {
  const settings = await getSettings();
  const paragraphs = settings.aboutSummary.split(/\n{2,}/).filter(Boolean);
  const heroIsDefault = !settings.heroImageUrl;

  return (
    <>
      <PageBanner
        eyebrow={settings.establishedYear ? `Est. ${settings.establishedYear}` : "About"}
        title={`About ${settings.siteName}`}
      />

      <div className="container-site pb-section">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-3">
            <h2 className="eyebrow">Our story</h2>
            <span aria-hidden="true" className="mt-5 block h-px w-12 bg-brand" />
          </div>
          <div className="prose-gallery md:col-span-8">
            {paragraphs.map((p, i) => (
              <p key={i} className={i === 0 ? "font-serif text-[clamp(1.5rem,1.1rem+1.4vw,2.25rem)] font-medium leading-[1.3] text-ink" : undefined}>{p}</p>
            ))}
          </div>
        </div>

        {/* Gallery imagery: the homepage photo (Admin > Website settings), shown at its full width. */}
        <figure className="mt-section">
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-bone">
            <Image
              src={settings.heroImageUrl || "/images/hero.jpg"}
              alt={heroIsDefault ? "Bronze sculpture displayed in a gallery with paintings on the walls" : `Inside ${settings.siteName}`}
              fill
              sizes="(min-width: 1280px) 1200px, 100vw"
              className="object-cover"
            />
          </div>
        </figure>

        <div className="mt-section flex flex-col items-start justify-between gap-8 border-t border-stone-200 pt-12 md:flex-row md:items-center">
          <p className="max-w-xl font-serif text-h3 text-ink">Visit the gallery, or ask us about any work in the collection.</p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <ButtonLink href="/contact">Contact the gallery</ButtonLink>
            <ButtonLink href="/artworks" variant="secondary">View the collection</ButtonLink>
          </div>
        </div>
      </div>
    </>
  );
}
