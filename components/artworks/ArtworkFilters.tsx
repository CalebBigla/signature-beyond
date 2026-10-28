import Link from "next/link";
import type { ArtworkQuery } from "@/lib/artwork-filters";

interface Props {
  query: ArtworkQuery;
  options: { artists: string[]; mediums: string[]; years: string[] };
}

const field = "w-full rounded border border-stone-300 bg-white px-3 py-2 text-sm";

function Select({ name, label, value, items }: { name: string; label: string; value: string; items: string[] }) {
  if (items.length === 0) return null; // hide filters that have nothing to choose from
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-xs text-stone-600">{label}</label>
      <select id={name} name={name} defaultValue={value} className={field}>
        <option value="">All</option>
        {items.map((i) => <option key={i} value={i}>{i}</option>)}
      </select>
    </div>
  );
}

/** A plain GET form: works without JavaScript and keeps filters in the URL. */
export function ArtworkFilters({ query, options }: Props) {
  return (
    <form method="get" action="/artworks" className="space-y-4">
      <div>
        <label htmlFor="q" className="mb-1 block text-xs text-stone-600">Search</label>
        <input id="q" name="q" type="search" defaultValue={query.q} placeholder="Title or artist" className={field} />
      </div>
      <Select name="artist" label="Artist" value={query.artist} items={options.artists} />
      <Select name="medium" label="Medium" value={query.medium} items={options.mediums} />
      <Select name="year" label="Year" value={query.year} items={options.years} />
      <div>
        <label htmlFor="availability" className="mb-1 block text-xs text-stone-600">Availability</label>
        <select id="availability" name="availability" defaultValue={query.availability} className={field}>
          <option value="">All</option>
          <option value="available">Available</option>
          <option value="on_request">On request</option>
          <option value="sold">Sold</option>
        </select>
      </div>
      <div className="flex gap-3">
        <button type="submit" className="rounded bg-ink px-4 py-2 text-sm text-white">Apply</button>
        <Link href="/artworks" className="px-2 py-2 text-sm underline">Reset</Link>
      </div>
    </form>
  );
}
