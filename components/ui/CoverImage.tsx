import Image from "next/image";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

/** A cover photo (poster, exhibition view) in a fixed-ratio frame, or the placeholder when no photo exists. */
export function CoverImage({
  url,
  alt = "",
  className = "",
  aspect = "aspect-[3/4]",
  sizes = "(min-width: 1024px) 33vw, 100vw",
  priority = false,
  fit = "cover",
}: {
  url: string | null;
  alt?: string;
  className?: string;
  aspect?: string;
  sizes?: string;
  priority?: boolean;
  /** "contain" for posters, so text on them is never cut off. */
  fit?: "cover" | "contain";
}) {
  if (!url) return <PlaceholderImage className={`${aspect} w-full ${className}`} />;
  return (
    <div className={`relative ${aspect} w-full overflow-hidden rounded-2xl ${fit === "contain" ? "bg-bone" : ""} ${className}`}>
      <Image
        src={url}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`${fit === "contain" ? "object-contain" : "object-cover"} transition-transform duration-700 ease-gallery group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100`}
      />
    </div>
  );
}
