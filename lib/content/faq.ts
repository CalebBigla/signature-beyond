// Built-in FAQ wording. It is shown only if no FAQ question is published in the database (Admin > FAQs).
// Normal edits are made in the admin area, not here. Draft answers only: nothing here promises a service the gallery has not confirmed.
export interface FaqItem { q: string; a: string; link?: { href: string; label: string } }
export interface FaqCategory { id: string; title: string; items: FaqItem[] }

export const FAQ: FaqCategory[] = [
  {
    id: "general", title: "General Information",
    items: [
      { q: "What is Signature Beyond?", a: "Signature Beyond is an art gallery dedicated to presenting and celebrating artistic creativity, with a focus on African art and contemporary artistic expression. Visitors can explore the gallery's artworks, exhibitions, auctions and published content through this website." },
      { q: "What can I explore on the Signature Beyond website?", a: "You can explore artwork listings, auction information, exhibitions, gallery information and journal content. The website also provides contact options for enquiries." },
      { q: "Where is Signature Beyond located?", a: "Please refer to the Contact page for the gallery's current contact and location information. To confirm visiting arrangements, contact the gallery directly.", link: { href: "/contact", label: "Go to the Contact page" } },
      { q: "Can I visit the gallery in person?", a: "Please contact the gallery to confirm visiting arrangements, opening hours and whether an appointment is required." },
    ],
  },
  {
    id: "artworks", title: "Artworks",
    items: [
      { q: "How can I explore the artworks?", a: "Visit the Artworks page to browse the gallery's published collection. Select an individual artwork to view the information available for that piece.", link: { href: "/artworks", label: "Browse artworks" } },
      { q: "How can I enquire about an artwork?", a: "Where the gallery has set it up, each artwork page has an Enquire on WhatsApp button that includes the artwork's title. You can also use the contact options on the Contact page, and include the artwork's title or the link to its page so the gallery can identify the piece.", link: { href: "/contact", label: "Contact the gallery" } },
      { q: "How can I find out whether an artwork is available?", a: "Check the availability information displayed on the artwork's page. If it is missing or unclear, contact the gallery for confirmation." },
      { q: "What does \"Price on Request\" mean?", a: "It means the price is not publicly displayed on the website. Contact the gallery to enquire about the price and any other relevant details." },
      { q: "Can I request more information about an artwork?", a: "Yes. You can contact the gallery with the artwork's title and your questions. The gallery can advise you about the information it has available." },
      { q: "Can I obtain information about an artwork's artist, materials or dimensions?", a: "Where this information is available, it may be included on the artwork's page. For additional details, contact the gallery and specify the artwork you are interested in." },
      { q: "Does the gallery provide information about provenance or authenticity?", a: "The information available may differ from one artwork to another. Contact the gallery about any available documentation for the specific artwork. Please do not assume that every artwork has identical documentation." },
    ],
  },
  {
    id: "auctions", title: "Auctions",
    items: [
      { q: "How can I find information about upcoming auctions?", a: "Visit the Auctions page to explore the auction information published by the gallery. Follow any available links or instructions for the relevant auction.", link: { href: "/auctions", label: "View auctions" } },
      { q: "How can I participate in an auction?", a: "Participation requirements depend on the specific auction. Review the applicable auction information and terms, or contact the gallery for guidance before participating.", link: { href: "/auction-terms", label: "Read the auction terms" } },
      { q: "Do I need to register before participating in an auction?", a: "Registration requirements may depend on the auction and its participation process. Check the instructions for the relevant auction or contact the gallery." },
      { q: "What happens after an auction ends?", a: "The next steps depend on the applicable auction terms and the outcome of the auction. Contact the gallery or consult the published terms for information about payment, collection and delivery." },
      { q: "Are there additional fees associated with purchasing an auction item?", a: "Any applicable buyer's premiums, taxes, delivery charges or other fees should be stated in the terms for the relevant auction. Review those terms before participating, or contact the gallery if anything is unclear." },
    ],
  },
  {
    id: "exhibitions", title: "Exhibitions",
    items: [
      { q: "How can I find current and upcoming exhibitions?", a: "Visit the Exhibitions page to explore the exhibitions listed on the website. Check the available dates and details for each exhibition.", link: { href: "/exhibitions", label: "View exhibitions" } },
      { q: "Can I view past exhibitions?", a: "The Exhibitions page may include information about previous exhibitions. Browse the available listings to explore the gallery's exhibition history." },
      { q: "How can I obtain more information about an exhibition?", a: "Use the information published on the exhibition's page, or contact the gallery with the exhibition's title and your enquiry." },
      { q: "Can artists submit their work for exhibition?", a: "Please contact the gallery to ask about its current artist-submission process and any requirements that apply." },
    ],
  },
  {
    id: "contact", title: "Enquiries and Contact",
    items: [
      { q: "How can I contact Signature Beyond?", a: "Use the Contact page to see the gallery's available contact options, including its email address and WhatsApp link where they have been added.", link: { href: "/contact", label: "Go to the Contact page" } },
      { q: "How long does it take to receive a response?", a: "Response times may vary depending on the nature and volume of enquiries. The gallery will respond when it is able to do so." },
      { q: "Can I contact the gallery through WhatsApp?", a: "If the WhatsApp option is shown on the website, you can use it to send an enquiry to the gallery." },
      { q: "What should I include when making an enquiry?", a: "Include your name, a suitable way to contact you and a clear description of your question. If your enquiry concerns a specific artwork, auction or exhibition, include its title or page link." },
    ],
  },
];

/** The fixed list of FAQ categories, in display order. Used by the admin dropdown and the public page. */
export const FAQ_CATEGORIES: { id: string; title: string }[] = FAQ.map(({ id, title }) => ({ id, title }));
