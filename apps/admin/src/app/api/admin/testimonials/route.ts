import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listTestimonials, createTestimonial } from "@/lib/queries/testimonials";
import { z } from "zod";
import { normalizeMediaUrl } from "@/lib/media-url";

const mediaUrlSchema = z
  .string()
  .min(1)
  .refine((value) => value.startsWith("/") || /^https?:\/\//i.test(value), "Invalid media URL");

const createSchema = z.object({
  name: z.string().min(1).max(200),
  location: z.string().max(200).optional().nullable(),
  photoUrl: mediaUrlSchema.optional().nullable(),
  text: z.string().min(1).max(2000),
  rating: z.number().int().min(1).max(5).optional(),
  approved: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

/**
 * GET /api/admin/testimonials — list all testimonials
 */
export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const rows = await listTestimonials();
    const normalized = rows.map((row) => ({
      ...row,
      photoUrl: row.photoUrl ? normalizeMediaUrl(row.photoUrl) : null,
    }));
    return NextResponse.json({ data: normalized, error: null });
  } catch (err) {
    console.error("[admin/testimonials GET]", err);
    return NextResponse.json({ data: null, error: "Something went wrong" }, { status: 500 });
  }
}

/**
 * POST /api/admin/testimonials — create a testimonial
 */
export async function POST(request: Request) {
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
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.errors.map((e) => e.message).join("; ") }, { status: 400 });
  }
  try {
    const payload = {
      ...parsed.data,
      photoUrl: parsed.data.photoUrl ? normalizeMediaUrl(parsed.data.photoUrl) : null,
    };
    const row = await createTestimonial(payload);
    const normalized = row
      ? { ...row, photoUrl: row.photoUrl ? normalizeMediaUrl(row.photoUrl) : null }
      : row;
    return NextResponse.json({ data: normalized, error: null }, { status: 201 });
  } catch (err) {
    console.error("[admin/testimonials POST]", err);
    return NextResponse.json({ data: null, error: "Something went wrong" }, { status: 500 });
  }
}
