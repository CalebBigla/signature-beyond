/** Where a dated event (auction or exhibition) sits relative to today. Dates are YYYY-MM-DD. */
export type EventPhase = "upcoming" | "live" | "past" | "undated";

const today = () => new Date().toISOString().slice(0, 10);

export function eventPhase(e: { startDate: string | null; endDate: string | null }, now = today()): EventPhase {
  if (!e.startDate) return "undated";
  const start = e.startDate.slice(0, 10);
  const end = (e.endDate ?? e.startDate).slice(0, 10);
  if (now < start) return "upcoming";
  if (now <= end) return "live";
  return "past";
}

export const PHASE_LABELS: Record<EventPhase, string> = {
  upcoming: "Upcoming",
  live: "Now on",
  past: "Past",
  undated: "",
};

/** Upcoming/live first (soonest first), then past (most recent first), then undated. */
export function splitByPhase<T extends { startDate: string | null; endDate: string | null }>(items: T[]) {
  const withPhase = items.map((item) => ({ item, phase: eventPhase(item) }));
  const current = withPhase
    .filter((x) => x.phase === "live" || x.phase === "upcoming")
    .sort((a, b) => (a.item.startDate ?? "").localeCompare(b.item.startDate ?? ""))
    .map((x) => x.item);
  const past = withPhase
    .filter((x) => x.phase === "past")
    .sort((a, b) => (b.item.startDate ?? "").localeCompare(a.item.startDate ?? ""))
    .map((x) => x.item);
  const undated = withPhase.filter((x) => x.phase === "undated").map((x) => x.item);
  return { current, past, undated };
}

export const yearOf = (d: string | null) => (d ? Number(d.slice(0, 4)) : null);
