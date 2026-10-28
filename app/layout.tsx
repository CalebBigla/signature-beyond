import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/ui/Providers";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { SITE_URL } from "@/lib/site";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-serif" });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });

const description = "Signature Beyond: contemporary African art, exhibitions, auctions and editorial.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Signature Beyond", template: "%s | Signature Beyond" },
  description,
  openGraph: { type: "website", siteName: "Signature Beyond", title: "Signature Beyond", description },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body className="font-sans">
        <Providers>{children}</Providers>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
