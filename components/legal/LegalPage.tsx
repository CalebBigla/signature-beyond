import { getSettings } from "@/lib/services";
import { getLegalContent } from "@/lib/content/site-content";
import { parseLegalContent } from "@/lib/content/legal-markup";
import type { LegalKey } from "@/lib/content/legal";
import { PageBanner } from "@/components/ui/PageBanner";

const longDate = (iso: string) =>
  new Date(`${iso.slice(0, 10)}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** Shared layout for the legal pages. The text comes from Admin > Legal pages (or the built-in wording). */
export async function LegalPage({ pageKey }: { pageKey: LegalKey }) {
  const [s, page] = await Promise.all([getSettings(), getLegalContent(pageKey)]);
  const sections = parseLegalContent(page.content);
  const emails = [s.primaryEmail, ...s.additionalEmails].filter(Boolean);
  let n = 0;

  return (
    <>
      <PageBanner title={page.title} />
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {page.showDraftNotice && (
          <p className="mb-8 rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <strong>Draft for review.</strong> This page has not yet been reviewed by the gallery or a legal adviser, and is not legal advice. Text in [square brackets] still needs confirmation.{page.updated && <> Last updated: {longDate(page.updated)}.</>}
          </p>
        )}
        {!page.showDraftNotice && page.updated && <p className="mb-8 text-sm text-stone-500">Last updated: {longDate(page.updated)}</p>}

        {sections.map((sec, i) => {
          const num = sec.heading !== null ? ++n : null;
          return (
            <section key={i} aria-labelledby={sec.heading !== null ? `sec-${i}` : undefined} className="mb-8">
              {sec.heading !== null && <h2 id={`sec-${i}`} className="mb-3 font-serif text-2xl">{num}. {sec.heading}</h2>}
              <div className="space-y-3 text-sm leading-relaxed text-stone-700">
                {sec.blocks.map((b, j) =>
                  b.type === "p" ? (
                    <p key={j} className="whitespace-pre-line">{b.text}</p>
                  ) : (
                    <ul key={j} className="space-y-1">
                      {emails.map((e) => <li key={e}>Email: <a href={`mailto:${e}`} className="underline">{e}</a></li>)}
                      {s.phoneNumbers.map((p) => <li key={p}>Phone: {p}</li>)}
                      {s.address && <li>Address: {s.address}</li>}
                      {!emails.length && !s.phoneNumbers.length && !s.address && <li>Please use the contact options on the Contact page.</li>}
                    </ul>
                  )
                )}
              </div>
            </section>
          );
        })}
      </article>
    </>
  );
}
