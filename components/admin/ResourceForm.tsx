"use client";
import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { deleteRecord, saveRecord, type FormState } from "@/lib/admin/actions";
import type { FieldDef, LinkDef, Option, ResourceDef, SideCard } from "@/lib/admin/resources";
import { Icon } from "@/components/ui/Icon";
import { Card, Field, Notice, StatusBadge, btn, formatWhen, inputClass } from "./ui";
import { ImageDropzone } from "./ImageDropzone";
import { PdfField } from "./PdfField";
import { useUnsavedGuard } from "./useUnsavedGuard";

interface Props {
  resource: ResourceDef;
  id: string | null;
  values: Record<string, unknown>;
  refOptions: Record<string, Option[]>;
  linkSelected: Record<string, string[]>;
  imageUrls: Record<string, string | null>;
  publicHref: string | null;
}

const initial: FormState = { ok: false, message: "" };
const SIDE_TITLES: Record<SideCard, string> = { publish: "Publishing", pricing: "Price & availability", media: "Image", document: "PDF document", address: "Web address" };
const SIDE_ORDER: SideCard[] = ["publish", "pricing", "media", "document", "address"];

function LinkPicker({ link, options, selected }: { link: LinkDef; options: Option[]; selected: string[] }) {
  const [filter, setFilter] = useState("");
  const [count, setCount] = useState(selected.length);
  const shown = filter ? options.filter((o) => o.label.toLowerCase().includes(filter.toLowerCase())) : options;
  return (
    <Card title={link.label} description={`${count} selected`} padded={false}>
      {options.length === 0 ? (
        <p className="p-5 text-sm text-stone-500">Nothing to choose from yet. Add some first, then come back.</p>
      ) : (
        <>
          {options.length > 8 && (
            <div className="border-b border-stone-200 p-3">
              <input type="search" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter…" aria-label={`Filter ${link.label}`} className={inputClass} />
            </div>
          )}
          <ul className="max-h-64 divide-y divide-stone-100 overflow-y-auto" onChange={(e) => {
            const list = (e.currentTarget as HTMLUListElement).querySelectorAll<HTMLInputElement>("input[type=checkbox]:checked");
            setCount(list.length);
          }}>
            {options.map((o) => (
              <li key={o.value} hidden={!shown.includes(o)}>
                <label className="flex cursor-pointer items-center gap-3 px-5 py-2.5 text-sm hover:bg-stone-50">
                  <input type="checkbox" name={`link:${link.table}`} value={o.value} defaultChecked={selected.includes(o.value)} className="h-4 w-4 rounded border-stone-300" />
                  {o.label}
                </label>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}

export function ResourceForm({ resource, id, values, refOptions, linkSelected, imageUrls, publicHref }: Props) {
  const [state, action, pending] = useActionState(saveRecord, initial);
  const [dirty, setDirty] = useState(false);
  const [title, setTitle] = useState(String(values[resource.titleField] ?? ""));
  const formRef = useRef<HTMLFormElement>(null);
  useUnsavedGuard(dirty && !pending);

  // A failed save keeps the edits, so the form stays "dirty" until it succeeds (success redirects away).
  useEffect(() => {
    if (state.message) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [state]);

  // Ctrl/Cmd + S saves.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") { e.preventDefault(); formRef.current?.requestSubmit(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const str = (n: string) => (values[n] === null || values[n] === undefined ? "" : String(values[n]));
  const main = useMemo(() => resource.fields.filter((f) => !f.side), [resource]);
  const side = (card: SideCard) => resource.fields.filter((f) => f.side === card);

  function control(f: FieldDef) {
    const common = { id: f.name, name: f.name, required: f.required };
    if (f.type === "textarea") return <textarea {...common} rows={f.rows ?? 5} defaultValue={str(f.name)} className={`${inputClass} leading-relaxed`} />;
    if (f.type === "select") {
      const opts = f.options ?? refOptions[f.refTable ?? ""] ?? [];
      return (
        <select {...common} defaultValue={str(f.name)} className={inputClass}>
          {!f.required && <option value="">None</option>}
          {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
    }
    if (f.type === "image") return <ImageDropzone name={f.name} currentUrl={imageUrls[f.name]} />;
    if (f.type === "pdf") return <PdfField name={f.name} folder={resource.key} currentPath={str(f.name) || null} currentUrl={imageUrls[f.name]} help={f.help} />;
    const type = f.type === "date" ? "date" : f.type === "number" ? "number" : "text";
    const value = f.type === "date" ? str(f.name).slice(0, 10) : str(f.name);
    const isTitle = f.name === resource.titleField;
    if (f.name === "slug") {
      return (
        <div className="flex rounded-md shadow-sm">
          <span className="inline-flex items-center rounded-l-md border border-r-0 border-stone-300 bg-stone-100 px-2.5 text-xs text-stone-500">{resource.publicPath ?? "/"}</span>
          <input {...common} type="text" defaultValue={value} placeholder="created-from-the-title" className={`${inputClass} rounded-l-none shadow-none`} />
        </div>
      );
    }
    return (
      <input
        {...common}
        type={type}
        step={f.type === "number" ? "any" : undefined}
        defaultValue={value}
        onChange={isTitle ? (e) => setTitle(e.target.value) : undefined}
        className={`${inputClass} ${isTitle ? "py-2.5 text-base font-medium" : ""}`}
      />
    );
  }

  const renderField = (f: FieldDef) =>
    f.type === "checkbox" ? (
      <label key={f.name} className="flex cursor-pointer items-start gap-3 text-sm text-stone-700">
        <input type="checkbox" name={f.name} defaultChecked={Boolean(values[f.name])} className="mt-0.5 h-4 w-4 rounded border-stone-300" />
        <span>{f.label}{f.help && <span className="block text-xs text-stone-500">{f.help}</span>}</span>
      </label>
    ) : f.type === "image" || f.type === "pdf" ? (
      <div key={f.name}>{control(f)}</div>
    ) : (
      <Field key={f.name} id={f.name} label={f.label} help={f.help} required={f.required}>{control(f)}</Field>
    );

  return (
    <>
      <form ref={formRef} action={action} onInput={() => setDirty(true)} onChange={() => setDirty(true)} noValidate={false}>
        <input type="hidden" name="_resource" value={resource.key} />
        <input type="hidden" name="_id" value={id ?? ""} />

        {/* Sticky action bar */}
        <div className="sticky top-16 z-10 -mx-4 mb-6 flex flex-wrap items-center gap-3 border-b border-stone-200 bg-stone-50/95 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-stone-800">{title || `New ${resource.singular}`}</p>
            <p className="flex items-center gap-2 text-xs text-stone-500">
              {resource.hasStatus && <StatusBadge status={values.status} />}
              {dirty ? <span className="text-amber-700">Unsaved changes</span> : id ? <span>All changes saved</span> : <span>Not saved yet</span>}
            </p>
          </div>
          {publicHref && values.status === "published" && (
            <a href={publicHref} target="_blank" rel="noopener noreferrer" className={btn("ghost", "sm")}>
              View on site <Icon name="external" className="h-3.5 w-3.5" />
            </a>
          )}
          <Link href={`/admin/${resource.key}`} className={btn("secondary")}>Close</Link>
          <button type="submit" disabled={pending} className={btn("primary")} title="Save (Ctrl+S)">
            {pending ? "Saving…" : id ? "Save changes" : `Create ${resource.singular}`}
          </button>
        </div>

        {state.message && !state.ok && <div className="mb-6"><Notice tone="error">{state.message}</Notice></div>}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-6">
            <Card title="Content">
              <div className="space-y-5">{main.map(renderField)}</div>
            </Card>

            {resource.links?.map((l) => (
              <LinkPicker key={l.table} link={l} options={refOptions[l.refTable] ?? []} selected={linkSelected[l.table] ?? []} />
            ))}

            {resource.gallery && (
              <Card title="Add images" description={id ? "New images are added after the existing ones. Manage them below." : "The first image becomes the main image."}>
                <ImageDropzone name="gallery" inputName="gallery" multiple />
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {SIDE_ORDER.map((card) => {
              const fields = side(card);
              if (fields.length === 0 && card !== "publish") return null;
              return (
                <Card key={card} title={SIDE_TITLES[card]}>
                  <div className="space-y-4">
                    {fields.map(renderField)}
                    {card === "publish" && id && (
                      <dl className="space-y-1 border-t border-stone-200 pt-4 text-xs text-stone-500">
                        {typeof values.created_at === "string" && <div className="flex justify-between gap-2"><dt>Created</dt><dd>{formatWhen(values.created_at)}</dd></div>}
                        {typeof values.updated_at === "string" && <div className="flex justify-between gap-2"><dt>Last updated</dt><dd>{formatWhen(values.updated_at)}</dd></div>}
                      </dl>
                    )}
                    {card === "publish" && id && (
                      <button
                        type="submit"
                        form="delete-record"
                        onClick={(e) => { if (!window.confirm(`Delete this ${resource.singular}? This cannot be undone.`)) e.preventDefault(); }}
                        className={`${btn("danger", "sm")} w-full`}
                      >
                        <Icon name="trash" className="h-3.5 w-3.5" /> Delete {resource.singular}
                      </button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </form>

      {id && (
        <form id="delete-record" action={deleteRecord} hidden>
          <input type="hidden" name="_resource" value={resource.key} />
          <input type="hidden" name="_id" value={id} />
        </form>
      )}
    </>
  );
}
