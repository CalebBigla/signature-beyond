// Turns the plain text typed in Admin > Legal pages into sections for the page.
// Rules (kept deliberately tiny so nobody needs to learn HTML):
//   "## Heading"   starts a new numbered section
//   blank line     starts a new paragraph
//   {{contact}}    on its own line inserts the gallery's contact details
// Raw HTML is never interpreted: everything is shown as plain text.

export type LegalBlock = { type: "p"; text: string } | { type: "contact" };
export interface LegalSectionData { heading: string | null; blocks: LegalBlock[] }

export function parseLegalContent(text: string): LegalSectionData[] {
  const sections: LegalSectionData[] = [];
  let current: LegalSectionData = { heading: null, blocks: [] };
  let para: string[] = [];

  const flushPara = () => {
    if (para.length) current.blocks.push({ type: "p", text: para.join("\n") });
    para = [];
  };
  const closeSection = () => {
    flushPara();
    if (current.heading !== null || current.blocks.length) sections.push(current);
  };

  for (const raw of text.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trimEnd();
    if (line.startsWith("## ")) {
      closeSection();
      current = { heading: line.slice(3).trim(), blocks: [] };
    } else if (line.trim() === "{{contact}}") {
      flushPara();
      current.blocks.push({ type: "contact" });
    } else if (line.trim() === "") {
      flushPara();
    } else {
      para.push(line.trim());
    }
  }
  closeSection();
  return sections;
}
