import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getExhibitionBySlug } from "@/lib/services";
import { PdfReader } from "@/components/documents/PdfReader";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const ex = await getExhibitionBySlug((await params).slug);
  return ex?.pdfUrl ? { title: `${ex.title} (PDF)`, alternates: { canonical: `/exhibitions/${ex.slug}/read` } } : { title: "Document not found" };
}

/** "Read more" on an exhibition: its attached PDF (e.g. the catalogue). */
export default async function ExhibitionDocument({ params }: Params) {
  const ex = await getExhibitionBySlug((await params).slug);
  if (!ex?.pdfUrl) notFound();
  return <PdfReader eyebrow="Exhibition" title={ex.title} pdfUrl={ex.pdfUrl} backHref={`/exhibitions/${ex.slug}`} backLabel={ex.title} />;
}
