import type { Artist, Artwork, Auction, Exhibition, FaqRecord, JournalPost, LegalPageRecord, Testimonial, WebsiteSettings } from "@/types";
import type {
  ArtistRow, ArtworkRow, AuctionRow, ExhibitionRow, FaqRow, JournalRow, LegalRow, SettingsRow, TestimonialRow,
} from "./rows";
import { mediaUrl } from "./env";

export const toArtist = (r: ArtistRow): Artist => ({
  id: r.id, slug: r.slug, name: r.name, biography: r.biography, status: r.status,
});

export const toArtwork = (r: ArtworkRow): Artwork => ({
  id: r.id, slug: r.slug, title: r.title,
  artist: r.artist ? toArtist(r.artist) : null,
  medium: r.medium, dimensions: r.dimensions, year: r.year, description: r.description,
  price: r.price === null ? null : Number(r.price), currency: r.currency,
  priceOnRequest: r.price_on_request, availability: r.availability,
  images: (r.images ?? []).map((i) => ({
    id: i.id, url: mediaUrl(i.storage_path) ?? "", alt: i.alt || r.title, isMain: i.is_main, sortOrder: i.sort_order,
  })),
  featured: r.featured, status: r.status,
});

export const toAuction = (r: AuctionRow): Auction => ({
  id: r.id, slug: r.slug, title: r.title, startDate: r.start_date, endDate: r.end_date,
  description: r.description, coverImageUrl: mediaUrl(r.cover_image_path),
  artworkIds: (r.auction_artworks ?? []).map((x) => x.artwork_id), featured: r.featured, status: r.status,
});

export const toExhibition = (r: ExhibitionRow): Exhibition => ({
  id: r.id, slug: r.slug, title: r.title, year: r.year, startDate: r.start_date, endDate: r.end_date,
  description: r.description, coverImageUrl: mediaUrl(r.cover_image_path),
  artistIds: (r.exhibition_artists ?? []).map((x) => x.artist_id),
  artworkIds: (r.exhibition_artworks ?? []).map((x) => x.artwork_id),
  featured: r.featured, status: r.status,
});

export const toJournalPost = (r: JournalRow): JournalPost => ({
  id: r.id, slug: r.slug, title: r.title, excerpt: r.excerpt, content: r.content,
  coverImageUrl: mediaUrl(r.cover_image_path), author: r.author, publishedAt: r.published_at, status: r.status,
});

export const toTestimonial = (r: TestimonialRow): Testimonial => ({
  id: r.id, quote: r.quote, author: r.author, role: r.role, status: r.status,
});

export const toSettings = (r: SettingsRow): WebsiteSettings => ({
  siteName: r.site_name, establishedYear: r.established_year, homeHeading: r.home_heading,
  homeIntro: r.home_intro, aboutSummary: r.about_summary, whatsappNumber: r.whatsapp_number,
  whatsappDefaultMessage: r.whatsapp_default_message, whatsappArtworkTemplate: r.whatsapp_artwork_template,
  primaryEmail: r.primary_email, additionalEmails: r.additional_emails, phoneNumbers: r.phone_numbers,
  address: r.address, virtualTourUrl: r.virtual_tour_url, heroImageUrl: mediaUrl(r.hero_image_path) ?? "", logoUrl: mediaUrl(r.logo_path) ?? "",
  tileImages: {
    auctions: mediaUrl(r.tile_auctions_path) ?? "", exhibitions: mediaUrl(r.tile_exhibitions_path) ?? "",
    artworks: mediaUrl(r.tile_artworks_path) ?? "", tour: mediaUrl(r.tile_tour_path) ?? "",
  },
  social: {
    instagram: r.social.instagram ?? "", facebook: r.social.facebook ?? "", youtube: r.social.youtube ?? "",
    tiktok: r.social.tiktok ?? "", linkedin: r.social.linkedin ?? "",
  },
});

export const toFaq = (r: FaqRow): FaqRecord => ({
  id: r.id, category: r.category, question: r.question, answer: r.answer,
  linkLabel: r.link_label, linkHref: r.link_href, sortOrder: r.sort_order,
});

export const toLegalPage = (r: LegalRow): LegalPageRecord => ({
  key: r.page_key, title: r.title, content: r.content, lastUpdated: r.last_updated, showDraftNotice: r.show_draft_notice,
});
