import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getSocialPostById,
  updateSocialPost,
  deleteSocialPost,
} from "@/lib/queries/social";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().max(500).optional().nullable(),
  thumbnailUrl: z.string().optional().nullable(),
  pinned: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
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
    return NextResponse.json(
      { data: null, error: parsed.error.errors.map((e) => e.message).join("; ") },
      { status: 400 },
    );
  }

  try {
    const existing = await getSocialPostById(id);
    if (!existing) {
      return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
    }
    const row = await updateSocialPost(id, parsed.data);
    return NextResponse.json({ data: row ?? existing, error: null });
  } catch (err) {
    console.error("[admin/social/[id] PUT]", err);
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
    const existing = await getSocialPostById(id);
    if (!existing) {
      return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
    }
    await deleteSocialPost(id);
    return NextResponse.json({ data: { ok: true }, error: null });
  } catch (err) {
    console.error("[admin/social/[id] DELETE]", err);
    return NextResponse.json({ data: null, error: "Something went wrong" }, { status: 500 });
  }
}
