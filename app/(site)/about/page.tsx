import type { Metadata } from "next";
import { getSettings } from "@/lib/services";
import { PageBanner } from "@/components/ui/PageBanner";

export const metadata: Metadata = { title: "About", description: "About Signature Beyond." };

export default async function AboutPage() {
  const settings = await getSettings();
  return (
    <>
      <PageBanner title="About" subtitle={settings.siteName} />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {settings.establishedYear && <p className="mb-2 text-xs tracking-widest text-stone-500">EST. {settings.establishedYear}</p>}
        <h2 className="font-serif text-3xl">Our Story</h2>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">{settings.aboutSummary}</p>
      </div>
    </>
  );
}
