import type { Artwork } from "@/types";

export function formatPrice(a: Artwork): string {
  if (a.priceOnRequest || a.price === null || !a.currency) return "Price on request";
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: a.currency,
    maximumFractionDigits: 0,
  }).format(a.price);
}

export function formatDateRange(start: string | null, end: string | null): string {
  if (!start) return "Dates to be confirmed";
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  return end ? `${fmt(start)} – ${fmt(end)}` : fmt(start);
}

export const AVAILABILITY_LABELS = {
  available: "Available",
  sold: "Sold",
  on_request: "On request",
} as const;

export function formatDate(d: string | null): string {
  return d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "";
}
