import { eq, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { portfolioItems } from "@/lib/schema";

/** Lists all portfolio items sorted by sort_order */
export async function listPortfolioItems() {
  return db.select().from(portfolioItems).orderBy(asc(portfolioItems.sortOrder), asc(portfolioItems.id));
}

/** Lists only visible portfolio items */
export async function listVisiblePortfolioItems() {
  return db
    .select()
    .from(portfolioItems)
    .where(eq(portfolioItems.visible, true))
    .orderBy(asc(portfolioItems.sortOrder), asc(portfolioItems.id));
}

/** Gets a single portfolio item by id */
export async function getPortfolioItemById(id: number) {
  const [row] = await db.select().from(portfolioItems).where(eq(portfolioItems.id, id)).limit(1);
  return row ?? null;
}

/** Creates a portfolio item */
export async function createPortfolioItem(data: {
  title: string;
  description?: string | null;
  category?: "residential" | "commercial" | "sports" | null;
  imageUrl: string;
  beforeImageUrl?: string | null;
  sortOrder?: number;
  visible?: boolean;
}) {
  const [row] = await db
    .insert(portfolioItems)
    .values({
      title: data.title,
      description: data.description ?? null,
      category: data.category ?? null,
      imageUrl: data.imageUrl,
      beforeImageUrl: data.beforeImageUrl ?? null,
      sortOrder: data.sortOrder ?? 0,
      visible: data.visible ?? true,
      createdAt: new Date(),
    })
    .returning();
  return row ?? null;
}

/** Updates a portfolio item */
export async function updatePortfolioItem(
  id: number,
  data: Partial<{
    title: string;
    description: string | null;
    category: "residential" | "commercial" | "sports" | null;
    imageUrl: string;
    beforeImageUrl: string | null;
    sortOrder: number;
    visible: boolean;
  }>
) {
  const set: Record<string, unknown> = {};
  if (data.title !== undefined) set.title = data.title;
  if (data.description !== undefined) set.description = data.description;
  if (data.category !== undefined) set.category = data.category;
  if (data.imageUrl !== undefined) set.imageUrl = data.imageUrl;
  if (data.beforeImageUrl !== undefined) set.beforeImageUrl = data.beforeImageUrl;
  if (data.sortOrder !== undefined) set.sortOrder = data.sortOrder;
  if (data.visible !== undefined) set.visible = data.visible;

  const [row] = await db
    .update(portfolioItems)
    .set(set)
    .where(eq(portfolioItems.id, id))
    .returning();
  return row ?? null;
}

/** Deletes a portfolio item */
export async function deletePortfolioItem(id: number) {
  await db.delete(portfolioItems).where(eq(portfolioItems.id, id));
}
