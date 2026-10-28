import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuctionBySlug, getPublishedArtworks } from "@/lib/services";
import { formatDateRange } from "@/lib/format";
import { ArtworkCard } from "@/components/artworks/ArtworkCard";
import { PageBanner } from "@/components/ui/PageBanner";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const auction = await getAuctionBySlug((await params).slug);
  return auction ? { title: auction.title, description: auction.description ?? `${auction.title} at Signature Beyond.` } : { title: "Auction not found" };
}

export default async function AuctionPage({ params }: Params) {
  const auction = await getAuctionBySlug((await params).slug);
  if (!auction) notFound();
  const artworks = (await getPublishedArtworks()).filter((a) => auction.artworkIds.includes(a.id));

  return (
    <>
      <PageBanner title={auction.title} subtitle={formatDateRange(auction.startDate, auction.endDate)} />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Link href="/auctions" className="text-xs underline">← All auctions</Link>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-stone-700">
          {auction.description ?? "Description to be confirmed."}
        </p>
        <h2 className="mb-4 mt-12 font-serif text-2xl">Artworks</h2>
        {artworks.length === 0 ? (
          <p className="text-sm text-stone-500">No artworks have been linked to this auction yet.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {artworks.map((a) => <li key={a.id}><ArtworkCard artwork={a} /></li>)}
          </ul>
        )}
      </div>
    </>
  );
}
