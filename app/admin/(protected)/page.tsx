import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { RESOURCES } from "@/lib/admin/resources";
import { getSettings } from "@/lib/services";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Card, PageHeader, StatusBadge, btn, formatWhen } from "@/components/admin/ui";

interface Enquiry { id: string; name: string; email: string; subject: string | null; message: string; created_at: string; handled: boolean }
interface Recent { key: string; label: string; id: string; title: string; status: string; created_at: string }

const ICONS: Record<string, IconName> = {
  artworks: "artworks", artists: "artists", auctions: "auctions", exhibitions: "exhibitions", journal: "journal", testimonials: "testimonials", faqs: "faq",
};

function greeting() {
  const h = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: "Africa/Lagos" }).format(new Date()));
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export default async function AdminHome() {
  const { db } = await requireAdmin();
  const tracked = RESOURCES.filter((r) => ["artworks", "auctions", "exhibitions", "journal", "artists"].includes(r.key));

  const [settings, counts, enquiries, unread, recent] = await Promise.all([
    getSettings(),
    Promise.all(
      tracked.map(async (r) => {
        const [total, live] = await Promise.all([
          db.from(r.table).select("id", { count: "exact", head: true }),
          db.from(r.table).select("id", { count: "exact", head: true }).eq("status", "published"),
        ]);
        return { r, total: total.count ?? 0, live: live.count ?? 0, error: total.error?.message };
      })
    ),
    db.from("enquiries").select("id,name,email,subject,message,created_at,handled").order("created_at", { ascending: false }).limit(5),
    db.from("enquiries").select("id", { count: "exact", head: true }).eq("handled", false),
    Promise.all(
      tracked.filter((r) => r.key !== "artists").map(async (r) => {
        const { data } = await db.from(r.table).select(`id, ${r.titleField}, status, created_at`).order("created_at", { ascending: false }).limit(4);
        return ((data ?? []) as unknown as Record<string, string>[]).map<Recent>((d) => ({
          key: r.key, label: r.singular, id: d.id, title: d[r.titleField], status: d.status, created_at: d.created_at,
        }));
      })
    ),
  ]);

  const recentItems = recent.flat().sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 6);
  const enquiryRows = (enquiries.data ?? []) as Enquiry[];
  const publishedArtworks = counts.find((c) => c.r.key === "artworks")?.live ?? 0;

  // Setup checklist: only real, checkable facts about this site.
  const checklist = [
    { done: Boolean(settings.heroImageUrl && settings.heroImageRightUrl), label: "Upload both homepage hero images", href: "/admin/homepage" },
    { done: Boolean(settings.aboutSummary.trim()) && !settings.aboutSummary.includes("[Demo text]"), label: "Write the About text", href: "/admin/settings" },
    { done: Boolean(settings.whatsappNumber), label: "Add the WhatsApp number", href: "/admin/settings" },
    { done: Boolean(settings.primaryEmail && settings.address), label: "Add the email address and gallery address", href: "/admin/settings" },
    { done: Boolean(settings.logoUrl), label: "Upload the logo", href: "/admin/settings" },
    { done: publishedArtworks > 0, label: "Publish your first artwork", href: "/admin/artworks/new" },
  ];
  const done = checklist.filter((c) => c.done).length;

  return (
    <>
      <PageHeader
        title={greeting()}
        description={new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Lagos" }).format(new Date())}
        actions={
          <>
            <Link href="/admin/homepage" className={btn("secondary")}><Icon name="home" className="h-4 w-4" /> Edit homepage</Link>
            <Link href="/admin/artworks/new" className={btn("primary")}><Icon name="plus" className="h-4 w-4" /> New artwork</Link>
          </>
        }
      />

      {done < checklist.length && (
        <Card
          className="mb-6"
          title="Finish setting up the website"
          description={`${done} of ${checklist.length} done`}
          actions={
            <div className="mt-1 h-1.5 w-32 overflow-hidden rounded-full bg-stone-100" role="progressbar" aria-valuemin={0} aria-valuemax={checklist.length} aria-valuenow={done} aria-label="Setup progress">
              <div className="h-full rounded-full bg-brand" style={{ width: `${(done / checklist.length) * 100}%` }} />
            </div>
          }
        >
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {checklist.map((c) => (
              <li key={c.label}>
                <Link href={c.href} className="flex items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-stone-50">
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${c.done ? "bg-emerald-600 text-white" : "border border-stone-300"}`}>
                    {c.done && <Icon name="check" className="h-3 w-3" />}
                  </span>
                  <span className={c.done ? "text-stone-500 line-through" : "text-stone-800"}>{c.label}</span>
                  <span className="sr-only">{c.done ? "(done)" : "(to do)"}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <ul className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {counts.map(({ r, total, live, error }) => (
          <li key={r.key}>
            <Link href={`/admin/${r.key}`} className="block h-full rounded-lg border border-stone-200 bg-white p-4 shadow-sm transition-colors hover:border-stone-300">
              <span className="flex items-center gap-2 text-sm text-stone-600"><Icon name={ICONS[r.key]} className="h-4 w-4" /> {r.label}</span>
              <span className="mt-3 block font-serif text-3xl text-stone-800">{error ? "?" : total}</span>
              <span className="mt-1 block text-xs text-stone-500">{error ? "Could not load" : `${live} published · ${total - live} draft`}</span>
            </Link>
          </li>
        ))}
        <li>
          <Link href="/admin/enquiries" className="block h-full rounded-lg border border-stone-200 bg-white p-4 shadow-sm transition-colors hover:border-stone-300">
            <span className="flex items-center gap-2 text-sm text-stone-600"><Icon name="enquiries" className="h-4 w-4" /> New enquiries</span>
            <span className="mt-3 block font-serif text-3xl text-stone-800">{unread.count ?? 0}</span>
            <span className="mt-1 block text-xs text-stone-500">waiting for a reply</span>
          </Link>
        </li>
      </ul>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Latest enquiries" actions={<Link href="/admin/enquiries" className="text-xs text-stone-600 underline">Open inbox</Link>} padded={false}>
          {enquiryRows.length === 0 ? (
            <p className="p-5 text-sm text-stone-500">No messages yet. Contact-form messages will appear here.</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {enquiryRows.map((e) => (
                <li key={e.id}>
                  <Link href={`/admin/enquiries?filter=all&open=${e.id}`} className="flex items-start gap-3 px-5 py-3 hover:bg-stone-50">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${e.handled ? "bg-transparent" : "bg-brand"}`} aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-3">
                        <span className={`truncate text-sm ${e.handled ? "text-stone-700" : "font-semibold text-stone-800"}`}>{e.name}</span>
                        <span className="shrink-0 text-xs text-stone-500">{formatWhen(e.created_at)}</span>
                      </span>
                      <span className="block truncate text-xs text-stone-600">{e.subject || e.message}</span>
                    </span>
                    {!e.handled && <span className="sr-only">Unread</span>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Recently added" padded={false}>
          {recentItems.length === 0 ? (
            <p className="p-5 text-sm text-stone-500">Nothing added yet. Start with an artwork or an auction.</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {recentItems.map((r) => (
                <li key={`${r.key}-${r.id}`}>
                  <Link href={`/admin/${r.key}/${r.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-stone-50">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-stone-100 text-stone-500"><Icon name={ICONS[r.key]} className="h-4 w-4" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-stone-800">{r.title}</span>
                      <span className="block text-xs capitalize text-stone-500">{r.label} · {formatWhen(r.created_at)}</span>
                    </span>
                    <StatusBadge status={r.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
