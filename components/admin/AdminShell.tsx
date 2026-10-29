"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { logout } from "@/lib/admin/actions";
import { NotificationBell, type NotificationItem } from "./NotificationBell";
import { CommandPalette } from "./CommandPalette";
import { FlashToast } from "./FlashToast";
import { ADMIN_NAV, isActive } from "./nav";

const saveCookie = (name: string, value: string) => {
  document.cookie = `${name}=${value}; path=/; max-age=31536000; samesite=lax`;
};

function NavList({ path, collapsed, unread, onNavigate }: { path: string; collapsed: boolean; unread: number; onNavigate?: () => void }) {
  return (
    <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-4">
      {ADMIN_NAV.map((g) => (
        <div key={g.label} className="mb-5">
          <p className={`mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40 ${collapsed ? "sr-only" : ""}`}>{g.label}</p>
          <ul className="space-y-0.5">
            {g.items.map((n) => {
              const active = isActive(path, n.href);
              const count = n.badge === "enquiries" ? unread : 0;
              return (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    title={collapsed ? n.label : undefined}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand ${
                      active ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5 hover:text-white"
                    } ${collapsed ? "justify-center" : ""}`}
                  >
                    {active && <span aria-hidden="true" className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-brand" />}
                    <Icon name={n.icon} className="h-[18px] w-[18px] shrink-0" />
                    <span className={collapsed ? "sr-only" : "flex-1"}>{n.label}</span>
                    {count > 0 && (
                      <span className={`rounded-full bg-brand px-1.5 text-[10px] font-semibold leading-4 text-ink ${collapsed ? "absolute right-1 top-1" : ""}`}>
                        {count > 99 ? "99+" : count}
                        <span className="sr-only"> unread</span>
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function Brand({ collapsed, logoSrc }: { collapsed: boolean; logoSrc: string }) {
  return (
    <Link href="/admin" className={`flex h-16 items-center gap-3 border-b border-white/10 px-5 ${collapsed ? "justify-center px-0" : ""}`}>
      <Image src={logoSrc} alt="" width={270} height={157} className="h-9 w-auto" />
      <span className={collapsed ? "sr-only" : "leading-tight"}>
        <span className="block font-serif text-lg text-white">Signature Beyond</span>
        <span className="block text-[10px] uppercase tracking-[0.2em] text-white/50">Content studio</span>
      </span>
    </Link>
  );
}

interface Props {
  children: React.ReactNode;
  initialTheme: "light" | "dark";
  initialCollapsed: boolean;
  notifications: { items: NotificationItem[]; unread: number; loadError?: string };
  userEmail: string;
  logoSrc: string;
}

export function AdminShell({ children, initialTheme, initialCollapsed, notifications, userEmail, logoSrc }: Props) {
  const path = usePathname();
  const [theme, setTheme] = useState(initialTheme);
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [drawer, setDrawer] = useState(false);
  const [palette, setPalette] = useState(false);
  const [lastPath, setLastPath] = useState(path);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close the mobile drawer on navigation.
  if (path !== lastPath) {
    setLastPath(path);
    setDrawer(false);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette((v) => !v); }
      if (e.key === "Escape") setDrawer(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (drawer) drawerRef.current?.querySelector<HTMLElement>("a")?.focus();
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

  const iconBtn = "flex h-10 w-10 items-center justify-center rounded-md text-stone-600 hover:bg-stone-100 hover:text-stone-800";
  const unread = notifications.unread;

  return (
    <div className={`min-h-screen ${theme === "dark" ? "admin-dark bg-stone-950 text-stone-200" : "bg-stone-50 text-stone-800"}`}>
      <a href="#admin-main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-stone-900">Skip to content</a>

      {/* Sidebar: fixed literal colour (not bg-ink) so the dark-mode remap never turns it light. */}
      <aside className={`fixed inset-y-0 left-0 z-30 hidden flex-col bg-[#14110f] text-white transition-[width] duration-200 motion-reduce:transition-none md:flex ${collapsed ? "w-[4.5rem]" : "w-64"}`}>
        <Brand collapsed={collapsed} logoSrc={logoSrc} />
        <NavList path={path} collapsed={collapsed} unread={unread} />
        <div className={`border-t border-white/10 p-3 ${collapsed ? "flex justify-center" : ""}`}>
          <form action={logout} className={collapsed ? "" : "flex items-center gap-3 rounded-md px-2 py-1.5"}>
            {!collapsed && (
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] uppercase tracking-[0.15em] text-white/40">Signed in</span>
                <span className="block truncate text-xs text-white/80" title={userEmail}>{userEmail}</span>
              </span>
            )}
            <button type="submit" aria-label="Log out" title="Log out" className="flex h-9 w-9 items-center justify-center rounded-md text-white/60 hover:bg-white/10 hover:text-white">
              <Icon name="logout" className="h-[18px] w-[18px]" />
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <button type="button" aria-label="Close menu" onClick={() => setDrawer(false)} className="absolute inset-0 bg-black/50" />
          <div ref={drawerRef} className="relative flex h-full w-72 max-w-[85vw] flex-col bg-[#14110f] text-white shadow-xl">
            <div className="flex items-center justify-between pr-3">
              <Brand collapsed={false} logoSrc={logoSrc} />
              <button type="button" aria-label="Close menu" onClick={() => setDrawer(false)} className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-white/10">
                <Icon name="close" />
              </button>
            </div>
            <NavList path={path} collapsed={false} unread={unread} />
            <form action={logout} className="border-t border-white/10 p-3">
              <button type="submit" className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white">
                <Icon name="logout" className="h-[18px] w-[18px]" /> Log out
              </button>
            </form>
          </div>
        </div>
      )}

      <div className={`transition-[padding] duration-200 motion-reduce:transition-none ${collapsed ? "md:pl-[4.5rem]" : "md:pl-64"}`}>
        <header className="sticky top-0 z-20 flex h-16 items-center gap-1 border-b border-stone-200 bg-white/95 px-3 backdrop-blur sm:px-5">
          <button type="button" onClick={() => setDrawer(true)} aria-label="Open menu" aria-expanded={drawer} className={`${iconBtn} md:hidden`}>
            <Icon name="menu" />
          </button>
          <button type="button" onClick={toggleSidebar} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={!collapsed} className={`${iconBtn} hidden md:flex`}>
            <Icon name={collapsed ? "chevronRight" : "chevronLeft"} />
          </button>

          <button
            type="button"
            onClick={() => setPalette(true)}
            className="ml-1 flex h-10 min-w-0 flex-1 items-center gap-2 rounded-md border border-stone-200 bg-stone-50 px-3 text-left text-sm text-stone-500 hover:border-stone-300 sm:max-w-sm"
          >
            <Icon name="search" className="h-4 w-4 shrink-0" />
            <span className="truncate">Search or jump to…</span>
            <kbd className="ml-auto hidden rounded border border-stone-300 bg-white px-1.5 text-[10px] text-stone-500 sm:inline">Ctrl K</kbd>
          </button>

          <div className="flex-1" />
          <Link href="/" target="_blank" rel="noopener noreferrer" className="hidden items-center gap-1.5 rounded-md px-3 py-2 text-sm text-stone-600 hover:bg-stone-100 hover:text-stone-800 sm:flex">
            View site <Icon name="external" className="h-4 w-4" />
          </Link>
          <button type="button" onClick={toggleTheme} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"} className={iconBtn}>
            <Icon name={theme === "dark" ? "sun" : "moon"} />
          </button>
          <NotificationBell {...notifications} />
        </header>
        <main id="admin-main" className="mx-auto max-w-7xl p-4 sm:p-8">{children}</main>
      </div>

      <CommandPalette open={palette} onClose={() => setPalette(false)} />
      <Suspense fallback={null}><FlashToast /></Suspense>
    </div>
  );
}
