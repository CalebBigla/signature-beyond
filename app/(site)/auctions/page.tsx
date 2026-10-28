import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedAuctions } from "@/lib/services";
import { formatDateRange } from "@/lib/format";
import { eventPhase, splitByPhase, yearOf } from "@/lib/event-phase";
import { EmptyNote, PageBanner } from "@/components/ui/PageBanner";
import { CoverImage } from "@/components/ui/CoverImage";
import { RecordCard } from "@/components/ui/RecordCard";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import type { Auction } from "@/types";

export const metadata: Metadata = { title: "Auctions", description: "Past and upcoming Signature Beyond auctions." };

const grid = "grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3";
const card = (a: Auction) => (
  <RecordCard
    href={`/auctions/${a.slug}`}
    title={a.title}
    headingLevel={3}
    meta={formatDateRange(a.startDate, a.endDate)}
    imageUrl={a.coverImageUrl}
    aspect="aspect-[4/5]"
    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
  />
);

export default async function AuctionsPage() {
  const auctions = await getPublishedAuctions();
  const { current, past, undated } = splitByPhase(auctions);

  // Past auctions grouped by year, newest first.
  const years = new Map<number, Auction[]>();
  for (const a of past) {
    const y = yearOf(a.startDate) as number;
    years.set(y, [...(years.get(y) ?? []), a]);
  }

  return (
    <>
      <PageBanner eyebrow="Auctions" title="Auctions" subtitle="Explore our past and upcoming auctions featuring exceptional African art." />
      <div className="container-site pb-section">
        {auctions.length === 0 && <EmptyNote>No auctions have been published yet.</EmptyNote>}

        {current.length > 0 && (
          <section aria-labelledby="current-auctions" className="mb-section">
            <h2 id="current-auctions" className="eyebrow mb-10">Upcoming &amp; live</h2>
            <ul className="space-y-20">
              {current.map((a) => {
                const phase = eventPhase(a);
                return (
                  <li key={a.id}>
                    <Reveal className="grid items-center gap-10 md:grid-cols-12 md:gap-12">
                      <Link href={`/auctions/${a.slug}`} className="group block md:col-span-6 lg:col-span-7" tabIndex={-1} aria-hidden="true">
                        <CoverImage url={a.coverImageUrl} aspect="aspect-[4/5]" fit="contain" sizes="(min-width: 1024px) 55vw, (min-width: 768px) 50vw, 100vw" />
                      </Link>
                      <div className="md:col-span-6 lg:col-span-4 lg:col-start-9">
                        <p className="eyebrow mb-5">{phase === "live" ? "Now on" : "Upcoming"}</p>
                        <h3 className="font-serif text-h1 font-medium">{a.title}</h3>
                        <p className="mt-6 border-t border-stone-200 pt-4 font-serif text-h3 text-ink">{formatDateRange(a.startDate, a.endDate)}</p>
                        <ButtonLink href={`/auctions/${a.slug}`} className="mt-10">View catalogue</ButtonLink>
                      </div>
                    </Reveal>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {[...years.entries()].map(([year, items]) => (
          <section key={year} aria-labelledby={`y-${year}`} className="mb-20 border-t border-stone-200 pt-8 md:grid md:grid-cols-12 md:gap-8">
            <h2 id={`y-${year}`} className="mb-8 font-serif text-h2 font-medium text-stone-600 md:col-span-2">{year}</h2>
            <ul className={`${grid} md:col-span-10`}>
              {items.map((a) => <li key={a.id}>{card(a)}</li>)}
            </ul>
          </section>
        ))}

        {undated.length > 0 && (
          <section aria-labelledby="archive" className={current.length || past.length ? "border-t border-stone-200 pt-8" : ""}>
            <h2 id="archive" className="eyebrow mb-10">{current.length || past.length ? "Archive" : "All auctions"}</h2>
            <ul className={grid}>
              {undated.map((a, i) => <li key={a.id}><Reveal delay={(i % 3) * 0.06}>{card(a)}</Reveal></li>)}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
