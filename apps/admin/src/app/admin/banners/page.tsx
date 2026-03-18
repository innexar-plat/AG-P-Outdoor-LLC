import { requireModule } from "@/lib/guards";
import { listBanners } from "@/lib/queries/banners";
import { BannersView } from "@/components/admin/banners";

/** Banners admin page (Server Component) */
export default async function BannersPage() {
  await requireModule("banners");
  const items = await listBanners();
  return <BannersView banners={items} />;
}
