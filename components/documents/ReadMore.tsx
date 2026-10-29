import Link from "next/link";

/** "Read more" link to the PDF reader page. Render it only when a PDF is attached. */
export function ReadMore({ href, className = "" }: { href: string; className?: string }) {
  return (
    <Link
      href={href}
      className={`group inline-flex min-h-11 items-center gap-3 rounded-full border border-stone-300 py-1.5 pl-1.5 pr-5 text-sm font-medium text-ink transition-colors hover:border-ink ${className}`}
    >
      <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-bone text-[9px] font-bold tracking-wide text-red-700">PDF</span>
      Read more
      <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none">→</span>
    </Link>
  );
}
