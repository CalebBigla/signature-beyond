import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { LEGAL_DEFAULTS, LEGAL_KEYS } from "@/lib/content/legal";
import { formatDate } from "@/lib/format";
import { Badge, PageHeader, btn } from "@/components/admin/ui";

const PUBLIC_PATH = { "privacy-policy": "/privacy-policy", terms: "/terms", "auction-terms": "/auction-terms" } as const;

export default async function LegalPagesList() {
  const { db } = await requireAdmin();
  const { data, error } = await db.from("legal_pages").select("page_key, title, last_updated");
  if (error) throw new Error(`Could not load the legal pages: ${error.message}`);
  const saved = new Map(((data ?? []) as { page_key: string; title: string; last_updated: string | null }[]).map((r) => [r.page_key, r]));

  return (
    <>
      <PageHeader
        title="Legal pages"
        description={<>Edit the Privacy Policy, Terms of Use and Auction Terms. Changes go live when you save. These texts have not been checked by a lawyer, so have them reviewed before removing the &quot;Draft for review&quot; notice.</>}
        crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Legal pages" }]}
      />
      <ul className="divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white shadow-sm">
        {LEGAL_KEYS.map((key) => {
          const row = saved.get(key);
          const title = row?.title ?? LEGAL_DEFAULTS[key].title;
          return (
            <li key={key} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <p className="flex items-center gap-2 font-medium">{title} {row ? <Badge tone="published">Edited</Badge> : <Badge tone="neutral">Original wording</Badge>}</p>
                <p className="text-xs text-stone-500">
                  {row ? (row.last_updated ? `Last updated ${formatDate(row.last_updated)}` : "Saved, no date set") : "Showing the original built-in wording"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link href={PUBLIC_PATH[key]} target="_blank" rel="noopener noreferrer" className={btn("ghost", "sm")}>View live page</Link>
                <Link href={`/admin/legal/${key}`} className={btn("secondary", "sm")}>Edit</Link>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
