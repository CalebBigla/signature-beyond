import { PageSkeleton } from "@/components/ui/PageSkeleton";

/** Shown while the collection loads. Same grid as the page, so nothing jumps. */
export default function ArtworksLoading() {
  return <PageSkeleton />;
}
