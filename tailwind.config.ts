import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ink is a CSS variable: the public site (.site) uses warm near-black, the admin keeps its original navy.
        ink: "rgb(var(--ink) / <alpha-value>)",
        charcoal: "#1f1b18",
        paper: "#faf8f5",
        bone: "#f2eee8",
        // Sampled from public/images/logo.png. Decorative only on light backgrounds (2.6:1 on paper); fine as text on ink (6.8:1).
        brand: { DEFAULT: "#ea800c", deep: "#a35700" }, // deep: 5.05:1 on paper, 4.63:1 on bone
        whatsapp: "#25d366",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        nav: ["var(--font-nav)", "var(--font-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        eyebrow: ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.25em" }],
        caption: ["0.8125rem", { lineHeight: "1.25rem" }],
        body: ["1.0625rem", { lineHeight: "1.75rem" }],
        h3: ["1.625rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        h2: ["clamp(2rem, 1.5rem + 2vw, 3rem)", { lineHeight: "1.08", letterSpacing: "-0.015em" }],
        h1: ["clamp(2.5rem, 1.75rem + 3.25vw, 4.5rem)", { lineHeight: "1.02", letterSpacing: "-0.02em" }],
        display: ["clamp(3rem, 1.75rem + 5.5vw, 6.5rem)", { lineHeight: "0.98", letterSpacing: "-0.025em" }],
      },
      maxWidth: { measure: "68ch" },
      spacing: { section: "clamp(4rem, 2rem + 7vw, 10rem)" },
      transitionTimingFunction: { gallery: "cubic-bezier(0.22, 1, 0.36, 1)" },
    },
  },
  plugins: [],
};
export default config;
