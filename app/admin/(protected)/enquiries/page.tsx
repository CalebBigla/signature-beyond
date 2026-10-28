import { requireAdmin } from "@/lib/admin/auth";

interface Enquiry { id: string; name: string; email: string; phone: string | null; subject: string | null; message: string; created_at: string }

export default async function EnquiriesPage() {
  const { db } = await requireAdmin();
  const { data, error } = await db.from("enquiries").select("*").order("created_at", { ascending: false }).limit(100);
  if (error) throw new Error(`Could not load enquiries: ${error.message}`);
  const rows = (data ?? []) as Enquiry[];
  return (
    <>
      <h1 className="mb-6 font-serif text-3xl">Enquiries</h1>
      {rows.length === 0 ? <p className="text-sm text-stone-500">No messages yet.</p> : (
        <ul className="space-y-4">
          {rows.map((e) => (
            <li key={e.id} className="rounded border border-stone-200 bg-white p-4 text-sm">
              <p className="font-medium">{e.name} · <a href={`mailto:${e.email}`} className="underline">{e.email}</a>{e.phone ? ` · ${e.phone}` : ""}</p>
              <p className="text-xs text-stone-500">{new Date(e.created_at).toLocaleString("en-GB")}{e.subject ? ` · ${e.subject}` : ""}</p>
              <p className="mt-2 whitespace-pre-wrap">{e.message}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
