import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getBlogPostById,
  updateBlogPost,
  deleteBlogPost,
} from "@/lib/queries/blog";
import { z } from "zod";
import { normalizeMediaUrl } from "@/lib/media-url";

const mediaUrlSchema = z
  .string()
  .min(1)
  .refine((value) => value.startsWith("/") || /^https?:\/\//i.test(value), "Invalid media URL");

const updateSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  slug: z.string().min(1).max(200).optional(),
  content: z.string().optional(),
  coverImage: mediaUrlSchema.optional().nullable(),
  metaTitle: z.string().max(200).optional().nullable(),
  metaDescription: z.string().max(500).optional().nullable(),
  status: z.enum(["draft", "published"]).optional(),
});

/**
 * GET /api/admin/blog/[id]
 * Gets a single blog post. Protected.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: _request.headers });
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }
  const id = Number((await params).id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ data: null, error: "Invalid id" }, { status: 400 });
  }
  try {
    const row = await getBlogPostById(id);
    if (!row) {
      return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
    }
    const normalized = {
      ...row,
      coverImage: row.coverImage ? normalizeMediaUrl(row.coverImage) : null,
    };
    return NextResponse.json({ data: normalized, error: null });
  } catch (err) {
    console.error("[admin/blog/[id] GET]", err);
    return NextResponse.json({ data: null, error: "Something went wrong" }, { status: 500 });
  }
}

/**
 * PUT /api/admin/blog/[id]
 * Updates a blog post. Protected.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }
  const id = Number((await params).id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ data: null, error: "Invalid id" }, { status: 400 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ data: null, error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => e.message).join("; ") || "Validation failed";
    return NextResponse.json({ data: null, error: msg }, { status: 400 });
  }
  try {
    const existing = await getBlogPostById(id);
    if (!existing) {
      return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
    }
    const payload = {
      ...parsed.data,
      ...(parsed.data.coverImage !== undefined
        ? { coverImage: parsed.data.coverImage ? normalizeMediaUrl(parsed.data.coverImage) : null }
        : {}),
    };
    const row = await updateBlogPost(id, payload);
    const data = row ?? existing;
    const normalized = {
      ...data,
      coverImage: data.coverImage ? normalizeMediaUrl(data.coverImage) : null,
    };
    return NextResponse.json({ data: normalized, error: null });
  } catch (err) {
    console.error("[admin/blog/[id] PUT]", err);
    return NextResponse.json({ data: null, error: "Something went wrong" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/blog/[id]
 * Deletes a blog post. Protected.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }
  const id = Number((await params).id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ data: null, error: "Invalid id" }, { status: 400 });
  }
  try {
    const existing = await getBlogPostById(id);
    if (!existing) {
      return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
    }
    await deleteBlogPost(id);
    return NextResponse.json({ data: { ok: true }, error: null });
  } catch (err) {
    console.error("[admin/blog/[id] DELETE]", err);
    return NextResponse.json({ data: null, error: "Something went wrong" }, { status: 500 });
  }
}
