import { eq, and, asc, lte, gte, or, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { banners } from "@/lib/schema";

/** Lists all banners sorted by sort_order */
export async function listBanners() {
  return db.select().from(banners).orderBy(asc(banners.sortOrder), asc(banners.id));
}

/** Lists active banners for a given placement, respecting date range */
export async function listActiveBanners(placement: string) {
  const now = new Date();
  const rows = await db
    .select()
    .from(banners)
    .where(
      and(
        eq(banners.active, true),
        eq(banners.placement, placement as "dashboard" | "site_header" | "site_footer" | "site_popup"),
        or(isNull(banners.startsAt), lte(banners.startsAt, now)),
        or(isNull(banners.endsAt), gte(banners.endsAt, now)),
      ),
    )
    .orderBy(asc(banners.sortOrder));
  return rows;
}

/** Gets a banner by id */
export async function getBannerById(id: number) {
  const [row] = await db.select().from(banners).where(eq(banners.id, id)).limit(1);
  return row ?? null;
}

/** Creates a banner */
export async function createBanner(data: {
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  linkText?: string | null;
  placement: "dashboard" | "site_header" | "site_footer" | "site_popup";
  bgColor?: string | null;
  textColor?: string | null;
  active?: boolean;
  sortOrder?: number;
  startsAt?: string | null;
  endsAt?: string | null;
  size?: string;
  customWidth?: number | null;
  customHeight?: number | null;
  layout?: string;
  animation?: string;
  carouselGroup?: string | null;
  carouselInterval?: number;
  borderRadius?: number;
  opacity?: number;
}) {
  const [row] = await db
    .insert(banners)
    .values({
      title: data.title,
      subtitle: data.subtitle ?? null,
      imageUrl: data.imageUrl ?? null,
      linkUrl: data.linkUrl ?? null,
      linkText: data.linkText ?? null,
      placement: data.placement,
      bgColor: data.bgColor ?? null,
      textColor: data.textColor ?? null,
      active: data.active ?? true,
      sortOrder: data.sortOrder ?? 0,
      startsAt: data.startsAt ? new Date(data.startsAt) : null,
      endsAt: data.endsAt ? new Date(data.endsAt) : null,
      createdAt: new Date(),
      size: data.size ?? "sidebar",
      customWidth: data.customWidth ?? null,
      customHeight: data.customHeight ?? null,
      layout: data.layout ?? "card",
      animation: data.animation ?? "fade",
      carouselGroup: data.carouselGroup ?? null,
      carouselInterval: data.carouselInterval ?? 5,
      borderRadius: data.borderRadius ?? 12,
      opacity: data.opacity ?? 100,
    })
    .returning();
  return row ?? null;
}

/** Updates a banner */
export async function updateBanner(
  id: number,
  data: Partial<{
    title: string;
    subtitle: string | null;
    imageUrl: string | null;
    linkUrl: string | null;
    linkText: string | null;
    placement: "dashboard" | "site_header" | "site_footer" | "site_popup";
    bgColor: string | null;
    textColor: string | null;
    active: boolean;
    sortOrder: number;
    startsAt: string | null;
    endsAt: string | null;
    size: string;
    customWidth: number | null;
    customHeight: number | null;
    layout: string;
    animation: string;
    carouselGroup: string | null;
    carouselInterval: number;
    borderRadius: number;
    opacity: number;
  }>
) {
  const set: Record<string, unknown> = {};
  const d = data;
  if (d.title !== undefined) set.title = d.title;
  if (d.subtitle !== undefined) set.subtitle = d.subtitle;
  if (d.imageUrl !== undefined) set.imageUrl = d.imageUrl;
  if (d.linkUrl !== undefined) set.linkUrl = d.linkUrl;
  if (d.linkText !== undefined) set.linkText = d.linkText;
  if (d.placement !== undefined) set.placement = d.placement;
  if (d.bgColor !== undefined) set.bgColor = d.bgColor;
  if (d.textColor !== undefined) set.textColor = d.textColor;
  if (d.active !== undefined) set.active = d.active;
  if (d.sortOrder !== undefined) set.sortOrder = d.sortOrder;
  if (d.startsAt !== undefined) set.startsAt = d.startsAt ? new Date(d.startsAt) : null;
  if (d.endsAt !== undefined) set.endsAt = d.endsAt ? new Date(d.endsAt) : null;
  if (d.size !== undefined) set.size = d.size;
  if (d.customWidth !== undefined) set.customWidth = d.customWidth;
  if (d.customHeight !== undefined) set.customHeight = d.customHeight;
  if (d.layout !== undefined) set.layout = d.layout;
  if (d.animation !== undefined) set.animation = d.animation;
  if (d.carouselGroup !== undefined) set.carouselGroup = d.carouselGroup;
  if (d.carouselInterval !== undefined) set.carouselInterval = d.carouselInterval;
  if (d.borderRadius !== undefined) set.borderRadius = d.borderRadius;
  if (d.opacity !== undefined) set.opacity = d.opacity;

  const [row] = await db.update(banners).set(set).where(eq(banners.id, id)).returning();
  return row ?? null;
}

/** Deletes a banner */
export async function deleteBanner(id: number) {
  await db.delete(banners).where(eq(banners.id, id));
}
