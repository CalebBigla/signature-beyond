import Link from "next/link";
import type { ComponentProps } from "react";

export type ButtonVariant = "primary" | "secondary";
/** "light" for paper/bone backgrounds, "dark" for ink sections and over photos. */
export type ButtonTone = "light" | "dark";

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full text-sm font-medium tracking-wide transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-60";

const styles: Record<ButtonVariant, Record<ButtonTone, string>> = {
  // Solid, square, generous padding.
  primary: {
    light: "bg-ink px-7 py-3.5 text-white hover:bg-stone-800",
    dark: "bg-paper px-7 py-3.5 text-ink hover:bg-white",
  },
  // Text with an underline that turns brand orange and grows on hover.
  secondary: {
    light:
      "px-1 py-3 text-ink underline decoration-stone-300 decoration-1 underline-offset-[6px] hover:decoration-brand motion-safe:hover:underline-offset-[8px] motion-safe:transition-all",
    dark:
      "px-1 py-3 text-white underline decoration-white/40 decoration-1 underline-offset-[6px] hover:decoration-brand motion-safe:hover:underline-offset-[8px] motion-safe:transition-all",
  },
};

export function buttonClass(variant: ButtonVariant = "primary", tone: ButtonTone = "light", extra = "") {
  return `${base} ${styles[variant][tone]} ${extra}`.trim();
}

type LinkProps = ComponentProps<typeof Link> & { variant?: ButtonVariant; tone?: ButtonTone };

/** A link styled as a button. External URLs open in a new tab. */
export function ButtonLink({ variant, tone, className = "", href, ...rest }: LinkProps) {
  const cls = buttonClass(variant, tone, className);
  if (typeof href === "string" && /^(https?:|mailto:|tel:)/.test(href)) {
    const external = href.startsWith("http");
    return (
      <a
        href={href}
        className={cls}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...(rest as ComponentProps<"a">)}
      />
    );
  }
  return <Link href={href} className={cls} {...rest} />;
}

export function Button({ variant, tone, className = "", ...rest }: ComponentProps<"button"> & { variant?: ButtonVariant; tone?: ButtonTone }) {
  return <button className={buttonClass(variant, tone, className)} {...rest} />;
}
