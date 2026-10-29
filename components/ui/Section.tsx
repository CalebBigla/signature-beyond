import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";

/** Section heading with an eyebrow, a serif title and an optional "view all" link aligned right. Rises in on scroll. */
export function SectionHead({ eyebrow, title, href, linkLabel, id }: { eyebrow?: string; title: string; href?: string; linkLabel?: string; id?: string }) {
  return (
    <Reveal className="mb-10 flex flex-col gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-end sm:justify-between md:mb-14">
      <div>
        {eyebrow && (
          <p className="eyebrow mb-4 flex items-center gap-3">
            <span aria-hidden="true" className="h-px w-8 bg-brand" />
            {eyebrow}
          </p>
        )}
        <h2 id={id} className="font-serif text-h2 font-medium">{title}</h2>
      </div>
      {href && linkLabel && (
        <Link
          href={href}
          className="group inline-flex min-h-11 shrink-0 items-center gap-2 text-sm text-ink underline decoration-stone-300 underline-offset-[6px] transition-colors hover:decoration-brand"
        >
          {linkLabel}
          <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none">→</span>
        </Link>
      )}
    </Reveal>
  );
}
