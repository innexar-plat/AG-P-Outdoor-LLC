import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getPortfolioItemById,
  updatePortfolioItem,
  deletePortfolioItem,
} from "@/lib/queries/portfolio";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(2000).optional().nullable(),
  category: z.enum(["residential", "commercial", "sports"]).optional().nullable(),
  imageUrl: z.string().url().optional(),
  beforeImageUrl: z.string().url().optional().nullable(),
  sortOrder: z.number().int().optional(),
  visible: z.boolean().optional(),
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
    const row = await updatePortfolioItem(id, parsed.data);
    return NextResponse.json({ data: row ?? existing, error: null });
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
