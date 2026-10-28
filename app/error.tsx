"use client";
import { Button } from "@/components/ui/Button";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="site container-site py-section text-center">
      <p className="eyebrow">Error</p>
      <h1 className="mt-5 font-serif text-h1 font-medium">Something went wrong</h1>
      <p className="mx-auto mt-5 max-w-md text-body text-stone-600">{error.message}</p>
      <Button type="button" onClick={reset} className="mt-10">Try again</Button>
    </div>
  );
}
