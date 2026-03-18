import { requireModule } from "@/lib/guards";
import { listSiteImages } from "@/lib/queries/images";
import { ImagesView } from "@/components/admin/images";

/** Site Images admin page (Server Component) */
export default async function ImagesPage() {
  await requireModule("images");
  const images = await listSiteImages();
  return <ImagesView images={images} />;
}
