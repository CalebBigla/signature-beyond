import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";

interface Props {
  eyebrow: string;
  title: string;
  pdfUrl: string;
  backHref: string;
  backLabel: string;
}

/** "Read more": the attached PDF shown inside the site, with download and full-screen options. */
export function PdfReader({ eyebrow, title, pdfUrl, backHref, backLabel }: Props) {
  return (
    <article className="container-site pb-section pt-8 md:pt-12">
      <Link href={backHref} className="inline-flex min-h-11 items-center text-caption text-stone-600 underline decoration-stone-300 underline-offset-4 hover:decoration-brand">
        ← {backLabel}
      </Link>

      <header className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="hero-rise eyebrow mb-4 flex items-center gap-3">
            <span aria-hidden="true" className="h-px w-8 bg-brand" />
            {eyebrow}
          </p>
          <h1 className="hero-rise font-serif text-h2 font-medium" style={{ animationDelay: "0.1s" }}>{title}</h1>
        </div>
        <div className="hero-rise flex flex-wrap items-center gap-x-6 gap-y-3" style={{ animationDelay: "0.2s" }}>
          <ButtonLink href={pdfUrl}>Open full screen</ButtonLink>
          <a href={pdfUrl} download className="inline-flex min-h-11 items-center px-1 text-sm font-medium text-ink underline decoration-stone-300 underline-offset-[6px] hover:decoration-brand">
            Download PDF
          </a>
        </div>
      </header>

      {/* Phones often show only the first page of an embedded PDF, so they get a clear button instead. */}
      <div className="hero-frame mt-10 overflow-hidden rounded-2xl border border-stone-200 bg-bone">
        <iframe
          src={`${pdfUrl}#view=FitH`}
          title={`${title} (PDF)`}
          className="hidden h-[calc(100svh-12rem)] min-h-[520px] w-full md:block"
        />
        <div className="flex flex-col items-center gap-4 px-6 py-16 text-center md:hidden">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-xs font-bold text-red-700 shadow-sm">PDF</span>
          <p className="max-w-xs text-body text-stone-700">Open the document to read it on your phone.</p>
          <ButtonLink href={pdfUrl}>Open the PDF</ButtonLink>
        </div>
      </div>
    </article>
  );
}
