import { NextResponse } from "next/server";
import { listVisiblePortfolioItems } from "@/lib/queries/portfolio";
import { normalizeMediaUrl } from "@/lib/media-url";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/site/portfolio — visible portfolio items sorted. No auth.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const category = (url.searchParams.get("category") ?? "").trim().toLowerCase();
    const tag = (url.searchParams.get("tag") ?? "").trim().toLowerCase();
    const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();

    const rows = await listVisiblePortfolioItems();
    const filtered = rows.filter((row) => {
      const rowCategories = row.categories ?? [];
      const rowTags = row.tags ?? [];

      if (category && !rowCategories.some((c) => c.slug.toLowerCase() === category)) {
        return false;
      }

      if (tag && !rowTags.some((t) => t.slug.toLowerCase() === tag)) {
        return false;
      }

      if (q) {
        const haystack = [
          row.title,
          row.description ?? "",
          ...rowCategories.map((c) => c.name),
          ...rowTags.map((t) => t.name),
        ]
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(q)) {
          return false;
        }
      }

      return true;
    });

    const normalized = filtered.map((row) => ({
      ...row,
      imageUrl: normalizeMediaUrl(row.imageUrl, "/admin/api/site/storage"),
      beforeImageUrl: row.beforeImageUrl ? normalizeMediaUrl(row.beforeImageUrl, "/admin/api/site/storage") : null,
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
