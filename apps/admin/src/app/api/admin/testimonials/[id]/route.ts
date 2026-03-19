import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
} from "@/lib/queries/testimonials";
import { z } from "zod";
import { normalizeMediaUrl } from "@/lib/media-url";

const mediaUrlSchema = z
  .string()
  .min(1)
  .refine((value) => value.startsWith("/") || /^https?:\/\//i.test(value), "Invalid media URL");

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  location: z.string().max(200).optional().nullable(),
  photoUrl: mediaUrlSchema.optional().nullable(),
  photoUrls: z.array(mediaUrlSchema).max(20).optional(),
  text: z.string().min(1).max(2000).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  approved: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

/**
 * PUT /api/admin/testimonials/[id] — update a testimonial
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }
  const id = Number((await params).id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ data: null, error: "Invalid id" }, { status: 400 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ data: null, error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.errors.map((e) => e.message).join("; ") }, { status: 400 });
  }
  try {
    const existing = await getTestimonialById(id);
    if (!existing) {
      return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
    }

    const normalizedPhotoUrls = parsed.data.photoUrls
      ? Array.from(new Set(parsed.data.photoUrls.map((url) => normalizeMediaUrl(url))))
      : undefined;

    const payload = {
      ...parsed.data,
      ...(parsed.data.photoUrl !== undefined
        ? { photoUrl: parsed.data.photoUrl ? normalizeMediaUrl(parsed.data.photoUrl) : null }
        : {}),
      ...(normalizedPhotoUrls !== undefined ? { photoUrls: normalizedPhotoUrls } : {}),
    };
    const row = await updateTestimonial(id, payload);
    const data = row ?? existing;
    const normalized = {
      ...data,
      photoUrl: data.photoUrl ? normalizeMediaUrl(data.photoUrl) : null,
      photoUrls: (data.photoUrls ?? []).map((url) => normalizeMediaUrl(url)),
    };
    return NextResponse.json({ data: normalized, error: null });
  } catch (err) {
    console.error("[admin/testimonials/[id] PUT]", err);
    return NextResponse.json({ data: null, error: "Something went wrong" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/testimonials/[id] — delete a testimonial
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }
  const id = Number((await params).id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ data: null, error: "Invalid id" }, { status: 400 });
  }
  try {
    const existing = await getTestimonialById(id);
    if (!existing) {
      return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
    }
    await deleteTestimonial(id);
    return NextResponse.json({ data: { ok: true }, error: null });
  } catch (err) {
    console.error("[admin/testimonials/[id] DELETE]", err);
    return NextResponse.json({ data: null, error: "Something went wrong" }, { status: 500 });
  }
}
