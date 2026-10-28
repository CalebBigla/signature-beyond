import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { RESOURCES } from "@/lib/admin/resources";

export default async function AdminHome() {
  const { db } = await requireAdmin();
  const counts = await Promise.all(
    RESOURCES.map(async (r) => {
      const total = await db.from(r.table).select("id", { count: "exact", head: true });
      const live = r.hasStatus ? await db.from(r.table).select("id", { count: "exact", head: true }).eq("status", "published") : null;
      return { r, total: total.count ?? 0, live: live?.count ?? null, error: total.error?.message };
    })
  );
  const unread = await db.from("enquiries").select("id", { count: "exact", head: true }).eq("handled", false);

  return (
    <>
      <h1 className="mb-6 font-serif text-3xl">Dashboard</h1>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {counts.map(({ r, total, live, error }) => (
          <li key={r.key}>
            <Link href={`/admin/${r.key}`} className="block rounded border border-stone-200 bg-white p-4">
              <p className="text-sm text-stone-500">{r.label}</p>
              <p className="font-serif text-3xl">{error ? "?" : total}</p>
              <p className="text-xs text-stone-500">{error ? error : live !== null ? `${live} published` : ""}</p>
            </Link>
          </li>
        ))}
        <li>
          <Link href="/admin/enquiries" className="block rounded border border-stone-200 bg-white p-4">
            <p className="text-sm text-stone-500">New enquiries</p>
            <p className="font-serif text-3xl">{unread.count ?? 0}</p>
          </Link>
        </li>
      </ul>
    </>
  );
}
