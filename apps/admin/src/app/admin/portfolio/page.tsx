import { requireModule } from "@/lib/guards";
import { listPortfolioItems } from "@/lib/queries/portfolio";
import { PortfolioView } from "@/components/admin/portfolio";
import { normalizeMediaUrl } from "@/lib/media-url";

/** Portfolio admin page (Server Component) */
export default async function PortfolioPage() {
  await requireModule("portfolio");
  const rawItems = await listPortfolioItems();
  const items = rawItems.map((item) => ({
    ...item,
    imageUrl: normalizeMediaUrl(item.imageUrl),
    beforeImageUrl: item.beforeImageUrl ? normalizeMediaUrl(item.beforeImageUrl) : null,
  }));
  return <PortfolioView items={items} />;
}
