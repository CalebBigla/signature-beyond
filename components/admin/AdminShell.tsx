"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { logout } from "@/lib/admin/actions";
import { NotificationBell, type NotificationItem } from "./NotificationBell";

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/artworks", label: "Artworks", icon: "artworks" },
  { href: "/admin/artists", label: "Artists", icon: "artists" },
  { href: "/admin/auctions", label: "Auctions", icon: "auctions" },
  { href: "/admin/exhibitions", label: "Exhibitions", icon: "exhibitions" },
  { href: "/admin/journal", label: "Journal", icon: "journal" },
  { href: "/admin/testimonials", label: "Testimonials", icon: "testimonials" },
  { href: "/admin/faqs", label: "FAQs", icon: "faq" },
  { href: "/admin/legal", label: "Legal pages", icon: "legal" },
  { href: "/admin/enquiries", label: "Enquiries", icon: "enquiries" },
  { href: "/admin/settings", label: "Website settings", icon: "settings" },
];

const saveCookie = (name: string, value: string) => {
  document.cookie = `${name}=${value}; path=/; max-age=31536000; samesite=lax`;
};

function NavList({ path, collapsed, onNavigate }: { path: string; collapsed: boolean; onNavigate?: () => void }) {
  const active = (href: string) => (href === "/admin" ? path === href : path.startsWith(href));
  return (
    <nav aria-label="Admin" className="flex-1 space-y-1 overflow-y-auto p-2">
      {NAV.map((n) => (
        <Link
          key={n.href}
          href={n.href}
          title={collapsed ? n.label : undefined}
          onClick={onNavigate}
          aria-current={active(n.href) ? "page" : undefined}
          className={`flex items-center gap-3 rounded px-3 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${
            active(n.href) ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
          } ${collapsed ? "justify-center" : ""}`}
        >
          <Icon name={n.icon} className="h-5 w-5 shrink-0" />
          <span className={collapsed ? "sr-only" : ""}>{n.label}</span>
        </Link>
      ))}
    </nav>
  );
}

interface Props {
  children: React.ReactNode;
  initialTheme: "light" | "dark";
  initialCollapsed: boolean;
  notifications: { items: NotificationItem[]; unread: number; loadError?: string };
}

export function AdminShell({ children, initialTheme, initialCollapsed, notifications }: Props) {
  const path = usePathname();
  const [theme, setTheme] = useState(initialTheme);
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setDrawer(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawer]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    saveCookie("admin-theme", next);
  };
  const toggleSidebar = () => {
    const next = !collapsed;
    setCollapsed(next);
    saveCookie("admin-sidebar", next ? "collapsed" : "expanded");
  };

  const iconBtn = "flex h-10 w-10 items-center justify-center rounded hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1";

  return (
    <div className={`min-h-screen ${theme === "dark" ? "admin-dark bg-stone-950 text-stone-200" : "bg-stone-50 text-stone-800"}`}>
      <a href="#admin-main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-stone-900">Skip to content</a>

      {/* Desktop sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 hidden flex-col bg-slate-900 text-white transition-[width] duration-200 md:flex ${collapsed ? "w-16" : "w-60"}`}>
        <div className={`flex h-14 items-center border-b border-white/10 px-4 font-serif text-lg ${collapsed ? "justify-center" : ""}`}>
          {collapsed ? <span aria-hidden="true">SB</span> : "Signature Beyond"}
          {collapsed && <span className="sr-only">Signature Beyond admin</span>}
        </div>
        <NavList path={path} collapsed={collapsed} />
      </aside>

      {/* Mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <button type="button" aria-label="Close menu" onClick={() => setDrawer(false)} className="absolute inset-0 bg-black/50" />
          <div className="relative flex h-full w-72 max-w-[85vw] flex-col bg-slate-900 text-white shadow-xl">
            <div className="flex h-14 items-center justify-between border-b border-white/10 px-4">
              <span className="font-serif text-lg">Signature Beyond</span>
              <button type="button" aria-label="Close menu" onClick={() => setDrawer(false)} className="flex h-10 w-10 items-center justify-center rounded hover:bg-white/10">
                <Icon name="close" />
              </button>
            </div>
            <NavList path={path} collapsed={false} onNavigate={() => setDrawer(false)} />
          </div>
        </div>
      )}

      <div className={`transition-[padding] duration-200 ${collapsed ? "md:pl-16" : "md:pl-60"}`}>
        <header className="sticky top-0 z-20 flex h-14 items-center gap-1 border-b border-stone-200 bg-white px-2 sm:px-4">
          <button type="button" onClick={() => setDrawer(true)} aria-label="Open menu" aria-expanded={drawer} className={`${iconBtn} md:hidden`}>
            <Icon name="menu" />
          </button>
          <button type="button" onClick={toggleSidebar} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={!collapsed} className={`${iconBtn} hidden md:flex`}>
            <Icon name={collapsed ? "chevronRight" : "chevronLeft"} />
          </button>
          <div className="flex-1" />
          <Link href="/" target="_blank" rel="noopener noreferrer" className="hidden items-center gap-1 px-2 text-sm hover:underline sm:flex">
            View site <Icon name="external" className="h-4 w-4" />
          </Link>
          <button type="button" onClick={toggleTheme} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"} className={iconBtn}>
            <Icon name={theme === "dark" ? "sun" : "moon"} />
          </button>
          <NotificationBell {...notifications} />
          <form action={logout}>
            <button type="submit" aria-label="Log out" title="Log out" className={iconBtn}><Icon name="logout" /></button>
          </form>
        </header>
        <main id="admin-main" className="p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
