import type { Metadata } from "next";
import Link from "next/link";
import { getFaqCategories } from "@/lib/content/site-content";
import { PageBanner } from "@/components/ui/PageBanner";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Answers to common questions about Signature Beyond, its artworks, auctions, exhibitions and how to get in touch.",
};

export default async function FaqPage() {
  const FAQ = await getFaqCategories();
  return (
    <>
      <PageBanner eyebrow="Help" title="Frequently Asked Questions" subtitle="Answers to common questions about the gallery and this website." />
      <div className="container-site max-w-4xl pb-section">
        <nav aria-label="FAQ categories" className="mb-10">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {FAQ.map((c) => (
              <li key={c.id}><a href={`#${c.id}`} className="inline-flex min-h-11 items-center underline decoration-stone-300 underline-offset-4 hover:decoration-brand">{c.title}</a></li>
            ))}
          </ul>
        </nav>

        {FAQ.map((c) => (
          <section key={c.id} id={c.id} aria-labelledby={`${c.id}-title`} className="mb-12 scroll-mt-24">
            <h2 id={`${c.id}-title`} className="mb-4 font-serif text-h2 font-medium">{c.title}</h2>
            <div className="border-t border-stone-200">
              {c.items.map((item, idx) => (
                <details key={`${c.id}-${idx}`} className="group border-b border-stone-200">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 min-h-11 py-5 text-left text-body font-medium [&::-webkit-details-marker]:hidden">
                    <span>{item.q}</span>
                    <span aria-hidden="true" className="text-xl leading-none transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <div className="max-w-measure pb-6 text-body text-stone-700">
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

        <div className="border-t border-brand pt-10 text-center">
          <h2 className="font-serif text-h2 font-medium">Still have a question?</h2>
          <p className="mx-auto mt-4 max-w-md text-body text-stone-600">If you could not find what you were looking for, the gallery will be glad to help.</p>
          <ButtonLink href="/contact" className="mt-8">Contact Us</ButtonLink>
        </div>
      </div>
    </>
  );
}
