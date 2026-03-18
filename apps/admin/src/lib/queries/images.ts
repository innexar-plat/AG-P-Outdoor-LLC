import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { siteImages } from "@/lib/schema";

/** Lists all site images grouped by section */
export async function listSiteImages() {
  return db.select().from(siteImages).orderBy(siteImages.section, siteImages.sortOrder, siteImages.slotKey);
}

/** Gets site images by section (for public API) */
export async function getSiteImagesBySection(section: string) {
  return db
    .select()
    .from(siteImages)
    .where(eq(siteImages.section, section.toLowerCase()));
}

/** Gets a site image by slot key */
export async function getSiteImageBySlot(slotKey: string) {
  const [row] = await db.select().from(siteImages).where(eq(siteImages.slotKey, slotKey)).limit(1);
  return row ?? null;
}

/** Upserts a site image slot */
export async function upsertSiteImage(data: {
  section: string;
  slotKey: string;
  label: string;
  url: string;
  altText?: string | null;
  displayType?: string;
  sortOrder?: number;
  carouselItems?: string;
  carouselInterval?: number;
  carouselEffect?: string;
}) {
  const existing = await getSiteImageBySlot(data.slotKey);
  const carouselItems = data.carouselItems ?? existing?.carouselItems ?? null;
  const carouselInterval = data.carouselInterval ?? existing?.carouselInterval ?? 5;
  const carouselEffect = data.carouselEffect ?? existing?.carouselEffect ?? "slide";

  if (existing) {
    const [row] = await db
      .update(siteImages)
      .set({
        url: data.url,
        altText: data.altText ?? existing.altText,
        displayType: (data.displayType as "single" | "gallery" | "carousel") ?? existing.displayType,
        sortOrder: data.sortOrder ?? existing.sortOrder,
        label: data.label ?? existing.label,
        carouselItems,
        carouselInterval,
        carouselEffect,
        updatedAt: new Date(),
      })
      .where(eq(siteImages.slotKey, data.slotKey))
      .returning();
    return row;
  }
  const [row] = await db
    .insert(siteImages)
    .values({
      section: data.section,
      slotKey: data.slotKey,
      label: data.label,
      url: data.url,
      altText: data.altText ?? null,
      displayType: (data.displayType as "single" | "gallery" | "carousel") ?? "single",
      sortOrder: data.sortOrder ?? 0,
      carouselItems,
      carouselInterval,
      carouselEffect,
      updatedAt: new Date(),
    })
    .returning();
  return row;
}
