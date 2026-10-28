"use client";
import Image from "next/image";
import { useState } from "react";
import type { ArtworkImage } from "@/types";

export function ArtworkGallery({ images }: { images: ArtworkImage[] }) {
  const sorted = [...images].sort((a, b) => Number(b.isMain) - Number(a.isMain) || a.sortOrder - b.sortOrder);
  const [index, setIndex] = useState(0);
  const current = sorted[index];

  return (
    <div>
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-200">
        <Image src={current.url} alt={current.alt} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-contain" />
      </div>
      {sorted.length > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto">
          {sorted.map((img, i) => (
            <li key={img.id}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show image ${i + 1} of ${sorted.length}`}
                aria-current={i === index}
                className={`relative block h-16 w-16 overflow-hidden border-2 ${i === index ? "border-ink" : "border-transparent"}`}
              >
                <Image src={img.url} alt="" fill sizes="64px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
