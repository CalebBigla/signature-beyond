import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArtworkBySlug, getPublishedArtworks, getSettings } from "@/lib/services";
import { formatPrice } from "@/lib/format";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { contactHref, jsonLd } from "@/lib/enquiry";
import { SITE_URL } from "@/lib/site";
import type { Artwork } from "@/types";
import { ArtworkCard } from "@/components/artworks/ArtworkCard";
import { ArtworkGallery } from "@/components/artworks/ArtworkGallery";
import { AvailabilityBadge } from "@/components/artworks/AvailabilityBadge";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHead } from "@/components/ui/Section";
import { ReadMore } from "@/components/documents/ReadMore";

type Params = { params: Promise<{ slug: string }> };

const mainImage = (a: Artwork) => a.images.find((i) => i.isMain) ?? a.images[0] ?? null;
const byLine = (a: Artwork) => (a.artist ? `${a.title} by ${a.artist.name}` : a.title);

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const artwork = await getArtworkBySlug(slug);
  if (!artwork) return { title: "Artwork not found" };
  const image = mainImage(artwork);
  const description = artwork.description ?? `${byLine(artwork)} at Signature Beyond.`;
  return {
    title: artwork.artist ? `${artwork.title}, ${artwork.artist.name}` : artwork.title,
    description,
    alternates: { canonical: `/artworks/${artwork.slug}` },
    openGraph: {
      title: byLine(artwork),
      description,
      url: `/artworks/${artwork.slug}`,
      ...(image ? { images: [{ url: image.url, alt: image.alt || byLine(artwork) }] } : {}),
    },
    twitter: { card: image ? "summary_large_image" : "summary" },
  };
}

/** schema.org VisualArtwork. Only fields that exist are included; an Offer only when a price is published. */
function artworkJsonLd(a: Artwork) {
  const image = mainImage(a);
  const hasPrice = !a.priceOnRequest && a.price !== null && Boolean(a.currency);
  return {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    name: a.title,
    url: `${SITE_URL}/artworks/${a.slug}`,
    ...(a.artist ? { creator: { "@type": "Person", name: a.artist.name } } : {}),
    ...(a.medium ? { artMedium: a.medium } : {}),
    ...(a.year ? { dateCreated: String(a.year) } : {}),
    ...(a.description ? { description: a.description } : {}),
    ...(image ? { image: image.url } : {}),
    ...(hasPrice
      ? {
          offers: {
            "@type": "Offer",
            price: a.price,
            priceCurrency: a.currency,
            availability: a.availability === "sold" ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
            url: `${SITE_URL}/artworks/${a.slug}`,
          },
        }
      : {}),
  };
}

export default async function ArtworkPage({ params }: Params) {
  const { slug } = await params;
  const artwork = await getArtworkBySlug(slug);
  if (!artwork) notFound();

  const [settings, all] = await Promise.all([getSettings(), getPublishedArtworks()]);
  const whatsappUrl = buildWhatsAppUrl(settings, artwork);
  const others = all.filter((a) => a.id !== artwork.id);
  const sameArtist = artwork.artist ? others.filter((a) => a.artist?.id === artwork.artist?.id) : [];
  const related = (sameArtist.length ? sameArtist : others).slice(0, 4);

  const specs = (
    [
      ["Medium", artwork.medium],
      ["Dimensions", artwork.dimensions],
    ] as const
  ).filter(([, v]) => v);

  const enquiryHref = contactHref(`Enquiry: ${byLine(artwork)}`);

  return (
    <article className="container-site pb-section pt-8 md:pt-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(artworkJsonLd(artwork)) }} />

      <nav aria-label="Breadcrumb" className="mb-8 text-caption text-stone-600">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link href="/artworks" className="inline-flex min-h-11 items-center underline decoration-stone-300 underline-offset-4 hover:decoration-brand">Artworks</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="truncate">{artwork.title}</li>
        </ol>
      </nav>

      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          {artwork.images.length > 0 ? (
            <ArtworkGallery images={artwork.images} title={byLine(artwork)} />
          ) : (
            <PlaceholderImage className="aspect-[4/5] w-full lg:aspect-[5/6]" />
          )}
        </div>

        <div className="lg:col-span-5 xl:col-span-4 xl:col-start-9">
          <div className="lg:sticky lg:top-28">
            {artwork.artist && (
              <p className="text-eyebrow font-medium uppercase">
                <Link href={`/artworks?artist=${encodeURIComponent(artwork.artist.name)}`} className="inline-flex min-h-11 items-center text-stone-600 transition-colors hover:text-brand-deep">
                  {artwork.artist.name}
                </Link>
              </p>
            )}
            <h1 className="mt-1 font-serif text-h1 italic">{artwork.title}</h1>
            {artwork.year && <p className="mt-2 font-serif text-xl text-stone-600">{artwork.year}</p>}

            {specs.length > 0 && (
              <dl className="mt-8 divide-y divide-stone-200 border-y border-stone-200 text-sm">
                {specs.map(([label, value]) => (
                  <div key={label} className="grid grid-cols-3 gap-4 py-3">
                    <dt className="text-stone-600">{label}</dt>
                    <dd className="col-span-2 text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div className={`flex flex-wrap items-baseline justify-between gap-3 ${specs.length ? "mt-6" : "mt-8 border-t border-stone-200 pt-6"}`}>
              <p className="font-serif text-[1.75rem] leading-none text-ink">{formatPrice(artwork)}</p>
              <AvailabilityBadge availability={artwork.availability} />
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <ButtonLink href={whatsappUrl ?? enquiryHref} className="w-full">
                Enquire about this work
              </ButtonLink>
              <ButtonLink href={contactHref(`Private viewing: ${byLine(artwork)}`)} variant="secondary" className="self-start">
                Request a private viewing
              </ButtonLink>
              {artwork.pdfUrl && <ReadMore href={`/artworks/${artwork.slug}/read`} className="self-start" />}
              {whatsappUrl && (
                <p className="text-caption text-stone-600">
                  Prefer email? <Link href={enquiryHref} className="text-ink underline underline-offset-4">Send an enquiry</Link>
                </p>
              )}
            </div>

            {/* Generic and true: the data model has no provenance, certificate or shipping fields to show. */}
            <p className="mt-10 border-l border-brand pl-4 text-sm leading-relaxed text-stone-700">
              Our team will share condition, provenance and shipping details on enquiry.
            </p>
          </div>
        </div>
      </div>

      {artwork.description && (
        <section aria-labelledby="about-work" className="mt-section grid gap-6 border-t border-stone-200 pt-12 md:grid-cols-12">
          <h2 id="about-work" className="eyebrow md:col-span-3">About the work</h2>
          <div className="prose-gallery md:col-span-8">
            {artwork.description.split(/\n{2,}/).map((para, i) => (
              <p key={i} className={i === 0 ? "font-serif text-[1.375rem] leading-relaxed text-ink" : undefined}>{para}</p>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section aria-labelledby="related" className="mt-section">
          <SectionHead
            id="related"
            eyebrow={sameArtist.length ? "The artist" : "The collection"}
            title={sameArtist.length && artwork.artist ? `More by ${artwork.artist.name}` : "More from the collection"}
            href={sameArtist.length && artwork.artist ? `/artworks?artist=${encodeURIComponent(artwork.artist.name)}` : "/artworks"}
            linkLabel="View all"
          />
          <ul className="grid grid-cols-2 gap-x-5 gap-y-14 lg:grid-cols-4 lg:gap-x-8">
            {related.map((a) => (
              <li key={a.id}><ArtworkCard artwork={a} sizes="(min-width: 1024px) 22vw, 50vw" /></li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
