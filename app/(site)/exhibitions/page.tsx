import type { Metadata } from "next";
import { getPublishedExhibitions } from "@/lib/services";
import { EmptyNote, PageBanner } from "@/components/ui/PageBanner";
import { RecordCard } from "@/components/ui/RecordCard";

export const metadata: Metadata = { title: "Exhibitions", description: "Current and past Signature Beyond exhibitions." };

export default async function ExhibitionsPage() {
  const exhibitions = await getPublishedExhibitions();
  return (
    <>
      <PageBanner title="Exhibitions" subtitle="A rich archive of past exhibitions and current showcases." />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {exhibitions.length === 0 ? (
          <EmptyNote>No exhibitions have been published yet.</EmptyNote>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {exhibitions.map((e) => (
              <li key={e.id}>
                <RecordCard href={`/exhibitions/${e.slug}`} title={e.title} meta={e.year ? String(e.year) : "Date to be confirmed"} imageUrl={e.coverImageUrl} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
