import { LoadingBar } from "@/components/ui/PageSkeleton";

/** Shown inside the admin shell while a screen loads (the sidebar and top bar stay in place). */
export default function AdminLoading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <LoadingBar />
      <div className="mb-8 space-y-3">
        <div className="h-3 w-32 animate-pulse rounded-full bg-stone-200 motion-reduce:animate-none" />
        <div className="h-9 w-64 animate-pulse rounded-lg bg-stone-200 motion-reduce:animate-none" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-lg border border-stone-200 bg-white motion-reduce:animate-none" />
        ))}
      </div>
      <div className="mt-6 h-72 animate-pulse rounded-lg border border-stone-200 bg-white motion-reduce:animate-none" />
    </div>
  );
}
