import Image from "next/image";
import Link from "next/link";
import type { WebsiteSettings } from "@/types";
import { NAV_LINKS } from "@/lib/navigation";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { SocialIcon } from "@/components/layout/SocialIcon";

const SOCIAL_LABELS: Record<keyof WebsiteSettings["social"], string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
};

const link = "rounded transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
const heading = "mb-3 text-xs font-medium uppercase tracking-[0.2em] text-white";

export function Footer({ settings }: { settings: WebsiteSettings }) {
  // Only accounts that have a URL set are shown, as icons with an accessible name (no visible text).
  const socials = (Object.keys(SOCIAL_LABELS) as (keyof typeof SOCIAL_LABELS)[]).filter((k) => settings.social[k]);
  const explore = NAV_LINKS.filter((l) => l.href !== "/contact");
  const whatsapp = buildWhatsAppUrl(settings);

  return (
    <footer className="bg-ink text-white/75">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.4fr_1fr_1.2fr_1fr]">
        <div>
          <Image src={settings.logoUrl || "/images/logo.png"} alt={settings.siteName} width={270} height={157} className="h-20 w-auto" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            Discover exceptional artworks celebrating African creativity, cultural heritage and contemporary artistic expression.
          </p>
          <Link href="/about" className={`mt-3 inline-block text-sm underline underline-offset-4 ${link}`}>About the gallery</Link>
        </div>

        <nav aria-label="Explore">
          <h2 className={heading}>Explore</h2>
          <ul className="space-y-2 text-sm">
            {explore.map((l) => <li key={l.href}><Link href={l.href} className={link}>{l.label}</Link></li>)}
          </ul>
        </nav>

        <nav aria-label="Help and contact">
          <h2 className={heading}>Help &amp; Contact</h2>
          <ul className="space-y-2 text-sm">
            <li><Link href="/faq" className={link}>FAQs</Link></li>
            <li><Link href="/contact" className={link}>Contact Us</Link></li>
            {settings.primaryEmail && <li><a href={`mailto:${settings.primaryEmail}`} className={`break-all ${link}`}>{settings.primaryEmail}</a></li>}
            {settings.phoneNumbers.map((p) => <li key={p}><a href={`tel:${p.replace(/\s/g, "")}`} className={link}>{p}</a></li>)}
            {whatsapp && <li><a href={whatsapp} target="_blank" rel="noopener noreferrer" className={link}>Chat on WhatsApp</a></li>}
            {settings.address && <li>{settings.address}</li>}
          </ul>
        </nav>

        <nav aria-label="Legal">
          <h2 className={heading}>Legal</h2>
          <ul className="space-y-2 text-sm">
            <li><Link href="/privacy-policy" className={link}>Privacy Policy</Link></li>
            <li><Link href="/terms" className={link}>Terms of Use</Link></li>
            <li><Link href="/auction-terms" className={link}>Auction Terms and Conditions</Link></li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-5 sm:flex-row sm:px-6">
          <p className="text-xs">© {new Date().getFullYear()} {settings.siteName}. All rights reserved.</p>
          {socials.length > 0 && (
            <ul className="flex flex-wrap items-center gap-3" aria-label="Social media">
              {socials.map((k) => (
                <li key={k}>
                  <a
                    href={settings.social[k]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit ${settings.siteName} on ${SOCIAL_LABELS[k]}`}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white/80 transition-colors hover:border-white hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    <SocialIcon name={k} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
}
