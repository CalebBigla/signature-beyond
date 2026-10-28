import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import {
  getPublishedArtworks, getPublishedAuctions, getPublishedExhibitions, getPublishedJournalPosts,
} from "@/lib/services";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [artworks, auctions, exhibitions, posts] = await Promise.all([
    getPublishedArtworks(), getPublishedAuctions(), getPublishedExhibitions(), getPublishedJournalPosts(),
  ]);
  const pages = ["", "/artworks", "/auctions", "/exhibitions", "/about", "/journal", "/contact", "/faq", "/privacy-policy", "/terms", "/auction-terms"];
  return [
    ...pages.map((p) => ({ url: `${SITE_URL}${p}` })),
    ...artworks.map((a) => ({ url: `${SITE_URL}/artworks/${a.slug}` })),
    ...auctions.map((a) => ({ url: `${SITE_URL}/auctions/${a.slug}` })),
    ...exhibitions.map((e) => ({ url: `${SITE_URL}/exhibitions/${e.slug}` })),
    ...posts.map((p) => ({ url: `${SITE_URL}/journal/${p.slug}`, lastModified: p.publishedAt ?? undefined })),
  ];
}
