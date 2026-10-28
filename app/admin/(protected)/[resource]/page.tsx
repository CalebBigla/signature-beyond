import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { getResource } from "@/lib/admin/resources";
import { deleteRecord, setStatus } from "@/lib/admin/actions";
import { DeleteButton } from "@/components/admin/DeleteButton";

export default async function ResourceList({ params }: { params: Promise<{ resource: string }> }) {
  const res = getResource((await params).resource);
  if (!res) notFound();
  const { db } = await requireAdmin();
  const { data, error } = await db.from(res.table).select("*").order("created_at", { ascending: false });
  if (error) throw new Error(`Could not load ${res.label}: ${error.message}`);
  const rows = (data ?? []) as Record<string, unknown>[];
  const show = (v: unknown) => (v === null || v === undefined || v === "" ? "-" : typeof v === "boolean" ? (v ? "Yes" : "No") : String(v).slice(0, 10 + (String(v).length > 10 && !/^\d{4}-/.test(String(v)) ? 30 : 0)));

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="font-serif text-3xl">{res.label}</h1>
        <Link href={`/admin/${res.key}/new`} className="rounded bg-ink px-4 py-2 text-sm text-white">Add {res.singular}</Link>
      </div>
      {rows.length === 0 ? (
        <p className="rounded border border-dashed border-stone-300 p-8 text-sm text-stone-500">No {res.label.toLowerCase()} yet. Click &quot;Add {res.singular}&quot; to create the first one.</p>
      ) : (
        <div className="overflow-x-auto rounded border border-stone-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-xs text-stone-500">
              <tr>
                <th className="p-3">Name</th>
                {res.listColumns.map((c) => <th key={c.name} className="p-3">{c.label}</th>)}
                {res.hasStatus && <th className="p-3">Status</th>}
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {rows.map((row) => {
                const id = String(row.id);
                const title = String(row[res.titleField] ?? "");
                const published = row.status === "published";
                return (
                  <tr key={id}>
                    <td className="p-3 font-medium">{title}</td>
                    {res.listColumns.map((c) => <td key={c.name} className="p-3">{show(row[c.name])}</td>)}
                    {res.hasStatus && <td className="p-3">{published ? "Published" : "Draft"}</td>}
                    <td className="p-3">
                      <div className="flex items-center gap-4">
                        <Link href={`/admin/${res.key}/${id}`} className="text-xs underline">Edit</Link>
                        {res.hasStatus && (
                          <form action={setStatus}>
                            <input type="hidden" name="_resource" value={res.key} />
                            <input type="hidden" name="_id" value={id} />
                            <input type="hidden" name="_status" value={published ? "draft" : "published"} />
                            <button type="submit" className="text-xs underline">{published ? "Unpublish" : "Publish"}</button>
                          </form>
                        )}
                        <DeleteButton action={deleteRecord} resource={res.key} id={id} what={title} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
