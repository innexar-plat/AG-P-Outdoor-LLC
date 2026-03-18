import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { listFormSubmissions } from "@/lib/queries/forms";

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  form_type: z.string().optional(),
  read: z.enum(["true", "false"]).optional(),
  from: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  to: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
});

/**
 * GET /api/admin/forms
 * Lists form submissions with Zod-validated query params.
 */
export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const raw = Object.fromEntries(Array.from(searchParams.entries()));

    const parsed = querySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: parsed.error.errors.map((e) => `${e.path}: ${e.message}`).join("; ") },
        { status: 400 },
      );
    }

    const { limit, offset, form_type, read: readParam, from: fromStr, to: toStr } = parsed.data;
    const read = readParam === "true" ? true : readParam === "false" ? false : undefined;
    const from = fromStr ? new Date(fromStr) : undefined;
    const to = toStr ? new Date(toStr) : undefined;

    const rows = await listFormSubmissions({
      limit,
      offset,
      formType: form_type,
      read,
      from,
      to,
    });
    return NextResponse.json({ data: rows, error: null });
  } catch (err) {
    console.error("[admin/forms GET]", err);
    return NextResponse.json({ data: null, error: "Something went wrong" }, { status: 500 });
  }
}
