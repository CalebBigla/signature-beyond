const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;

/** @type {import('next').NextConfig} */
const nextConfig = {
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