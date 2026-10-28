import Image from "next/image";
import Link from "next/link";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

interface Props { href: string; title: string; meta: string; imageUrl: string | null; imageAlt?: string }

/** Shared card for auctions, exhibitions and journal posts. */
export function RecordCard({ href, title, meta, imageUrl, imageAlt = "" }: Props) {
  return (
    <Link href={href} className="group block overflow-hidden rounded border border-stone-200 bg-white">
      <div className="overflow-hidden">
        {imageUrl ? (
          <div className="relative aspect-[4/3] w-full transition-transform duration-500 group-hover:scale-105">
            <Image src={imageUrl} alt={imageAlt} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
          </div>
        ) : (
          <PlaceholderImage className="aspect-[4/3] w-full transition-transform duration-500 group-hover:scale-105" />
        )}
      </div>
      <div className="p-4">
        <h2 className="font-serif text-xl">{title}</h2>
        <p className="mt-1 text-xs text-stone-500">{meta}</p>
        <span className="mt-3 inline-block text-xs font-medium">View details →</span>
      </div>
    </Link>
  );
}
