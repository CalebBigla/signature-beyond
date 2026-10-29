import Image from "next/image";
import Link from "next/link";
import type { WebsiteSettings } from "@/types";
import { FOOTER_EXTRA_LINKS, NAV_LINKS } from "@/lib/navigation";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { SocialIcon } from "@/components/layout/SocialIcon";

const SOCIAL_LABELS: Record<keyof WebsiteSettings["social"], string> = {
  facebook: "Facebook",
  twitter: "X (Twitter)",
  instagram: "Instagram",
  youtube: "YouTube",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
};

const link = "inline-flex min-h-8 items-center transition-colors hover:text-white";
// Brand orange is AA-compliant as text on ink (6.8:1).
const heading = "mb-5 text-eyebrow font-medium uppercase text-brand";

/** First sentence of the About summary, for a short line under the logo. */
const firstSentence = (s: string) => s.match(/^.*?[.!?](\s|$)/)?.[0].trim() ?? s;

export function Footer({ settings }: { settings: WebsiteSettings }) {
  // Only accounts that have a URL set are shown, as icons with an accessible name (no visible text).
  const socials = (Object.keys(SOCIAL_LABELS) as (keyof typeof SOCIAL_LABELS)[]).filter((k) => settings.social[k]);
  const explore = [...NAV_LINKS.filter((l) => l.href !== "/contact"), ...FOOTER_EXTRA_LINKS];
  const whatsapp = buildWhatsAppUrl(settings);
  const about = settings.aboutSummary.trim();

  return (
    <footer className="on-dark bg-ink text-white/70">
      <div className="container-site grid gap-12 py-20 md:py-28 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Image src={settings.logoUrl || "/images/logo.png"} alt={settings.siteName} width={270} height={157} sizes="140px" className="h-20 w-auto" />
          {about && <p className="mt-8 max-w-sm font-serif text-xl leading-snug text-white/85">{firstSentence(about)}</p>}
          <Link href="/about" className="mt-6 inline-flex min-h-11 items-center text-sm text-white underline decoration-white/30 underline-offset-[6px] transition-colors hover:decoration-brand">
            About the gallery
          </Link>
        </div>

        <nav aria-label="Explore" className="lg:col-span-2 lg:col-start-6">
          <h2 className={heading}>Explore</h2>
          <ul className="space-y-1.5 text-sm">
            {explore.map((l) => <li key={l.href}><Link href={l.href} className={link}>{l.label}</Link></li>)}
          </ul>
        </nav>

        <div className="lg:col-span-3">
          <h2 className={heading}>Visit &amp; Contact</h2>
          {settings.address && <address className="mb-5 whitespace-pre-line text-sm not-italic leading-relaxed text-white/85">{settings.address}</address>}
          <ul className="space-y-1.5 text-sm">
            {settings.primaryEmail && <li><a href={`mailto:${settings.primaryEmail}`} className={`break-all ${link}`}>{settings.primaryEmail}</a></li>}
            {settings.phoneNumbers.map((p) => <li key={p}><a href={`tel:${p.replace(/\s/g, "")}`} className={link}>{p}</a></li>)}
            {whatsapp && <li><a href={whatsapp} target="_blank" rel="noopener noreferrer" className={link}>Chat on WhatsApp</a></li>}
            <li><Link href="/contact" className={link}>Contact us</Link></li>
            <li><Link href="/faq" className={link}>FAQs</Link></li>
          </ul>
        </div>

        <nav aria-label="Legal" className="lg:col-span-2">
          <h2 className={heading}>Legal</h2>
          <ul className="space-y-1.5 text-sm">
            <li><Link href="/privacy-policy" className={link}>Privacy Policy</Link></li>
            <li><Link href="/terms" className={link}>Terms of Use</Link></li>
            <li><Link href="/auction-terms" className={link}>Auction Terms and Conditions</Link></li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <div className="container-site flex flex-col-reverse items-start justify-between gap-6 py-8 sm:flex-row sm:items-center">
          <p className="text-xs tracking-wide text-white/60">© {new Date().getFullYear()} {settings.siteName}. All rights reserved.</p>
          {socials.length > 0 && (
            <ul className="-ml-3 flex flex-wrap items-center gap-1 sm:ml-0 sm:-mr-3" aria-label="Social media">
              {socials.map((k) => (
                <li key={k}>
                  <a
                    href={settings.social[k]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit ${settings.siteName} on ${SOCIAL_LABELS[k]}`}
                    className="flex h-11 w-11 items-center justify-center text-white/70 transition-colors hover:text-brand"
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
