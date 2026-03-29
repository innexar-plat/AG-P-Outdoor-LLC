import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import {
  getFormSubmissionById,
  updateFormSubmissionRead,
  updateFormSubmission,
  deleteFormSubmission,
} from "@/lib/queries/forms";

const patchSchema = z.object({
  read: z.boolean().optional(),
  leadStatus: z.enum(["new", "called", "not_called"]).optional(),
  crmComment: z.string().max(5000).nullable().optional(),
});

/**
 * PATCH /api/admin/forms/[id]
 * Mark submission as read. Body: { "read": true }. Protected.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => e.message).join("; ") || "Validation failed";
    return NextResponse.json({ data: null, error: msg }, { status: 400 });
  }
  try {
    const existing = await getFormSubmissionById(id);
    if (!existing) {
      return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
    }
    const payload = {
      ...(parsed.data.read !== undefined ? { read: parsed.data.read } : {}),
      ...(parsed.data.leadStatus !== undefined ? { leadStatus: parsed.data.leadStatus } : {}),
      ...(parsed.data.crmComment !== undefined ? { crmComment: parsed.data.crmComment } : {}),
    };
    const row =
      parsed.data.leadStatus !== undefined || parsed.data.crmComment !== undefined
        ? await updateFormSubmission(id, payload)
        : await updateFormSubmissionRead(id, parsed.data.read ?? true);
    return NextResponse.json({ data: row ?? existing, error: null });
  } catch (err) {
    console.error("[admin/forms/[id] PATCH]", err);
    return NextResponse.json({ data: null, error: "Something went wrong" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/forms/[id]
 * Deletes a form submission. Protected.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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
    const existing = await getFormSubmissionById(id);
    if (!existing) {
      return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
    }
    await deleteFormSubmission(id);
    return NextResponse.json({ data: { ok: true }, error: null });
  } catch (err) {
    console.error("[admin/forms/[id] DELETE]", err);
    return NextResponse.json({ data: null, error: "Something went wrong" }, { status: 500 });
  }
}
