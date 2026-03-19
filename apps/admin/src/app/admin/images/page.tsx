import { requireModule } from "@/lib/guards";
import { listSiteImages } from "@/lib/queries/images";
import { ImagesView } from "@/components/admin/images";
import { normalizeCarouselItems, normalizeMediaUrl } from "@/lib/media-url";

/** Site Images admin page (Server Component) */
export default async function ImagesPage() {
  await requireModule("images");
  const rawImages = await listSiteImages();
  const images = rawImages.map((img) => ({
    ...img,
    url: normalizeMediaUrl(img.url),
    carouselItems: normalizeCarouselItems(img.carouselItems),
  }));
  return <ImagesView images={images} />;
}
