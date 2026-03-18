import { NextResponse } from "next/server";
import { listVisiblePortfolioItems } from "@/lib/queries/portfolio";

/**
 * GET /api/site/portfolio — visible portfolio items sorted. No auth.
 */
export async function GET() {
  try {
    const rows = await listVisiblePortfolioItems();
    return NextResponse.json(
      { data: rows, error: null },
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
