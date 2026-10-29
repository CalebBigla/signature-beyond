import { PageSkeleton } from "@/components/ui/PageSkeleton";

/** Shown instantly while a detail page loads. */
export default function DetailLoading() {
  return <PageSkeleton variant="detail" />;
}
