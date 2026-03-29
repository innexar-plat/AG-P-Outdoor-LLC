import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listSiteImages, upsertSiteImage } from "@/lib/queries/images";
import { z } from "zod";
import { normalizeCarouselItems, normalizeMediaUrl } from "@/lib/media-url";

function parseCarouselItems(raw: unknown): Array<{ url?: string }> {
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  if (Array.isArray(raw)) return raw;
  return [];
}

function getUrlFromCarouselItems(raw: unknown): string {
  const items = parseCarouselItems(raw);
  const first = items[0];
  return (first?.url && String(first.url).trim()) ?? "";
}

const carouselItemSchema = z.object({
  url: z.union([z.string(), z.number()]).transform((v) => String(v ?? "")),
  altText: z.union([z.string(), z.null(), z.undefined()]).optional(),
  sortOrder: z.union([z.number(), z.string()]).transform((v) => Number(v) || 0),
});

const upsertSchema = z.preprocess(
  (raw) => {
    if (!raw || typeof raw !== "object") return raw;
    const o = raw as Record<string, unknown>;
    return {
      ...o,
      section: String(o.section ?? "").trim(),
      slotKey: String(o.slotKey ?? "").trim(),
      label: String(o.label ?? "").trim(),
      url: String(o.url ?? "").trim(),
      altText: o.altText ?? null,
      displayType: ["single", "gallery", "carousel"].includes(String(o.displayType ?? "single")) ? String(o.displayType ?? "single") : "single",
      sortOrder: Number(o.sortOrder) || 0,
      carouselItems: Array.isArray(o.carouselItems) ? o.carouselItems : o.carouselItems,
      carouselInterval: o.carouselInterval != null ? Number(o.carouselInterval) : undefined,
      carouselEffect: o.carouselEffect === "fade" ? "fade" : "slide",
      focalX: o.focalX != null ? Math.round(Math.min(100, Math.max(0, Number(o.focalX)))) : undefined,
      focalY: o.focalY != null ? Math.round(Math.min(100, Math.max(0, Number(o.focalY)))) : undefined,
    };
  },
  z
    .object({
      section: z.string().min(1, "Section is required"),
      slotKey: z.string().min(1, "Slot key is required"),
      label: z.string().min(1, "Label is required"),
      url: z.string(),
      altText: z.string().nullable().optional(),
      displayType: z.enum(["single", "gallery", "carousel"]),
      sortOrder: z.number(),
      carouselItems: z
        .union([z.array(carouselItemSchema), z.string(), z.undefined()])
        .optional()
        .transform((v) => {
          if (Array.isArray(v)) return v.length > 0 ? JSON.stringify(v) : undefined;
          if (typeof v === "string" && v) return v;
          return undefined;
        }),
      carouselInterval: z.number().int().min(1).max(60).optional(),
      carouselEffect: z.enum(["slide", "fade"]),
      focalX: z.number().int().min(0).max(100).optional(),
      focalY: z.number().int().min(0).max(100).optional(),
    })
    .refine(
      (data) => {
        const url = data.url?.trim() ?? "";
        const items = parseCarouselItems(data.carouselItems);
        const hasUrl = url.length > 0;
        const hasCarouselUrl = items.length > 0 && items.some((i) => (i?.url ?? "").trim().length > 0);
        if (data.displayType === "carousel" || data.displayType === "gallery") {
          return hasUrl || hasCarouselUrl;
        }
        return hasUrl;
      },
      { message: "URL is required (or add at least one carousel image)" }
    )
    .transform((data) => {
      const url = data.url?.trim() || getUrlFromCarouselItems(data.carouselItems);
      return { ...data, url };
    })
);

/**
 * GET /api/admin/images — list all site images
 */
export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const rows = await listSiteImages();
    const normalized = rows.map((row) => ({
      ...row,
      url: normalizeMediaUrl(row.url),
      carouselItems: normalizeCarouselItems(row.carouselItems),
    }));
    return NextResponse.json({ data: normalized, error: null });
  } catch (err) {
    console.error("[admin/images GET]", err);
    return NextResponse.json({ data: null, error: "Something went wrong" }, { status: 500 });
  }
}

/**
 * POST /api/admin/images — create or update a site image slot
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
  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
    console.error("[admin/images POST] validation failed:", msg, "body:", JSON.stringify(body));
    return NextResponse.json({ data: null, error: msg || "Validation failed" }, { status: 400 });
  }
  try {
    const row = await upsertSiteImage(parsed.data);
    const normalized = {
      ...row,
      url: normalizeMediaUrl(row.url),
      carouselItems: normalizeCarouselItems(row.carouselItems),
    };
    return NextResponse.json({ data: normalized, error: null });
  } catch (err) {
    console.error("[admin/images POST]", err);
    return NextResponse.json({ data: null, error: "Something went wrong" }, { status: 500 });
  }
}
