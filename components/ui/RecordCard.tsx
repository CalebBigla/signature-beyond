import Link from "next/link";
import { CoverImage } from "@/components/ui/CoverImage";

interface Props {
  href: string;
  title: string;
  meta: string;
  imageUrl: string | null;
  imageAlt?: string;
  eyebrow?: string;
  excerpt?: string | null;
  aspect?: string;
  sizes?: string;
  headingLevel?: 2 | 3;
}

/** Shared editorial entry for auctions, exhibitions and journal posts: image, hairline, caption. No box. */
export function RecordCard({ href, title, meta, imageUrl, imageAlt = "", eyebrow, excerpt, aspect = "aspect-[4/3]", sizes, headingLevel = 2 }: Props) {
  const Title = `h${headingLevel}` as const;
  return (
    <Link href={href} className="group block">
      <CoverImage url={imageUrl} alt={imageAlt} aspect={aspect} sizes={sizes} />
      <div className="mt-5 border-t border-stone-200 pt-4">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <Title className="font-serif text-h3 font-medium text-ink transition-colors group-hover:text-brand-deep">{title}</Title>
        {meta && <p className="mt-2 text-caption text-stone-600">{meta}</p>}
        {excerpt && <p className="mt-3 line-clamp-3 max-w-prose text-sm leading-relaxed text-stone-700">{excerpt}</p>}
      </div>
    </Link>
  );
}
