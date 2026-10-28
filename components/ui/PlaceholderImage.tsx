export function PlaceholderImage({ className = "" }: { className?: string }) {
  return (
    <div
      role="img"
      aria-label="Image placeholder: artwork photo to be supplied"
      className={`flex items-center justify-center bg-[#e9e3da] text-eyebrow uppercase text-stone-600 ${className}`}
    >
      <span className="border-y border-stone-300 px-1 py-2">Image to be supplied</span>
    </div>
  );
}
