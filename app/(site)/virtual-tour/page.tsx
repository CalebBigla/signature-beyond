import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSettings } from "@/lib/services";
import { PageBanner } from "@/components/ui/PageBanner";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Virtual Tour", description: "Take a virtual tour of Signature Beyond Art Gallery." };

// The tour itself is hosted elsewhere (link set in Admin > Homepage > Virtual tour); this page forwards to it.
export default async function VirtualTourPage() {
  const s = await getSettings();
  if (/^https:\/\//.test(s.virtualTourUrl)) redirect(s.virtualTourUrl);

  return (
    <>
      <PageBanner eyebrow="Virtual Tour" title="Virtual tour" subtitle="The online tour of the gallery is being prepared." />
      <div className="container-site pb-section">
        <p className="max-w-measure text-body text-stone-700">In the meantime, you are welcome to visit the gallery in person or arrange a private viewing.</p>
        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          <ButtonLink href="/contact?subject=Private%20viewing%20request">Book a private viewing</ButtonLink>
          <ButtonLink href="/artworks" variant="secondary">View the collection</ButtonLink>
        </div>
      </div>
    </>
  );
}
