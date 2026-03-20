import { eq, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { portfolioItems } from "@/lib/schema";
import {
  ensurePortfolioCategoryBySlug,
  getPortfolioItemTaxonomyMaps,
  syncPortfolioItemCategories,
  syncPortfolioItemTags,
} from "@/lib/queries/portfolio-taxonomy";

type PortfolioBase = typeof portfolioItems.$inferSelect;

export type PortfolioItemWithTaxonomy = PortfolioBase & {
  categories: Array<{ id: number; name: string; slug: string }>;
  tags: Array<{ id: number; name: string; slug: string }>;
};

function toLegacyCategory(value: string | null | undefined): "residential" | "commercial" | "sports" | null {
  if (value === "residential" || value === "commercial" || value === "sports") return value;
  return null;
}

async function withTaxonomy(rows: PortfolioBase[]): Promise<PortfolioItemWithTaxonomy[]> {
  const itemIds = rows.map((r) => r.id);
  const { categoriesByItemId, tagsByItemId } = await getPortfolioItemTaxonomyMaps(itemIds);

  return rows.map((row) => {
    const categories = categoriesByItemId.get(row.id) ?? [];
    const tags = tagsByItemId.get(row.id) ?? [];
    return {
      ...row,
      categories: categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
      tags: tags.map((t) => ({ id: t.id, name: t.name, slug: t.slug })),
    };
  });
}

/** Lists all portfolio items sorted by sort_order */
export async function listPortfolioItems() {
  const rows = await db.select().from(portfolioItems).orderBy(asc(portfolioItems.sortOrder), asc(portfolioItems.id));
  return withTaxonomy(rows);
}

/** Lists only visible portfolio items */
export async function listVisiblePortfolioItems() {
  const rows = await db
    .select()
    .from(portfolioItems)
    .where(eq(portfolioItems.visible, true))
    .orderBy(asc(portfolioItems.sortOrder), asc(portfolioItems.id));
  return withTaxonomy(rows);
}

/** Gets a single portfolio item by id */
export async function getPortfolioItemById(id: number) {
  const [row] = await db.select().from(portfolioItems).where(eq(portfolioItems.id, id)).limit(1);
  if (!row) return null;
  const [enriched] = await withTaxonomy([row]);
  return enriched ?? null;
}

/** Creates a portfolio item */
export async function createPortfolioItem(data: {
  title: string;
  description?: string | null;
  category?: string | null;
  imageUrl: string;
  beforeImageUrl?: string | null;
  sortOrder?: number;
  visible?: boolean;
  categoryIds?: number[];
  tagIds?: number[];
}) {
  const [row] = await db
    .insert(portfolioItems)
    .values({
      title: data.title,
      description: data.description ?? null,
      category: toLegacyCategory(data.category),
      imageUrl: data.imageUrl,
      beforeImageUrl: data.beforeImageUrl ?? null,
      sortOrder: data.sortOrder ?? 0,
      visible: data.visible ?? true,
      createdAt: new Date(),
    })
    .returning();
  if (!row) return null;

  let categoryIds = data.categoryIds ?? [];
  if (!categoryIds.length && data.category) {
    const category = await ensurePortfolioCategoryBySlug(data.category);
    if (category?.id) categoryIds = [category.id];
  }

  await syncPortfolioItemCategories(row.id, categoryIds);
  await syncPortfolioItemTags(row.id, data.tagIds ?? []);

  return getPortfolioItemById(row.id);
}

/** Updates a portfolio item */
export async function updatePortfolioItem(
  id: number,
  data: Partial<{
    title: string;
    description: string | null;
    category: string | null;
    imageUrl: string;
    beforeImageUrl: string | null;
    sortOrder: number;
    visible: boolean;
    categoryIds: number[];
    tagIds: number[];
  }>
) {
  const set: Record<string, unknown> = {};
  if (data.title !== undefined) set.title = data.title;
  if (data.description !== undefined) set.description = data.description;
  if (data.category !== undefined) set.category = toLegacyCategory(data.category);
  if (data.imageUrl !== undefined) set.imageUrl = data.imageUrl;
  if (data.beforeImageUrl !== undefined) set.beforeImageUrl = data.beforeImageUrl;
  if (data.sortOrder !== undefined) set.sortOrder = data.sortOrder;
  if (data.visible !== undefined) set.visible = data.visible;

  const [row] = await db
    .update(portfolioItems)
    .set(set)
    .where(eq(portfolioItems.id, id))
    .returning();

  if (!row) return null;

  if (data.categoryIds !== undefined) {
    await syncPortfolioItemCategories(id, data.categoryIds);
  } else if (data.category !== undefined) {
    if (data.category) {
      const category = await ensurePortfolioCategoryBySlug(data.category);
      await syncPortfolioItemCategories(id, category?.id ? [category.id] : []);
    } else {
      await syncPortfolioItemCategories(id, []);
    }
  }

  if (data.tagIds !== undefined) {
    await syncPortfolioItemTags(id, data.tagIds);
  }

  return getPortfolioItemById(id);
}

/** Deletes a portfolio item */
export async function deletePortfolioItem(id: number) {
  await db.delete(portfolioItems).where(eq(portfolioItems.id, id));
}
