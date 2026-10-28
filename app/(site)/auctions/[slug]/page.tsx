import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuctionBySlug, getPublishedArtworks, getSettings } from "@/lib/services";
import { formatDate } from "@/lib/format";
import { PHASE_LABELS, eventPhase } from "@/lib/event-phase";
import { contactHref, jsonLd } from "@/lib/enquiry";
import { SITE_URL } from "@/lib/site";
import { ArtworkCard } from "@/components/artworks/ArtworkCard";
import { CoverImage } from "@/components/ui/CoverImage";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHead } from "@/components/ui/Section";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const auction = await getAuctionBySlug((await params).slug);
  if (!auction) return { title: "Auction not found" };
  const description = auction.description ?? `${auction.title} at Signature Beyond.`;
  return {
    title: auction.title,
    description,
    alternates: { canonical: `/auctions/${auction.slug}` },
    openGraph: { title: auction.title, description, ...(auction.coverImageUrl ? { images: [{ url: auction.coverImageUrl }] } : {}) },
  };
}

export default async function AuctionPage({ params }: Params) {
  const auction = await getAuctionBySlug((await params).slug);
  if (!auction) notFound();
  const [all, settings] = await Promise.all([getPublishedArtworks(), getSettings()]);
  const artworks = all.filter((a) => auction.artworkIds.includes(a.id));
  const phase = eventPhase(auction);

  // Key facts: only what the auction record holds (it has no venue, time or preview fields).
  const facts = [
    auction.startDate && { label: auction.endDate && auction.endDate !== auction.startDate ? "Opens" : "Date", value: formatDate(auction.startDate) },
    auction.endDate && auction.endDate !== auction.startDate && { label: "Closes", value: formatDate(auction.endDate) },
    { label: "Status", value: PHASE_LABELS[phase] },
    artworks.length > 0 && { label: "Works", value: String(artworks.length) },
  ].filter((f): f is { label: string; value: string } => Boolean(f));

  const event = auction.startDate && {
    "@context": "https://schema.org",
    "@type": "Event",
    name: auction.title,
    startDate: auction.startDate,
    ...(auction.endDate ? { endDate: auction.endDate } : {}),
    ...(auction.description ? { description: auction.description } : {}),
    ...(auction.coverImageUrl ? { image: auction.coverImageUrl } : {}),
    url: `${SITE_URL}/auctions/${auction.slug}`,
    // No location: the record has no venue field, and the gallery address must not be assumed.
    organizer: { "@type": "Organization", name: settings.siteName, url: SITE_URL },
  };

  return (
    <article className="pb-section">
      {event && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(event) }} />}

      <div className="container-site pt-8 md:pt-12">
        <Link href="/auctions" className="inline-flex min-h-11 items-center text-caption text-stone-600 underline decoration-stone-300 underline-offset-4 hover:decoration-brand">
          ← All auctions
        </Link>

        <div className="mt-6 grid items-end gap-10 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-6 lg:col-span-7">
            <CoverImage
              url={auction.coverImageUrl}
              alt={auction.coverImageUrl ? `${auction.title} poster` : ""}
              aspect="aspect-[4/5]"
              fit="contain"
              priority
              sizes="(min-width: 1024px) 55vw, (min-width: 768px) 50vw, 100vw"
            />
          </div>
          <div className="md:col-span-6 lg:col-span-5">
            <p className="eyebrow mb-5">{phase === "undated" ? "Auction" : `${PHASE_LABELS[phase]} auction`}</p>
            <h1 className="font-serif text-h1 font-medium">{auction.title}</h1>
            {auction.description && (
              <div className="mt-8 space-y-5 text-body text-stone-700">
                {auction.description.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}
              </div>
            )}
          </div>
        </div>

        <dl className="mt-16 grid grid-cols-2 border-y border-stone-200 md:grid-cols-4">
          {facts.map((f) => (
            <div key={f.label} className="border-stone-200 py-6 pr-4 [&:not(:first-child)]:md:border-l [&:not(:first-child)]:md:pl-6">
              <dt className="eyebrow">{f.label}</dt>
              <dd className="mt-2 font-serif text-xl text-ink">{f.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          <ButtonLink href={contactHref(`Auction enquiry: ${auction.title}`)}>Enquire about this auction</ButtonLink>
          <ButtonLink href="/auction-terms" variant="secondary">Auction terms and conditions</ButtonLink>
        </div>
      </div>

      <section aria-labelledby="works" className="container-site mt-section">
        <SectionHead id="works" eyebrow="The sale" title="Works in this auction" />
        {artworks.length === 0 ? (
          <p className="text-body text-stone-600">No artworks have been linked to this auction yet.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-x-5 gap-y-14 md:grid-cols-3 md:gap-x-8 lg:grid-cols-4">
            {artworks.map((a) => <li key={a.id}><ArtworkCard artwork={a} sizes="(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 50vw" /></li>)}
          </ul>
        )}
      </section>
    </article>
  );
}
