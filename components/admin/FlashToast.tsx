"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";

// Server actions redirect with ?notice=<key>; this turns it into a short confirmation and cleans the URL.
const MESSAGES: Record<string, string> = {
  saved: "Changes saved.",
  created: "Created. You can keep editing.",
  deleted: "Deleted.",
  published: "Published. It is now visible on the website.",
  unpublished: "Moved to draft. It is hidden from the website.",
  bulk: "Done. The selected items were updated.",
  "image-updated": "Image updated.",
  "image-deleted": "Image deleted.",
};

export function FlashToast() {
  const params = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const key = params.get("notice");
  const [message, setMessage] = useState<string | null>(null);
  const [lastKey, setLastKey] = useState<string | null>(null);

  // Adopt a new notice during render (no effect needed), then strip it from the URL below.
  if (key && key !== lastKey) {
    setLastKey(key);
    setMessage(MESSAGES[key] ?? null);
  }

  useEffect(() => {
    if (!key) return;
    const next = new URLSearchParams(params.toString());
    next.delete("notice");
    const qs = next.toString();
    router.replace(qs ? `${path}?${qs}` : path, { scroll: false });
  }, [key, params, path, router]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4500);
    return () => clearTimeout(t);
  }, [message]);

  if (!message) return null;
  return (
    <div role="status" aria-live="polite" className="fixed bottom-4 right-4 z-50 flex max-w-sm items-center gap-3 rounded-lg bg-stone-900 px-4 py-3 text-sm text-white shadow-xl">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300"><Icon name="check" className="h-4 w-4" /></span>
      <span className="flex-1">{message}</span>
      <button type="button" onClick={() => setMessage(null)} aria-label="Dismiss" className="rounded p-1 text-white/60 hover:text-white"><Icon name="close" className="h-4 w-4" /></button>
    </div>
  );
}
