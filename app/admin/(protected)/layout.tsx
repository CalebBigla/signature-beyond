import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminShell } from "@/components/admin/AdminShell";
import { DemoNotice } from "@/components/admin/DemoNotice";
import { requireAdmin } from "@/lib/admin/auth";
import { isDemoMode } from "@/lib/services";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

interface EnquiryRow { id: string; name: string; subject: string | null; message: string; created_at: string; handled: boolean }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (isDemoMode) return <DemoNotice />;
  const { db } = await requireAdmin();

  // Theme and sidebar state live in cookies, so the server renders the right look straight away (no flash).
  const jar = await cookies();
  const theme = jar.get("admin-theme")?.value === "dark" ? "dark" : "light";
  const collapsed = jar.get("admin-sidebar")?.value === "collapsed";

  const [recent, unread] = await Promise.all([
    db.from("enquiries").select("id,name,subject,message,created_at,handled").order("created_at", { ascending: false }).limit(10),
    db.from("enquiries").select("id", { count: "exact", head: true }).eq("handled", false),
  ]);
  const loadError = recent.error?.message ?? unread.error?.message;
  const items = ((recent.data ?? []) as EnquiryRow[]).map((e) => ({
    id: e.id,
    title: e.subject ? `${e.name}: ${e.subject}` : e.name,
    body: e.message,
    createdAt: e.created_at,
    read: e.handled,
  }));

  return (
    <AdminShell initialTheme={theme} initialCollapsed={collapsed} notifications={{ items, unread: unread.count ?? 0, loadError }}>
      {children}
    </AdminShell>
  );
}
