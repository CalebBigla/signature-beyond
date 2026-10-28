/** Link to the contact form with the subject pre-filled (read by app/(site)/contact/page.tsx). */
export const contactHref = (subject: string) => `/contact?subject=${encodeURIComponent(subject)}`;

/** Subject passed in the URL, trimmed to the form's 200-character limit. */
export function subjectFromParams(raw: string | string[] | undefined): string {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return (v ?? "").trim().slice(0, 200);
}

/** Serialises JSON-LD safely for a <script> tag (no "</script>" break-out). */
export const jsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");
