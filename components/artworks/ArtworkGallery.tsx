"use client";
import Image from "next/image";
import { useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import type { ArtworkImage } from "@/types";

/**
 * Main viewer on a bone mat (natural ratio, never cropped), thumbnails, and a full-screen lightbox
 * with click-to-zoom. The lightbox is a native <dialog>: the browser keeps focus inside it and closes it on Escape.
 */
export function ArtworkGallery({ images, title }: { images: ArtworkImage[]; title: string }) {
  const sorted = [...images].sort((a, b) => Number(b.isMain) - Number(a.isMain) || a.sortOrder - b.sortOrder);
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const thumbsRef = useRef<HTMLUListElement>(null);
  const current = sorted[index];
  const count = sorted.length;
  const altFor = (img: ArtworkImage, i: number) => img.alt || `${title}, view ${i + 1} of ${count}`;

  const go = (next: number) => {
    setIndex((next + count) % count);
    setZoom(null);
  };
  const open = () => {
    setZoom(null);
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();

  // Arrow keys move between thumbnails (roving focus).
  const onThumbKey = (e: KeyboardEvent<HTMLUListElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (index + (e.key === "ArrowRight" ? 1 : -1) + count) % count;
    go(next);
    thumbsRef.current?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus();
  };

  const onDialogKey = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (count > 1 && e.key === "ArrowRight") go(index + 1);
    if (count > 1 && e.key === "ArrowLeft") go(index - 1);
  };

  const toggleZoom = (e: MouseEvent<HTMLButtonElement>) => {
    if (zoom) return setZoom(null);
    const r = e.currentTarget.getBoundingClientRect();
    // Keyboard activation has no pointer position: zoom into the centre.
    const x = e.clientX ? ((e.clientX - r.left) / r.width) * 100 : 50;
    const y = e.clientY ? ((e.clientY - r.top) / r.height) * 100 : 50;
    setZoom({ x, y });
  };

  return (
    <div>
      <button
        type="button"
        onClick={open}
        className="group relative block aspect-[4/5] w-full cursor-zoom-in bg-bone lg:aspect-[5/6]"
        aria-label={`Open full-screen view of ${title}`}
      >
        <Image
          src={current.url}
          alt={altFor(current, index)}
          fill
          priority={index === 0}
          sizes="(min-width: 1024px) 58vw, 100vw"
          className="object-contain p-[6%]"
        />
        <span className="absolute bottom-4 right-4 bg-paper/90 px-3 py-1.5 text-eyebrow uppercase text-ink opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          View full screen
        </span>
      </button>

      {count > 1 && (
        <ul ref={thumbsRef} className="mt-4 flex gap-3 overflow-x-auto pb-1" aria-label="Choose a view" onKeyDown={onThumbKey}>
          {sorted.map((img, i) => (
            <li key={img.id} className="shrink-0">
              <button
                type="button"
                onClick={() => go(i)}
                tabIndex={i === index ? 0 : -1}
                aria-label={`Show view ${i + 1} of ${count}`}
                aria-current={i === index ? "true" : undefined}
                className={`relative block h-20 w-20 bg-bone transition-opacity ${i === index ? "opacity-100 outline outline-1 outline-offset-2 outline-ink" : "opacity-60 hover:opacity-100"}`}
              >
                <Image src={img.url} alt="" fill sizes="80px" className="object-contain p-1.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <dialog
        ref={dialogRef}
        onKeyDown={onDialogKey}
        onClose={() => setZoom(null)}
        aria-label={`${title}: full-screen view`}
        className="m-0 h-[100dvh] max-h-none w-screen max-w-none bg-paper p-0 text-ink backdrop:bg-ink/80"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <p className="text-caption text-stone-600" aria-live="polite">
              {count > 1 ? `${index + 1} / ${count}` : ""} <span className="ml-2 hidden sm:inline">{zoom ? "Click to zoom out" : "Click the image to zoom"}</span>
            </p>
            <button type="button" onClick={close} className="inline-flex min-h-11 items-center gap-2 px-2 text-sm" autoFocus>
              Close <span aria-hidden="true" className="text-lg leading-none">×</span>
            </button>
          </div>

          <div className="relative flex-1 overflow-hidden">
            <button
              type="button"
              onClick={toggleZoom}
              className={`absolute inset-0 ${zoom ? "cursor-zoom-out" : "cursor-zoom-in"}`}
              aria-label={zoom ? "Zoom out" : "Zoom in"}
            >
              <Image
                src={current.url}
                alt={altFor(current, index)}
                fill
                sizes="100vw"
                quality={90}
                className="object-contain p-4 transition-transform duration-500 ease-gallery motion-reduce:transition-none sm:p-10"
                style={zoom ? { transform: "scale(2.25)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
              />
            </button>

            {count > 1 && (
              <>
                <button type="button" onClick={() => go(index - 1)} aria-label="Previous view" className="absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center bg-paper/90 text-xl sm:left-6">
                  <span aria-hidden="true">←</span>
                </button>
                <button type="button" onClick={() => go(index + 1)} aria-label="Next view" className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center bg-paper/90 text-xl sm:right-6">
                  <span aria-hidden="true">→</span>
                </button>
              </>
            )}
          </div>
        </div>
      </dialog>
    </div>
  );
}
