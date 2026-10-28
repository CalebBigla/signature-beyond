"use client";
import Link from "next/link";
import { useActionState } from "react";
import { saveRecord, type FormState } from "@/lib/admin/actions";
import type { FieldDef, Option, ResourceDef } from "@/lib/admin/resources";

interface Props {
  resource: ResourceDef;
  id: string | null;
  values: Record<string, unknown>;
  refOptions: Record<string, Option[]>;
  linkSelected: Record<string, string[]>;
  imageUrls: Record<string, string | null>;
}

const input = "w-full rounded border border-stone-300 bg-white px-3 py-2 text-sm";
const initial: FormState = { ok: false, message: "" };

export function ResourceForm({ resource, id, values, refOptions, linkSelected, imageUrls }: Props) {
  const [state, action, pending] = useActionState(saveRecord, initial);
  const str = (n: string) => (values[n] === null || values[n] === undefined ? "" : String(values[n]));

  function control(f: FieldDef) {
    const common = { id: f.name, name: f.name };
    if (f.type === "textarea") return <textarea {...common} rows={f.rows ?? 5} defaultValue={str(f.name)} className={input} required={f.required} />;
    if (f.type === "select") {
      const opts = f.options ?? refOptions[f.refTable ?? ""] ?? [];
      return (
        <select {...common} defaultValue={str(f.name)} className={input} required={f.required}>
          {!f.required && <option value="">None</option>}
          {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
    }
    if (f.type === "image") {
      const url = imageUrls[f.name];
      return (
        <div className="space-y-2">
          {url && (
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="Current" className="h-20 w-20 rounded object-cover" />
              <label className="text-xs"><input type="checkbox" name={`remove:${f.name}`} /> Remove this image</label>
            </div>
          )}
          <input id={f.name} type="file" name={`file:${f.name}`} accept="image/jpeg,image/png,image/webp" className="text-sm" />
          <p className="text-xs text-stone-500">JPEG, PNG or WebP, up to 5 MB.</p>
        </div>
      );
    }
    const type = f.type === "date" ? "date" : f.type === "number" ? "number" : "text";
    const value = f.type === "date" ? str(f.name).slice(0, 10) : str(f.name);
    return <input {...common} type={type} step={f.type === "number" ? "any" : undefined} defaultValue={value} className={input} required={f.required} />;
  }

  return (
    <form action={action} className="max-w-2xl space-y-5">
      <input type="hidden" name="_resource" value={resource.key} />
      <input type="hidden" name="_id" value={id ?? ""} />

      {resource.fields.map((f) =>
        f.type === "checkbox" ? (
          <label key={f.name} className="flex items-center gap-2 text-sm">
            <input type="checkbox" name={f.name} defaultChecked={Boolean(values[f.name])} /> {f.label}
          </label>
        ) : (
          <div key={f.name}>
            <label htmlFor={f.name} className="mb-1 block text-xs text-stone-600">{f.label}{f.required && " *"}</label>
            {control(f)}
            {f.help && <p className="mt-1 text-xs text-stone-500">{f.help}</p>}
          </div>
        )
      )}

      {resource.links?.map((l) => (
        <fieldset key={l.table} className="rounded border border-stone-200 p-3">
          <legend className="px-1 text-xs text-stone-600">{l.label}</legend>
          {(refOptions[l.refTable] ?? []).length === 0 ? (
            <p className="text-xs text-stone-500">Nothing to choose from yet.</p>
          ) : (
            <ul className="max-h-48 space-y-1 overflow-y-auto">
              {refOptions[l.refTable].map((o) => (
                <li key={o.value}>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name={`link:${l.table}`} value={o.value} defaultChecked={linkSelected[l.table]?.includes(o.value)} /> {o.label}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </fieldset>
      ))}

      {resource.gallery && (
        <div>
          <label htmlFor="gallery" className="mb-1 block text-xs text-stone-600">Add artwork images (the first one becomes the main image)</label>
          <input id="gallery" type="file" name="gallery" multiple accept="image/jpeg,image/png,image/webp" className="text-sm" />
          <p className="mt-1 text-xs text-stone-500">JPEG, PNG or WebP, up to 5 MB each. Save first, then manage images below.</p>
        </div>
      )}

      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending} className="rounded bg-ink px-5 py-2 text-sm text-white disabled:opacity-60">{pending ? "Saving..." : "Save"}</button>
        <Link href={`/admin/${resource.key}`} className="text-sm underline">Cancel</Link>
      </div>
      {state.message && <p role="alert" className={`text-sm ${state.ok ? "text-green-800" : "text-red-700"}`}>{state.message}</p>}
    </form>
  );
}
