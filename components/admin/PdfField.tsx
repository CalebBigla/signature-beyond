"use client";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Icon } from "@/components/ui/Icon";

const MAX = 25 * 1024 * 1024;

interface Props {
  /** Column name, e.g. pdf_path. The form posts pdf:<name> (new path) and pdforig:<name> (saved path). */
  name: string;
  /** Storage folder under pdfs/, e.g. the resource key. */
  folder: string;
  currentPath: string | null;
  currentUrl: string | null;
  help?: string;
}

/**
 * PDF upload. The file goes straight from the browser to Supabase Storage (signed-in admin session),
 * so large catalogues are not limited by the website's request size. The form then saves only the path.
 */
export function PdfField({ name, folder, currentPath, currentUrl, help }: Props) {
  const [path, setPath] = useState(currentPath ?? "");
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const touch = () => hiddenRef.current?.dispatchEvent(new Event("input", { bubbles: true })); // marks the form as changed

  const upload = async (file: File | undefined) => {
    setError("");
    if (!file) return;
    if (file.type !== "application/pdf") return setError(`"${file.name}" is not a PDF.`);
    if (file.size > MAX) return setError(`"${file.name}" is larger than 25 MB.`);
    setUploading(true);
    const newPath = `pdfs/${folder}/${crypto.randomUUID()}.pdf`;
    const { error: e } = await createClient().storage.from("media").upload(newPath, file, { contentType: "application/pdf" });
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    if (e) {
      setError(/mime|type/i.test(e.message)
        ? "The storage does not accept PDFs yet: run supabase/migrations/007_pdf_documents.sql in Supabase, then try again."
        : `Upload failed: ${e.message}`);
      return;
    }
    setPath(newPath);
    setFileName(file.name);
    touch();
  };

  const remove = () => {
    setPath("");
    setFileName(null);
    touch();
  };

  const hasSaved = Boolean(currentPath) && path === currentPath;
  return (
    <div className="space-y-3">
      <input ref={hiddenRef} type="hidden" name={`pdf:${name}`} value={path} />
      <input type="hidden" name={`pdforig:${name}`} value={currentPath ?? ""} />
      {uploading && <input type="hidden" name={`uploading:${name}`} value="1" />}

      {path ? (
        <div className="flex items-center gap-3 rounded-md border border-stone-200 bg-stone-50 px-3 py-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-red-50 text-[10px] font-bold text-red-700">PDF</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-stone-800">{fileName ?? "Attached PDF"}</span>
            <span className="block text-xs text-stone-500">{hasSaved ? "Saved" : "Uploaded, will be attached when you save"}</span>
          </span>
          {hasSaved && currentUrl && (
            <a href={currentUrl} target="_blank" rel="noopener noreferrer" className="rounded p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-800" aria-label="Open the PDF" title="Open">
              <Icon name="external" className="h-4 w-4" />
            </a>
          )}
          <button type="button" onClick={remove} className="rounded p-1.5 text-red-700 hover:bg-red-50" aria-label="Remove the PDF" title="Remove">
            <Icon name="trash" className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <p className="text-xs text-stone-500">No PDF attached.</p>
      )}

      <label className={`inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-md border border-stone-300 bg-white px-3 text-xs font-medium text-stone-800 hover:bg-stone-100 focus-within:ring-2 focus-within:ring-brand/40 ${uploading ? "pointer-events-none opacity-60" : ""}`}>
        <Icon name="upload" className="h-3.5 w-3.5" /> {uploading ? "Uploading…" : path ? "Replace PDF" : "Choose PDF"}
        <input ref={inputRef} type="file" accept="application/pdf" className="sr-only" disabled={uploading} onChange={(e) => upload(e.target.files?.[0])} />
      </label>
      <p className="text-xs text-stone-500">PDF · max 25 MB{help ? `. ${help}` : ""}</p>
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
