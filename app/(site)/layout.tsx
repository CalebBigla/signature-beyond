import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { getSettings, isDemoMode } from "@/lib/services";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <>
      {isDemoMode && (
        <p className="bg-amber-100 px-4 py-1 text-center text-xs text-amber-900">
          Demo mode: sample content only, not verified gallery information.
        </p>
      )}
<Header siteName={settings.siteName} logoSrc={settings.logoUrl || "/images/logo.png"} />
      <main>{children}</main>
      <Footer settings={settings} />
      <WhatsAppButton settings={settings} />
    </>
  );
}
