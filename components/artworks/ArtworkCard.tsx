import Link from "next/link";
import type { Artwork } from "@/types";
import { formatPrice } from "@/lib/format";
import { ArtworkImage } from "./ArtworkImage";
import { AvailabilityBadge } from "./AvailabilityBadge";

/** Gallery-label caption: artist, title, year and medium, then price on its own line. */
export function ArtworkCaption({ artwork, headingLevel = 3 }: { artwork: Artwork; headingLevel?: 2 | 3 }) {
  const Title = `h${headingLevel}` as const;
  const meta = [artwork.year, artwork.medium].filter(Boolean).join(", ");
  return (
    <div className="mt-5">
      {artwork.artist && <p className="text-eyebrow font-medium uppercase text-stone-600">{artwork.artist.name}</p>}
      <Title className="mt-2 font-serif text-[1.375rem] italic leading-snug text-ink">{artwork.title}</Title>
      {meta && <p className="mt-1 text-caption text-stone-600">{meta}</p>}
      <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink">
        <span>{formatPrice(artwork)}</span>
        {artwork.availability !== "on_request" && <AvailabilityBadge availability={artwork.availability} />}
      </p>
    </div>
  );
}

export function ArtworkCard({ artwork, aspect, sizes }: { artwork: Artwork; aspect?: string; sizes?: string }) {
  return (
    <Link href={`/artworks/${artwork.slug}`} className="group block">
      <div className="overflow-hidden">
        <ArtworkImage artwork={artwork} aspect={aspect} sizes={sizes} />
      </div>
      <ArtworkCaption artwork={artwork} />
    </Link>
  );
}
