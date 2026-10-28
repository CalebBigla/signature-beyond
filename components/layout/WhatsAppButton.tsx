import type { WebsiteSettings } from "@/types";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function WhatsAppButton({ settings }: { settings: WebsiteSettings }) {
  const url = buildWhatsAppUrl(settings);
  if (!url) return null; // no number configured: hide rather than link nowhere

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Signature Beyond on WhatsApp"
      className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
    >
      {/* Simple chat-bubble icon. Swap for the official WhatsApp logo asset if preferred. */}
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden="true">
        <path d="M12 3C7 3 3 6.6 3 11c0 1.9.7 3.600 2 5l-1 4 4.200-1.100A9.600 9.600 0 0 0 12 19c5 0 9-3.600 9-8s-4-8-9-8Z" />
      </svg>
    </a>
  );
}
