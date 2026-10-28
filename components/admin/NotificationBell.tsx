"use client";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { Icon } from "@/components/ui/Icon";
import { markAllEnquiriesRead, markEnquiryRead } from "@/lib/admin/actions";

export interface NotificationItem { id: string; title: string; body: string; createdAt: string; read: boolean }

interface Props { items: NotificationItem[]; unread: number; loadError?: string }

/** Notifications come from real contact-form enquiries. "Read" means the enquiry is marked handled. */
export function NotificationBell({ items, unread, loadError }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onDown); };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open}
        aria-haspopup="true"
        className="relative flex h-10 w-10 items-center justify-center rounded hover:bg-stone-100"
      >
        <Icon name="bell" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-medium text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div role="region" aria-label="Notifications" className="absolute right-0 z-40 mt-2 w-80 max-w-[calc(100vw-1.5rem)] rounded border border-stone-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-stone-200 px-3 py-2">
            <p className="text-sm font-medium">Notifications</p>
            {unread > 0 && (
              <button type="button" disabled={pending} onClick={() => start(() => markAllEnquiriesRead())} className="text-xs underline disabled:opacity-50">
                Mark all as read
              </button>
            )}
          </div>
          {loadError ? (
            <p className="p-4 text-sm text-red-700">Could not load notifications: {loadError}</p>
          ) : items.length === 0 ? (
            <p className="p-4 text-sm text-stone-500">No notifications yet. New contact-form messages will appear here.</p>
          ) : (
            <ul className="max-h-80 divide-y divide-stone-200 overflow-y-auto">
              {items.map((n) => (
                <li key={n.id} className={`p-3 text-sm ${n.read ? "" : "bg-stone-50"}`}>
                  <div className="flex items-start gap-2">
                    {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-600" aria-label="Unread" />}
                    <div className="min-w-0 flex-1">
                      <Link href="/admin/enquiries" onClick={() => setOpen(false)} className="block truncate font-medium hover:underline">{n.title}</Link>
                      <p className="line-clamp-2 text-xs text-stone-600">{n.body}</p>
                      <p className="mt-1 flex items-center justify-between text-xs text-stone-500">
                        <span>{new Date(n.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</span>
                        {!n.read && (
                          <button type="button" disabled={pending} onClick={() => start(() => markEnquiryRead(n.id))} className="underline disabled:opacity-50">
                            Mark as read
                          </button>
                        )}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/enquiries" onClick={() => setOpen(false)} className="block border-t border-stone-200 px-3 py-2 text-center text-xs underline">View all enquiries</Link>
        </div>
      )}
    </div>
  );
}
