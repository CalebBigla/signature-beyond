import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { LEGAL_DEFAULTS, LEGAL_KEYS } from "@/lib/content/legal";
import { formatDate } from "@/lib/format";

const PUBLIC_PATH = { "privacy-policy": "/privacy-policy", terms: "/terms", "auction-terms": "/auction-terms" } as const;

export default async function LegalPagesList() {
  const { db } = await requireAdmin();
  const { data, error } = await db.from("legal_pages").select("page_key, title, last_updated");
  if (error) throw new Error(`Could not load the legal pages: ${error.message}`);
  const saved = new Map(((data ?? []) as { page_key: string; title: string; last_updated: string | null }[]).map((r) => [r.page_key, r]));

  return (
    <>
      <h1 className="mb-2 font-serif text-3xl">Legal pages</h1>
      <p className="mb-8 max-w-2xl text-sm text-stone-600">
        Edit the wording of the Privacy Policy, Terms of Use and Auction Terms. Changes go live as soon as you save. These texts have not been checked by a lawyer, so please have them reviewed before removing the &quot;Draft for review&quot; notice.
      </p>
      <ul className="max-w-2xl divide-y divide-stone-200 rounded border border-stone-200 bg-white">
        {LEGAL_KEYS.map((key) => {
          const row = saved.get(key);
          const title = row?.title ?? LEGAL_DEFAULTS[key].title;
          return (
            <li key={key} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium">{title}</p>
                <p className="text-xs text-stone-500">
                  {row ? (row.last_updated ? `Last updated ${formatDate(row.last_updated)}` : "Saved, no date set") : "Showing the original built-in wording"}
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <Link href={PUBLIC_PATH[key]} target="_blank" rel="noopener noreferrer" className="underline">View live page</Link>
                <Link href={`/admin/legal/${key}`} className="rounded bg-ink px-4 py-2 text-white">Edit</Link>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
