"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { ADMIN_NAV, QUICK_ACTIONS } from "./nav";

const ENTRIES = [
  ...ADMIN_NAV.flatMap((g) => g.items.map((i) => ({ ...i, group: g.label }))),
  ...QUICK_ACTIONS.map((a) => ({ ...a, group: "Create" })),
  { href: "/", label: "View the live website", icon: "external" as const, group: "Website" },
];

/** Ctrl/Cmd + K: jump to any admin screen or start a new record. A native <dialog> handles focus and Escape. */
export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    return term ? ENTRIES.filter((e) => e.label.toLowerCase().includes(term) || e.group.toLowerCase().includes(term)) : ENTRIES;
  }, [q]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const go = (href: string) => {
    onClose();
    setQ("");
    if (href === "/") window.open("/", "_blank", "noopener");
    else router.push(href);
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(i + 1, results.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && results[active]) { e.preventDefault(); go(results[active].href); }
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
      aria-label="Search the admin"
      className="mt-[12vh] w-[min(36rem,calc(100vw-2rem))] rounded-lg border border-stone-200 bg-white p-0 text-stone-800 shadow-2xl backdrop:bg-stone-950/40"
    >
      <div className="flex items-center gap-3 border-b border-stone-200 px-4">
        <Icon name="search" className="h-4 w-4 text-stone-500" />
        <input
          autoFocus
          value={q}
          onChange={(e) => { setQ(e.target.value); setActive(0); }}
          onKeyDown={onKey}
          placeholder="Search pages and actions…"
          aria-label="Search pages and actions"
          aria-controls="palette-results"
          aria-activedescendant={results[active] ? `palette-${active}` : undefined}
          role="combobox"
          aria-expanded="true"
          className="h-12 flex-1 bg-transparent text-sm outline-none"
        />
        <kbd className="rounded border border-stone-300 px-1.5 py-0.5 text-[10px] text-stone-500">Esc</kbd>
      </div>
      <ul id="palette-results" role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
        {results.length === 0 && <li className="px-3 py-6 text-center text-sm text-stone-500">No matches.</li>}
        {results.map((r, i) => (
          <li
            key={r.href + r.label}
            id={`palette-${i}`}
            role="option"
            aria-selected={i === active}
            onMouseEnter={() => setActive(i)}
            onClick={() => go(r.href)}
            className={`flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm ${i === active ? "bg-stone-100" : ""}`}
          >
            <Icon name={r.icon} className="h-4 w-4 text-stone-500" />
            <span className="flex-1">{r.label}</span>
            <span className="text-xs text-stone-500">{r.group}</span>
          </li>
        ))}
      </ul>
    </dialog>
  );
}
