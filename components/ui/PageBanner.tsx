/** Quiet page intro: eyebrow, large serif title, optional standfirst, hairline below. Enters on load (CSS). */
export function PageBanner({ title, subtitle, eyebrow }: { title: string; subtitle?: string; eyebrow?: string }) {
  return (
    <header className="container-site pb-10 pt-16 md:pb-14 md:pt-24">
      {eyebrow && (
        <p className="hero-rise eyebrow mb-5 flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-8 bg-brand" />
          {eyebrow}
        </p>
      )}
      <h1 className="hero-rise max-w-4xl font-serif text-h1 font-medium text-ink" style={{ animationDelay: "0.1s" }}>{title}</h1>
      {subtitle && <p className="hero-rise mt-6 max-w-2xl text-body text-stone-600" style={{ animationDelay: "0.2s" }}>{subtitle}</p>}
      <div className="hero-line mt-10 h-px w-full origin-left bg-stone-200 md:mt-14" aria-hidden="true" />
    </header>
  );
}

export function EmptyNote({ children }: { children: React.ReactNode }) {
  return <p className="border-y border-stone-200 py-12 text-center text-body text-stone-600">{children}</p>;
}
