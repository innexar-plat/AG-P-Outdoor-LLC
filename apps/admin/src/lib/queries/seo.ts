import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pageSeo } from "@/lib/schema";

/** Lists all page SEO records */
export async function listPageSeo() {
  return db.select().from(pageSeo).orderBy(pageSeo.pageKey);
}

/** Gets SEO data for a page */
export async function getPageSeo(pageKey: string) {
  const [row] = await db.select().from(pageSeo).where(eq(pageSeo.pageKey, pageKey)).limit(1);
  return row ?? null;
}

/** Upserts page SEO data */
export async function upsertPageSeo(data: {
  pageKey: string;
  titleTag?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
}) {
  const existing = await getPageSeo(data.pageKey);
  if (existing) {
    const [row] = await db
      .update(pageSeo)
      .set({
        titleTag: data.titleTag ?? existing.titleTag,
        metaDescription: data.metaDescription ?? existing.metaDescription,
        ogImage: data.ogImage ?? existing.ogImage,
        updatedAt: new Date(),
      })
      .where(eq(pageSeo.pageKey, data.pageKey))
      .returning();
    return row;
  }
  const [row] = await db
    .insert(pageSeo)
    .values({
      pageKey: data.pageKey,
      titleTag: data.titleTag ?? null,
      metaDescription: data.metaDescription ?? null,
      ogImage: data.ogImage ?? null,
      updatedAt: new Date(),
    })
    .returning();
  return row;
}
