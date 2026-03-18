import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listFormSubmissions } from "@/lib/queries/forms";

/**
 * GET /api/admin/forms/export
 * Returns form submissions as CSV. Protected.
 */
export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const rows = await listFormSubmissions({ limit: 1000 });
    const header = "id,formType,name,email,phone,message,read,createdAt\n";
    const lines = rows.map(
      (r) =>
        `${r.id},${r.formType},${escapeCsv(r.name)},${escapeCsv(r.email)},${escapeCsv(r.phone ?? "")},${escapeCsv(r.message ?? "")},${r.read},${r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt}`
    );
    const csv = header + lines.join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=form-submissions.csv",
      },
    });
  } catch (err) {
    console.error("[admin/forms/export GET]", err);
    return NextResponse.json({ data: null, error: "Something went wrong" }, { status: 500 });
  }
}

function escapeCsv(s: string): string {
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}
