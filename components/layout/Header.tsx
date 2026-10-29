"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { NAV_LINKS } from "@/lib/navigation";
import type { SocialLinks } from "@/types";

const subscribeScroll = (cb: () => void) => {
  window.addEventListener("scroll", cb, { passive: true });
  return () => window.removeEventListener("scroll", cb);
};
const isScrolled = () => window.scrollY > 8;

// Header icons, filled as on the gallery's existing navbar. Only accounts with a link are shown.
const HEADER_SOCIALS = [
  {
    key: "facebook", label: "Facebook",
    icon: <path fill="currentColor" d="M9.1 23.7v-8H6.6V12h2.5v-1.6c0-4.1 1.8-6 5.9-6 .8 0 2.1.2 2.6.3v3.3h-1.4c-1.4 0-2 .6-2 2.1V12h3.9l-.7 3.7h-3.2v8.2C19.4 23.2 24 18.2 24 12 24 5.4 18.6 0 12 0S0 5.4 0 12c0 5.6 3.9 10.4 9.1 11.7Z" />,
  },
  {
    key: "twitter", label: "X (Twitter)",
    icon: <path fill="currentColor" d="M23.95 4.57a10 10 0 0 1-2.82.77 4.96 4.96 0 0 0 2.16-2.72 9.9 9.9 0 0 1-3.13 1.18 4.92 4.92 0 0 0-8.38 4.49A13.98 13.98 0 0 1 1.64 3.16a4.92 4.92 0 0 0 1.52 6.57 4.9 4.9 0 0 1-2.23-.61v.06a4.92 4.92 0 0 0 3.95 4.83 4.99 4.99 0 0 1-2.21.08 4.94 4.94 0 0 0 4.6 3.42A9.87 9.87 0 0 1 0 19.54a14 14 0 0 0 7.56 2.21c9.05 0 14-7.5 14-13.99 0-.21 0-.42-.02-.63A10 10 0 0 0 24 4.59l-.05-.02Z" />,
  },
  {
    key: "instagram", label: "Instagram",
    icon: (
      <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
        <circle cx="12" cy="12" r="4.2" />
        <circle cx="17.6" cy="6.4" r="0.6" fill="currentColor" />
      </g>
    ),
  },
  {
    key: "youtube", label: "YouTube",
    icon: <path fill="currentColor" d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.87.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z" />,
  },
] as const;

function SocialIcons({ social, siteName, className = "" }: { social: SocialLinks; siteName: string; className?: string }) {
  const items = HEADER_SOCIALS.filter((s) => social[s.key]);
  if (items.length === 0) return null;
  return (
    <ul className={`flex items-center ${className}`} aria-label="Social media">
      {items.map((s) => (
        <li key={s.key}>
          <a
            href={social[s.key]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${siteName} on ${s.label}`}
            className="flex h-11 w-11 items-center justify-center text-brand transition-opacity hover:opacity-75"
          >
            <svg viewBox="0 0 24 24" className="h-[26px] w-[26px]" aria-hidden="true">{s.icon}</svg>
          </a>
        </li>
      ))}
    </ul>
  );
}

export function Header({ siteName, logoSrc, social }: { siteName: string; logoSrc: string; social: SocialLinks }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const scrolled = useSyncExternalStore(subscribeScroll, isScrolled, () => false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  // The menu opens just below the header, wherever it sits (the demo banner can push it down).
  const [menuTop, setMenuTop] = useState(0);
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  // Close the menu whenever the route changes (back/forward included).
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  // While the menu is open: lock page scroll, trap Tab inside the menu and the toggle, close on Escape.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    menuRef.current?.querySelector<HTMLElement>("a")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      const items = [toggleRef.current, ...Array.from(menuRef.current?.querySelectorAll<HTMLElement>("a") ?? [])].filter(
        (el): el is HTMLElement => Boolean(el)
      );
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement as HTMLElement | null;
      if (!current || !items.includes(current)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && current === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && current === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header ref={headerRef} className={`sticky top-0 z-40 bg-[#eeeeee] text-ink transition-shadow duration-300 ${scrolled && !open ? "shadow-[0_1px_8px_rgba(20,17,15,0.08)]" : ""}`}>
      <div className="relative z-10 mx-auto flex h-[4.75rem] max-w-[90rem] items-center justify-between px-4 sm:px-6 lg:px-10">
        <Link href="/" aria-label={`${siteName} home`} className="-ml-1 flex shrink-0 items-center p-1">
          <Image src={logoSrc} alt={siteName} width={270} height={157} priority sizes="110px" className="h-[3.4rem] w-auto" />
        </Link>

        <div className="hidden items-center gap-6 lg:flex xl:gap-10">
          <nav aria-label="Main" className="h-[4.75rem]">
            <ul className="flex h-full items-stretch">
              {NAV_LINKS.map((l) => {
                const active = isActive(l.href);
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      aria-current={active ? "page" : undefined}
                      className={`relative flex h-full items-center px-4 font-nav text-[0.97rem] transition-colors xl:px-5 ${
                        active ? "text-brand" : "text-ink hover:text-brand"
                      }`}
                    >
                      {l.label}
                      <span
                        aria-hidden="true"
                        className={`absolute inset-x-0 bottom-3 h-[2px] bg-brand transition-opacity duration-300 motion-reduce:transition-none ${active ? "opacity-100" : "opacity-0"}`}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <SocialIcons social={social} siteName={siteName} className="hidden gap-1 xl:flex" />
        </div>

        <button
          ref={toggleRef}
          type="button"
          className="-mr-2 flex h-11 w-11 items-center justify-center lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => {
            setMenuTop(headerRef.current?.getBoundingClientRect().bottom ?? 0);
            setOpen((v) => !v);
          }}
        >
          <span aria-hidden="true" className="relative block h-3 w-6">
            <span className={`absolute left-0 h-[2px] w-6 bg-current transition-transform duration-300 motion-reduce:transition-none ${open ? "top-1.5 rotate-45" : "top-0"}`} />
            <span className={`absolute left-0 h-[2px] w-6 bg-current transition-transform duration-300 motion-reduce:transition-none ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
          </span>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            ref={menuRef}
            id="mobile-nav"
            aria-label="Mobile"
            className="fixed inset-x-0 bottom-0 z-0 flex flex-col overflow-y-auto bg-[#eeeeee] text-ink lg:hidden"
            style={{ top: menuTop }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <ul className="flex flex-col border-t border-stone-300 px-4 pt-4 sm:px-6">
              {NAV_LINKS.map((l, i) => {
                const active = isActive(l.href);
                return (
                  <motion.li
                    key={l.href}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.04 + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      href={l.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-14 items-center gap-4 border-b border-stone-300/70 font-nav text-xl ${active ? "text-brand" : "text-ink"}`}
                    >
                      <span aria-hidden="true" className={`h-[2px] w-5 bg-brand ${active ? "opacity-100" : "opacity-0"}`} />
                      {l.label}
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
            <SocialIcons social={social} siteName={siteName} className="mt-8 gap-2 px-3 sm:px-5" />
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
