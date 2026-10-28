import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getExhibitionBySlug, getPublishedArtworks } from "@/lib/services";
import { formatDateRange } from "@/lib/format";
import { ArtworkCard } from "@/components/artworks/ArtworkCard";
import { PageBanner } from "@/components/ui/PageBanner";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const ex = await getExhibitionBySlug((await params).slug);
  return ex ? { title: ex.title, description: ex.description ?? `${ex.title} at Signature Beyond.` } : { title: "Exhibition not found" };
}

export default async function ExhibitionPage({ params }: Params) {
  const ex = await getExhibitionBySlug((await params).slug);
  if (!ex) notFound();
  const artworks = (await getPublishedArtworks()).filter((a) => ex.artworkIds.includes(a.id));

  return (
    <>
      <PageBanner title={ex.title} subtitle={ex.startDate ? formatDateRange(ex.startDate, ex.endDate) : ex.year ? String(ex.year) : "Date to be confirmed"} />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Link href="/exhibitions" className="text-xs underline">← All exhibitions</Link>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-stone-700">{ex.description ?? "Description to be confirmed."}</p>
        <h2 className="mb-4 mt-12 font-serif text-2xl">Artworks in this exhibition</h2>
        {artworks.length === 0 ? (
          <p className="text-sm text-stone-500">No artworks have been linked to this exhibition yet.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {artworks.map((a) => <li key={a.id}><ArtworkCard artwork={a} /></li>)}
          </ul>
        )}
      </div>
    </>
  );
}
