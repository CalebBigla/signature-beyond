import type { DataProvider } from "./types";
import { createClient } from "@/lib/supabase/server";
import type {
  ArtworkRow, AuctionRow, ExhibitionRow, FaqRow, JournalRow, LegalRow, SettingsRow, TestimonialRow,
} from "@/lib/supabase/rows";
import {
  toArtwork, toAuction, toExhibition, toFaq, toJournalPost, toLegalPage, toSettings, toTestimonial,
} from "@/lib/supabase/mappers";

// Errors are thrown (never swallowed), so a failed request shows the error page
// instead of looking like "no content".
const fail = (what: string, message: string): never => {
  throw new Error(`Could not load ${what}: ${message}`);
};

const ARTWORK_SELECT = "*, artist:artists(*), images:artwork_images(*)";
const AUCTION_SELECT = "*, auction_artworks(artwork_id)";
const EXHIBITION_SELECT = "*, exhibition_artworks(artwork_id), exhibition_artists(artist_id)";

export const supabaseProvider: DataProvider = {
  async getSettings() {
    const db = await createClient();
    const { data, error } = await db.from("website_settings").select("*").eq("id", 1).single();
    if (error) fail("website settings", error.message);
    return toSettings(data as unknown as SettingsRow);
  },

  async getPublishedArtworks() {
    const db = await createClient();
    const { data, error } = await db.from("artworks").select(ARTWORK_SELECT)
      .eq("status", "published").order("created_at", { ascending: false });
    if (error) fail("artworks", error.message);
    return ((data ?? []) as unknown as ArtworkRow[]).map(toArtwork);
  },

  async getFeaturedArtworks() {
    const db = await createClient();
    const { data, error } = await db.from("artworks").select(ARTWORK_SELECT)
      .eq("status", "published").eq("featured", true).order("created_at", { ascending: false });
    if (error) fail("featured artworks", error.message);
    return ((data ?? []) as unknown as ArtworkRow[]).map(toArtwork);
  },

  async getArtworkBySlug(slug) {
    const db = await createClient();
    const { data, error } = await db.from("artworks").select(ARTWORK_SELECT)
      .eq("status", "published").eq("slug", slug).maybeSingle();
    if (error) fail("the artwork", error.message);
    return data ? toArtwork(data as unknown as ArtworkRow) : null;
  },

  async getPublishedAuctions() {
    const db = await createClient();
    const { data, error } = await db.from("auctions").select(AUCTION_SELECT)
      .eq("status", "published").order("start_date", { ascending: false, nullsFirst: false });
    if (error) fail("auctions", error.message);
    return ((data ?? []) as unknown as AuctionRow[]).map(toAuction);
  },

  async getAuctionBySlug(slug) {
    const db = await createClient();
    const { data, error } = await db.from("auctions").select(AUCTION_SELECT)
      .eq("status", "published").eq("slug", slug).maybeSingle();
    if (error) fail("the auction", error.message);
    return data ? toAuction(data as unknown as AuctionRow) : null;
  },

  async getPublishedExhibitions() {
    const db = await createClient();
    const { data, error } = await db.from("exhibitions").select(EXHIBITION_SELECT)
      .eq("status", "published").order("year", { ascending: false, nullsFirst: false });
    if (error) fail("exhibitions", error.message);
    return ((data ?? []) as unknown as ExhibitionRow[]).map(toExhibition);
  },

  async getExhibitionBySlug(slug) {
    const db = await createClient();
    const { data, error } = await db.from("exhibitions").select(EXHIBITION_SELECT)
      .eq("status", "published").eq("slug", slug).maybeSingle();
    if (error) fail("the exhibition", error.message);
    return data ? toExhibition(data as unknown as ExhibitionRow) : null;
  },

  async getPublishedJournalPosts() {
    const db = await createClient();
    const { data, error } = await db.from("journal_posts").select("*")
      .eq("status", "published").order("published_at", { ascending: false, nullsFirst: false });
    if (error) fail("journal posts", error.message);
    return ((data ?? []) as unknown as JournalRow[]).map(toJournalPost);
  },

  async getJournalPostBySlug(slug) {
    const db = await createClient();
    const { data, error } = await db.from("journal_posts").select("*")
      .eq("status", "published").eq("slug", slug).maybeSingle();
    if (error) fail("the article", error.message);
    return data ? toJournalPost(data as unknown as JournalRow) : null;
  },

  async getPublishedTestimonials() {
    const db = await createClient();
    const { data, error } = await db.from("testimonials").select("*").eq("status", "published");
    if (error) fail("testimonials", error.message);
    return ((data ?? []) as unknown as TestimonialRow[]).map(toTestimonial);
  },

  async getPublishedFaqs() {
    const db = await createClient();
    const { data, error } = await db.from("faq_items").select("*")
      .eq("status", "published").order("sort_order", { ascending: true }).order("created_at", { ascending: true });
    if (error) fail("the FAQ", error.message);
    return ((data ?? []) as unknown as FaqRow[]).map(toFaq);
  },

  async getLegalPage(key) {
    const db = await createClient();
    const { data, error } = await db.from("legal_pages").select("*").eq("page_key", key).maybeSingle();
    if (error) fail("the page", error.message);
    return data ? toLegalPage(data as unknown as LegalRow) : null;
  },
};
