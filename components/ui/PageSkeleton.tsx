/** Loading placeholders shown while a page fetches its content (used by the loading.tsx files). */

export function LoadingBar() {
  return (
    <div className="fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden" aria-hidden="true">
      <div className="loading-bar h-full w-full bg-brand" />
    </div>
  );
}

export function PageSkeleton({ variant = "grid" }: { variant?: "grid" | "detail" }) {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <LoadingBar />
      {variant === "detail" ? (
        <div className="container-site grid gap-12 pb-section pt-8 md:pt-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <div className="skeleton h-3 w-40 rounded-full" />
            <div className="skeleton mt-8 aspect-[4/5] w-full rounded-2xl lg:aspect-[5/6]" />
          </div>
          <div className="space-y-4 lg:col-span-5 lg:pt-14 xl:col-span-4 xl:col-start-9">
            <div className="skeleton h-3 w-28 rounded-full" />
            <div className="skeleton h-14 w-4/5 rounded-xl" />
            <div className="skeleton h-5 w-24 rounded-full" />
            <div className="skeleton mt-8 h-24 w-full rounded-xl" />
            <div className="skeleton mt-6 h-12 w-full rounded-full" />
          </div>
        </div>
      ) : (
        <div className="container-site pb-section pt-16 md:pt-24">
          <div className="skeleton h-3 w-28 rounded-full" />
          <div className="skeleton mt-6 h-14 w-2/3 max-w-md rounded-xl" />
          <div className="skeleton mt-6 h-4 w-full max-w-xl rounded-full" />
          <div className="mt-14 h-px w-full bg-stone-200" />
          <ul className="mt-16 grid grid-cols-2 gap-x-5 gap-y-14 md:grid-cols-3 md:gap-x-8">
            {Array.from({ length: 6 }, (_, i) => (
              <li key={i}>
                <div className="skeleton aspect-[4/5] w-full rounded-2xl" />
                <div className="skeleton mt-5 h-2.5 w-24 rounded-full" />
                <div className="skeleton mt-3 h-5 w-40 rounded-full" />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
