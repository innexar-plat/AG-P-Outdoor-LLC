import { NextResponse } from "next/server";
import { listApprovedTestimonials } from "@/lib/queries/testimonials";

/**
 * GET /api/site/testimonials — approved testimonials sorted. No auth.
 */
export async function GET() {
  try {
    const rows = await listApprovedTestimonials();
    return NextResponse.json({ data: rows, error: null });
  } catch (err) {
    console.error("[site/testimonials GET]", err);
    return NextResponse.json({ data: null, error: "Something went wrong" }, { status: 500 });
  }
}
