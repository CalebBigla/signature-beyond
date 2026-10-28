import type { DataProvider } from "./types";
import { demoProvider } from "./demo-provider";
import { supabaseProvider } from "./supabase-provider";

const mode = process.env.NEXT_PUBLIC_DATA_MODE ?? "demo";

/** True while the site is showing built-in sample data. */
export const isDemoMode = mode !== "supabase";

const provider: DataProvider = isDemoMode ? demoProvider : supabaseProvider;

// Pages and components import ONLY from here, never from a provider.
export const getSettings = () => provider.getSettings();
export const getPublishedArtworks = () => provider.getPublishedArtworks();
export const getFeaturedArtworks = () => provider.getFeaturedArtworks();
export const getArtworkBySlug = (slug: string) => provider.getArtworkBySlug(slug);
export const getPublishedAuctions = () => provider.getPublishedAuctions();
export const getAuctionBySlug = (slug: string) => provider.getAuctionBySlug(slug);
export const getPublishedExhibitions = () => provider.getPublishedExhibitions();
export const getExhibitionBySlug = (slug: string) => provider.getExhibitionBySlug(slug);
export const getPublishedJournalPosts = () => provider.getPublishedJournalPosts();
export const getJournalPostBySlug = (slug: string) => provider.getJournalPostBySlug(slug);
export const getPublishedTestimonials = () => provider.getPublishedTestimonials();
export const getPublishedFaqs = () => provider.getPublishedFaqs();
export const getLegalPage = (key: string) => provider.getLegalPage(key);
