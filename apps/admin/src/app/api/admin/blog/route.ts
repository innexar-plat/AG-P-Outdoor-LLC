import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listBlogPosts, createBlogPost } from "@/lib/queries/blog";
import { z } from "zod";
import { normalizeMediaUrl } from "@/lib/media-url";

const mediaUrlSchema = z
  .string()
  .min(1)
  .refine((value) => value.startsWith("/") || /^https?:\/\//i.test(value), "Invalid media URL");

const createSchema = z.object({
  title: z.string().min(1).max(500),
  slug: z.string().min(1).max(200),
  content: z.string(),
  coverImage: mediaUrlSchema.optional().nullable(),
  metaTitle: z.string().max(200).optional().nullable(),
  metaDescription: z.string().max(500).optional().nullable(),
  status: z.enum(["draft", "published"]),
});

/**
 * GET /api/admin/blog
 * Lists all blog posts including drafts. Protected.
 */
export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as "draft" | "published" | null;
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 100);
    const offset = Number(searchParams.get("offset")) || 0;
    const rows = await listBlogPosts({
      status: status ?? undefined,
      limit,
      offset,
    });
    const normalized = rows.map((row) => ({
      ...row,
      coverImage: row.coverImage ? normalizeMediaUrl(row.coverImage) : null,
    }));
    return NextResponse.json({ data: normalized, error: null });
  } catch (err) {
    console.error("[admin/blog GET]", err);
    return NextResponse.json({ data: null, error: "Something went wrong" }, { status: 500 });
  }
}

/**
 * POST /api/admin/blog
 * Creates a new blog post. Protected.
 */
export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ data: null, error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => e.message).join("; ") || "Validation failed";
    return NextResponse.json({ data: null, error: msg }, { status: 400 });
  }
  const { title, slug, content, coverImage, metaTitle, metaDescription, status } = parsed.data;
  try {
    const row = await createBlogPost({
      title,
      slug,
      content,
      coverImage: coverImage ? normalizeMediaUrl(coverImage) : null,
      metaTitle: metaTitle ?? null,
      metaDescription: metaDescription ?? null,
      status,
    });
    const normalized = row
      ? { ...row, coverImage: row.coverImage ? normalizeMediaUrl(row.coverImage) : null }
      : row;
    return NextResponse.json({ data: normalized, error: null }, { status: 201 });
  } catch (err) {
    console.error("[admin/blog POST]", err);
    return NextResponse.json({ data: null, error: "Something went wrong" }, { status: 500 });
  }
}
