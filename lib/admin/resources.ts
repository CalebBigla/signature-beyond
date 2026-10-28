import { FAQ_CATEGORIES } from "@/lib/content/faq";

export type FieldType = "text" | "textarea" | "number" | "date" | "checkbox" | "select" | "image";
export interface Option { value: string; label: string }
export interface FieldDef {
  name: string; label: string; type: FieldType; required?: boolean; notNull?: boolean;
  options?: Option[]; refTable?: string; refLabel?: string; help?: string; rows?: number;
  /** Optional check for text fields: a regular expression the value must match, and the message if it does not. */
  pattern?: string; patternMessage?: string;
}
export interface LinkDef { table: string; parentCol: string; childCol: string; refTable: string; refLabel: string; label: string }
export interface ResourceDef {
  key: string; label: string; singular: string; table: string; titleField: string; hasSlug: boolean;
  hasStatus: boolean; fields: FieldDef[]; links?: LinkDef[]; gallery?: boolean; listColumns: { name: string; label: string }[];
  /** How the list is ordered when nobody has clicked a column heading. Default: newest first. */
  defaultSort?: { col: string; asc: boolean };
  /** Starting values for the "Add" form. */
  defaults?: Record<string, unknown>;
}

const STATUS: FieldDef = {
  name: "status", label: "Status", type: "select", required: true,
  options: [{ value: "draft", label: "Draft (hidden from the public)" }, { value: "published", label: "Published (visible)" }],
};
const SLUG: FieldDef = { name: "slug", label: "Web address (slug)", type: "text", help: "Leave empty to create it from the title." };
const FEATURED: FieldDef = { name: "featured", label: "Featured on homepage", type: "checkbox" };

export const RESOURCES: ResourceDef[] = [
  {
    key: "artworks", label: "Artworks", singular: "artwork", table: "artworks", titleField: "title", hasSlug: true, hasStatus: true, gallery: true,
    listColumns: [{ name: "availability", label: "Availability" }, { name: "featured", label: "Featured" }],
    fields: [
      { name: "title", label: "Title", type: "text", required: true }, SLUG,
      { name: "artist_id", label: "Artist", type: "select", refTable: "artists", refLabel: "name" },
      { name: "medium", label: "Medium", type: "text" }, { name: "dimensions", label: "Dimensions", type: "text" },
      { name: "year", label: "Year", type: "number" }, { name: "price", label: "Price", type: "number" },
      { name: "currency", label: "Currency (e.g. NGN, USD)", type: "text" },
      { name: "price_on_request", label: "Price on request (hides the price)", type: "checkbox" },
      { name: "availability", label: "Availability", type: "select", required: true, options: [
        { value: "available", label: "Available" }, { value: "on_request", label: "On request" }, { value: "sold", label: "Sold" }] },
      FEATURED, { name: "description", label: "Description", type: "textarea" }, STATUS,
    ],
  },
  {
    key: "artists", label: "Artists", singular: "artist", table: "artists", titleField: "name", hasSlug: true, hasStatus: true, listColumns: [],
    fields: [{ name: "name", label: "Name", type: "text", required: true }, SLUG, { name: "biography", label: "Biography", type: "textarea", rows: 8 }, STATUS],
  },
  {
    key: "auctions", label: "Auctions", singular: "auction", table: "auctions", titleField: "title", hasSlug: true, hasStatus: true,
    listColumns: [{ name: "start_date", label: "Starts" }],
    links: [{ table: "auction_artworks", parentCol: "auction_id", childCol: "artwork_id", refTable: "artworks", refLabel: "title", label: "Artworks in this auction" }],
    fields: [
      { name: "title", label: "Title", type: "text", required: true }, SLUG,
      { name: "start_date", label: "Start date", type: "date" }, { name: "end_date", label: "End date", type: "date" },
      { name: "cover_image_path", label: "Cover image", type: "image" }, FEATURED,
      { name: "description", label: "Description", type: "textarea" }, STATUS,
    ],
  },
  {
    key: "exhibitions", label: "Exhibitions", singular: "exhibition", table: "exhibitions", titleField: "title", hasSlug: true, hasStatus: true,
    listColumns: [{ name: "year", label: "Year" }],
    links: [
      { table: "exhibition_artworks", parentCol: "exhibition_id", childCol: "artwork_id", refTable: "artworks", refLabel: "title", label: "Artworks in this exhibition" },
      { table: "exhibition_artists", parentCol: "exhibition_id", childCol: "artist_id", refTable: "artists", refLabel: "name", label: "Participating artists" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true }, SLUG, { name: "year", label: "Year", type: "number" },
      { name: "start_date", label: "Start date", type: "date" }, { name: "end_date", label: "End date", type: "date" },
      { name: "cover_image_path", label: "Cover image", type: "image" }, FEATURED,
      { name: "description", label: "Description", type: "textarea" }, STATUS,
    ],
  },
  {
    key: "journal", label: "Journal", singular: "article", table: "journal_posts", titleField: "title", hasSlug: true, hasStatus: true,
    listColumns: [{ name: "published_at", label: "Published" }],
    fields: [
      { name: "title", label: "Title", type: "text", required: true }, SLUG,
      { name: "excerpt", label: "Short summary", type: "textarea", rows: 3 }, { name: "author", label: "Author", type: "text" },
      { name: "published_at", label: "Publication date", type: "date" }, { name: "cover_image_path", label: "Cover image", type: "image" },
      { name: "content", label: "Article text", type: "textarea", rows: 14, notNull: true, help: "Separate paragraphs with a blank line." }, STATUS,
    ],
  },
  {
    key: "testimonials", label: "Testimonials", singular: "testimonial", table: "testimonials", titleField: "author", hasSlug: false, hasStatus: true,
    listColumns: [{ name: "role", label: "Role" }],
    fields: [
      { name: "quote", label: "Quote (use real, approved testimonials only)", type: "textarea", required: true, rows: 4 },
      { name: "author", label: "Author", type: "text", required: true }, { name: "role", label: "Role (optional)", type: "text" }, STATUS,
    ],
  },
];

// FAQ questions are managed with the same generic screens as everything else.
RESOURCES.push({
  key: "faqs", label: "FAQs", singular: "question", table: "faq_items", titleField: "question", hasSlug: false, hasStatus: true,
  listColumns: [{ name: "category", label: "Category" }, { name: "sort_order", label: "Order" }],
  defaultSort: { col: "sort_order", asc: true },
  defaults: { status: "draft", category: "general", sort_order: 1000 },
  fields: [
    { name: "question", label: "Question", type: "text", required: true },
    { name: "answer", label: "Answer", type: "textarea", required: true, rows: 8, help: "Plain text. Leave a blank line between paragraphs." },
    { name: "category", label: "Category", type: "select", required: true, options: FAQ_CATEGORIES.map((c) => ({ value: c.id, label: c.title })) },
    { name: "sort_order", label: "Order on the page", type: "number", required: true, help: "Lower numbers appear first. Tip: use 10, 20, 30... so you can slot a new question in between." },
    { name: "link_label", label: "Link text (optional)", type: "text", help: "For example: Browse artworks" },
    { name: "link_href", label: "Link address (optional)", type: "text", pattern: "^(\\/(?!\\/)|https:\\/\\/)", patternMessage: "The link address must start with / (a page on this site, like /contact) or https://", help: "A page on this site such as /contact or /artworks, or a full https:// address." },
    STATUS,
  ],
});

export const getResource = (key: string) => RESOURCES.find((r) => r.key === key);
