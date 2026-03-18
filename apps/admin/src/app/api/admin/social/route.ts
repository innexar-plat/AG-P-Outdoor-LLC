import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listSocialPosts, createSocialPost } from "@/lib/queries/social";
import { SOCIAL_PLATFORMS } from "@/lib/schema";
import { detectPlatform, generateEmbed } from "@/lib/social-embed";
import { z } from "zod";

const createSchema = z.object({
  postUrl: z.string().url().min(1),
  title: z.string().max(500).optional().nullable(),
  thumbnailUrl: z.string().optional().nullable(),
  pinned: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const rows = await listSocialPosts();
    return NextResponse.json({ data: rows, error: null });
  } catch (err) {
    console.error("[admin/social GET]", err);
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
    return NextResponse.json(
      { data: null, error: parsed.error.errors.map((e) => e.message).join("; ") },
      { status: 400 },
    );
  }

  const platform = detectPlatform(parsed.data.postUrl);
  if (!platform || !(SOCIAL_PLATFORMS as readonly string[]).includes(platform)) {
    return NextResponse.json(
      { data: null, error: "Unsupported platform. Supported: YouTube, Instagram, Facebook, X/Twitter, TikTok, LinkedIn" },
      { status: 400 },
    );
  }

  const embedHtml = generateEmbed(platform, parsed.data.postUrl);

  try {
    const row = await createSocialPost({
      platform,
      postUrl: parsed.data.postUrl,
      embedHtml: embedHtml ?? null,
      title: parsed.data.title ?? null,
      thumbnailUrl: parsed.data.thumbnailUrl ?? null,
      pinned: parsed.data.pinned ?? false,
      sortOrder: parsed.data.sortOrder ?? 0,
    });
    return NextResponse.json({ data: row, error: null }, { status: 201 });
  } catch (err) {
    console.error("[admin/social POST]", err);
    return NextResponse.json({ data: null, error: "Something went wrong" }, { status: 500 });
  }
}
