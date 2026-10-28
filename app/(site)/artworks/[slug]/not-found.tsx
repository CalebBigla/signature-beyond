import Link from "next/link";

export default function ArtworkNotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-serif text-4xl">Artwork not found</h1>
      <p className="mt-3 text-sm text-stone-600">This artwork may have been removed or is not published.</p>
      <Link href="/artworks" className="mt-6 inline-block rounded bg-ink px-5 py-3 text-sm text-white">Back to artworks</Link>
    </div>
  );
}
