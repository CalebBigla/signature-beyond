import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Privacy Policy", description: "How Signature Beyond handles personal information on this website." };

// The wording is edited in Admin > Legal pages.
export default function PrivacyPolicyPage() {
  return <LegalPage pageKey="privacy-policy" />;
}
