import { NextResponse } from "next/server";
import { getBlogPostBySlug } from "@/lib/queries/blog";

/**
 * GET /api/site/blog/[slug] — single published post by slug. No auth.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  try {
    const row = await getBlogPostBySlug(slug);
    if (!row) {
      return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ data: row, error: null });
  } catch (err) {
    console.error("[site/blog/[slug] GET]", err);
    return NextResponse.json({ data: null, error: "Something went wrong" }, { status: 500 });
  }
}
