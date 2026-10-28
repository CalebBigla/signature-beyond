"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { NAV_LINKS } from "@/lib/navigation";

const subscribeScroll = (cb: () => void) => {
  window.addEventListener("scroll", cb, { passive: true });
  return () => window.removeEventListener("scroll", cb);
};
const isScrolled = () => window.scrollY > 24;

export function Header({ siteName, logoSrc }: { siteName: string; logoSrc: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const scrolled = useSyncExternalStore(subscribeScroll, isScrolled, () => false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  // Close the menu whenever the route changes (back/forward included).
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  // Only the home page has a full-bleed hero for the header to sit over.
  const overHero = pathname === "/" && !scrolled && !open;
  const compact = scrolled && !open;

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

  const tone = overHero ? "text-white" : "text-ink";

  return (
    <header className={`sticky top-0 z-40 isolate ${tone} ${overHero ? "on-dark" : ""}`}>
      {/* Background lives on its own layer so the backdrop blur never traps the fixed mobile menu. */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 -z-10 transition-[background-color,border-color,backdrop-filter] duration-500 motion-reduce:transition-none ${
          overHero
            ? "border-b border-transparent bg-transparent"
            : "border-b border-stone-200/80 bg-paper/90 backdrop-blur-md supports-[not(backdrop-filter:blur(0))]:bg-paper"
        }`}
      />
      <div
        className={`container-site relative z-10 flex items-center justify-between transition-[height] duration-500 ease-gallery motion-reduce:transition-none ${
          compact ? "h-16 md:h-[4.5rem]" : "h-20 md:h-24"
        }`}
      >
        <Link href="/" aria-label={`${siteName} home`} className="-ml-1 flex items-center p-1">
          <Image
            src={logoSrc}
            alt={siteName}
            width={270}
            height={157}
            priority
            sizes="120px"
            className={`w-auto transition-[height] duration-500 ease-gallery motion-reduce:transition-none ${compact ? "h-10 md:h-12" : "h-12 md:h-16"}`}
          />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((l) => {
              const active = isActive(l.href);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={`group relative inline-flex min-h-11 items-center px-3 text-[0.8125rem] font-medium tracking-[0.08em] transition-colors ${
                      active ? "" : overHero ? "text-white/80 hover:text-white" : "text-stone-600 hover:text-ink"
                    }`}
                  >
                    {l.label}
                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-3 bottom-2 h-px origin-left bg-brand transition-transform duration-500 ease-gallery motion-reduce:transition-none ${
                        active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <button
          ref={toggleRef}
          type="button"
          className="-mr-2 flex h-11 w-11 items-center justify-center lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span aria-hidden="true" className="relative block h-3 w-6">
            <span className={`absolute left-0 h-px w-6 bg-current transition-transform duration-300 motion-reduce:transition-none ${open ? "top-1.5 rotate-45" : "top-0"}`} />
            <span className={`absolute left-0 h-px w-6 bg-current transition-transform duration-300 motion-reduce:transition-none ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
          </span>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            ref={menuRef}
            id="mobile-nav"
            aria-label="Mobile"
            className="fixed inset-0 z-0 overflow-y-auto bg-paper pt-24 text-ink lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <ul className="container-site flex flex-col border-t border-stone-200 pb-16 pt-6">
              {NAV_LINKS.map((l, i) => {
                const active = isActive(l.href);
                return (
                  <motion.li
                    key={l.href}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.05 + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      href={l.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className="flex min-h-14 items-center gap-4 py-2 font-serif text-[2.25rem] font-medium leading-tight"
                    >
                      <span aria-hidden="true" className={`h-px w-6 bg-brand transition-opacity ${active ? "opacity-100" : "opacity-0"}`} />
                      {l.label}
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
