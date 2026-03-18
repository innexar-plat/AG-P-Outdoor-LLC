import { requireModule } from "@/lib/guards";
import { getAllSettings } from "@/lib/queries/settings";
import { PixelsForm } from "@/components/admin/PixelsForm";

export default async function PixelsPage() {
  await requireModule("pixels");
  const settings = await getAllSettings();
  return <PixelsForm initial={settings} />;
}
