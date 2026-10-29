import type { IconName } from "@/components/ui/Icon";

export interface AdminNavItem { href: string; label: string; icon: IconName; badge?: "enquiries" }
export interface AdminNavGroup { label: string; items: AdminNavItem[] }

export const ADMIN_NAV: AdminNavGroup[] = [
  { label: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: "dashboard" }] },
  {
    label: "Website",
    items: [
      { href: "/admin/homepage", label: "Homepage", icon: "home" },
      { href: "/admin/legal", label: "Legal pages", icon: "legal" },
      { href: "/admin/faqs", label: "FAQs", icon: "faq" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/artworks", label: "Artworks", icon: "artworks" },
      { href: "/admin/artists", label: "Artists", icon: "artists" },
      { href: "/admin/auctions", label: "Auctions", icon: "auctions" },
      { href: "/admin/exhibitions", label: "Exhibitions", icon: "exhibitions" },
      { href: "/admin/journal", label: "Journal", icon: "journal" },
      { href: "/admin/testimonials", label: "Testimonials", icon: "testimonials" },
    ],
  },
  {
    label: "Inbox & settings",
    items: [
      { href: "/admin/enquiries", label: "Enquiries", icon: "enquiries", badge: "enquiries" },
      { href: "/admin/settings", label: "Website settings", icon: "settings" },
    ],
  },
];

/** Extra entries for the command palette (Ctrl/Cmd + K). */
export const QUICK_ACTIONS: { href: string; label: string; icon: IconName }[] = [
  { href: "/admin/artworks/new", label: "New artwork", icon: "plus" },
  { href: "/admin/artists/new", label: "New artist", icon: "plus" },
  { href: "/admin/auctions/new", label: "New auction", icon: "plus" },
  { href: "/admin/exhibitions/new", label: "New exhibition", icon: "plus" },
  { href: "/admin/journal/new", label: "New journal article", icon: "plus" },
  { href: "/admin/testimonials/new", label: "New testimonial", icon: "plus" },
  { href: "/admin/faqs/new", label: "New FAQ question", icon: "plus" },
];

export const isActive = (path: string, href: string) => (href === "/admin" ? path === href : path === href || path.startsWith(`${href}/`));
