import type { Artwork, WebsiteSettings } from "@/types";

/** Builds a WhatsApp Click-to-Chat URL, or null if no number is configured. */
export function buildWhatsAppUrl(
  settings: WebsiteSettings,
  artwork?: Pick<Artwork, "title" | "artist">
): string | null {
  const number = settings.whatsappNumber.replace(/\D/g, "");
  if (!number) return null;

  let message = settings.whatsappDefaultMessage;
  if (artwork) {
    const artistName = artwork.artist?.name;
    message = settings.whatsappArtworkTemplate
      .replace(" by {artist}", artistName ? ` by ${artistName}` : "")
      .replace("{artist}", artistName ?? "")
      .replace("{title}", artwork.title);
  }
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
