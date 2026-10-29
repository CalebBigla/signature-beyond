import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedExhibitions } from "@/lib/services";
import { formatDateRange } from "@/lib/format";
import { PHASE_LABELS, eventPhase, splitByPhase } from "@/lib/event-phase";
import { EmptyNote, PageBanner } from "@/components/ui/PageBanner";
import { CoverImage } from "@/components/ui/CoverImage";
import { RecordCard } from "@/components/ui/RecordCard";
import { Reveal } from "@/components/ui/Reveal";
import type { Exhibition } from "@/types";

export const metadata: Metadata = { title: "Exhibitions", description: "Current and past Signature Beyond exhibitions." };

const when = (e: Exhibition) => (e.startDate ? formatDateRange(e.startDate, e.endDate) : e.year ? String(e.year) : PHASE_LABELS.undated);

export default async function ExhibitionsPage() {
  const exhibitions = await getPublishedExhibitions();
  const { current, past, undated } = splitByPhase(exhibitions);
  const archive = [...past, ...undated];

  return (
    <>
      <PageBanner eyebrow="Exhibitions" title="Exhibitions" subtitle="A rich archive of past exhibitions and current showcases." />
      <div className="container-site pb-section">
        {exhibitions.length === 0 && <EmptyNote>New exhibitions will be announced here.</EmptyNote>}

        {current.length > 0 && (
          <section aria-labelledby="current-ex" className="mb-section space-y-20">
            <h2 id="current-ex" className="eyebrow">Current &amp; upcoming</h2>
            {current.map((e) => (
              <Reveal key={e.id}>
                <Link href={`/exhibitions/${e.slug}`} className="group grid gap-8 md:grid-cols-12 md:gap-12">
                  <div className="md:col-span-8">
                    <CoverImage url={e.coverImageUrl} aspect="aspect-[16/10]" sizes="(min-width: 768px) 65vw, 100vw" />
                  </div>
                  <div className="flex flex-col justify-end md:col-span-4">
                    <p className="eyebrow mb-4">{eventPhase(e) === "live" ? "Now on" : "Upcoming"}</p>
                    <h3 className="font-serif text-h2 font-medium transition-colors group-hover:text-brand-deep">{e.title}</h3>
                    <p className="mt-4 text-sm text-stone-700">{when(e)}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </section>
        )}

        {archive.length > 0 && (
          <section aria-labelledby="past-ex" className={current.length ? "border-t border-stone-200 pt-8" : ""}>
            <h2 id="past-ex" className="eyebrow mb-10">{current.length ? "Past exhibitions" : "All exhibitions"}</h2>
            <ul className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {archive.map((e, i) => (
                <li key={e.id}>
                  <Reveal delay={(i % 3) * 0.06}>
                    <RecordCard href={`/exhibitions/${e.slug}`} title={e.title} headingLevel={3} meta={when(e)} imageUrl={e.coverImageUrl} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw" />
                  </Reveal>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
