export type PublishStatus = "draft" | "published";
export type Availability = "available" | "sold" | "on_request";

export interface Artist {
  id: string;
  slug: string;
  name: string;
  biography: string | null;
  status: PublishStatus;
}

export interface ArtworkImage {
  id: string;
  url: string;
  alt: string;
  isMain: boolean;
  sortOrder: number;
}

export interface Artwork {
  id: string;
  slug: string;
  title: string;
  artist: Artist | null;
  medium: string | null;
  dimensions: string | null;
  year: number | null;
  description: string | null;
  price: number | null;
  currency: string | null;
  priceOnRequest: boolean;
  availability: Availability;
  images: ArtworkImage[];
  featured: boolean;
  status: PublishStatus;
  /** true = sample record, not verified business data */
  isDemo?: boolean;
}

export interface Auction {
  id: string;
  slug: string;
  title: string;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
  coverImageUrl: string | null;
  artworkIds: string[];
  featured: boolean;
  status: PublishStatus;
  isDemo?: boolean;
}

export interface Exhibition {
  id: string;
  slug: string;
  title: string;
  year: number | null;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
  coverImageUrl: string | null;
  artistIds: string[];
  artworkIds: string[];
  featured: boolean;
  status: PublishStatus;
  isDemo?: boolean;
}

export interface JournalPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  author: string | null;
  publishedAt: string | null;
  status: PublishStatus;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string | null;
  status: PublishStatus;
}

export interface SocialLinks {
  instagram: string;
  facebook: string;
  youtube: string;
  tiktok: string;
  linkedin: string;
}

/** The single source of truth for site-wide, CMS-editable settings. */
export interface WebsiteSettings {
  siteName: string;
  establishedYear: number | null;
  homeHeading: string;
  homeIntro: string;
  aboutSummary: string;
  whatsappNumber: string; // international format, e.g. "2348000000000"
  whatsappDefaultMessage: string;
  whatsappArtworkTemplate: string; // supports {title} and {artist}
  primaryEmail: string;
  additionalEmails: string[];
  phoneNumbers: string[];
  address: string;
  virtualTourUrl: string;
  /** Homepage hero photo from Storage. Empty = use the default image in /public/images/hero.jpg */
  heroImageUrl: string;
  /** Logo from Storage. Empty = use the default logo in /public/images/logo.png */
  logoUrl: string;
  /** Photos for the four homepage tiles. Empty = a placeholder box is shown. */
  tileImages: { auctions: string; exhibitions: string; artworks: string; tour: string };
  social: SocialLinks;
}

/** One FAQ question, as saved in Admin > FAQs. */
export interface FaqRecord {
  id: string;
  category: string;
  question: string;
  answer: string;
  linkLabel: string | null;
  linkHref: string | null;
  sortOrder: number;
}

/** A legal page (Privacy Policy, Terms, Auction Terms), as saved in Admin > Legal pages. */
export interface LegalPageRecord {
  key: string;
  title: string;
  content: string;
  lastUpdated: string | null; // YYYY-MM-DD
  showDraftNotice: boolean;
}
