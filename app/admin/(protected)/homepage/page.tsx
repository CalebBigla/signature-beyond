import { requireAdmin } from "@/lib/admin/auth";
import { getSettings } from "@/lib/services";
import { HomepageForm } from "@/components/admin/HomepageForm";
import { PageHeader } from "@/components/admin/ui";

export default async function HomepageEditor() {
  await requireAdmin();
  const settings = await getSettings();
  return (
    <>
      <PageHeader
        title="Homepage"
        description="The split hero at the top of the homepage: a full image with your text on the left, a plain image on the right. The other homepage sections fill themselves from your artworks, auctions, exhibitions and journal."
        crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Homepage" }]}
      />
      <HomepageForm s={settings} />
    </>
  );
}
