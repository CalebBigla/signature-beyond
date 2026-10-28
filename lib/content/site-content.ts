import { getLegalPage, getPublishedFaqs } from "@/lib/services";
import { FAQ, FAQ_CATEGORIES, type FaqCategory, type FaqItem } from "./faq";
import { LEGAL_DEFAULTS, type LegalKey } from "./legal";

// Only allow links that stay on this site ("/contact") or use https. Blocks "javascript:" and "//other-site" tricks.
const safeHref = (h: string | null) => (h && /^(\/(?!\/)|https:\/\/)/.test(h) ? h : null);

/**
 * FAQ shown on /faq. Uses the questions published in Admin > FAQs.
 * If none are published at all, the built-in wording is shown instead so the page is never empty.
 * (A database error is NOT hidden: it throws, like every other page.)
 */
export async function getFaqCategories(): Promise<FaqCategory[]> {
  const rows = await getPublishedFaqs();
  if (rows.length === 0) return FAQ;

  const groups = new Map<string, FaqItem[]>();
  for (const r of rows) {
    const href = safeHref(r.linkHref);
    const item: FaqItem = { q: r.question, a: r.answer, ...(href ? { link: { href, label: r.linkLabel?.trim() || "Learn more" } } : {}) };
    groups.set(r.category, [...(groups.get(r.category) ?? []), item]);
  }
  const known = FAQ_CATEGORIES.filter((c) => groups.has(c.id));
  const unknown = [...groups.keys()].filter((id) => !FAQ_CATEGORIES.some((c) => c.id === id)).map((id) => ({ id, title: id }));
  return [...known, ...unknown].map((c) => ({ id: c.id, title: c.title, items: groups.get(c.id) ?? [] }));
}

export interface LegalContent { title: string; content: string; updated: string | null; showDraftNotice: boolean }

/** Legal page text: the saved version if there is one, otherwise the built-in wording. */
export async function getLegalContent(key: LegalKey): Promise<LegalContent> {
  const saved = await getLegalPage(key);
  if (saved) return { title: saved.title, content: saved.content, updated: saved.lastUpdated, showDraftNotice: saved.showDraftNotice };
  const d = LEGAL_DEFAULTS[key];
  return { title: d.title, content: d.content, updated: d.updated, showDraftNotice: true };
}
