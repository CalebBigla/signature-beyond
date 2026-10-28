import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getJournalPostBySlug } from "@/lib/services";
import { formatDate } from "@/lib/format";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const post = await getJournalPostBySlug((await params).slug);
  return post ? { title: post.title, description: post.excerpt ?? undefined } : { title: "Article not found" };
}

export default async function JournalPostPage({ params }: Params) {
  const post = await getJournalPostBySlug((await params).slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link href="/journal" className="text-xs underline">← Journal</Link>
      <h1 className="mt-6 font-serif text-4xl">{post.title}</h1>
      <p className="mt-2 text-xs text-stone-500">
        {[post.author, formatDate(post.publishedAt)].filter(Boolean).join(" · ")}
      </p>
      {/* Plain text for now: paragraphs split on blank lines. No raw HTML is rendered. */}
      <div className="mt-8 space-y-4 text-sm leading-relaxed text-stone-700">
        {post.content.split(/\n{2,}/).map((para, i) => <p key={i}>{para}</p>)}
      </div>
    </article>
  );
}
