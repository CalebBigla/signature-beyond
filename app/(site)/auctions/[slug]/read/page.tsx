import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAuctionBySlug } from "@/lib/services";
import { PdfReader } from "@/components/documents/PdfReader";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const auction = await getAuctionBySlug((await params).slug);
  return auction?.pdfUrl ? { title: `${auction.title} (PDF)`, alternates: { canonical: `/auctions/${auction.slug}/read` } } : { title: "Document not found" };
}

/** "Read more" on an auction: its attached PDF (e.g. the sale catalogue). */
export default async function AuctionDocument({ params }: Params) {
  const auction = await getAuctionBySlug((await params).slug);
  if (!auction?.pdfUrl) notFound();
  return <PdfReader eyebrow="Auction" title={auction.title} pdfUrl={auction.pdfUrl} backHref={`/auctions/${auction.slug}`} backLabel={auction.title} />;
}
