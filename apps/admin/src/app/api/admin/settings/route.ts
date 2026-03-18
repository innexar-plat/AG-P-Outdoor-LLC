import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAllSettings, setSettings } from "@/lib/queries/settings";
import { z } from "zod";

const putSchema = z.record(z.string(), z.string().nullable());

/**
 * GET /api/admin/settings
 * Returns all settings as key-value object. Protected.
 */
export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const data = await getAllSettings();
    return NextResponse.json({ data, error: null });
  } catch (err) {
    console.error("[admin/settings GET]", err);
    return NextResponse.json({ data: null, error: "Something went wrong" }, { status: 500 });
  }
}

/**
 * PUT /api/admin/settings
 * Upserts multiple settings. Body: { "ga4_id": "G-xxx", "gtm_id": "GTM-xxx", ... }. Protected.
 */
export async function PUT(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ data: null, error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = putSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => e.message).join("; ") || "Validation failed";
    return NextResponse.json({ data: null, error: msg }, { status: 400 });
  }
  try {
    await setSettings(parsed.data);
    const data = await getAllSettings();
    return NextResponse.json({ data, error: null });
  } catch (err) {
    console.error("[admin/settings PUT]", err);
    return NextResponse.json({ data: null, error: "Something went wrong" }, { status: 500 });
  }
}
