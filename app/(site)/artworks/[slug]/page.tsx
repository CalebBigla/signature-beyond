import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArtworkBySlug, getPublishedArtworks, getSettings } from "@/lib/services";
import { AVAILABILITY_LABELS, formatPrice } from "@/lib/format";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { ArtworkCard } from "@/components/artworks/ArtworkCard";
import { ArtworkGallery } from "@/components/artworks/ArtworkGallery";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const artwork = await getArtworkBySlug(slug);
  if (!artwork) return { title: "Artwork not found" };
  return {
    title: artwork.title,
    description: artwork.description ?? `${artwork.title} at Signature Beyond.`,
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

  const specs = [
    ["Medium", artwork.medium],
    ["Dimensions", artwork.dimensions],
    ["Year", artwork.year ? String(artwork.year) : null],
    ["Price", formatPrice(artwork)],
    ["Availability", AVAILABILITY_LABELS[artwork.availability]],
  ] as const;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-stone-500">
        <Link href="/artworks" className="underline">Artworks</Link> / {artwork.title}
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {artwork.images.length > 0 ? (
          <ArtworkGallery images={artwork.images} />
        ) : (
          <PlaceholderImage className="aspect-[4/5] w-full" />
        )}

        <div>
          <h1 className="font-serif text-4xl">{artwork.title}</h1>
          <p className="mt-1 text-stone-600">{artwork.artist?.name ?? "Artist to be confirmed"}</p>

          <dl className="mt-6 divide-y divide-stone-200 border-y border-stone-200 text-sm">
            {specs.map(([label, value]) => (
              <div key={label} className="flex justify-between py-2">
                <dt className="text-stone-500">{label}</dt>
                <dd>{value ?? "To be confirmed"}</dd>
              </div>
            ))}
          </dl>

          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block w-full rounded bg-whatsapp px-5 py-3 text-center text-sm font-medium text-white sm:w-auto"
            >
              Enquire on WhatsApp
            </a>
          ) : (
            <p className="mt-6 rounded bg-stone-100 p-3 text-sm text-stone-600">
              WhatsApp enquiries are not set up yet. Add the gallery number in website settings.
            </p>
          )}

          {artwork.description && <p className="mt-6 text-sm leading-relaxed text-stone-700">{artwork.description}</p>}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16" aria-labelledby="related">
          <h2 id="related" className="mb-4 font-serif text-2xl">Related Artworks</h2>
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((a) => (
              <li key={a.id}><ArtworkCard artwork={a} /></li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
