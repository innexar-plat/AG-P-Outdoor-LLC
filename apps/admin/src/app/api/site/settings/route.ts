import { NextResponse } from "next/server";
import { getPublicSettings } from "@/lib/queries/settings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/site/settings
 * Returns public settings for the site (pixels, company, CTA). No auth.
 */
export async function GET() {
  try {
    const data = await getPublicSettings();
    return NextResponse.json({ data, error: null });
  } catch (err) {
    console.error("[site/settings GET]", err);
    return NextResponse.json(
      { data: null, error: "Something went wrong" },
      { status: 500 }
    );
  }
}
