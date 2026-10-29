import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/services";

/** Server-side check. Every admin page AND every admin action calls this first. */
export async function requireAdmin() {
  // No database in demo mode: send people to the login page, which explains how to connect one.
  if (isDemoMode) redirect("/admin/login");
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: profile } = await db.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!profile) redirect("/admin/login?error=not-admin");
  return { db, user };
}
