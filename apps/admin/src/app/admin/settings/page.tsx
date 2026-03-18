import { requireModule } from "@/lib/guards";
import { getAllSettings } from "@/lib/queries/settings";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function SettingsPage() {
  await requireModule("settings");
  const settings = await getAllSettings();
  return <SettingsForm initial={settings} />;
}
