import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getExhibitionBySlug, getPublishedArtworks } from "@/lib/services";
import { formatDateRange } from "@/lib/format";
import { PHASE_LABELS, eventPhase } from "@/lib/event-phase";
import { ArtworkCard } from "@/components/artworks/ArtworkCard";
import { CoverImage } from "@/components/ui/CoverImage";
import { SectionHead } from "@/components/ui/Section";
import type { Artist } from "@/types";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const ex = await getExhibitionBySlug((await params).slug);
  if (!ex) return { title: "Exhibition not found" };
  const description = ex.description ?? `${ex.title} at Signature Beyond.`;
  return {
    title: ex.title,
    description,
    alternates: { canonical: `/exhibitions/${ex.slug}` },
    openGraph: { title: ex.title, description, ...(ex.coverImageUrl ? { images: [{ url: ex.coverImageUrl }] } : {}) },
  };
}

export default async function ExhibitionPage({ params }: Params) {
  const ex = await getExhibitionBySlug((await params).slug);
  if (!ex) notFound();
  const all = await getPublishedArtworks();
  const artworks = all.filter((a) => ex.artworkIds.includes(a.id));
  const phase = eventPhase(ex);
  const when = ex.startDate ? formatDateRange(ex.startDate, ex.endDate) : ex.year ? String(ex.year) : PHASE_LABELS.undated;

  // Featured artists: those linked to the exhibition, found through the published artworks (no artist service exists).
  const artists = new Map<string, Artist>();
  for (const a of all) if (a.artist && (ex.artistIds.includes(a.artist.id) || ex.artworkIds.includes(a.id))) artists.set(a.artist.id, a.artist);

  return (
    <article className="pb-section">
      <header className="container-site pt-8 md:pt-12">
        <Link href="/exhibitions" className="inline-flex min-h-11 items-center text-caption text-stone-600 underline decoration-stone-300 underline-offset-4 hover:decoration-brand">
          ← All exhibitions
        </Link>
        <div className="mt-8 grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <p className="eyebrow mb-5">{phase === "live" ? "Current exhibition" : phase === "upcoming" ? "Upcoming exhibition" : "Exhibition"}</p>
            <h1 className="font-serif text-display font-medium">{ex.title}</h1>
          </div>
          <p className="font-serif text-h3 text-stone-700 md:col-span-4 md:text-right">{when}</p>
        </div>
      </header>

      {ex.coverImageUrl && (
        <div className="mx-auto mt-12 max-w-[96rem] md:px-6 lg:px-10">
          <CoverImage url={ex.coverImageUrl} alt={`${ex.title}, installation view`} aspect="aspect-[16/9]" priority sizes="100vw" />
        </div>
      )}

      <div className="container-site mt-16 grid gap-10 border-t border-stone-200 pt-12 md:grid-cols-12">
        <div className="md:col-span-3">
          {artists.size > 0 && (
            <>
              <h2 className="eyebrow">Artists</h2>
              <ul className="mt-4 space-y-1 text-sm">
                {[...artists.values()].map((a) => (
                  <li key={a.id}>
                    <Link href={`/artworks?artist=${encodeURIComponent(a.name)}`} className="inline-flex min-h-9 items-center text-ink underline decoration-stone-300 underline-offset-4 hover:decoration-brand">{a.name}</Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        <div className="prose-gallery md:col-span-8">
          <h2 className="sr-only">About the exhibition</h2>
          {ex.description ? (
            ex.description.split(/\n{2,}/).map((p, i) => <p key={i} className={i === 0 ? "font-serif text-[1.375rem] leading-relaxed text-ink" : undefined}>{p}</p>)
          ) : (
            <p className="text-stone-600">Description to be confirmed.</p>
          )}
        </div>
      </div>

      <section aria-labelledby="ex-works" className="container-site mt-section">
        <SectionHead id="ex-works" eyebrow="On view" title="Works in this exhibition" />
        {artworks.length === 0 ? (
          <p className="text-body text-stone-600">No artworks have been linked to this exhibition yet.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-x-5 gap-y-14 md:grid-cols-3 md:gap-x-8 lg:grid-cols-4">
            {artworks.map((a) => <li key={a.id}><ArtworkCard artwork={a} sizes="(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 50vw" /></li>)}
          </ul>
        )}
      </section>
    </article>
  );
}
