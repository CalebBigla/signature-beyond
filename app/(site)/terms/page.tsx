import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Terms of Use", description: "The terms that apply when you use the Signature Beyond website." };

// The wording is edited in Admin > Legal pages.
export default function TermsPage() {
  return <LegalPage pageKey="terms" />;
}
