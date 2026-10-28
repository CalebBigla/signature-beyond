import type { Metadata } from "next";
import { getSettings } from "@/lib/services";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { PageBanner } from "@/components/ui/PageBanner";
import { EnquiryForm } from "@/components/forms/EnquiryForm";

export const metadata: Metadata = { title: "Contact", description: "Contact Signature Beyond." };

export default async function ContactPage() {
  const s = await getSettings();
  const whatsapp = buildWhatsAppUrl(s);
  const emails = [s.primaryEmail, ...s.additionalEmails].filter(Boolean);
  const hasAnything = Boolean(whatsapp || emails.length || s.phoneNumbers.length || s.address);

  return (
    <>
      <PageBanner title="Contact" subtitle="We would love to hear from you." />
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-12 text-sm sm:px-6">
        {!hasAnything && (
          <p className="rounded border border-dashed border-stone-300 p-6 text-stone-500">
            Contact details have not been added yet. Add them in website settings.
          </p>
        )}
        {s.address && <p><strong className="block">Address</strong>{s.address}</p>}
        {s.phoneNumbers.length > 0 && (
          <p><strong className="block">Phone</strong>
            {s.phoneNumbers.map((p) => <a key={p} href={`tel:${p.replace(/\s/g, "")}`} className="mr-4 underline">{p}</a>)}
          </p>
        )}
        {emails.length > 0 && (
          <p><strong className="block">Email</strong>
            {emails.map((e) => <a key={e} href={`mailto:${e}`} className="mr-4 underline">{e}</a>)}
          </p>
        )}
        {whatsapp && (
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="inline-block rounded bg-whatsapp px-5 py-3 font-medium text-white">
            Chat on WhatsApp
          </a>
        )}
        <EnquiryForm />
      </div>
    </>
  );
}
