import { requireModule } from "@/lib/guards";
import { listPortfolioItems } from "@/lib/queries/portfolio";
import { PortfolioView } from "@/components/admin/portfolio";

/** Portfolio admin page (Server Component) */
export default async function PortfolioPage() {
  await requireModule("portfolio");
  const items = await listPortfolioItems();
  return <PortfolioView items={items} />;
}
