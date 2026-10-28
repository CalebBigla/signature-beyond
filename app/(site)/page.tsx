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
import { formatDate, formatDateRange, formatPrice } from "@/lib/format";
import { Reveal } from "@/components/ui/Reveal";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { CoverImage } from "@/components/ui/CoverImage";
import { ArtworkImage } from "@/components/artworks/ArtworkImage";
import { RecordCard } from "@/components/ui/RecordCard";

function SectionHead(props: { eyebrow: string; title: string; href: string; linkLabel: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <p className="text-xs pl-1 mb-1 uppercase tracking-[0.2em] text-stone-500">{props.eyebrow}</p>
        <h2 className="font-serif text-3xl">{props.title}</h2>
      </div>
      <Link href={props.href} className="shrink-0 text-xs underline-offset-4 hover:underline pb-2">
        {props.linkLabel} →
      </Link>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded border border-dashed border-stone-300 p-6 text-sm text-stone-500">{text}</p>;
}

const hover = "transition-transform duration-500 group-hover:scale-105";

export default async function HomePage() {
  const [settings, artworks, auctions, exhibitions, posts, testimonials] = await Promise.all([
    getSettings(),
    getFeaturedArtworks(),
    getPublishedAuctions(),
    getPublishedExhibitions(),
    getPublishedJournalPosts(),
    getPublishedTestimonials(),
  ]);

  const tiles = [
    { title: "Upcoming Auctions", text: "Discover our latest auction events.", href: "/auctions", cta: "View Auctions", image: settings.tileImages.auctions },
    { title: "Current & Past Exhibitions", text: "Explore our exhibition history.", href: "/exhibitions", cta: "View Exhibitions", image: settings.tileImages.exhibitions },
    { title: "Featured Artworks", text: "A selection from our collection.", href: "/artworks", cta: "View Artworks", image: settings.tileImages.artworks },
    ...(settings.virtualTourUrl
      ? [{ title: "Virtual Tour", text: "Tour our gallery from anywhere.", href: settings.virtualTourUrl, cta: "Start Tour", image: settings.tileImages.tour }]
      : []),
  ];

  return (
    <>
      {/* Hero photo: upload a new one in Admin > Website settings, or replace public/images/hero.jpg */}
      <section className="relative isolate overflow-hidden bg-ink text-white">
        <Image
          src={settings.heroImageUrl || "/images/hero.jpg"}
          alt="Bronze sculpture displayed in a gallery with paintings on the walls"
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/85 via-black/55 to-black/10 max-md:from-black/80 max-md:via-black/60 max-md:to-black/50" />
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 md:py-40">
          {settings.establishedYear && (
            <p className="mb-4 text-xs tracking-[0.25em]">EST. {settings.establishedYear}</p>
          )}
          <h1 className="max-w-xl font-serif text-5xl leading-tight md:text-6xl">{settings.homeHeading}</h1>
          <p className="mt-6 max-w-md text-sm text-white/80">{settings.homeIntro}</p>
          <Link
            href="/artworks"
            className="mt-8 inline-block rounded bg-white px-5 py-3 text-sm text-ink transition-colors hover:bg-stone-200"
          >
            Explore Our Collection →
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 ">
          {tiles.map((t, i) => (
            <li key={t.title}>
              <Reveal delay={i * 0.05}>
                <Link href={t.href} className="group block overflow-hidden rounded border border-stone-200 bg-white">
                  <div className="overflow-hidden">
                    {t.image ? (
                      <div className="relative h-32 w-full transition-transform duration-500 group-hover:scale-105">
                        <Image src={t.image} alt="" fill sizes="(min-width: 1024px) 25vw, 100vw" className="object-cover" />
                      </div>
                    ) : (
                      <PlaceholderImage className="h-32 w-full transition-transform duration-500 group-hover:scale-105" />
                    )}
                  </div>
                  <div className="p-4">
                    <h2 className="font-serif text-xl">{t.title}</h2>
                    <p className="mt-1 text-xs text-stone-500">{t.text}</p>
                    <span className="mt-3 inline-block text-xs font-medium">{t.cta} →</span>
                  </div>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-10 sm:px-6 lg:grid-cols-2">
        <div>
          <SectionHead eyebrow="Recent auctions" title="Notable Auctions" href="/auctions" linkLabel="View all" />
          {auctions.length === 0 ? (
            <Empty text="No auctions published yet." />
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {auctions.slice(0, 3).map((a) => (
                <li key={a.id}>
                  <Link href={`/auctions/${a.slug}`} className="group block">
                    <div className="overflow-hidden"><CoverImage url={a.coverImageUrl} className={hover} /></div>
                    <p className="mt-2 mb-1 text-sm font-medium">{a.title}</p>
                    <p className="text-xs text-stone-500">{formatDateRange(a.startDate, a.endDate)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <SectionHead eyebrow="Featured exhibitions" title="Current & Upcoming" href="/exhibitions" linkLabel="View all" />
          {exhibitions.length === 0 ? (
            <Empty text="No exhibitions published yet." />
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {exhibitions.slice(0, 3).map((e) => (
                <li key={e.id}>
                  <Link href={`/exhibitions/${e.slug}`} className="group block">
                    <div className="overflow-hidden"><CoverImage url={e.coverImageUrl} className={hover} /></div>
                    <p className="mt-2 mb-1 text-sm font-medium">{e.title}</p>
                    <p className="text-xs text-stone-500">{e.year ?? "Date to be confirmed"}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="bg-charcoal py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHead eyebrow="Popular artworks" title="Explore Our Collection" href="/artworks" linkLabel="View all" />
          {artworks.length === 0 ? (
            <Empty text="No featured artworks yet." />
          ) : (
            <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {artworks.slice(0, 4).map((a) => (
                <li key={a.id}>
                  <Reveal>
                    <Link href={`/artworks/${a.slug}`} className="group block overflow-hidden rounded bg-white text-stone-800">
                      <div className="overflow-hidden"><ArtworkImage artwork={a} className={hover} /></div>
                      <div className="p-3">
                        <p className="text-sm font-medium">{a.title}</p>
                        <p className="text-xs text-stone-500">{a.artist?.name ?? "Artist to be confirmed"}</p>
                        <p className="mt-1 text-xs">{formatPrice(a)}</p>
                      </div>
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500">About Signature Beyond</p>
          <h2 className="mt-1 font-serif text-3xl">A Legacy of Excellence in African Art</h2>
          <p className="mt-4 max-w-xl text-sm text-stone-600">{settings.aboutSummary}</p>
          <Link href="/about" className="mt-5 inline-block rounded border border-stone-400 px-4 py-2 text-sm">
            Learn More →
          </Link>
        </div>
        {testimonials.length > 0 && (
          <div>
            <h2 className="font-serif text-2xl">What Our Clients Say</h2>
            <ul className="mt-4 space-y-4">
              {testimonials.slice(0, 3).map((t) => (
                <li key={t.id}>
                  <figure className="rounded border border-stone-200 bg-white p-4">
                    <blockquote className="text-sm italic text-stone-600">“{t.quote}”</blockquote>
                    <figcaption className="mt-2 text-xs">
                      {t.author}{t.role ? `, ${t.role}` : ""}
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {posts.length > 0 && (
        <section className="bg-stone-100 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionHead eyebrow="From the journal" title="Latest News & Stories" href="/journal" linkLabel="View all" />
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {posts.slice(0, 4).map((p) => (
                <li key={p.id}>
                  <RecordCard href={`/journal/${p.slug}`} title={p.title} meta={formatDate(p.publishedAt)} imageUrl={p.coverImageUrl} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}