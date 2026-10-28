import Image from "next/image";
import type { Artwork } from "@/types";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

/** Shows the artwork's main image, or a clear placeholder when none exists. */
export function ArtworkImage({ artwork, className = "" }: { artwork: Artwork; className?: string }) {
  const main = artwork.images.find((i) => i.isMain) ?? artwork.images[0];
  if (!main) return <PlaceholderImage className={`aspect-[3/4] w-full ${className}`} />;
  return (
    <div className={`relative aspect-[3/4] w-full ${className}`}>
      <Image src={main.url} alt={main.alt} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
    </div>
  );
}
