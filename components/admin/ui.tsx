import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";

/*
 * Admin UI kit. Uses white / stone-* classes on purpose: the .admin-dark rules in globals.css
 * remap exactly these, so every screen works in dark mode without extra code.
 */

export const inputClass =
  "block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 shadow-sm placeholder:text-stone-500 focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:opacity-60";

const BTN = {
  primary: "bg-ink text-white hover:opacity-90",
  secondary: "border border-stone-300 bg-white text-stone-800 hover:bg-stone-100",
  danger: "border border-red-200 bg-white text-red-700 hover:bg-red-50",
  ghost: "text-stone-700 hover:bg-stone-100",
} as const;
export type AdminButtonVariant = keyof typeof BTN;

export const btn = (variant: AdminButtonVariant = "primary", size: "sm" | "md" = "md") =>
  `inline-flex items-center justify-center gap-2 rounded-md font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
    size === "sm" ? "min-h-8 px-3 text-xs" : "min-h-10 px-4 text-sm"
  } ${BTN[variant]}`;

export interface Crumb { label: string; href?: string }

export function PageHeader({ title, description, crumbs, actions }: { title: string; description?: ReactNode; crumbs?: Crumb[]; actions?: ReactNode }) {
  return (
    <div className="mb-8">
      {crumbs && crumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-2 text-xs text-stone-500">
          <ol className="flex flex-wrap items-center gap-1.5">
            {crumbs.map((c, i) => (
              <li key={i} className="flex items-center gap-1.5">
                {c.href ? <Link href={c.href} className="hover:text-stone-800 hover:underline">{c.label}</Link> : <span aria-current="page">{c.label}</span>}
                {i < crumbs.length - 1 && <span aria-hidden="true">/</span>}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-serif text-3xl font-medium text-stone-800">{title}</h1>
          {description && <p className="mt-1 max-w-2xl text-sm text-stone-600">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function Card({ title, description, actions, children, className = "", padded = true }: {
  title?: ReactNode; description?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string; padded?: boolean;
}) {
  return (
    <section className={`rounded-lg border border-stone-200 bg-white shadow-sm ${className}`}>
      {(title || actions) && (
        <header className="flex items-start justify-between gap-3 border-b border-stone-200 px-5 py-3.5">
          <div>
            {title && <h2 className="text-sm font-semibold text-stone-800">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-stone-500">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className={padded ? "p-5" : ""}>{children}</div>
    </section>
  );
}

export function Field({ id, label, help, error, required, children }: {
  id: string; label: ReactNode; help?: ReactNode; error?: string; required?: boolean; children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-stone-700">
        {label}{required && <span className="text-red-700" aria-hidden="true"> *</span>}
      </label>
      {children}
      {error ? <p className="mt-1.5 text-xs text-red-700">{error}</p> : help ? <p className="mt-1.5 text-xs text-stone-500">{help}</p> : null}
    </div>
  );
}

const BADGE = {
  published: "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
  draft: "bg-stone-100 text-stone-700 ring-stone-500/20",
  unread: "bg-amber-50 text-amber-800 ring-amber-600/20",
  neutral: "bg-stone-100 text-stone-700 ring-stone-500/20",
} as const;

export function Badge({ tone, children }: { tone: keyof typeof BADGE; children: ReactNode }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${BADGE[tone]}`}>{children}</span>;
}

export const StatusBadge = ({ status }: { status: unknown }) =>
  status === "published" ? <Badge tone="published"><span className="h-1.5 w-1.5 rounded-full bg-emerald-600" aria-hidden="true" />Published</Badge>
    : <Badge tone="draft"><span className="h-1.5 w-1.5 rounded-full bg-stone-400" aria-hidden="true" />Draft</Badge>;

export function EmptyState({ icon = "artworks", title, children, action }: { icon?: IconName; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-500"><Icon name={icon} className="h-6 w-6" /></span>
      <h2 className="mt-4 text-base font-semibold text-stone-800">{title}</h2>
      {children && <p className="mt-1 max-w-sm text-sm text-stone-500">{children}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "success" | "error" | "warning"; children: ReactNode }) {
  const cls = {
    info: "border-sky-200 bg-sky-50 text-sky-900",
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    error: "border-red-200 bg-red-50 text-red-800",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
  }[tone];
  return <div role={tone === "error" ? "alert" : "status"} className={`rounded-md border px-4 py-3 text-sm ${cls}`}>{children}</div>;
}

export const formatWhen = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";
