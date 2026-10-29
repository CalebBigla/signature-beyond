// Server-side only (used by lib/admin/actions.ts).
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import type { createClient } from "@/lib/supabase/server";

/** Admin sign-in: at most 5 failed attempts per email + IP in 15 minutes. */
export const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

type Db = Awaited<ReturnType<typeof createClient>>;

/**
 * Fallback store for when the database functions (006_login_rate_limit.sql) are not installed yet.
 * It only covers one server process, which is why the database version is preferred.
 */
const memory = new Map<string, number[]>();
const recent = (key: string) => (memory.get(key) ?? []).filter((t) => Date.now() - t < WINDOW_MS);

export async function loginKey(email: string): Promise<string> {
  const h = await headers();
  const ip = (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "unknown").trim();
  return createHash("sha256").update(`${email.trim().toLowerCase()}|${ip}`).digest("hex");
}

export async function rateStatus(db: Db, key: string): Promise<{ failures: number; retryAfterSeconds: number }> {
  const { data, error } = await db.rpc("login_rate_status", { p_key: key });
  if (!error && Array.isArray(data) && data[0]) {
    const row = data[0] as { failures: number; retry_after_seconds: number };
    return { failures: row.failures, retryAfterSeconds: row.retry_after_seconds };
  }
  const times = recent(key);
  return { failures: times.length, retryAfterSeconds: times.length ? Math.ceil((times[0] + WINDOW_MS - Date.now()) / 1000) : 0 };
}

export async function recordFailure(db: Db, key: string): Promise<void> {
  const { error } = await db.rpc("login_rate_fail", { p_key: key });
  if (error) memory.set(key, [...recent(key), Date.now()]);
}

export async function resetAttempts(db: Db, key: string): Promise<void> {
  await db.rpc("login_rate_reset", { p_key: key });
  memory.delete(key);
}

export const minutesText = (seconds: number) => {
  const m = Math.max(1, Math.ceil(seconds / 60));
  return `${m} minute${m === 1 ? "" : "s"}`;
};
