/** Quiet page intro: eyebrow, large serif title, optional standfirst, hairline below. */
export function PageBanner({ title, subtitle, eyebrow }: { title: string; subtitle?: string; eyebrow?: string }) {
  return (
    <header className="container-site pb-10 pt-16 md:pb-14 md:pt-24">
      {eyebrow && <p className="eyebrow mb-5">{eyebrow}</p>}
      <h1 className="max-w-4xl font-serif text-h1 font-medium text-ink">{title}</h1>
      {subtitle && <p className="mt-6 max-w-2xl text-body text-stone-600">{subtitle}</p>}
      <div className="mt-10 h-px w-full bg-stone-200 md:mt-14" aria-hidden="true" />
    </header>
  );
}

export function EmptyNote({ children }: { children: React.ReactNode }) {
  return <p className="border-y border-stone-200 py-12 text-center text-body text-stone-600">{children}</p>;
}
