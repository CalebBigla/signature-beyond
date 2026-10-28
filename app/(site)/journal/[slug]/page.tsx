import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getJournalPostBySlug } from "@/lib/services";
import { formatDate } from "@/lib/format";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const post = await getJournalPostBySlug((await params).slug);
  if (!post) return { title: "Article not found" };
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    alternates: { canonical: `/journal/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.excerpt ?? undefined, ...(post.coverImageUrl ? { images: [{ url: post.coverImageUrl }] } : {}) },
  };
}

export default async function JournalPostPage({ params }: Params) {
  const post = await getJournalPostBySlug((await params).slug);
  if (!post) notFound();
  const meta = [post.author, formatDate(post.publishedAt)].filter(Boolean).join(" · ");

  return (
    <article className="pb-section">
      <header className="container-site pt-8 md:pt-12">
        <Link href="/journal" className="inline-flex min-h-11 items-center text-caption text-stone-600 underline decoration-stone-300 underline-offset-4 hover:decoration-brand">
          ← Journal
        </Link>
        <div className="mx-auto mt-10 max-w-measure text-center">
          <p className="eyebrow">Journal</p>
          <h1 className="mt-5 font-serif text-h1 font-medium">{post.title}</h1>
          {post.excerpt && <p className="mt-6 font-serif text-h3 italic text-stone-700">{post.excerpt}</p>}
          {meta && <p className="mt-6 text-caption text-stone-600">{meta}</p>}
        </div>
      </header>

      {post.coverImageUrl && (
        <div className="container-site mt-12">
          <div className="relative aspect-[3/2] w-full overflow-hidden bg-bone">
            <Image src={post.coverImageUrl} alt="" fill priority sizes="(min-width: 1280px) 1200px, 100vw" className="object-cover" />
          </div>
        </div>
      )}

      {/* Plain text: paragraphs split on blank lines; a paragraph starting with "> " becomes a pull quote. No raw HTML is rendered. */}
      <div className="container-site mt-14">
        <div className="prose-gallery mx-auto">
          {post.content.split(/\n{2,}/).map((para, i) =>
            para.startsWith("> ") ? (
              <blockquote key={i}>{para.replace(/^>\s?/gm, "")}</blockquote>
            ) : (
              <p key={i}>{para}</p>
            )
          )}
        </div>
      </div>
    </article>
  );
}
