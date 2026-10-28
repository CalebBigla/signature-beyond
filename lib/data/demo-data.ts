import type { Artwork, Auction, Exhibition, WebsiteSettings } from "@/types";

/**
 * DEMONSTRATION DATA ONLY. Titles come from the preliminary content inventory.
 * Artists, prices, dates, images and contact details are NOT verified and are
 * left empty on purpose. Replace via the CMS / Supabase once confirmed.
 */
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const art = (id: string, title: string, featured = true): Artwork => ({
  id,
  slug: slugify(title),
  title,
  artist: null,
  medium: null,
  dimensions: null,
  year: null,
  description: null,
  price: null,
  currency: null,
  priceOnRequest: true,
  availability: "on_request",
  images: [],
  featured,
  status: "published",
  isDemo: true,
});

export const demoArtworks: Artwork[] = [
  art("a1", "African Beauty"),
  art("a2", "Untitled"),
  art("a3", "Beetle (Ijapa)"),
  art("a4", "Self-Adoration"),
  art("a5", "Damsel", false),
];

const auction = (id: string, title: string): Auction => ({
  id,
  slug: slugify(title),
  title,
  startDate: null,
  endDate: null,
  description: null,
  coverImageUrl: null,
  artworkIds: [],
  featured: true,
  status: "published",
  isDemo: true,
});

export const demoAuctions: Auction[] = [
  auction("u1", "African Original 2023"),
  auction("u2", "African Original 2022"),
  auction("u3", "Contemporary 2021"),
];

const exhibition = (id: string, title: string): Exhibition => ({
  id,
  slug: slugify(title),
  title,
  year: null,
  startDate: null,
  endDate: null,
  description: null,
  coverImageUrl: null,
  artistIds: [],
  artworkIds: [],
  featured: true,
  status: "published",
  isDemo: true,
});

export const demoExhibitions: Exhibition[] = [
  exhibition("e1", "Toys for Troys"),
  exhibition("e2", "Room Morning Dance"),
  exhibition("e3", "Ghetto Impressions"),
];

export const demoSettings: WebsiteSettings = {
  siteName: "Signature Beyond",
  establishedYear: null, // the brief mentions 1992: confirm before filling in
  homeHeading: "Welcome to Signature Beyond",
  homeIntro: "[Demo text] Replace with approved introduction copy.",
  aboutSummary: "[Demo text] Replace with approved About copy.",
  whatsappNumber: "", // e.g. "2348000000000". The button stays hidden while empty.
  whatsappDefaultMessage: "Hello Signature Beyond, I would like to make an enquiry.",
  whatsappArtworkTemplate:
    "Hello Signature Beyond, I am interested in the artwork {title} by {artist}. Please provide more information.",
  primaryEmail: "",
  additionalEmails: [],
  phoneNumbers: [],
  address: "",
  virtualTourUrl: "",
  heroImageUrl: "",
  logoUrl: "",
  tileImages: { auctions: "", exhibitions: "", artworks: "", tour: "" },
  social: { instagram: "", facebook: "", youtube: "", tiktok: "", linkedin: "" },
};

// No approved journal posts or testimonials exist yet, so these stay empty on purpose.
export const demoJournal: import("@/types").JournalPost[] = [];
export const demoTestimonials: import("@/types").Testimonial[] = [];
