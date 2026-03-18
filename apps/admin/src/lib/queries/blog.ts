import { eq, and, desc } from "drizzle-orm";
import { db } from "../db";
import { blogPosts } from "../schema";
import type { BlogPostStatus } from "@/types";

/**
 * Lists all blog posts, optionally filtered by status.
 */
export async function listBlogPosts(opts?: {
  status?: BlogPostStatus;
  limit?: number;
  offset?: number;
}) {
  const limit = opts?.limit ?? 20;
  const offset = opts?.offset ?? 0;
  if (opts?.status) {
    return db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.status, opts.status))
      .orderBy(desc(blogPosts.createdAt))
      .limit(limit)
      .offset(offset);
  }
  return db
    .select()
    .from(blogPosts)
    .orderBy(desc(blogPosts.createdAt))
    .limit(limit)
    .offset(offset);
}

/**
 * Gets a single blog post by id.
 */
export async function getBlogPostById(id: number) {
  const rows = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
  return rows[0] ?? null;
}

/**
 * Gets a single blog post by slug (for public).
 */
export async function getBlogPostBySlug(slug: string) {
  const rows = await db
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.slug, slug), eq(blogPosts.status, "published")))
    .limit(1);
  return rows[0] ?? null;
}

/**
 * Creates a blog post.
 */
export async function createBlogPost(data: {
  title: string;
  slug: string;
  content: string;
  coverImage?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  status: "draft" | "published";
}) {
  const publishedAt = data.status === "published" ? new Date() : null;
  const [row] = await db
    .insert(blogPosts)
    .values({
      title: data.title,
      slug: data.slug,
      content: data.content,
      coverImage: data.coverImage ?? null,
      metaTitle: data.metaTitle ?? null,
      metaDescription: data.metaDescription ?? null,
      status: data.status,
      publishedAt,
      createdAt: new Date(),
    })
    .returning();
  return row ?? null;
}

/**
 * Updates a blog post.
 */
export async function updateBlogPost(
  id: number,
  data: Partial<{
    title: string;
    slug: string;
    content: string;
    coverImage: string | null;
    metaTitle: string | null;
    metaDescription: string | null;
    status: "draft" | "published";
  }>
) {
  const set: Record<string, unknown> = {};
  if (data.title !== undefined) set.title = data.title;
  if (data.slug !== undefined) set.slug = data.slug;
  if (data.content !== undefined) set.content = data.content;
  if (data.coverImage !== undefined) set.coverImage = data.coverImage;
  if (data.metaTitle !== undefined) set.metaTitle = data.metaTitle;
  if (data.metaDescription !== undefined) set.metaDescription = data.metaDescription;
  if (data.status !== undefined) set.status = data.status;
  if (data.status === "published") {
    const existing = await getBlogPostById(id);
    if (existing?.status !== "published") {
      set.publishedAt = new Date();
    }
  }
  const [row] = await db
    .update(blogPosts)
    .set(set)
    .where(eq(blogPosts.id, id))
    .returning();
  return row ?? null;
}

/**
 * Deletes a blog post.
 */
export async function deleteBlogPost(id: number) {
  await db.delete(blogPosts).where(eq(blogPosts.id, id));
}
