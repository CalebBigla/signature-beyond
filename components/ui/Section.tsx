import Link from "next/link";

/** Section heading with an eyebrow, a serif title and an optional "view all" link aligned right. */
export function SectionHead({ eyebrow, title, href, linkLabel, id }: { eyebrow?: string; title: string; href?: string; linkLabel?: string; id?: string }) {
  return (
    <div className="mb-10 flex flex-col gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-end sm:justify-between md:mb-14">
      <div>
        {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
        <h2 id={id} className="font-serif text-h2 font-medium">{title}</h2>
      </div>
      {href && linkLabel && (
        <Link
          href={href}
          className="inline-flex min-h-11 shrink-0 items-center text-sm text-ink underline decoration-stone-300 underline-offset-[6px] transition-colors hover:decoration-brand"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
