import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

/** For code running in the browser (e.g. admin image upload). */
export function createClient() {
  const { url, key } = getSupabaseEnv();
  return createBrowserClient(url, key);
}
