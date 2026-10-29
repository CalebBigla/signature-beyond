import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getJournalPostBySlug } from "@/lib/services";
import { PdfReader } from "@/components/documents/PdfReader";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const post = await getJournalPostBySlug((await params).slug);
  return post?.pdfUrl ? { title: `${post.title} (PDF)`, alternates: { canonical: `/journal/${post.slug}/read` } } : { title: "Document not found" };
}

/** "Read more" on a journal article: its attached PDF. */
export default async function JournalDocument({ params }: Params) {
  const post = await getJournalPostBySlug((await params).slug);
  if (!post?.pdfUrl) notFound();
  return <PdfReader eyebrow="Journal" title={post.title} pdfUrl={post.pdfUrl} backHref={`/journal/${post.slug}`} backLabel={post.title} />;
}
