import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getAnalyticsSummary } from "@/lib/services/analytics";

const querySchema = z.object({
  days: z.coerce.number().int().min(1).max(90).default(30),
});

/**
 * GET /api/admin/analytics/summary
 * Returns page views, sources, devices for the last N days.
 */
export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({ days: searchParams.get("days") ?? undefined });
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: parsed.error.errors.map((e) => e.message).join("; ") },
        { status: 400 },
      );
    }
    const data = await getAnalyticsSummary(parsed.data.days);
    return NextResponse.json({ data, error: null });
  } catch (err) {
    console.error("[admin/analytics/summary GET]", err);
    return NextResponse.json({ data: null, error: "Something went wrong" }, { status: 500 });
  }
}
