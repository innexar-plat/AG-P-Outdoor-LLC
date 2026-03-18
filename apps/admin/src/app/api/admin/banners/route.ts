import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listBanners, createBanner } from "@/lib/queries/banners";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1).max(500),
  subtitle: z.string().max(1000).optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  linkUrl: z.string().optional().nullable(),
  linkText: z.string().max(100).optional().nullable(),
  placement: z.enum(["dashboard", "site_header", "site_footer", "site_popup"]),
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

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const rows = await listBanners();
    return NextResponse.json({ data: rows, error: null });
  } catch (err) {
    console.error("[admin/banners GET]", err);
    return NextResponse.json({ data: null, error: "Something went wrong" }, { status: 500 });
  }
}

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
    const row = await createBanner(parsed.data);
    return NextResponse.json({ data: row, error: null }, { status: 201 });
  } catch (err) {
    console.error("[admin/banners POST]", err);
    return NextResponse.json({ data: null, error: "Something went wrong" }, { status: 500 });
  }
}
