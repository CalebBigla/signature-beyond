"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  ["/admin", "Dashboard"], ["/admin/artworks", "Artworks"], ["/admin/artists", "Artists"],
  ["/admin/auctions", "Auctions"], ["/admin/exhibitions", "Exhibitions"], ["/admin/journal", "Journal"],
  ["/admin/testimonials", "Testimonials"], ["/admin/enquiries", "Enquiries"], ["/admin/settings", "Website settings"],
] as const;

export function AdminNav({ logoutAction }: { logoutAction: () => Promise<void> }) {
  const path = usePathname();
  const active = (href: string) => (href === "/admin" ? path === href : path.startsWith(href));
  return (
    <nav aria-label="Admin" className="flex gap-1 overflow-x-auto p-2 md:flex-col md:overflow-visible md:p-4">
      {LINKS.map(([href, label]) => (
        <Link key={href} href={href} aria-current={active(href) ? "page" : undefined}
          className={`shrink-0 rounded px-3 py-2 text-sm ${active(href) ? "bg-white/15 text-white" : "text-white/70 hover:text-white"}`}>
          {label}
        </Link>
      ))}
      <form action={logoutAction} className="shrink-0 md:mt-6">
        <button type="submit" className="rounded px-3 py-2 text-sm text-white/70 hover:text-white">Log out</button>
      </form>
    </nav>
  );
}
