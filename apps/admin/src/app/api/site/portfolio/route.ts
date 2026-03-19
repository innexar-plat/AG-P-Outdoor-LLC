import { NextResponse } from "next/server";
import { listVisiblePortfolioItems } from "@/lib/queries/portfolio";
import { normalizeMediaUrl } from "@/lib/media-url";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/site/portfolio — visible portfolio items sorted. No auth.
 */
export async function GET() {
  try {
    const rows = await listVisiblePortfolioItems();
    const normalized = rows.map((row) => ({
      ...row,
      imageUrl: normalizeMediaUrl(row.imageUrl, "/api/site/storage"),
      beforeImageUrl: row.beforeImageUrl ? normalizeMediaUrl(row.beforeImageUrl, "/api/site/storage") : null,
    }));
    return NextResponse.json(
      { data: normalized, error: null },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
        },
      },
    );
  } catch (err) {
    console.error("[site/portfolio GET]", err);
    return NextResponse.json({ data: null, error: "Something went wrong" }, { status: 500 });
  }
}
