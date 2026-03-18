import { NextResponse } from "next/server";
import { getPageSeo } from "@/lib/queries/seo";

/**
 * GET /api/site/seo/[page] — SEO data per page. No auth.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ page: string }> },
) {
  const { page } = await params;
  try {
    const row = await getPageSeo(page);
    if (!row) {
      return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ data: row, error: null });
  } catch (err) {
    console.error("[site/seo/[page] GET]", err);
    return NextResponse.json({ data: null, error: "Something went wrong" }, { status: 500 });
  }
}
