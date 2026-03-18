import { requireModule } from "@/lib/guards";
import { listPageSeo } from "@/lib/queries/seo";
import { SeoView } from "@/components/admin/SeoView";

/** SEO admin page (Server Component) */
export default async function SeoPage() {
  await requireModule("seo");
  const pages = await listPageSeo();
  return <SeoView pages={pages} />;
}
