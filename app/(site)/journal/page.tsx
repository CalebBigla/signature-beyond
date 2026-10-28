import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedJournalPosts } from "@/lib/services";
import { formatDate } from "@/lib/format";
import { EmptyNote, PageBanner } from "@/components/ui/PageBanner";
import { CoverImage } from "@/components/ui/CoverImage";
import { RecordCard } from "@/components/ui/RecordCard";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = { title: "Journal", description: "Art news, stories and insights from Signature Beyond." };

const byline = (author: string | null, date: string | null) => [author, formatDate(date)].filter(Boolean).join(" · ");

export default async function JournalPage() {
  const posts = await getPublishedJournalPosts();
  const [lead, ...rest] = posts;

  return (
    <>
      <PageBanner eyebrow="Journal" title="Journal" subtitle="Art news, stories and insights from the world of African art." />
      <div className="container-site pb-section">
        {!lead ? (
          <EmptyNote>No journal articles have been published yet.</EmptyNote>
        ) : (
          <>
            {/* Magazine-style lead story, then the rest in a three-column index. */}
            <Link href={`/journal/${lead.slug}`} className="group grid gap-8 md:grid-cols-12 md:gap-12">
              <div className="md:col-span-7">
                <CoverImage url={lead.coverImageUrl} aspect="aspect-[3/2]" priority sizes="(min-width: 768px) 55vw, 100vw" />
              </div>
              <div className="flex flex-col justify-center md:col-span-5">
                <p className="eyebrow mb-4">Latest</p>
                <h2 className="font-serif text-h1 font-medium transition-colors group-hover:text-brand-deep">{lead.title}</h2>
                {lead.excerpt && <p className="mt-6 text-body text-stone-700">{lead.excerpt}</p>}
                <p className="mt-6 text-caption text-stone-600">{byline(lead.author, lead.publishedAt)}</p>
              </div>
            </Link>

            {rest.length > 0 && (
              <ul className="mt-section grid gap-x-8 gap-y-16 border-t border-stone-200 pt-12 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((p, i) => (
                  <li key={p.id}>
                    <Reveal delay={(i % 3) * 0.06}>
                      <RecordCard href={`/journal/${p.slug}`} title={p.title} headingLevel={3} meta={byline(p.author, p.publishedAt)} excerpt={p.excerpt} imageUrl={p.coverImageUrl} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw" />
                    </Reveal>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </>
  );
}
