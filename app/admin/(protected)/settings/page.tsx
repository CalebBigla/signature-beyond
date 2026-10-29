import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { getSettings } from "@/lib/services";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { PageHeader } from "@/components/admin/ui";

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await getSettings();
  return (
    <>
      <PageHeader
        title="Website settings"
        description={<>Details used across the whole website. The homepage hero has its own editor under <Link href="/admin/homepage" className="underline">Homepage</Link>.</>}
        crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Website settings" }]}
      />
      <SettingsForm s={settings} />
    </>
  );
}
