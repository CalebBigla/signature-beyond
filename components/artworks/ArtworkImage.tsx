import Image from "next/image";
import type { Artwork } from "@/types";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

/**
 * The artwork's main image on a bone mat. The box has a fixed ratio (no layout shift) and the
 * work is contained inside it, so a painting is never cropped.
 */
export function ArtworkImage({
  artwork,
  className = "",
  aspect = "aspect-[4/5]",
  sizes = "(min-width: 1024px) 30vw, 50vw",
}: {
  artwork: Artwork;
  className?: string;
  aspect?: string;
  sizes?: string;
}) {
  const main = artwork.images.find((i) => i.isMain) ?? artwork.images[0];
  if (!main) return <PlaceholderImage className={`${aspect} w-full ${className}`} />;
  return (
    <div className={`relative ${aspect} w-full overflow-hidden rounded-2xl bg-bone ${className}`}>
      <Image
        src={main.url}
        alt={main.alt || `${artwork.title}${artwork.artist ? ` by ${artwork.artist.name}` : ""}`}
        fill
        sizes={sizes}
        className="object-contain p-[7%] transition-transform duration-700 ease-gallery group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
    </div>
  );
}
