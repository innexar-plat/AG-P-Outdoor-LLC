import { NextResponse } from "next/server";
import { listActiveBanners } from "@/lib/queries/banners";

/**
 * GET /api/site/banners/[placement] — list active banners for a placement
 * Public route (no auth required)
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ placement: string }> },
) {
  const placement = (await params).placement;
  const valid = ["dashboard", "site_header", "site_footer", "site_popup"];
  if (!valid.includes(placement)) {
    return NextResponse.json({ data: [], error: null });
  }
  try {
    const rows = await listActiveBanners(placement);
    return NextResponse.json({ data: rows, error: null });
  } catch (err) {
    console.error("[site/banners GET]", err);
    return NextResponse.json({ data: [], error: "Something went wrong" }, { status: 500 });
  }
}
