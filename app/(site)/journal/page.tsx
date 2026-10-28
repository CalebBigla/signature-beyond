import type { Metadata } from "next";
import { getPublishedJournalPosts } from "@/lib/services";
import { formatDate } from "@/lib/format";
import { EmptyNote, PageBanner } from "@/components/ui/PageBanner";
import { RecordCard } from "@/components/ui/RecordCard";

export const metadata: Metadata = { title: "Journal", description: "Art news, stories and insights from Signature Beyond." };

export default async function JournalPage() {
  const posts = await getPublishedJournalPosts();
  return (
    <>
      <PageBanner title="Journal" subtitle="Art news, stories and insights from the world of African art." />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {posts.length === 0 ? (
          <EmptyNote>No journal articles have been published yet.</EmptyNote>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <li key={p.id}>
                <RecordCard href={`/journal/${p.slug}`} title={p.title} meta={formatDate(p.publishedAt) || "Draft date"} imageUrl={p.coverImageUrl} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
