import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArtworkBySlug } from "@/lib/services";
import { PdfReader } from "@/components/documents/PdfReader";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const a = await getArtworkBySlug((await params).slug);
  return a?.pdfUrl ? { title: `${a.title} (PDF)`, alternates: { canonical: `/artworks/${a.slug}/read` } } : { title: "Document not found" };
}

/** "Read more" on an artwork: its attached PDF. */
export default async function ArtworkDocument({ params }: Params) {
  const a = await getArtworkBySlug((await params).slug);
  if (!a?.pdfUrl) notFound();
  return <PdfReader eyebrow={a.artist?.name ?? "Artwork"} title={a.title} pdfUrl={a.pdfUrl} backHref={`/artworks/${a.slug}`} backLabel={a.title} />;
}
