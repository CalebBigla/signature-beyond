import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { deleteEnquiry, setEnquiryHandled } from "@/lib/admin/actions";
import { Icon } from "@/components/ui/Icon";
import { ConfirmButton } from "@/components/admin/DeleteButton";
import { Badge, EmptyState, PageHeader, btn, formatWhen, inputClass } from "@/components/admin/ui";

interface Enquiry { id: string; name: string; email: string; phone: string | null; subject: string | null; message: string; created_at: string; handled: boolean }

const PAGE_SIZE = 25;
type Params = { searchParams: Promise<Record<string, string | string[] | undefined>> };
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function EnquiriesPage({ searchParams }: Params) {
  const sp = await searchParams;
  const { db } = await requireAdmin();
  const filter = one(sp.filter) === "all" || one(sp.filter) === "handled" ? one(sp.filter) : "unread";
  // PostgREST "or" filters are comma separated, so strip characters that could change the filter.
  const q = one(sp.q).replace(/[,()*%\\]/g, " ").trim().slice(0, 100);
  const open = one(sp.open);
  const page = Math.max(1, parseInt(one(sp.page), 10) || 1);

  const href = (patch: Record<string, string | number | null>) => {
    const p = new URLSearchParams();
    const cur: Record<string, string> = { filter: filter === "unread" ? "" : filter, q, page: page > 1 ? String(page) : "" };
    for (const [k, v] of Object.entries({ ...cur, ...patch })) if (v !== null && v !== "") p.set(k, String(v));
    const s = p.toString();
    return `/admin/enquiries${s ? `?${s}` : ""}`;
  };

  let query = db.from("enquiries").select("*", { count: "exact" });
  if (filter === "unread") query = query.eq("handled", false);
  if (filter === "handled") query = query.eq("handled", true);
  if (q) query = query.or(`name.ilike.*${q}*,email.ilike.*${q}*,subject.ilike.*${q}*,message.ilike.*${q}*`);
  const from = (page - 1) * PAGE_SIZE;
  const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, from + PAGE_SIZE - 1);
  if (error) throw new Error(`Could not load enquiries: ${error.message}`);
  const rows = (data ?? []) as Enquiry[];
  const { count: unreadCount } = await db.from("enquiries").select("id", { count: "exact", head: true }).eq("handled", false);
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));
  const returnTo = href({});

  const tab = (value: string, label: string, n?: number | null) => (
    <Link
      key={value}
      href={href({ filter: value === "unread" ? null : value, page: null })}
      aria-current={filter === value ? "page" : undefined}
      className={`inline-flex items-center gap-2 border-b-2 px-1 pb-2.5 text-sm ${filter === value ? "border-brand font-medium text-stone-800" : "border-transparent text-stone-500 hover:text-stone-800"}`}
    >
      {label}{typeof n === "number" && <span className="rounded-full bg-stone-100 px-1.5 text-xs text-stone-600">{n}</span>}
    </Link>
  );

  return (
    <>
      <PageHeader
        title="Enquiries"
        description="Messages from the website contact form, newest first. Mark a message as handled once you have replied."
        crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Enquiries" }]}
      />

      <div className="mb-4 flex flex-wrap items-end justify-between gap-4 border-b border-stone-200">
        <nav aria-label="Filter enquiries" className="flex gap-6">
          {tab("unread", "Unread", unreadCount)}
          {tab("handled", "Handled")}
          {tab("all", "All")}
        </nav>
        <form method="get" action="/admin/enquiries" role="search" className="mb-2.5 w-full sm:w-72">
          {filter !== "unread" && <input type="hidden" name="filter" value={filter} />}
          <label htmlFor="q" className="sr-only">Search enquiries</label>
          <div className="relative">
            <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input id="q" name="q" type="search" defaultValue={q} placeholder="Search name, email or message…" className={`${inputClass} pl-9`} />
          </div>
        </form>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon="enquiries" title={q ? "No matches" : filter === "unread" ? "Inbox zero" : "No enquiries yet"}>
          {q ? "Try a different search." : filter === "unread" ? "Every message has been handled." : "Messages sent through the contact form will appear here."}
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {rows.map((e) => {
            const subject = e.subject ? `Re: ${e.subject}` : "Your enquiry to Signature Beyond";
            const phone = e.phone?.replace(/[^\d+]/g, "") ?? "";
            return (
              <li key={e.id}>
                <details open={open === e.id || undefined} className="group rounded-lg border border-stone-200 bg-white shadow-sm open:ring-1 open:ring-stone-300">
                  <summary className="flex cursor-pointer list-none items-start gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${e.handled ? "bg-transparent ring-1 ring-stone-300" : "bg-brand"}`} aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline justify-between gap-x-4">
                        <span className={`text-sm ${e.handled ? "text-stone-700" : "font-semibold text-stone-800"}`}>{e.name}</span>
                        <span className="text-xs text-stone-500">{formatWhen(e.created_at)}</span>
                      </span>
                      <span className="block truncate text-sm text-stone-600">{e.subject || "(no subject)"}</span>
                      <span className="block truncate text-xs text-stone-500 group-open:hidden">{e.message}</span>
                    </span>
                    {e.handled ? <Badge tone="neutral">Handled</Badge> : <Badge tone="unread">Unread</Badge>}
                  </summary>
                  <div className="border-t border-stone-200 px-5 py-4">
                    <dl className="mb-4 grid gap-1 text-sm sm:grid-cols-[6rem_1fr]">
                      <dt className="text-stone-500">Email</dt><dd><a href={`mailto:${e.email}`} className="underline">{e.email}</a></dd>
                      {e.phone && <><dt className="text-stone-500">Phone</dt><dd>{e.phone}</dd></>}
                    </dl>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-800">{e.message}</p>
                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      <a href={`mailto:${e.email}?subject=${encodeURIComponent(subject)}`} className={btn("primary", "sm")}><Icon name="mail" className="h-3.5 w-3.5" /> Reply by email</a>
                      {phone && <a href={`tel:${phone}`} className={btn("secondary", "sm")}><Icon name="phone" className="h-3.5 w-3.5" /> Call</a>}
                      {phone && <a href={`https://wa.me/${phone.replace(/^\+/, "")}`} target="_blank" rel="noopener noreferrer" className={btn("secondary", "sm")}>WhatsApp</a>}
                      <form action={setEnquiryHandled} className="ml-auto">
                        <input type="hidden" name="_id" value={e.id} />
                        <input type="hidden" name="_handled" value={e.handled ? "false" : "true"} />
                        <input type="hidden" name="_return" value={returnTo} />
                        <button type="submit" className={btn("secondary", "sm")}>{e.handled ? "Mark as unread" : <><Icon name="check" className="h-3.5 w-3.5" /> Mark as handled</>}</button>
                      </form>
                      <form action={deleteEnquiry}>
                        <input type="hidden" name="_id" value={e.id} />
                        <input type="hidden" name="_return" value={returnTo} />
                        <ConfirmButton message={`Delete the message from ${e.name}? This cannot be undone.`} className={`${btn("ghost", "sm")} text-red-700`} aria-label="Delete enquiry">
                          <Icon name="trash" className="h-3.5 w-3.5" />
                        </ConfirmButton>
                      </form>
                    </div>
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      )}

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-6 flex items-center justify-between text-sm text-stone-600">
          <span>{from + 1}–{Math.min(from + PAGE_SIZE, count ?? 0)} of {count}</span>
          <div className="flex gap-2">
            {page > 1 && <Link href={href({ page: page - 1 })} className={btn("secondary", "sm")}>Previous</Link>}
            {page < totalPages && <Link href={href({ page: page + 1 })} className={btn("secondary", "sm")}>Next</Link>}
          </div>
        </nav>
      )}
    </>
  );
}
