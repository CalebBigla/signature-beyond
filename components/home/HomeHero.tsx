import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";

export interface HeroImage { src: string; alt: string }
export interface HeroLink { label: string; href: string }
export type HeroLayout = "image-right" | "image-left";
export type HeroTone = "light" | "bone" | "dark";

interface Props {
  eyebrow: string;
  heading: string;
  intro: string;
  image: HeroImage;
  primary: HeroLink | null;
  secondary: HeroLink | null;
  layout?: HeroLayout;
  tone?: HeroTone;
  /** Admin live preview: no preloading, shorter. */
  preview?: boolean;
}

// Local previews (blob: URLs from a file picker) cannot go through the image optimiser.
const unoptimized = (src: string) => src.startsWith("blob:") || src.startsWith("data:");

const TONES: Record<HeroTone, string> = {
  light: "bg-white text-ink",
  bone: "bg-bone text-ink",
  dark: "on-dark bg-ink text-white",
};

/**
 * Homepage hero: text on one side, an image on the other (side and background set in Admin > Homepage).
 * Shared by the website and the admin live preview so they always match.
 */
export function HomeHero({ eyebrow, heading, intro, image, primary, secondary, layout = "image-right", tone = "light", preview = false }: Props) {
  const dark = tone === "dark";
  const imageLeft = layout === "image-left";
  const minH = preview ? "md:min-h-[440px]" : "md:min-h-[min(82svh,760px)]";
  // On wide screens, line the text up with the rest of the page content (not in the narrower preview).
  const align = preview ? "" : imageLeft ? "xl:pr-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))]" : "xl:pl-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))]";

  return (
    <section className={`relative isolate overflow-hidden ${TONES[tone]}`}>
      <div className={`grid md:grid-cols-12 ${minH}`}>
        <div
          className={`flex items-center px-4 py-14 sm:px-6 md:col-span-6 md:py-20 lg:col-span-5 lg:px-10 ${imageLeft ? "md:order-2" : ""} ${align}`}
        >
          <div className="max-w-xl">
            {eyebrow && <p className="eyebrow mb-6">{eyebrow}</p>}
            <h1 className="font-serif text-[clamp(2.5rem,1.6rem+2.8vw,4.5rem)] font-medium leading-[1.04] tracking-[-0.02em]">{heading}</h1>
            {intro && <p className={`mt-7 max-w-md text-body ${dark ? "text-white/80" : "text-stone-600"}`}>{intro}</p>}
            {(primary || secondary) && (
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                {primary && <ButtonLink href={primary.href} tone={dark ? "dark" : "light"}>{primary.label}</ButtonLink>}
                {secondary && <ButtonLink href={secondary.href} variant="secondary" tone={dark ? "dark" : "light"}>{secondary.label}</ButtonLink>}
              </div>
            )}
          </div>
        </div>

        <div className={`relative aspect-[4/3] md:col-span-6 md:aspect-auto lg:col-span-7 ${imageLeft ? "md:order-1" : ""}`}>
          <Image
            src={image.src}
            alt={image.alt}
            fill
            priority={!preview}
            unoptimized={unoptimized(image.src)}
            sizes="(min-width: 1024px) 58vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
