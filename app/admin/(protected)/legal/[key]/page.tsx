import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { LEGAL_DEFAULTS, isLegalKey } from "@/lib/content/legal";
import { LegalPageForm } from "@/components/admin/LegalPageForm";

export default async function EditLegalPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!isLegalKey(key)) notFound();
  const { db } = await requireAdmin();

  const { data, error } = await db.from("legal_pages").select("title, content, last_updated, show_draft_notice").eq("page_key", key).maybeSingle();
  if (error) throw new Error(`Could not load the page: ${error.message}`);

  // No saved version yet: start the form from the original built-in wording.
  const d = LEGAL_DEFAULTS[key];
  const row = data as { title: string; content: string; last_updated: string | null; show_draft_notice: boolean } | null;

  return (
    <>
      <Link href="/admin/legal" className="text-xs underline">← Legal pages</Link>
      <h1 className="mb-6 mt-3 font-serif text-3xl">Edit: {row?.title ?? d.title}</h1>
      <LegalPageForm
        pageKey={key}
        title={row?.title ?? d.title}
        content={row?.content ?? d.content}
        lastUpdated={(row ? row.last_updated : d.updated)?.slice(0, 10) ?? ""}
        showDraftNotice={row ? row.show_draft_notice : true}
        hasSavedVersion={Boolean(row)}
      />
    </>
  );
}
