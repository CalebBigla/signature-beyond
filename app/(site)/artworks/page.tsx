import type { Metadata } from "next";
import Image from "next/image"
import Link from "next/link";
import { getPublishedArtworks } from "@/lib/services";
import { filterArtworks, filterOptions, pageHref, paginate, parseQuery } from "@/lib/artwork-filters";
import { ArtworkCard } from "@/components/artworks/ArtworkCard";
import { ArtworkFilters } from "@/components/artworks/ArtworkFilters";

export const metadata: Metadata = {
  title: "Artworks",
  description: "Browse the Signature Beyond collection of contemporary African art.",
  alternates: { canonical: "/artworks" },
};

export default async function ArtworksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = parseQuery(await searchParams);
  const all = await getPublishedArtworks();
  const filtered = filterArtworks(all, query);
  const { items, page, totalPages } = paginate(filtered, query.page);

  return (
    <>
      <section className="relative py-14 text-white overflow-hidden">
  <Image
    src="/images/background-1.jpeg"
    alt="Artworks background"
    fill
    className="object-cover"
  />
  <div className="absolute inset-0 bg-black/60" />
  
  <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
    <h1 className="font-serif text-5xl">Artworks</h1>
    <p className="mt-3 max-w-md text-sm text-white/80">
      Discover exceptional works from leading and emerging African artists.
    </p>
  </div>
</section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[220px_1fr]">
        <aside aria-label="Filter artworks">
          <ArtworkFilters query={query} options={filterOptions(all)} />
        </aside>

        <section aria-label="Artwork results">
          <p className="mb-4 text-sm text-stone-500" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? "artwork" : "artworks"}
          </p>

          {items.length === 0 ? (
            <p className="rounded border border-dashed border-stone-300 p-8 text-sm text-stone-500">
              {all.length === 0
                ? "No artworks have been published yet."
                : "No artworks match your filters. Try resetting them."}
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {items.map((a) => (
                <li key={a.id}><ArtworkCard artwork={a} /></li>
              ))}
            </ul>
          )}

          {totalPages > 1 && (
            <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-4 text-sm">
              {page > 1 && <Link href={pageHref(query, page - 1)}>← Previous</Link>}
              <span>Page {page} of {totalPages}</span>
              {page < totalPages && <Link href={pageHref(query, page + 1)}>Next →</Link>}
            </nav>
          )}
        </section>
      </div>
    </>
  );
}
