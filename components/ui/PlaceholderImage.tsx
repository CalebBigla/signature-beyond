export function PlaceholderImage({ className = "" }: { className?: string }) {
  return (
    <div
      role="img"
      aria-label="Image placeholder: artwork photo to be supplied"
      className={`flex items-center justify-center bg-gradient-to-br from-stone-300 to-stone-500 text-xs uppercase tracking-widest text-stone-700 ${className}`}
    >
      Image to be supplied
    </div>
  );
}
