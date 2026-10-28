import Image from "next/image";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

/** A portrait card photo, or the placeholder box when no photo exists. */
export function CoverImage({ url, className = "" }: { url: string | null; className?: string }) {
  if (!url) return <PlaceholderImage className={`aspect-[3/4] w-full ${className}`} />;
  return (
    <div className={`relative aspect-[3/4] w-full ${className}`}>
      <Image src={url} alt="" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
    </div>
  );
}