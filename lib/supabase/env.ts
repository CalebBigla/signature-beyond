export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local (see docs/SUPABASE_SETUP.md)."
    );
  }
  return { url, key };
}

/** Public web address of a file stored in the "media" bucket. */
export function mediaUrl(path: string | null): string | null {
  if (!path) return null;
  const { url } = getSupabaseEnv();
  return `${url}/storage/v1/object/public/media/${path}`;
}
