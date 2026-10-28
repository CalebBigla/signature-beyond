import Link from "next/link";
import type { ArtworkQuery } from "@/lib/artwork-filters";
import { pageHref } from "@/lib/artwork-filters";
import { AVAILABILITY_LABELS } from "@/lib/format";
import { buttonClass } from "@/components/ui/Button";

interface Props {
  query: ArtworkQuery;
  options: { artists: string[]; mediums: string[]; years: string[] };
}

// Quiet text controls: a hairline underneath, no box.
const field =
  "min-h-11 w-full appearance-none border-0 border-b border-stone-300 bg-transparent px-0 py-2 pr-6 text-sm text-ink focus:border-ink focus:outline-none focus:ring-0";
const chevron =
  "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' fill='none' stroke='%2357534e' stroke-width='1.2'/%3E%3C/svg%3E\")] bg-[length:12px] bg-[right_2px_center] bg-no-repeat";

function Select({ name, label, value, items }: { name: string; label: string; value: string; items: { value: string; label: string }[] }) {
  if (items.length === 0) return null; // hide filters that have nothing to choose from
  return (
    <div className="min-w-0">
      <label htmlFor={name} className="eyebrow block">{label}</label>
      <select id={name} name={name} defaultValue={value} className={`${field} ${chevron}`}>
        <option value="">All</option>
        {items.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
      </select>
    </div>
  );
}

const asItems = (xs: string[]) => xs.map((x) => ({ value: x, label: x }));

/** A plain GET form: works without JavaScript and keeps filters in the URL. */
export function ArtworkFilters({ query, options }: Props) {
  const active = (
    [
      ["q", query.q ? `“${query.q}”` : ""],
      ["artist", query.artist],
      ["medium", query.medium],
      ["year", query.year],
      ["availability", query.availability ? AVAILABILITY_LABELS[query.availability] : ""],
    ] as const
  ).filter(([, v]) => v);

  return (
    <div>
      <form method="get" action="/artworks" className="grid grid-cols-2 items-end gap-x-6 gap-y-6 md:grid-cols-6">
        <div className="col-span-2">
          <label htmlFor="q" className="eyebrow block">Search</label>
          <input id="q" name="q" type="search" defaultValue={query.q} placeholder="Title or artist" className={`${field} placeholder:text-stone-500`} />
        </div>
        <Select name="artist" label="Artist" value={query.artist} items={asItems(options.artists)} />
        <Select name="medium" label="Medium" value={query.medium} items={asItems(options.mediums)} />
        <Select name="year" label="Year" value={query.year} items={asItems(options.years)} />
        <Select
          name="availability"
          label="Availability"
          value={query.availability}
          items={[
            { value: "available", label: AVAILABILITY_LABELS.available },
            { value: "on_request", label: AVAILABILITY_LABELS.on_request },
            { value: "sold", label: AVAILABILITY_LABELS.sold },
          ]}
        />
        <div className="col-span-2 flex items-center gap-6 md:col-span-1">
          <button type="submit" className={buttonClass("primary", "light", "px-6 py-2.5")}>Apply</button>
        </div>
      </form>

      {active.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-caption">
          <span className="text-stone-600">Filtered by</span>
          {active.map(([key, label]) => (
            <Link
              key={key}
              href={pageHref({ ...query, [key]: "" }, 1)}
              className="inline-flex min-h-9 items-center gap-2 border border-stone-300 px-3 text-ink transition-colors hover:border-ink"
              aria-label={`Remove filter: ${label}`}
            >
              {label} <span aria-hidden="true">×</span>
            </Link>
          ))}
          <Link href="/artworks" className="inline-flex min-h-9 items-center px-1 text-ink underline underline-offset-4">Clear all</Link>
        </div>
      )}
    </div>
  );
}
