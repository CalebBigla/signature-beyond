import { requireAdmin } from "@/lib/admin/auth";
import { getSettings } from "@/lib/services";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await getSettings();
  return (
    <>
      <h1 className="mb-2 font-serif text-3xl">Website settings</h1>
      <p className="mb-8 text-sm text-stone-600">These details are used across the whole website, including the WhatsApp buttons and the footer.</p>
      <SettingsForm s={settings} />
    </>
  );
}
