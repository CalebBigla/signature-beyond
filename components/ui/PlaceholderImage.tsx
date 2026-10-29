import Image from "next/image";

/** Shown where a record has no photo yet: a quiet frame with the gallery mark, not a "missing image" notice. */
export function PlaceholderImage({ className = "" }: { className?: string }) {
  return (
    <div role="img" aria-label="Image coming soon" className={`flex items-center justify-center bg-[#ebe6de] ${className}`}>
      <Image src="/images/logo.png" alt="" width={270} height={157} sizes="96px" className="h-10 w-auto opacity-25 grayscale sm:h-12" />
    </div>
  );
}
