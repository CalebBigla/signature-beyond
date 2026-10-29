/** Shown while the collection loads (Supabase mode). Same grid as the page, so nothing jumps. */
export default function ArtworksLoading() {
  return (
    <div className="container-site pb-section pt-16 md:pt-24" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading artworks…</span>
      <div className="h-3 w-28 rounded-full bg-bone" />
      <div className="mt-6 h-14 w-2/3 max-w-md rounded-xl bg-bone" />
      <div className="mt-14 h-px w-full bg-stone-200" />
      <ul className="mt-16 grid grid-cols-2 gap-x-5 gap-y-14 md:grid-cols-3 md:gap-x-8 md:gap-y-20">
        {Array.from({ length: 6 }, (_, i) => (
          <li key={i} className="motion-safe:animate-pulse">
            <div className="aspect-[4/5] w-full rounded-2xl bg-bone" />
            <div className="mt-5 h-2.5 w-24 rounded-full bg-bone" />
            <div className="mt-3 h-5 w-40 rounded-full bg-bone" />
          </li>
        ))}
      </ul>
    </div>
  );
}
