import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedArtworks } from "@/lib/services";
import { filterArtworks, filterOptions, pageHref, paginate, parseQuery } from "@/lib/artwork-filters";
import { ArtworkCard } from "@/components/artworks/ArtworkCard";
import { ArtworkFilters } from "@/components/artworks/ArtworkFilters";
import { PageBanner } from "@/components/ui/PageBanner";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Artworks",
  description: "Browse the Signature Beyond collection of contemporary African art.",
  alternates: { canonical: "/artworks" },
};

const pager = "inline-flex min-h-11 items-center px-2 underline decoration-stone-300 underline-offset-[6px] hover:decoration-brand";

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
      <PageBanner eyebrow="The collection" title="Artworks" subtitle="Discover exceptional works from leading and emerging African artists." />

      <div className="container-site pb-section">
        {all.length > 0 && (
          <section aria-label="Filter artworks" className="mb-12 md:mb-16">
            <ArtworkFilters query={query} options={filterOptions(all)} />
          </section>
        )}

        <section aria-label="Artwork results">
          <h2 className="eyebrow mb-8" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? "work" : "works"}
          </h2>

          {items.length === 0 ? (
            <div className="border-y border-stone-200 py-16 text-center">
              <p className="font-serif text-h3">{all.length === 0 ? "The collection is being prepared." : "No works match these filters."}</p>
              <p className="mt-3 text-sm text-stone-600">
                {all.length === 0 ? <>For available works, please <Link href="/contact?subject=Available%20works" className="underline underline-offset-4">contact the gallery</Link>.</> : <>Try removing a filter, or <Link href="/artworks" className="underline underline-offset-4">view all works</Link>.</>}
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-x-5 gap-y-14 md:grid-cols-3 md:gap-x-8 md:gap-y-20">
              {items.map((a, i) => (
                <li key={a.id}>
                  <Reveal delay={(i % 3) * 0.06}>
                    <ArtworkCard artwork={a} sizes="(min-width: 768px) 30vw, 50vw" />
                  </Reveal>
                </li>
              ))}
            </ul>
          )}

          {totalPages > 1 && (
            <nav aria-label="Pagination" className="mt-20 flex items-center justify-between border-t border-stone-200 pt-6 text-sm">
              {page > 1 ? <Link href={pageHref(query, page - 1)} className={pager}>← Previous</Link> : <span />}
              <span className="text-stone-600">Page {page} of {totalPages}</span>
              {page < totalPages ? <Link href={pageHref(query, page + 1)} className={pager}>Next →</Link> : <span />}
            </nav>
          )}
        </section>
      </div>
    </>
  );
}
