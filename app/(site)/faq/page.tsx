import type { Metadata } from "next";
import Link from "next/link";
import { getFaqCategories } from "@/lib/content/site-content";
import { PageBanner } from "@/components/ui/PageBanner";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Answers to common questions about Signature Beyond, its artworks, auctions, exhibitions and how to get in touch.",
};

export default async function FaqPage() {
  const FAQ = await getFaqCategories();
  return (
    <>
      <PageBanner title="Frequently Asked Questions" subtitle="Answers to common questions about the gallery and this website." />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <nav aria-label="FAQ categories" className="mb-10">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {FAQ.map((c) => (
              <li key={c.id}><a href={`#${c.id}`} className="underline underline-offset-4">{c.title}</a></li>
            ))}
          </ul>
        </nav>

        {FAQ.map((c) => (
          <section key={c.id} id={c.id} aria-labelledby={`${c.id}-title`} className="mb-12 scroll-mt-24">
            <h2 id={`${c.id}-title`} className="mb-2 font-serif text-3xl">{c.title}</h2>
            <div className="border-t border-stone-200">
              {c.items.map((item, idx) => (
                <details key={`${c.id}-${idx}`} className="group border-b border-stone-200">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink [&::-webkit-details-marker]:hidden">
                    <span>{item.q}</span>
                    <span aria-hidden="true" className="text-xl leading-none transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <div className="pb-5 text-sm leading-relaxed text-stone-700">
                    {item.a.split(/\n\s*\n/).map((para, i) => <p key={i} className={i ? "mt-3" : undefined}>{para}</p>)}
                    {item.link && (
                      <p className="mt-3"><Link href={item.link.href} className="underline underline-offset-4">{item.link.label} →</Link></p>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}

        <div className="rounded border border-stone-200 bg-white p-6 text-center">
          <h2 className="font-serif text-2xl">Still have a question?</h2>
          <p className="mt-2 text-sm text-stone-600">If you could not find what you were looking for, the gallery will be glad to help.</p>
          <Link href="/contact" className="mt-4 inline-block rounded bg-ink px-5 py-3 text-sm text-white">Contact Us</Link>
        </div>
      </div>
    </>
  );
}
