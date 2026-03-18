import { eq, desc, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { socialPosts } from "@/lib/schema";

export async function listSocialPosts() {
  return db
    .select()
    .from(socialPosts)
    .orderBy(desc(socialPosts.pinned), asc(socialPosts.sortOrder), desc(socialPosts.createdAt));
}

export async function getSocialPostById(id: number) {
  const [row] = await db.select().from(socialPosts).where(eq(socialPosts.id, id)).limit(1);
  return row ?? null;
}

/** Creates a social post */
export async function createSocialPost(data: {
  platform: string;
  postUrl: string;
  embedHtml?: string | null;
  title?: string | null;
  thumbnailUrl?: string | null;
  pinned?: boolean;
  sortOrder?: number;
}) {
  const [row] = await db
    .insert(socialPosts)
    .values({
      platform: data.platform,
      postUrl: data.postUrl,
      embedHtml: data.embedHtml ?? null,
      title: data.title ?? null,
      thumbnailUrl: data.thumbnailUrl ?? null,
      pinned: data.pinned ?? false,
      sortOrder: data.sortOrder ?? 0,
      createdAt: new Date(),
    })
    .returning();
  return row ?? null;
}

/** Updates a social post */
export async function updateSocialPost(
  id: number,
  data: Partial<{
    title: string | null;
    thumbnailUrl: string | null;
    pinned: boolean;
    sortOrder: number;
  }>
) {
  const set: Record<string, unknown> = {};
  if (data.title !== undefined) set.title = data.title;
  if (data.thumbnailUrl !== undefined) set.thumbnailUrl = data.thumbnailUrl;
  if (data.pinned !== undefined) set.pinned = data.pinned;
  if (data.sortOrder !== undefined) set.sortOrder = data.sortOrder;

  const [row] = await db.update(socialPosts).set(set).where(eq(socialPosts.id, id)).returning();
  return row ?? null;
}

/** Deletes a social post */
export async function deleteSocialPost(id: number) {
  await db.delete(socialPosts).where(eq(socialPosts.id, id));
}
