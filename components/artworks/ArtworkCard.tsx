import Link from "next/link";
import type { Artwork } from "@/types";
import { AVAILABILITY_LABELS, formatPrice } from "@/lib/format";
import { ArtworkImage } from "./ArtworkImage";

export function ArtworkCard({ artwork }: { artwork: Artwork }) {
  return (
    <Link href={`/artworks/${artwork.slug}`} className="group block overflow-hidden rounded border border-stone-200 bg-white">
      <div className="overflow-hidden">
        <ArtworkImage artwork={artwork} className="transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium">{artwork.title}</h3>
        <p className="text-xs text-stone-500">{artwork.artist?.name ?? "Artist to be confirmed"}</p>
        <p className="mt-1 flex items-center justify-between text-xs">
          <span>{formatPrice(artwork)}</span>
          <span className="text-stone-500">{AVAILABILITY_LABELS[artwork.availability]}</span>
        </p>
      </div>
    </Link>
  );
}
