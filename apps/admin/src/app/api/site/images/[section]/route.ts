import { NextResponse } from "next/server";
import { getSiteImagesBySection } from "@/lib/queries/images";
import { normalizeCarouselItems, normalizeMediaUrl } from "@/lib/media-url";

/**
 * GET /api/site/images/[section] — images for a section. No auth.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ section: string }> },
) {
  const { section } = await params;
  try {
    const rows = await getSiteImagesBySection(section);
    const normalized = rows.map((row) => ({
      ...row,
      url: normalizeMediaUrl(row.url, "/api/site/storage"),
      carouselItems: normalizeCarouselItems(row.carouselItems, "/api/site/storage"),
    }));
    return NextResponse.json({ data: normalized, error: null });
  } catch (err) {
    console.error("[site/images/[section] GET]", err);
    return NextResponse.json({ data: null, error: "Something went wrong" }, { status: 500 });
  }
}
