import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getBannerById, updateBanner, deleteBanner } from "@/lib/queries/banners";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  subtitle: z.string().max(1000).optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  linkUrl: z.string().optional().nullable(),
  linkText: z.string().max(100).optional().nullable(),
  placement: z.enum(["dashboard", "site_header", "site_footer", "site_popup"]).optional(),
  bgColor: z.string().max(50).optional().nullable(),
  textColor: z.string().max(50).optional().nullable(),
  active: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  startsAt: z.string().optional().nullable(),
  endsAt: z.string().optional().nullable(),
  size: z.string().optional(),
  customWidth: z.number().int().min(50).max(2000).optional().nullable(),
  customHeight: z.number().int().min(30).max(2000).optional().nullable(),
  layout: z.string().optional(),
  animation: z.string().optional(),
  carouselGroup: z.string().max(100).optional().nullable(),
  carouselInterval: z.number().int().min(1).max(60).optional(),
  borderRadius: z.number().int().min(0).max(50).optional(),
  opacity: z.number().int().min(10).max(100).optional(),
});

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
    const existing = await getBannerById(id);
    if (!existing) {
      return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
    }
    const d = parsed.data;
    const updateData: Parameters<typeof updateBanner>[1] = {};
    if (d.title !== undefined) updateData.title = d.title;
    if (d.subtitle !== undefined) updateData.subtitle = d.subtitle;
    if (d.imageUrl !== undefined) updateData.imageUrl = d.imageUrl;
    if (d.linkUrl !== undefined) updateData.linkUrl = d.linkUrl;
    if (d.linkText !== undefined) updateData.linkText = d.linkText;
    if (d.placement !== undefined) updateData.placement = d.placement;
    if (d.bgColor !== undefined) updateData.bgColor = d.bgColor;
    if (d.textColor !== undefined) updateData.textColor = d.textColor;
    if (d.active !== undefined) updateData.active = d.active;
    if (d.sortOrder !== undefined) updateData.sortOrder = d.sortOrder;
    if (d.startsAt !== undefined) updateData.startsAt = d.startsAt;
    if (d.endsAt !== undefined) updateData.endsAt = d.endsAt;
    if (d.size !== undefined) updateData.size = d.size;
    if (d.customWidth !== undefined) updateData.customWidth = d.customWidth;
    if (d.customHeight !== undefined) updateData.customHeight = d.customHeight;
    if (d.layout !== undefined) updateData.layout = d.layout;
    if (d.animation !== undefined) updateData.animation = d.animation;
    if (d.carouselGroup !== undefined) updateData.carouselGroup = d.carouselGroup;
    if (d.carouselInterval !== undefined) updateData.carouselInterval = d.carouselInterval;
    if (d.borderRadius !== undefined) updateData.borderRadius = d.borderRadius;
    if (d.opacity !== undefined) updateData.opacity = d.opacity;

    const row = await updateBanner(id, updateData);
    return NextResponse.json({ data: row ?? existing, error: null });
  } catch (err) {
    console.error("[admin/banners/[id] PUT]", err);
    return NextResponse.json({ data: null, error: "Something went wrong" }, { status: 500 });
  }
}

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
    const existing = await getBannerById(id);
    if (!existing) {
      return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
    }
    await deleteBanner(id);
    return NextResponse.json({ data: { ok: true }, error: null });
  } catch (err) {
    console.error("[admin/banners/[id] DELETE]", err);
    return NextResponse.json({ data: null, error: "Something went wrong" }, { status: 500 });
  }
}
