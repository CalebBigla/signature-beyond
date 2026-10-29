import Image from "next/image";
import Link from "next/link";
import {
  getFeaturedArtworks,
  getPublishedAuctions,
  getPublishedExhibitions,
  getPublishedJournalPosts,
  getPublishedTestimonials,
  getSettings,
} from "@/lib/services";
import { formatDate, formatDateRange } from "@/lib/format";
import { PHASE_LABELS, eventPhase, splitByPhase } from "@/lib/event-phase";
import { Reveal } from "@/components/ui/Reveal";
import { CoverImage } from "@/components/ui/CoverImage";
import { RecordCard } from "@/components/ui/RecordCard";
import { SectionHead } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { ArtworkCard } from "@/components/artworks/ArtworkCard";
import { HomeHero } from "@/components/home/HomeHero";

// Asymmetric gallery hang for up to six featured works (md and up). Mobile is a simple two-column grid.
const HANG = [
  { cell: "col-span-2 md:col-span-7", aspect: "aspect-[4/5]", sizes: "(min-width: 768px) 55vw, 100vw" },
  { cell: "md:col-span-4 md:col-start-9 md:mt-40", aspect: "aspect-[3/4]", sizes: "(min-width: 768px) 30vw, 50vw" },
  { cell: "md:col-span-5 md:-mt-10", aspect: "aspect-square", sizes: "(min-width: 768px) 40vw, 50vw" },
  { cell: "md:col-span-5 md:col-start-8 md:mt-24", aspect: "aspect-[4/5]", sizes: "(min-width: 768px) 40vw, 50vw" },
  { cell: "md:col-span-4 md:col-start-2", aspect: "aspect-[3/4]", sizes: "(min-width: 768px) 30vw, 50vw" },
  { cell: "md:col-span-6 md:col-start-7 md:mt-32", aspect: "aspect-[4/3]", sizes: "(min-width: 768px) 45vw, 50vw" },
];

const excerpt = (s: string | null, n = 220) => (s && s.length > n ? `${s.slice(0, n).replace(/\s+\S*$/, "")}…` : s);

