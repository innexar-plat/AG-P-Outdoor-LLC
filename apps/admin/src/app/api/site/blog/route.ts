import { NextResponse } from "next/server";
import { listBlogPosts } from "@/lib/queries/blog";
import { normalizeMediaUrl } from "@/lib/media-url";

export const dynamic = "force-dynamic";

/**
 * GET /api/site/blog — published blog posts with pagination. No auth.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 100);
    const offset = Number(searchParams.get("offset")) || 0;
    const rows = await listBlogPosts({ status: "published", limit, offset });
    const normalized = rows.map((row) => ({
      ...row,
      coverImage: row.coverImage ? normalizeMediaUrl(row.coverImage, "/admin/api/site/storage") : null,
    }));
    return NextResponse.json({ data: normalized, error: null });
  } catch (err) {
    console.error("[site/blog GET]", err);
    return NextResponse.json({ data: null, error: "Something went wrong" }, { status: 500 });
  }
}
