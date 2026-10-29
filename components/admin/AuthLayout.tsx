import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { getSettings } from "@/lib/services";

/** Split-screen frame for sign-in, password reset and the demo-mode notice. */
export async function AuthLayout({ title, description, children }: { title: string; description?: ReactNode; children: ReactNode }) {
  const s = await getSettings();
  return (
    <div className="grid min-h-screen bg-white text-stone-800 lg:grid-cols-[1fr_1.1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#14110f] p-12 text-white lg:flex">
        <Image src={s.heroImageRightUrl || s.heroImageUrl || "/images/hero.jpg"} alt="" fill sizes="45vw" className="object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#14110f] via-[#14110f]/70 to-[#14110f]/40" />
        <Link href="/" className="relative">
          <Image src={s.logoUrl || "/images/logo.png"} alt={s.siteName} width={270} height={157} className="h-14 w-auto" priority />
        </Link>
        <div className="relative">
          <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-brand">Content studio</p>
          <p className="mt-4 max-w-md font-serif text-4xl leading-tight">Manage the collection, auctions, exhibitions and the homepage in one place.</p>
        </div>
      </aside>
      <main className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-10 inline-block lg:hidden">
            <Image src={s.logoUrl || "/images/logo.png"} alt={s.siteName} width={270} height={157} className="h-12 w-auto" />
          </Link>
          <h1 className="font-serif text-3xl font-medium">{title}</h1>
          {description && <p className="mt-2 text-sm text-stone-600">{description}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
