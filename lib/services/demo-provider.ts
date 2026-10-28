import type { DataProvider } from "./types";
import {
  demoArtworks, demoAuctions, demoExhibitions, demoJournal, demoSettings, demoTestimonials,
} from "@/lib/data/demo-data";

export const demoProvider: DataProvider = {
  async getSettings() { return demoSettings; },
  async getPublishedArtworks() { return demoArtworks.filter((a) => a.status === "published"); },
  async getFeaturedArtworks() { return demoArtworks.filter((a) => a.status === "published" && a.featured); },
  async getArtworkBySlug(slug) { return demoArtworks.find((a) => a.slug === slug && a.status === "published") ?? null; },
  async getPublishedAuctions() { return demoAuctions.filter((a) => a.status === "published"); },
  async getAuctionBySlug(slug) { return demoAuctions.find((a) => a.slug === slug && a.status === "published") ?? null; },
  async getPublishedExhibitions() { return demoExhibitions.filter((e) => e.status === "published"); },
  async getExhibitionBySlug(slug) { return demoExhibitions.find((e) => e.slug === slug && e.status === "published") ?? null; },
  async getPublishedJournalPosts() { return demoJournal.filter((p) => p.status === "published"); },
  async getJournalPostBySlug(slug) { return demoJournal.find((p) => p.slug === slug && p.status === "published") ?? null; },
  async getPublishedTestimonials() { return demoTestimonials.filter((t) => t.status === "published"); },
  // Demo mode has no database, so the built-in FAQ and legal wording is used.
  async getPublishedFaqs() { return []; },
  async getLegalPage() { return null; },
};
