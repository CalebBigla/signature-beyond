"use client";
import { useEffect, useRef, useState, type DragEvent } from "react";
import { Icon } from "@/components/ui/Icon";

const ACCEPT = ["image/jpeg", "image/png", "image/webp"];
const MAX = 5 * 1024 * 1024;

interface Props {
  /** Form names: file:<name> for the upload, remove:<name> for clearing the current image. */
  name: string;
  id?: string;
  label?: string;
  currentUrl?: string | null;
  /** Shown when there is no image and none is chosen, e.g. "Default photo is used". */
  emptyHint?: string;
  aspect?: string;
  multiple?: boolean;
  /** Raw input name for multiple uploads (e.g. "gallery"). Defaults to file:<name>. */
  inputName?: string;
  /** Tells the parent about a newly chosen local preview (or null when cleared). */
  onPreview?: (url: string | null) => void;
  /** Tells the parent the image will be removed on save. */
  onRemove?: (removed: boolean) => void;
}

/** Drag-and-drop or click-to-choose image field with an instant preview and client-side checks. */
export function ImageDropzone({ name, id, label, currentUrl, emptyHint, aspect = "aspect-[4/3]", multiple = false, inputName, onPreview, onRemove }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [removed, setRemoved] = useState(false);
  const [error, setError] = useState("");
  const [over, setOver] = useState(false);

  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  const accept = (files: FileList | null) => {
    setError("");
    if (!files || files.length === 0) return;
    const bad = Array.from(files).find((f) => !ACCEPT.includes(f.type) || f.size > MAX);
    if (bad) {
      setError(!ACCEPT.includes(bad.type) ? `"${bad.name}" is not a JPEG, PNG or WebP image.` : `"${bad.name}" is larger than 5 MB.`);
      if (inputRef.current) inputRef.current.value = "";
      setPreviews([]);
      onPreview?.(null);
      return;
    }
    const urls = Array.from(files).map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    setRemoved(false);
    onRemove?.(false);
    onPreview?.(urls[0] ?? null);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    if (!inputRef.current) return;
    const dt = new DataTransfer();
    Array.from(e.dataTransfer.files).slice(0, multiple ? 20 : 1).forEach((f) => dt.items.add(f));
    inputRef.current.files = dt.files;
    inputRef.current.dispatchEvent(new Event("input", { bubbles: true })); // marks the form as changed
    accept(dt.files);
  };

  const clearChoice = () => {
    if (inputRef.current) inputRef.current.value = "";
    setPreviews([]);
    onPreview?.(null);
    inputRef.current?.dispatchEvent(new Event("input", { bubbles: true }));
  };

  const shown = previews[0] ?? (removed ? null : currentUrl ?? null);
  const inputId = id ?? `file-${name}`;

  return (
    <div>
      {label && <p className="mb-1.5 text-sm font-medium text-stone-700">{label}</p>}
      <div
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
        className={`relative overflow-hidden rounded-lg border-2 border-dashed transition-colors ${over ? "border-brand bg-orange-50" : "border-stone-300 bg-stone-50"}`}
      >
        {shown && !multiple ? (
          <div className={`relative ${aspect} w-full`}>
            {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview or Storage URL */}
            <img src={shown} alt="" className="absolute inset-0 h-full w-full object-cover" />
            {previews.length > 0 && <span className="absolute left-2 top-2 rounded bg-stone-900/80 px-2 py-0.5 text-[11px] font-medium text-white">New, not saved yet</span>}
          </div>
        ) : multiple && previews.length > 0 ? (
          <ul className="grid grid-cols-3 gap-2 p-3 sm:grid-cols-4">
            {previews.map((u) => (
              // eslint-disable-next-line @next/next/no-img-element -- local blob preview
              <li key={u}><img src={u} alt="" className="aspect-square w-full rounded object-cover" /></li>
            ))}
          </ul>
        ) : (
          <div className={`flex ${multiple ? "py-8" : aspect} flex-col items-center justify-center gap-2 px-4 text-center`}>
            <Icon name="upload" className="h-6 w-6 text-stone-400" />
            <p className="text-sm text-stone-600"><span className="font-medium text-stone-800">Drop {multiple ? "images" : "an image"} here</span> or use the button below</p>
            {emptyHint && <p className="text-xs text-stone-500">{emptyHint}</p>}
          </div>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        <label htmlFor={inputId} className="inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-md border border-stone-300 bg-white px-3 text-xs font-medium text-stone-800 hover:bg-stone-100 focus-within:ring-2 focus-within:ring-brand/40">
          <Icon name="image" className="h-3.5 w-3.5" /> {shown && !multiple ? "Replace" : multiple ? "Choose images" : "Choose image"}
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            name={inputName ?? `file:${name}`}
            accept={ACCEPT.join(",")}
            multiple={multiple}
            className="sr-only"
            onChange={(e) => accept(e.target.files)}
          />
        </label>
        {previews.length > 0 && <button type="button" onClick={clearChoice} className="text-xs text-stone-600 underline">Cancel</button>}
        {!multiple && currentUrl && previews.length === 0 && (
          <label className="inline-flex items-center gap-1.5 text-xs text-stone-600">
            <input
              type="checkbox"
              name={`remove:${name}`}
              checked={removed}
              onChange={(e) => { setRemoved(e.target.checked); onRemove?.(e.target.checked); }}
              className="h-3.5 w-3.5 rounded border-stone-300"
            />
            Remove image
          </label>
        )}
        <span className="text-xs text-stone-500">JPEG, PNG or WebP · max 5 MB{multiple ? " each" : ""}</span>
      </div>
      {error && <p role="alert" className="mt-1.5 text-xs text-red-700">{error}</p>}
    </div>
  );
}
