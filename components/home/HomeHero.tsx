"use client";
import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
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
  /** Admin live preview: no preloading, no scroll effect, shorter. */
  preview?: boolean;
}

// Local previews (blob: URLs from a file picker) cannot go through the image optimiser.
const unoptimized = (src: string) => src.startsWith("blob:") || src.startsWith("data:");

const TONES: Record<HeroTone, string> = {
  light: "bg-white text-ink",
  bone: "bg-bone text-ink",
  dark: "on-dark bg-ink text-white",
};

// Entrance uses CSS animations (globals.css: .hero-rise / .hero-frame / .hero-zoom) so it starts with the
// first paint, before JavaScript loads. Each line of text gets a slightly later start.
const delay = (i: number) => ({ animationDelay: `${0.12 + i * 0.12}s` });

/**
 * Homepage hero: text on one side, a framed image on the other (side and background set in Admin > Homepage).
 * Fills the screen below the header on tablets and desktops. Shared by the website and the admin live preview.
 * Motion: text enters line by line, the image settles from a slight zoom and drifts gently on scroll (JS).
 * With reduced motion switched on, only the fades remain.
 */
export function HomeHero({ eyebrow, heading, intro, image, primary, secondary, layout = "image-right", tone = "light", preview = false }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const drift = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);
  const dark = tone === "dark";
  const imageLeft = layout === "image-left";
  const height = preview ? "md:h-[460px]" : "md:h-[calc(100svh-4.75rem)] md:min-h-[560px] md:max-h-[1000px]";
  // On wide screens, line the text up with the rest of the page content (not in the narrower preview).
  const align = preview ? "" : imageLeft ? "xl:pr-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))]" : "xl:pl-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))]";

  return (
    <section ref={ref} className={`relative isolate overflow-hidden ${TONES[tone]}`}>
      <div className={`grid md:grid-cols-12 ${height}`}>
        <div
          className={`flex items-center px-4 pb-10 pt-14 sm:px-6 md:col-span-6 md:py-16 lg:col-span-5 lg:px-10 ${imageLeft ? "md:order-2" : ""} ${align}`}
        >
          <div className="max-w-xl">
            {eyebrow && (
              <p className="hero-rise eyebrow mb-6 flex items-center gap-3" style={delay(0)}>
                <span aria-hidden="true" className="h-px w-8 bg-brand" />
                {eyebrow}
              </p>
            )}
            <h1 style={delay(1)} className="hero-rise font-serif text-[clamp(2.5rem,1.6rem+2.8vw,4.5rem)] font-medium leading-[1.04] tracking-[-0.02em]">
              {heading}
            </h1>
            {intro && (
              <p style={delay(2)} className={`hero-rise mt-7 max-w-md text-body ${dark ? "text-white/80" : "text-stone-600"}`}>{intro}</p>
            )}
            {(primary || secondary) && (
              <div style={delay(3)} className="hero-rise mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                {primary && <ButtonLink href={primary.href} tone={dark ? "dark" : "light"}>{primary.label}</ButtonLink>}
                {secondary && <ButtonLink href={secondary.href} variant="secondary" tone={dark ? "dark" : "light"}>{secondary.label}</ButtonLink>}
              </div>
            )}
          </div>
        </div>

        {/* Framed image: space around it, as on a gallery wall. */}
        <div className={`px-4 pb-4 sm:px-6 sm:pb-6 md:col-span-6 md:py-8 lg:col-span-7 lg:py-10 ${imageLeft ? "md:order-1 md:pl-8 md:pr-0 lg:pl-10" : "md:pl-0 md:pr-8 lg:pr-10"}`}>
          <div className="hero-frame relative aspect-[4/5] h-full w-full overflow-hidden bg-stone-200 sm:aspect-[4/3] md:aspect-auto">
            <motion.div style={preview || reduce ? undefined : { y: drift }} className="absolute -inset-y-[6%] inset-x-0">
              <div className="hero-zoom absolute inset-0">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                priority={!preview}
                unoptimized={unoptimized(image.src)}
                sizes="(min-width: 1024px) 55vw, (min-width: 768px) 48vw, 100vw"
                className="object-cover"
              />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
