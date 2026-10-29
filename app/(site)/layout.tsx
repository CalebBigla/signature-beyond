import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { getSettings, isDemoMode } from "@/lib/services";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    // "site" switches on the public-site tokens (warm ink, focus rings); the admin area never has it.
    <div className="site">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:text-white">
        Skip to content
      </a>
      {isDemoMode && (
        <p className="bg-amber-100 px-4 py-1 text-center text-xs text-amber-900">
          Demo mode: sample content only, not verified gallery information.
        </p>
      )}
      <Header siteName={settings.siteName} logoSrc={settings.logoUrl || "/images/logo.png"} social={settings.social} />
      <main id="main">{children}</main>
      <Footer settings={settings} />
      <WhatsAppButton settings={settings} />
    </div>
  );
}
