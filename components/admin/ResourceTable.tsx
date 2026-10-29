"use client";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { bulkAction, deleteRecord, setStatus } from "@/lib/admin/actions";
import { StatusBadge, btn } from "./ui";

export interface TableHeader { key: string; label: string; href?: string; sorted?: "asc" | "desc" }
export interface TableRow { id: string; title: string; subtitle?: string; thumb: string | null; cells: string[]; status?: string; publicHref?: string }

interface Props {
  resourceKey: string;
  singular: string;
  hasStatus: boolean;
  showThumb: boolean;
  headers: TableHeader[];
  titleHeader: TableHeader;
  rows: TableRow[];
  returnTo: string;
}

/** Content list with checkbox selection and bulk actions. Row actions use separate forms linked with the form attribute. */
export function ResourceTable({ resourceKey, singular, hasStatus, showThumb, headers, titleHeader, rows, returnTo }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const allSelected = rows.length > 0 && selected.size === rows.length;
  const toggle = (id: string) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)));

  const sortLabel = (h: TableHeader) =>
    h.href ? (
      <Link href={h.href} className="inline-flex items-center gap-1 hover:text-stone-800" aria-label={`Sort by ${h.label}`}>
        {h.label}
        {h.sorted && <Icon name={h.sorted === "asc" ? "arrowUp" : "arrowDown"} className="h-3 w-3" />}
      </Link>
    ) : h.label;

  return (
    <>
      <form
        id="bulk"
        action={bulkAction}
        onSubmit={(e) => {
          const op = (e.nativeEvent as SubmitEvent).submitter?.getAttribute("value");
          if (op === "delete" && !window.confirm(`Delete ${selected.size} item(s)? This cannot be undone.`)) e.preventDefault();
        }}
      >
        <input type="hidden" name="_resource" value={resourceKey} />
        <input type="hidden" name="_return" value={returnTo} />
      </form>

      {selected.size > 0 && (
        <div className="sticky top-16 z-10 mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-stone-200 bg-white px-4 py-2.5 shadow-sm">
          <p className="mr-auto text-sm font-medium">{selected.size} selected</p>
          {hasStatus && (
            <>
              <button form="bulk" type="submit" name="_op" value="published" className={btn("secondary", "sm")}>Publish</button>
              <button form="bulk" type="submit" name="_op" value="draft" className={btn("secondary", "sm")}>Move to draft</button>
            </>
          )}
          <button form="bulk" type="submit" name="_op" value="delete" className={btn("danger", "sm")}>Delete</button>
          <button type="button" onClick={() => setSelected(new Set())} className={btn("ghost", "sm")}>Clear</button>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-xs font-medium text-stone-500">
            <tr>
              <th scope="col" className="w-10 py-3 pl-4">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all on this page" className="h-4 w-4 rounded border-stone-300" />
              </th>
              <th scope="col" className="px-3 py-3">{sortLabel(titleHeader)}</th>
              {headers.map((h) => <th key={h.key} scope="col" className="px-3 py-3">{sortLabel(h)}</th>)}
              {hasStatus && <th scope="col" className="px-3 py-3">Status</th>}
              <th scope="col" className="px-3 py-3 text-right"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.map((r) => {
              const published = r.status === "published";
              return (
                <tr key={r.id} className={`group ${selected.has(r.id) ? "bg-stone-50" : "hover:bg-stone-50"}`}>
                  <td className="py-3 pl-4">
                    <input form="bulk" type="checkbox" name="ids" value={r.id} checked={selected.has(r.id)} onChange={() => toggle(r.id)} aria-label={`Select ${r.title}`} className="h-4 w-4 rounded border-stone-300" />
                  </td>
                  <td className="px-3 py-3">
                    <Link href={`/admin/${resourceKey}/${r.id}`} className="flex items-center gap-3">
                      {showThumb && (
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md bg-stone-100 text-stone-400">
                          {/* eslint-disable-next-line @next/next/no-img-element -- small admin thumbnail from Storage */}
                          {r.thumb ? <img src={r.thumb} alt="" className="h-full w-full object-cover" loading="lazy" /> : <Icon name="image" className="h-4 w-4" />}
                        </span>
                      )}
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-stone-800 group-hover:underline">{r.title || "(untitled)"}</span>
                        {r.subtitle && <span className="block truncate text-xs text-stone-500">{r.subtitle}</span>}
                      </span>
                    </Link>
                  </td>
                  {r.cells.map((c, i) => <td key={i} className="whitespace-nowrap px-3 py-3 text-stone-600">{c}</td>)}
                  {hasStatus && <td className="px-3 py-3"><StatusBadge status={r.status} /></td>}
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {hasStatus && (
                        <button form={`status-${r.id}`} type="submit" className={btn("ghost", "sm")}>{published ? "Unpublish" : "Publish"}</button>
                      )}
                      {r.publicHref && published && (
                        <a href={r.publicHref} target="_blank" rel="noopener noreferrer" className={btn("ghost", "sm")} aria-label={`View ${r.title} on the website`} title="View on website">
                          <Icon name="external" className="h-4 w-4" />
                        </a>
                      )}
                      <Link href={`/admin/${resourceKey}/${r.id}`} className={btn("secondary", "sm")}>Edit</Link>
                      <button
                        form={`delete-${r.id}`}
                        type="submit"
                        onClick={(e) => { if (!window.confirm(`Delete "${r.title}"? This cannot be undone.`)) e.preventDefault(); }}
                        className={`${btn("ghost", "sm")} text-red-700`}
                        aria-label={`Delete ${r.title}`}
                        title={`Delete ${singular}`}
                      >
                        <Icon name="trash" className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* One small form per row action; the buttons above point at them with the form attribute. */}
      {rows.map((r) => (
        <div key={r.id} hidden>
          {hasStatus && (
            <form id={`status-${r.id}`} action={setStatus}>
              <input type="hidden" name="_resource" value={resourceKey} />
              <input type="hidden" name="_id" value={r.id} />
              <input type="hidden" name="_status" value={r.status === "published" ? "draft" : "published"} />
              <input type="hidden" name="_return" value={returnTo} />
            </form>
          )}
          <form id={`delete-${r.id}`} action={deleteRecord}>
            <input type="hidden" name="_resource" value={resourceKey} />
            <input type="hidden" name="_id" value={r.id} />
          </form>
        </div>
      ))}
    </>
  );
}
