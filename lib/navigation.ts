// Main navigation, in the order shown in the header (matches the gallery's live site).
export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Virtual Tour", href: "/virtual-tour" },
  { label: "Artworks", href: "/artworks" },
  { label: "Exhibition", href: "/exhibitions" },
  { label: "Auctions", href: "/auctions" },
  { label: "Contact", href: "/contact" },
] as const;

/** Pages that are not in the header but are linked from the footer. */
export const FOOTER_EXTRA_LINKS = [
  { label: "About", href: "/about" },
  { label: "Journal", href: "/journal" },
] as const;
