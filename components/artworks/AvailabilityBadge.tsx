import type { Availability } from "@/types";
import { AVAILABILITY_LABELS } from "@/lib/format";

const DOT: Record<Availability, string> = {
  available: "bg-emerald-700",
  on_request: "bg-brand",
  sold: "bg-red-700",
};

/** Small, understated status: a coloured dot plus the word (colour is never the only signal). */
export function AvailabilityBadge({ availability, className = "" }: { availability: Availability; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 text-caption text-stone-600 ${className}`}>
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${DOT[availability]}`} />
      {AVAILABILITY_LABELS[availability]}
    </span>
  );
}
