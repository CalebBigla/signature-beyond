import type { Metadata } from "next";
import { getPublishedAuctions } from "@/lib/services";
import { formatDateRange } from "@/lib/format";
import { EmptyNote, PageBanner } from "@/components/ui/PageBanner";
import { RecordCard } from "@/components/ui/RecordCard";

export const metadata: Metadata = { title: "Auctions", description: "Past and upcoming Signature Beyond auctions." };

export default async function AuctionsPage() {
  const auctions = await getPublishedAuctions();
  return (
    <>
      <PageBanner title="Auctions" subtitle="Explore our past and upcoming auctions featuring exceptional African art." />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {auctions.length === 0 ? (
          <EmptyNote>No auctions have been published yet.</EmptyNote>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {auctions.map((a) => (
              <li key={a.id}>
                <RecordCard href={`/auctions/${a.slug}`} title={a.title} meta={formatDateRange(a.startDate, a.endDate)} imageUrl={a.coverImageUrl} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
