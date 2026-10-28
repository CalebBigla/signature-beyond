import type { Artwork, Availability } from "@/types";

export const PAGE_SIZE = 9;

export interface ArtworkQuery {
  q: string;
  artist: string;
  medium: string;
  year: string;
  availability: "" | Availability;
  page: number;
}

type RawParams = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] ?? "" : v ?? "");

export function parseQuery(raw: RawParams): ArtworkQuery {
  const a = one(raw.availability);
  const page = parseInt(one(raw.page), 10);
  return {
    q: one(raw.q).trim(),
    artist: one(raw.artist),
    medium: one(raw.medium),
    year: one(raw.year),
    availability: a === "available" || a === "sold" || a === "on_request" ? a : "",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

export function filterArtworks(all: Artwork[], f: ArtworkQuery): Artwork[] {
  const q = f.q.toLowerCase();
  return all.filter(
    (a) =>
      (!q || a.title.toLowerCase().includes(q) || (a.artist?.name.toLowerCase().includes(q) ?? false)) &&
      (!f.artist || a.artist?.name === f.artist) &&
      (!f.medium || a.medium === f.medium) &&
      (!f.year || String(a.year) === f.year) &&
      (!f.availability || a.availability === f.availability)
  );
}

export function paginate<T>(items: T[], page: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  return { items: items.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE), page: current, totalPages };
}

const unique = (xs: (string | null | undefined)[]) =>
  [...new Set(xs.filter((x): x is string => Boolean(x)))].sort();

export function filterOptions(all: Artwork[]) {
  return {
    artists: unique(all.map((a) => a.artist?.name)),
    mediums: unique(all.map((a) => a.medium)),
    years: unique(all.map((a) => (a.year ? String(a.year) : null))).reverse(),
  };
}

export function pageHref(f: ArtworkQuery, page: number): string {
  const p = new URLSearchParams();
  (["q", "artist", "medium", "year", "availability"] as const).forEach((k) => f[k] && p.set(k, f[k]));
  if (page > 1) p.set("page", String(page));
  const s = p.toString();
  return s ? `/artworks?${s}` : "/artworks";
}
