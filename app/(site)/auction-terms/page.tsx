import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Auction Terms and Conditions", description: "How auctions listed on the Signature Beyond website work." };

// The wording is edited in Admin > Legal pages.
export default function AuctionTermsPage() {
  return <LegalPage pageKey="auction-terms" />;
}
