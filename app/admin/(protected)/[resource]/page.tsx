import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { getResource } from "@/lib/admin/resources";
import { mediaUrl } from "@/lib/supabase/env";
import { AVAILABILITY_LABELS } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";
import { EmptyState, PageHeader, btn, inputClass } from "@/components/admin/ui";
import { ResourceTable, type TableHeader, type TableRow } from "@/components/admin/ResourceTable";

const PAGE_SIZE = 20;
type Params = { params: Promise<{ resource: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const get = (row: Record<string, unknown>, path: string): unknown =>
  path.split(".").reduce<unknown>((v, k) => (v && typeof v === "object" ? (v as Record<string, unknown>)[k] : undefined), row);

function show(v: unknown, col: string): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (col === "availability") return AVAILABILITY_LABELS[v as keyof typeof AVAILABILITY_LABELS] ?? String(v);
  const s = String(v);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  return s.length > 40 ? `${s.slice(0, 40)}…` : s;
}

export default async function ResourceList({ params, searchParams }: Params) {
  const res = getResource((await params).resource);
  if (!res) notFound();
  const sp = await searchParams;
  const { db } = await requireAdmin();

  const q = one(sp.q).trim().slice(0, 100);
  const status = one(sp.status) === "published" || one(sp.status) === "draft" ? one(sp.status) : "";
  const sortable = [res.titleField, "created_at", ...res.listColumns.map((c) => c.name).filter((n) => !n.includes("."))];
  const sort = sortable.includes(one(sp.sort)) ? one(sp.sort) : (res.defaultSort?.col ?? "created_at");
  const asc = one(sp.sort) ? one(sp.dir) === "asc" : (res.defaultSort?.asc ?? false);
  const page = Math.max(1, parseInt(one(sp.page), 10) || 1);

  // URL builder that keeps the current filters.
  const href = (patch: Record<string, string | number | null>) => {
    const p = new URLSearchParams();
    const cur: Record<string, string> = { q, status, sort: one(sp.sort) ? sort : "", dir: one(sp.sort) ? (asc ? "asc" : "desc") : "", page: page > 1 ? String(page) : "" };
    for (const [k, v] of Object.entries({ ...cur, ...patch })) if (v !== null && v !== "") p.set(k, String(v));
    const s = p.toString();
    return `/admin/${res.key}${s ? `?${s}` : ""}`;
  };

  let query = db.from(res.table).select(`*${res.listSelect ? `, ${res.listSelect}` : ""}`, { count: "exact" });
  if (q) query = query.ilike(res.titleField, `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`);
  if (status && res.hasStatus) query = query.eq("status", status);
  const from = (page - 1) * PAGE_SIZE;
  const { data, error, count } = await query.order(sort, { ascending: asc, nullsFirst: false }).range(from, from + PAGE_SIZE - 1);
  if (error) throw new Error(`Could not load ${res.label}: ${error.message}`);

  // Totals for the status tabs (unfiltered by search).
  const [all, published] = res.hasStatus
    ? await Promise.all([
        db.from(res.table).select("id", { count: "exact", head: true }),
        db.from(res.table).select("id", { count: "exact", head: true }).eq("status", "published"),
      ])
    : [{ count: count ?? 0 }, { count: 0 }];
  const totals = { all: all.count ?? 0, published: published.count ?? 0, draft: (all.count ?? 0) - (published.count ?? 0) };

  const rowsRaw = (data ?? []) as unknown as Record<string, unknown>[];
  const thumbOf = (r: Record<string, unknown>) => {
    if (res.thumb === "cover") return mediaUrl((r.cover_image_path as string | null) ?? null);
    if (res.thumb === "artwork") {
      const imgs = ((r.images as { storage_path: string; is_main: boolean; sort_order: number }[] | null) ?? []).slice().sort((a, b) => a.sort_order - b.sort_order);
      return mediaUrl((imgs.find((i) => i.is_main) ?? imgs[0])?.storage_path ?? null);
    }
    return null;
  };
  const rows: TableRow[] = rowsRaw.map((r) => ({
    id: String(r.id),
    title: String(r[res.titleField] ?? ""),
    subtitle: res.hasSlug && r.slug ? `/${String(r.slug)}` : undefined,
    thumb: thumbOf(r),
    cells: res.listColumns.map((c) => show(get(r, c.name), c.name)),
    status: r.status as string | undefined,
    publicHref: res.publicPath && r.slug ? `${res.publicPath}${String(r.slug)}` : undefined,
  }));

  const sortHeader = (key: string, label: string): TableHeader => ({
    key, label,
    href: key.includes(".") ? undefined : href({ sort: key, dir: sort === key && asc ? "desc" : "asc", page: null }),
    sorted: sort === key ? (asc ? "asc" : "desc") : undefined,
  });
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));
  const tab = (value: string, label: string, n: number) => (
    <Link
      key={value}
      href={href({ status: value, page: null })}
      aria-current={status === value ? "page" : undefined}
      className={`inline-flex items-center gap-2 border-b-2 px-1 pb-2.5 text-sm transition-colors ${status === value ? "border-brand font-medium text-stone-800" : "border-transparent text-stone-500 hover:text-stone-800"}`}
    >
      {label} <span className="rounded-full bg-stone-100 px-1.5 text-xs text-stone-600">{n}</span>
    </Link>
  );

  return (
    <>
      <PageHeader
        title={res.label}
        description={res.description}
        crumbs={[{ label: "Dashboard", href: "/admin" }, { label: res.label }]}
        actions={<Link href={`/admin/${res.key}/new`} className={btn("primary")}><Icon name="plus" className="h-4 w-4" /> Add {res.singular}</Link>}
      />

      <div className="mb-4 flex flex-wrap items-end justify-between gap-4 border-b border-stone-200">
        {res.hasStatus ? (
          <nav aria-label="Filter by status" className="flex gap-6">
            {tab("", "All", totals.all)}
            {tab("published", "Published", totals.published)}
            {tab("draft", "Drafts", totals.draft)}
          </nav>
        ) : <span />}
        <form method="get" action={`/admin/${res.key}`} role="search" className="mb-2.5 flex w-full items-center gap-2 sm:w-72">
          {status && <input type="hidden" name="status" value={status} />}
          <label htmlFor="q" className="sr-only">Search {res.label.toLowerCase()}</label>
          <div className="relative flex-1">
            <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input id="q" name="q" type="search" defaultValue={q} placeholder={`Search ${res.label.toLowerCase()}…`} className={`${inputClass} pl-9`} />
          </div>
        </form>
      </div>

      {rows.length === 0 ? (
        q || status ? (
          <EmptyState icon="search" title="No matches" action={<Link href={`/admin/${res.key}`} className={btn("secondary")}>Clear filters</Link>}>
            Nothing matches {q ? <>“{q}”</> : "this filter"}. Try another search.
          </EmptyState>
        ) : (
          <EmptyState
            title={`No ${res.label.toLowerCase()} yet`}
            action={<Link href={`/admin/${res.key}/new`} className={btn("primary")}><Icon name="plus" className="h-4 w-4" /> Add the first {res.singular}</Link>}
          >
            {res.description}
          </EmptyState>
        )
      ) : (
        <ResourceTable
          resourceKey={res.key}
          singular={res.singular}
          hasStatus={res.hasStatus}
          showThumb={Boolean(res.thumb)}
          titleHeader={sortHeader(res.titleField, res.fields.find((f) => f.name === res.titleField)?.label ?? "Title")}
          headers={res.listColumns.map((c) => sortHeader(c.name, c.label))}
          rows={rows}
          returnTo={href({})}
        />
      )}

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-6 flex items-center justify-between text-sm text-stone-600">
          <span>{from + 1}–{Math.min(from + PAGE_SIZE, count ?? 0)} of {count}</span>
          <div className="flex gap-2">
            {page > 1 ? <Link href={href({ page: page - 1 })} className={btn("secondary", "sm")}>Previous</Link> : <span className={`${btn("secondary", "sm")} opacity-50`} aria-disabled="true">Previous</span>}
            {page < totalPages ? <Link href={href({ page: page + 1 })} className={btn("secondary", "sm")}>Next</Link> : <span className={`${btn("secondary", "sm")} opacity-50`} aria-disabled="true">Next</span>}
          </div>
        </nav>
      )}
    </>
  );
}
