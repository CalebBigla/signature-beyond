"use client";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-serif text-4xl">Something went wrong</h1>
      <p className="mt-3 text-sm text-stone-600">{error.message}</p>
      <button type="button" onClick={reset} className="mt-6 rounded bg-ink px-5 py-3 text-sm text-white">
        Try again
      </button>
    </div>
  );
}