export default async function HomePage() {
  const [settings, artworks, auctions, exhibitions, posts, testimonials] = await Promise.all([
    getSettings(),
    getFeaturedArtworks(),
    getPublishedAuctions(),
    getPublishedExhibitions(),
    getPublishedJournalPosts(),
    getPublishedTestimonials(),
  ]);

  const auctionsByPhase = splitByPhase(auctions);
  const nextAuction = auctionsByPhase.current[0] ?? null;
  const featureAuction = nextAuction ?? auctionsByPhase.past[0] ?? auctionsByPhase.undated[0] ?? null;
  const featurePhase = featureAuction ? eventPhase(featureAuction) : null;

  const exByPhase = splitByPhase(exhibitions);
  const orderedEx = [...exByPhase.current, ...exByPhase.past, ...exByPhase.undated];
  const featureEx = orderedEx[0] ?? null;
  const featureExPhase = featureEx ? eventPhase(featureEx) : null;
  const otherEx = orderedEx.slice(1, 4);

  const quote = testimonials[0];
  const heroSrc = settings.heroImageRightUrl || settings.heroImageUrl;
  const heroAlt = settings.heroImageRightUrl ? settings.heroImageRightAlt : settings.heroImageAlt;

  return (
    <>
      {/* Hero: text beside an image, all edited in Admin > Homepage. Default image: public/images/hero.jpg. */}
      <HomeHero
        eyebrow={settings.heroEyebrow || (settings.establishedYear ? `Est. ${settings.establishedYear}` : "")}
        heading={settings.homeHeading}
        intro={settings.homeIntro}
        image={{
          src: heroSrc || "/images/hero.jpg",
          alt: heroSrc ? heroAlt : "Bronze sculpture displayed in a gallery with paintings on the walls",
        }}
        layout={settings.heroLayout}
        tone={settings.heroTone}
        primary={settings.heroPrimaryLabel && settings.heroPrimaryHref ? { label: settings.heroPrimaryLabel, href: settings.heroPrimaryHref } : null}
        secondary={
          settings.heroSecondaryLabel && settings.heroSecondaryHref
            ? { label: settings.heroSecondaryLabel, href: settings.heroSecondaryHref }
            : nextAuction
              ? { label: eventPhase(nextAuction) === "live" ? "Auction now on" : "Upcoming auction", href: `/auctions/${nextAuction.slug}` }
              : null
        }
      />

      {featureAuction && featurePhase && (
        <section aria-labelledby="auction-feature" className="container-site py-section">
          <Reveal className="grid items-center gap-10 md:grid-cols-12 md:gap-12">
            <Link href={`/auctions/${featureAuction.slug}`} className="group block md:col-span-6 lg:col-span-7" tabIndex={-1} aria-hidden="true">
              <CoverImage
                url={featureAuction.coverImageUrl || settings.tileImages.auctions || null}
                aspect="aspect-[4/5]"
                fit="contain"
                sizes="(min-width: 1024px) 55vw, (min-width: 768px) 50vw, 100vw"
              />
            </Link>
            <div className="md:col-span-6 lg:col-span-4 lg:col-start-9">
              <p className="eyebrow mb-5">
                {featurePhase === "upcoming" ? "Upcoming auction" : featurePhase === "live" ? "Auction now on" : featurePhase === "past" ? "Most recent auction" : "Auction"}
              </p>
              <h2 id="auction-feature" className="font-serif text-h1 font-medium">{featureAuction.title}</h2>
              <p className="mt-6 border-t border-stone-200 pt-4 text-sm text-ink">{formatDateRange(featureAuction.startDate, featureAuction.endDate)}</p>
              {featureAuction.description && <p className="mt-6 text-body text-stone-700">{excerpt(featureAuction.description)}</p>}
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                <ButtonLink href={`/auctions/${featureAuction.slug}`}>
                  {featurePhase === "past" || featurePhase === "undated" ? "View auction" : "View catalogue"}
                </ButtonLink>
                <ButtonLink href="/auctions" variant="secondary">All auctions</ButtonLink>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {artworks.length > 0 && (
        <section aria-labelledby="featured-works" className="border-t border-stone-200 bg-paper py-section">
          <div className="container-site">
            <SectionHead id="featured-works" eyebrow="From the collection" title="Featured works" href="/artworks" linkLabel="View the collection" />
            <ul className="grid grid-cols-2 gap-x-5 gap-y-14 md:grid-cols-12 md:gap-x-8 md:gap-y-20">
              {artworks.slice(0, HANG.length).map((a, i) => (
                <li key={a.id} className={HANG[i].cell}>
                  <Reveal delay={(i % 2) * 0.08}>
                    <ArtworkCard artwork={a} aspect={HANG[i].aspect} sizes={HANG[i].sizes} />
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {featureEx && (
        <section aria-labelledby="exhibitions" className="bg-bone py-section">
          <div className="container-site">
            <SectionHead id="exhibitions" eyebrow="Exhibitions" title={featureExPhase === "live" || featureExPhase === "upcoming" ? "Current & upcoming" : "From the programme"} href="/exhibitions" linkLabel="All exhibitions" />
            <Reveal>
              <Link href={`/exhibitions/${featureEx.slug}`} className="group grid gap-8 md:grid-cols-12 md:gap-12">
                <div className="md:col-span-8">
                  <CoverImage url={featureEx.coverImageUrl || settings.tileImages.exhibitions || null} aspect="aspect-[16/10]" sizes="(min-width: 768px) 65vw, 100vw" />
                </div>
                <div className="flex flex-col justify-end md:col-span-4">
                  <p className="eyebrow mb-4">{featureExPhase === "live" ? "Current exhibition" : featureExPhase === "upcoming" ? "Upcoming exhibition" : "Exhibition"}</p>
                  <h3 className="font-serif text-h2 font-medium transition-colors group-hover:text-brand-deep">{featureEx.title}</h3>
                  <p className="mt-4 text-sm text-stone-700">
                    {featureEx.startDate ? formatDateRange(featureEx.startDate, featureEx.endDate) : featureEx.year ?? "Dates to be confirmed"}
                  </p>
                  {featureEx.description && <p className="mt-5 text-body text-stone-700">{excerpt(featureEx.description, 180)}</p>}
                  <span className="mt-8 inline-flex min-h-11 items-center text-sm underline decoration-stone-400 underline-offset-[6px] group-hover:decoration-brand">View exhibition</span>
                </div>
              </Link>
            </Reveal>
            {otherEx.length > 0 && (
              <ul className="mt-20 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
                {otherEx.map((e, i) => (
                  <li key={e.id}>
                    <Reveal delay={i * 0.06}>
                      <RecordCard
                        href={`/exhibitions/${e.slug}`}
                        title={e.title}
                        headingLevel={3}
                        meta={e.startDate ? formatDateRange(e.startDate, e.endDate) : e.year ? String(e.year) : PHASE_LABELS.undated}
                        imageUrl={e.coverImageUrl}
                        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
                      />
                    </Reveal>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {settings.aboutSummary && (
        <section aria-labelledby="heritage" className="container-site py-section">
          <Reveal className="grid gap-8 md:grid-cols-12">
            <div className="md:col-span-3">
              <p className="eyebrow">{settings.establishedYear ? `Since ${settings.establishedYear}` : "The gallery"}</p>
              <span aria-hidden="true" className="mt-5 block h-px w-12 bg-brand" />
            </div>
            <div className="md:col-span-8">
              <h2 id="heritage" className="sr-only">About {settings.siteName}</h2>
              <p className="font-serif text-[clamp(1.5rem,1.1rem+1.6vw,2.5rem)] font-medium leading-[1.25] text-ink">{settings.aboutSummary}</p>
              <ButtonLink href="/about" variant="secondary" className="mt-8">Our story</ButtonLink>
            </div>
          </Reveal>
        </section>
      )}

      {posts.length > 0 && (
        <section aria-labelledby="journal" className="border-t border-stone-200 py-section">
          <div className="container-site">
            <SectionHead id="journal" eyebrow="Journal" title="Notes from the gallery" href="/journal" linkLabel="Read the journal" />
            <ul className="divide-y divide-stone-200 border-b border-stone-200">
              {posts.slice(0, 3).map((p) => (
                <li key={p.id}>
                  <Link href={`/journal/${p.slug}`} className="group grid gap-3 py-8 md:grid-cols-12 md:gap-8">
                    <p className="text-caption text-stone-600 md:col-span-3">{formatDate(p.publishedAt)}</p>
                    <h3 className="font-serif text-h3 font-medium transition-colors group-hover:text-brand-deep md:col-span-5">{p.title}</h3>
                    {p.excerpt && <p className="text-sm leading-relaxed text-stone-700 md:col-span-4">{p.excerpt}</p>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {quote && (
        <section aria-label="What collectors say" className="bg-bone py-section">
          <Reveal className="container-site">
            <figure className="mx-auto max-w-4xl text-center">
              <span aria-hidden="true" className="mx-auto mb-10 block h-px w-12 bg-brand" />
              <blockquote className="font-serif text-[clamp(1.5rem,1.1rem+1.6vw,2.5rem)] italic leading-[1.3] text-ink">“{quote.quote}”</blockquote>
              <figcaption className="mt-8 text-eyebrow font-medium uppercase text-stone-600">
                {quote.author}{quote.role ? ` · ${quote.role}` : ""}
              </figcaption>
            </figure>
          </Reveal>
        </section>
      )}

      <section aria-labelledby="visit" className="on-dark relative isolate overflow-hidden bg-ink py-section text-white">
        {settings.tileImages.tour && (
          <>
            <Image src={settings.tileImages.tour} alt="" fill sizes="100vw" className="-z-20 object-cover" />
            <div className="absolute inset-0 -z-10 bg-ink/80" />
          </>
        )}
        <div className="container-site grid gap-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="eyebrow mb-5">Visit</p>
            <h2 id="visit" className="font-serif text-h1 font-medium">See the work in person</h2>
            <p className="mt-6 max-w-lg text-body text-white/80">
              Arrange a private viewing at the gallery, or ask us about any work in the collection.
            </p>
          </div>
          <div className="flex flex-col justify-end md:col-span-5">
            {settings.address && (
              <address className="mb-8 whitespace-pre-line border-l border-brand pl-5 text-sm not-italic leading-relaxed text-white/85">{settings.address}</address>
            )}
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              <ButtonLink href="/contact?subject=Private%20viewing%20request" tone="dark">Book a private viewing</ButtonLink>
              {settings.virtualTourUrl && (
                <ButtonLink href={settings.virtualTourUrl} variant="secondary" tone="dark">Take the virtual tour</ButtonLink>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
