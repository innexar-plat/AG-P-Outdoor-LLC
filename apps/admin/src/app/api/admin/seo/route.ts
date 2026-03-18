import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listPageSeo, upsertPageSeo } from "@/lib/queries/seo";
import { z } from "zod";

const upsertSchema = z.object({
  pageKey: z.string().min(1),
  titleTag: z.string().max(200).optional().nullable(),
  metaDescription: z.string().max(500).optional().nullable(),
  ogImage: z
    .preprocess((v) => (v === "" || v === undefined ? null : v), z.string().url().nullable().optional()),
});

/**
 * GET /api/admin/seo — list all page SEO records
 */
export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const rows = await listPageSeo();
    return NextResponse.json({ data: rows, error: null });
  } catch (err) {
    console.error("[admin/seo GET]", err);
    return NextResponse.json({ data: null, error: "Something went wrong" }, { status: 500 });
  }
}

/**
 * PUT /api/admin/seo — upsert SEO data for a page
 */
export async function PUT(request: Request) {
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
  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.errors.map((e) => e.message).join("; ") }, { status: 400 });
  }
  try {
    const row = await upsertPageSeo(parsed.data);
    return NextResponse.json({ data: row, error: null });
  } catch (err) {
    console.error("[admin/seo PUT]", err);
    return NextResponse.json({ data: null, error: "Something went wrong" }, { status: 500 });
  }
}
