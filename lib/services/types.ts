import type { Artwork, Auction, Exhibition, FaqRecord, JournalPost, LegalPageRecord, Testimonial, WebsiteSettings } from "@/types";

/** Every data source (demo or Supabase) must implement this contract. */
export interface DataProvider {
  getSettings(): Promise<WebsiteSettings>;
  getPublishedArtworks(): Promise<Artwork[]>;
  getFeaturedArtworks(): Promise<Artwork[]>;
  getArtworkBySlug(slug: string): Promise<Artwork | null>;
  getPublishedAuctions(): Promise<Auction[]>;
  getAuctionBySlug(slug: string): Promise<Auction | null>;
  getPublishedExhibitions(): Promise<Exhibition[]>;
  getExhibitionBySlug(slug: string): Promise<Exhibition | null>;
  getPublishedJournalPosts(): Promise<JournalPost[]>;
  getJournalPostBySlug(slug: string): Promise<JournalPost | null>;
  getPublishedTestimonials(): Promise<Testimonial[]>;
  /** Published FAQ questions in display order. May be empty. */
  getPublishedFaqs(): Promise<FaqRecord[]>;
  /** The saved version of a legal page, or null if it has none (the built-in text is then used). */
  getLegalPage(key: string): Promise<LegalPageRecord | null>;
}
