import type { Availability, PublishStatus } from "@/types";

export interface ArtistRow { id: string; slug: string; name: string; biography: string | null; status: PublishStatus }
export interface ImageRow { id: string; storage_path: string; alt: string; is_main: boolean; sort_order: number }
export interface ArtworkRow {
  id: string; slug: string; title: string; medium: string | null; dimensions: string | null;
  year: number | null; description: string | null; price: number | string | null; currency: string | null;
  price_on_request: boolean; availability: Availability; featured: boolean; status: PublishStatus;
  artist: ArtistRow | null; images: ImageRow[];
}
export interface AuctionRow {
  id: string; slug: string; title: string; start_date: string | null; end_date: string | null;
  description: string | null; cover_image_path: string | null; featured: boolean; status: PublishStatus;
  auction_artworks: { artwork_id: string }[];
}
export interface ExhibitionRow {
  id: string; slug: string; title: string; year: number | null; start_date: string | null; end_date: string | null;
  description: string | null; cover_image_path: string | null; featured: boolean; status: PublishStatus;
  exhibition_artworks: { artwork_id: string }[]; exhibition_artists: { artist_id: string }[];
}
export interface JournalRow {
  id: string; slug: string; title: string; excerpt: string | null; content: string;
  cover_image_path: string | null; author: string | null; published_at: string | null; status: PublishStatus;
}
export interface TestimonialRow { id: string; quote: string; author: string; role: string | null; status: PublishStatus }
export interface SettingsRow {
  site_name: string; established_year: number | null; home_heading: string; home_intro: string;
  about_summary: string; whatsapp_number: string; whatsapp_default_message: string;
  whatsapp_artwork_template: string; primary_email: string; additional_emails: string[];
  phone_numbers: string[]; address: string; virtual_tour_url: string; hero_image_path: string | null; logo_path: string | null;
  tile_auctions_path: string | null; tile_exhibitions_path: string | null; tile_artworks_path: string | null; tile_tour_path: string | null; social: Partial<Record<string, string>>;
}
export interface FaqRow {
  id: string; category: string; question: string; answer: string; link_label: string | null;
  link_href: string | null; sort_order: number; status: PublishStatus;
}
export interface LegalRow {
  id: string; page_key: string; title: string; content: string; last_updated: string | null; show_draft_notice: boolean;
}
