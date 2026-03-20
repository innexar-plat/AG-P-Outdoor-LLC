import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  portfolioCategories,
  portfolioItemCategories,
  portfolioItemTags,
  portfolioTags,
} from "@/lib/schema";

export type PortfolioCategory = typeof portfolioCategories.$inferSelect;
export type PortfolioTag = typeof portfolioTags.$inferSelect;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function listPortfolioCategories(activeOnly = false) {
  const where = activeOnly ? eq(portfolioCategories.active, true) : undefined;
  return db
    .select()
    .from(portfolioCategories)
    .where(where)
    .orderBy(asc(portfolioCategories.sortOrder), asc(portfolioCategories.name));
}

export async function createPortfolioCategory(input: {
  name: string;
  slug?: string;
  sortOrder?: number;
  active?: boolean;
}) {
  const now = new Date();
  const [row] = await db
    .insert(portfolioCategories)
    .values({
      name: input.name,
      slug: input.slug && input.slug.trim() ? slugify(input.slug) : slugify(input.name),
      sortOrder: input.sortOrder ?? 0,
      active: input.active ?? true,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return row ?? null;
}

export async function updatePortfolioCategory(
  id: number,
  input: Partial<{ name: string; slug: string; sortOrder: number; active: boolean }>,
) {
  const set: Record<string, unknown> = { updatedAt: new Date() };
  if (input.name !== undefined) set.name = input.name;
  if (input.slug !== undefined) set.slug = slugify(input.slug);
  if (input.sortOrder !== undefined) set.sortOrder = input.sortOrder;
  if (input.active !== undefined) set.active = input.active;

  const [row] = await db
    .update(portfolioCategories)
    .set(set)
    .where(eq(portfolioCategories.id, id))
    .returning();
  return row ?? null;
}

export async function deletePortfolioCategory(id: number) {
  await db.delete(portfolioCategories).where(eq(portfolioCategories.id, id));
}

export async function listPortfolioTags() {
  return db.select().from(portfolioTags).orderBy(asc(portfolioTags.name));
}

export async function createPortfolioTag(input: { name: string; slug?: string }) {
  const now = new Date();
  const [row] = await db
    .insert(portfolioTags)
    .values({
      name: input.name,
      slug: input.slug && input.slug.trim() ? slugify(input.slug) : slugify(input.name),
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return row ?? null;
}

export async function updatePortfolioTag(id: number, input: Partial<{ name: string; slug: string }>) {
  const set: Record<string, unknown> = { updatedAt: new Date() };
  if (input.name !== undefined) set.name = input.name;
  if (input.slug !== undefined) set.slug = slugify(input.slug);

  const [row] = await db
    .update(portfolioTags)
    .set(set)
    .where(eq(portfolioTags.id, id))
    .returning();
  return row ?? null;
}

export async function deletePortfolioTag(id: number) {
  await db.delete(portfolioTags).where(eq(portfolioTags.id, id));
}

export async function ensurePortfolioCategoryBySlug(slugOrName: string) {
  const slug = slugify(slugOrName);
  const [existing] = await db
    .select()
    .from(portfolioCategories)
    .where(eq(portfolioCategories.slug, slug))
    .limit(1);

  if (existing) return existing;

  const now = new Date();
  const [created] = await db
    .insert(portfolioCategories)
    .values({
      name: slugOrName,
      slug,
      sortOrder: 999,
      active: true,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return created;
}

export async function syncPortfolioItemCategories(itemId: number, categoryIds: number[]) {
  await db.delete(portfolioItemCategories).where(eq(portfolioItemCategories.itemId, itemId));
  if (!categoryIds.length) return;

  const now = new Date();
  await db.insert(portfolioItemCategories).values(
    categoryIds.map((categoryId) => ({
      itemId,
      categoryId,
      createdAt: now,
    })),
  );
}

export async function syncPortfolioItemTags(itemId: number, tagIds: number[]) {
  await db.delete(portfolioItemTags).where(eq(portfolioItemTags.itemId, itemId));
  if (!tagIds.length) return;

  const now = new Date();
  await db.insert(portfolioItemTags).values(
    tagIds.map((tagId) => ({
      itemId,
      tagId,
      createdAt: now,
    })),
  );
}

export async function getPortfolioItemTaxonomyMaps(itemIds: number[]) {
  if (!itemIds.length) {
    return {
      categoriesByItemId: new Map<number, PortfolioCategory[]>(),
      tagsByItemId: new Map<number, PortfolioTag[]>(),
    };
  }

  const categoryRows = await db
    .select({ itemId: portfolioItemCategories.itemId, category: portfolioCategories })
    .from(portfolioItemCategories)
    .innerJoin(portfolioCategories, eq(portfolioCategories.id, portfolioItemCategories.categoryId))
    .where(inArray(portfolioItemCategories.itemId, itemIds))
    .orderBy(asc(portfolioCategories.sortOrder), asc(portfolioCategories.name));

  const tagRows = await db
    .select({ itemId: portfolioItemTags.itemId, tag: portfolioTags })
    .from(portfolioItemTags)
    .innerJoin(portfolioTags, eq(portfolioTags.id, portfolioItemTags.tagId))
    .where(inArray(portfolioItemTags.itemId, itemIds))
    .orderBy(asc(portfolioTags.name));

  const categoriesByItemId = new Map<number, PortfolioCategory[]>();
  const tagsByItemId = new Map<number, PortfolioTag[]>();

  for (const row of categoryRows) {
    const arr = categoriesByItemId.get(row.itemId) ?? [];
    arr.push(row.category);
    categoriesByItemId.set(row.itemId, arr);
  }

  for (const row of tagRows) {
    const arr = tagsByItemId.get(row.itemId) ?? [];
    arr.push(row.tag);
    tagsByItemId.set(row.itemId, arr);
  }

  return { categoriesByItemId, tagsByItemId };
}
