import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getPortfolioItemById,
  updatePortfolioItem,
  deletePortfolioItem,
} from "@/lib/queries/portfolio";
import { z } from "zod";
import { normalizeMediaUrl } from "@/lib/media-url";

const mediaUrlSchema = z
  .string()
  .min(1)
  .refine(
    (value) => value.startsWith("/") || /^https?:\/\//i.test(value),
    "Invalid media URL",
  );

const updateSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(2000).optional().nullable(),
  category: z.string().min(1).max(100).optional().nullable(),
  imageUrl: mediaUrlSchema.optional(),
  beforeImageUrl: mediaUrlSchema.optional().nullable(),
  sortOrder: z.number().int().optional(),
  visible: z.boolean().optional(),
  categoryIds: z.array(z.number().int().positive()).optional(),
  tagIds: z.array(z.number().int().positive()).optional(),
});

/**
 * PUT /api/admin/portfolio/[id] — update a portfolio item
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
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
    return NextResponse.json({ data: null, error: parsed.error.errors.map((e) => e.message).join("; ") }, { status: 400 });
  }
  try {
    const existing = await getPortfolioItemById(id);
    if (!existing) {
      return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
    }
    const payload = {
      ...parsed.data,
      ...(parsed.data.imageUrl !== undefined ? { imageUrl: normalizeMediaUrl(parsed.data.imageUrl) } : {}),
      ...(parsed.data.beforeImageUrl !== undefined
        ? { beforeImageUrl: parsed.data.beforeImageUrl ? normalizeMediaUrl(parsed.data.beforeImageUrl) : null }
        : {}),
    };
    const row = await updatePortfolioItem(id, payload);
    const data = row ?? existing;
    const normalized = {
      ...data,
      imageUrl: normalizeMediaUrl(data.imageUrl),
      beforeImageUrl: data.beforeImageUrl ? normalizeMediaUrl(data.beforeImageUrl) : null,
    };
    return NextResponse.json({ data: normalized, error: null });
  } catch (err) {
    console.error("[admin/portfolio/[id] PUT]", err);
    return NextResponse.json({ data: null, error: "Something went wrong" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/portfolio/[id] — delete a portfolio item
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
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
    const existing = await getPortfolioItemById(id);
    if (!existing) {
      return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
    }
    await deletePortfolioItem(id);
    return NextResponse.json({ data: { ok: true }, error: null });
  } catch (err) {
    console.error("[admin/portfolio/[id] DELETE]", err);
    return NextResponse.json({ data: null, error: "Something went wrong" }, { status: 500 });
  }
}
