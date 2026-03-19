import { NextResponse } from "next/server";
import { listApprovedTestimonials } from "@/lib/queries/testimonials";
import { normalizeMediaUrl } from "@/lib/media-url";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/site/testimonials — approved testimonials sorted. No auth.
 */
export async function GET() {
  try {
    const rows = await listApprovedTestimonials();
    const normalized = rows.map((row) => ({
      ...row,
      photoUrl: row.photoUrl ? normalizeMediaUrl(row.photoUrl, "/admin/api/site/storage") : null,
      photoUrls: (row.photoUrls ?? []).map((url) => normalizeMediaUrl(url, "/admin/api/site/storage")),
    }));
    return NextResponse.json({ data: normalized, error: null });
  } catch (err) {
    console.error("[site/testimonials GET]", err);
    return NextResponse.json({ data: null, error: "Something went wrong" }, { status: 500 });
  }
}
