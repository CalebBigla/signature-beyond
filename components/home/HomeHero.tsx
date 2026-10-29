import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";

export interface HeroImage { src: string; alt: string }
export interface HeroLink { label: string; href: string }

interface Props {
  eyebrow: string;
  heading: string;
  intro: string;
  left: HeroImage;
  /** Plain image on the right, no text. Null = the left image spans the full width. */
  right: HeroImage | null;
  primary: HeroLink | null;
  secondary: HeroLink | null;
  /** Admin live preview: no pull-up under the header, no preloading, shorter. */
  preview?: boolean;
}

// Local previews (blob: URLs from a file picker) cannot go through the image optimiser.
const unoptimized = (src: string) => src.startsWith("blob:") || src.startsWith("data:");

/** Homepage hero. Left half: full image with the text. Right half: a plain image. Shared by the site and the admin preview. */
export function HomeHero({ eyebrow, heading, intro, left, right, primary, secondary, preview = false }: Props) {
  const split = Boolean(right);
  const height = preview ? "min-h-[420px]" : "min-h-[88svh]";

  return (
    <section
      className={`on-dark relative isolate bg-ink text-white ${preview ? "" : "-mt-20 md:-mt-24"} ${split ? "md:grid md:grid-cols-2" : ""}`}
    >
      <div className={`relative isolate flex ${height} items-end overflow-hidden`}>
        <Image
          src={left.src}
          alt={left.alt}
          fill
          priority={!preview}
          unoptimized={unoptimized(left.src)}
          sizes={split ? "(min-width: 768px) 50vw, 100vw" : "100vw"}
          className="-z-20 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/35 to-black/25 md:bg-gradient-to-tr md:from-black/75 md:via-black/30 md:to-black/10" />
        <div className={`w-full pb-16 md:pb-20 ${preview ? "pt-24" : "pt-40"} ${split ? "px-4 sm:px-6 lg:px-10 xl:pl-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))]" : "container-site md:pb-24"}`}>
          {eyebrow && <p className="eyebrow mb-6">{eyebrow}</p>}
          <h1 className={`max-w-3xl font-serif font-medium ${split ? "text-[clamp(2.75rem,1.5rem+3.4vw,5.25rem)] leading-[1] tracking-[-0.02em]" : "text-display"}`}>
            {heading}
          </h1>
          {intro && <p className="mt-8 max-w-xl text-body text-white/85">{intro}</p>}
          {(primary || secondary) && (
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              {primary && <ButtonLink href={primary.href} tone="dark">{primary.label}</ButtonLink>}
              {secondary && <ButtonLink href={secondary.href} variant="secondary" tone="dark">{secondary.label}</ButtonLink>}
            </div>
          )}
        </div>
      </div>

      {right && (
        <div className={`relative aspect-[4/5] overflow-hidden sm:aspect-[4/3] md:aspect-auto ${preview ? "md:min-h-[420px]" : "md:min-h-[88svh]"}`}>
          <Image
            src={right.src}
            alt={right.alt}
            fill
            priority={!preview}
            unoptimized={unoptimized(right.src)}
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
          {/* A faint top shade only, so the white navigation stays legible over a light photo. No text sits on this image. */}
          {!preview && <div aria-hidden="true" className="absolute inset-x-0 top-0 hidden h-40 bg-gradient-to-b from-black/45 to-transparent md:block" />}
        </div>
      )}
    </section>
  );
}
