import type { Metadata } from "next";
import { getSettings } from "@/lib/services";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { subjectFromParams } from "@/lib/enquiry";
import { PageBanner } from "@/components/ui/PageBanner";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Contact", description: "Contact Signature Beyond." };

const link = "text-ink underline decoration-stone-300 underline-offset-4 transition-colors hover:decoration-brand";

export default async function ContactPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [s, params] = await Promise.all([getSettings(), searchParams]);
  const whatsapp = buildWhatsAppUrl(s);
  const emails = [s.primaryEmail, ...s.additionalEmails].filter(Boolean);
  const mapUrl = s.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address)}` : null;

  return (
    <>
      <PageBanner eyebrow="Contact" title="Contact the gallery" subtitle="We would love to hear from you." />
      <div className="container-site grid gap-16 pb-section lg:grid-cols-12">
        <aside aria-label="Gallery contact details" className="space-y-10 lg:col-span-4">
          {s.address && (
            <div>
              <h2 className="eyebrow">Visit</h2>
              <address className="mt-3 whitespace-pre-line font-serif text-h3 not-italic leading-snug text-ink">{s.address}</address>
              {mapUrl && <a href={mapUrl} target="_blank" rel="noopener noreferrer" className={`mt-3 inline-flex min-h-11 items-center text-sm ${link}`}>Open in Maps</a>}
            </div>
          )}
          {s.phoneNumbers.length > 0 && (
            <div>
              <h2 className="eyebrow">Telephone</h2>
              <ul className="mt-3 space-y-1">
                {s.phoneNumbers.map((p) => <li key={p}><a href={`tel:${p.replace(/\s/g, "")}`} className={`inline-flex min-h-9 items-center text-body ${link}`}>{p}</a></li>)}
              </ul>
            </div>
          )}
          {emails.length > 0 && (
            <div>
              <h2 className="eyebrow">Email</h2>
              <ul className="mt-3 space-y-1">
                {emails.map((e) => <li key={e}><a href={`mailto:${e}`} className={`inline-flex min-h-9 items-center break-all text-body ${link}`}>{e}</a></li>)}
              </ul>
            </div>
          )}
          {whatsapp && (
            <div>
              <h2 className="eyebrow">WhatsApp</h2>
              <ButtonLink href={whatsapp} variant="secondary" className="mt-1">Chat with the gallery</ButtonLink>
            </div>
          )}
        </aside>

        <div className="border-t border-stone-200 pt-12 lg:col-span-7 lg:col-start-6 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
          <EnquiryForm defaultSubject={subjectFromParams(params.subject)} />
        </div>
      </div>
    </>
  );
}
