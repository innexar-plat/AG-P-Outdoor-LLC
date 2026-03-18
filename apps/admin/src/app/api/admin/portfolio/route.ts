import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listPortfolioItems, createPortfolioItem } from "@/lib/queries/portfolio";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(2000).optional().nullable(),
  category: z.enum(["residential", "commercial", "sports"]).optional().nullable(),
  imageUrl: z.string().url(),
  beforeImageUrl: z.string().url().optional().nullable(),
  sortOrder: z.number().int().optional(),
  visible: z.boolean().optional(),
});

/**
 * GET /api/admin/portfolio — list all portfolio items
 */
export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const rows = await listPortfolioItems();
    return NextResponse.json({ data: rows, error: null });
  } catch (err) {
    console.error("[admin/portfolio GET]", err);
    return NextResponse.json({ data: null, error: "Something went wrong" }, { status: 500 });
  }
}

/**
 * POST /api/admin/portfolio — create a portfolio item
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
    return NextResponse.json({ data: null, error: parsed.error.errors.map((e) => e.message).join("; ") }, { status: 400 });
  }
  try {
    const row = await createPortfolioItem(parsed.data);
    return NextResponse.json({ data: row, error: null }, { status: 201 });
  } catch (err) {
    console.error("[admin/portfolio POST]", err);
    return NextResponse.json({ data: null, error: "Something went wrong" }, { status: 500 });
  }
}
