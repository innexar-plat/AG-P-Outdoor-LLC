import { NextResponse } from "next/server";
import { insertPageView } from "@/lib/queries/analytics";

/**
 * POST /api/site/track
 * Records a page view for analytics. No auth. Rate limit via IP recommended in production.
 */
export async function POST(request: Request) {
  let body: { path?: string; sessionId?: string; referrer?: string; device?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ data: null, error: "Invalid JSON" }, { status: 400 });
  }
  const path = typeof body.path === "string" && body.path ? body.path : "/";
  const sessionId = typeof body.sessionId === "string" ? body.sessionId : null;
  const referrer = typeof body.referrer === "string" ? body.referrer : null;
  const device = typeof body.device === "string" ? body.device : "desktop";

  try {
    await insertPageView({ pagePath: path, sessionId, referrer, deviceCategory: device });
    return NextResponse.json({ data: { ok: true }, error: null }, { status: 201 });
  } catch (err) {
    console.error("[site/track]", err);
    return NextResponse.json({ data: null, error: "Something went wrong" }, { status: 500 });
  }
}
