// Settings may be named with or without the NEXT_PUBLIC_ prefix (Vercel's Supabase integration, for
// example, adds SUPABASE_URL / SUPABASE_ANON_KEY). They are resolved once here and passed on under the
// names the code uses, so the website, the admin and the browser all see the same values.
const first = (...names) => names.map((n) => process.env[n]?.trim()).find(Boolean) ?? "";

const supabaseUrl = first("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL");
const supabaseKey = first(
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_PUBLISHABLE_KEY", "SUPABASE_ANON_KEY",
);
// No mode set: use the database whenever it is configured, otherwise the built-in demo content.
const dataMode = first("NEXT_PUBLIC_DATA_MODE", "DATA_MODE") || (supabaseUrl && supabaseKey ? "supabase" : "demo");
const siteUrl = first("NEXT_PUBLIC_SITE_URL", "SITE_URL") || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "");

let supabaseHost = null;
try { supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : null; } catch { /* invalid URL: ignored */ }

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_DATA_MODE: dataMode,
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: supabaseKey,
    ...(siteUrl ? { NEXT_PUBLIC_SITE_URL: siteUrl } : {}),
    NEXT_PUBLIC_GA_ID: first("NEXT_PUBLIC_GA_ID", "GA_ID"),
    NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: first("NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION", "GOOGLE_SITE_VERIFICATION"),
  },
  // The bottom-left "Compiling / Rendering" badge only exists in `npm run dev`; hide it.
  devIndicators: false,
  // Image uploads go through server actions; the default 1 MB limit is too small.
  experimental: { serverActions: { bodySizeLimit: "6mb" } },
  images: {
    // Lets next/image show pictures stored in your Supabase Storage bucket.
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co", pathname: "/storage/v1/object/public/**" },
      ...(supabaseHost
        ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
        : []),
    ],
  },
};
export default nextConfig;
