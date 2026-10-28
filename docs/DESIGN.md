# Design system: public site

How the public site looks and behaves, so new pages stay consistent. The admin area (`app/admin/**`) is separate and does not use these rules.

The direction is "quiet luxury gallery": calm, generous space and editorial type, with the artwork first. Signature Beyond orange is an accent, never a fill.

## Colour tokens

Defined in `tailwind.config.ts` and mirrored as CSS variables in `app/globals.css`.

| Token | Value | Use |
|---|---|---|
| `brand` | `#ea800c` (sampled from `public/images/logo.png`) | Hairline rules, the active/hover nav underline, availability dots, quote rules. **Text only on `ink`** (6.8:1). |
| `brand-deep` | `#a35700` | Orange **text** on light backgrounds (hover titles, links) and the focus ring. 5.05:1 on paper, 4.63:1 on bone. |
| `paper` | `#faf8f5` | Page background. |
| `bone` | `#f2eee8` | Alternate section bands and image mats. |
| `ink` | `#14110f` on the public site | Primary text, primary buttons, dark sections, the footer. |
| `stone-*` | Tailwind defaults | `stone-600` for secondary text (passes AA on paper and bone). `stone-200` for hairlines. Avoid `stone-500` for text on bone (4.15:1). |

`ink` is a CSS variable (`--ink`). The `.site` wrapper (in `app/(site)/layout.tsx`) sets it to warm near-black, and everywhere else, including the admin, keeps the original navy `#0b1220`. Anything rendered outside the site layout (e.g. `app/not-found.tsx`) adds `className="site"` itself.

**Do not** use `brand` as text on paper or bone. It is 2.6:1 and fails WCAG AA even for large headings. Use `brand-deep`, or `ink` with a `brand` rule beside it.

## Typography

- **Display serif:** Cormorant Garamond (400/500/600, with italic), via `next/font` (`font-serif`). It was kept over Playfair Display and Prata for three reasons:
  - Its fine, high-contrast strokes read as quieter and more "gallery" at hero sizes.
  - It has a true italic for artwork titles (Prata has none).
  - The admin already uses `font-serif`, so keeping it leaves the admin unchanged.
  - Use weight 500 at h3 and above; it gets thin below about 20px.
- **Sans:** Inter (`font-sans`) for body, UI and captions.

Type scale (Tailwind `fontSize` tokens):

| Token | Size | Use |
|---|---|---|
| `text-display` | clamp(3rem → 6.5rem), leading 0.98, -0.025em | Home hero and exhibition titles |
| `text-h1` | clamp(2.5rem → 4.5rem), leading 1.02, -0.02em | Page titles, feature titles |
| `text-h2` | clamp(2rem → 3rem), leading 1.08 | Section titles |
| `text-h3` | 1.625rem | Card titles, list titles |
| `text-body` | 1.0625rem / 1.75rem | Body copy |
| `text-caption` | 0.8125rem | Dates, meta, image captions |
| `text-eyebrow` | 0.6875rem, +0.25em tracking | Uppercase labels ("UPCOMING AUCTION", "EST. 1992") |

Helpers in `globals.css`:

- `.eyebrow`: uppercase label in `stone-600`, or `white/70` inside `.on-dark`.
- `.prose-gallery`: long-form text at a 68ch measure, with 1.5rem paragraph rhythm and pull quotes (`blockquote`).
- `.container-site`: `max-w-7xl`, with 16 / 24 / 40px gutters.

## Spacing and layout

- Sections use `py-section`, which is clamp(4rem → 10rem): about 64–96px on mobile and 128–160px on desktop.
- Use a 12-column grid (`md:grid-cols-12`) for editorial splits: image 7 / text 4 offset, or label 3 / text 8.
- Separate content with hairlines (`border-stone-200`, 1px), not boxes. No shadows, no rounded corners. The WhatsApp button is the only exception.
- `SectionHead` (`components/ui/Section.tsx`) is the standard section heading: eyebrow, serif title, an optional right-aligned link, and a hairline.
- `PageBanner` is the standard page intro: eyebrow, h1, optional standfirst, hairline. It has no dark image banner.

## Images

- **Artworks** (`ArtworkImage`): the work is contained on a `bone` mat inside a fixed-ratio frame, so it is never cropped and nothing shifts while it loads. Vary the frame (`aspect` prop) for asymmetric hangs.
- **Covers** (`CoverImage`): `cover` for photography, `fit="contain"` for posters (text must not be cut off).
- Always pass `sizes`. Use `priority` only for the one hero or LCP image on a page.
- Missing images render `PlaceholderImage` ("Image to be supplied"). Never use stock filler.

## Buttons (`components/ui/Button.tsx`)

There are only two variants, each with a light and a dark tone:

- **Primary:** solid `ink`, white text, square corners, `px-7 py-3.5`. On dark backgrounds or photos, use `tone="dark"` (paper fill, ink text).
- **Secondary:** text with a 1px underline that turns `brand` and moves on hover.

Use `ButtonLink` for links (external URLs open in a new tab), `Button` for `<button>`, and `buttonClass()` where you need only the classes. The minimum target height is 44px.

## Artwork caption (gallery label)

`ArtworkCaption` in `components/artworks/ArtworkCard.tsx`, in this order:

1. Artist: uppercase eyebrow. Hidden if there is no artist.
2. Title: serif italic, about 22px.
3. Year and medium: caption, `stone-600`. Hidden if both are empty.
4. Price, or "Price on request", on its own line, followed by `AvailabilityBadge` (a dot plus a word) when the work is available or sold.

## Content rules

- Show only what the data holds. Hide empty fields; never print "To be confirmed" filler where the element can simply be left out.
- Do not hard-code facts (prices, dates, bios, awards, testimonials, venues). Neutral UI copy ("See the work in person") is fine.
- Keep the demo-mode banner and the `[Demo text]` markers.

## Motion

- Use `Reveal` for in-view entrances: a 600ms ease-out fade with a 12px rise, fired once.
- Image hover scale is at most `1.03`, over 700ms.
- On scroll, the header shrinks from 80/96px to 64/72px and gains a blurred paper backdrop. On the home page it starts transparent over the hero.
- **Reduced motion:** `MotionConfig reducedMotion="user"` (Providers) drops transforms and keeps opacity fades. Every CSS height, transform or scale transition carries `motion-reduce:transition-none` (and `motion-reduce:group-hover:scale-100` for zooms). Smooth scrolling is switched off under reduced motion.

## Accessibility checklist for new UI

- Focus ring: global 2px `brand-deep` outline (or `brand` inside `.on-dark`), offset 3px. Don't remove it.
- Touch targets are at least 44px (`min-h-11`).
- Modal UI should use the native `<dialog>` (see `ArtworkGallery`), or trap focus and close on Escape (see `Header`).
- Never use colour as the only signal; badges always pair the dot with a word.
