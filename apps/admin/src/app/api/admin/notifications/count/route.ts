import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { countFormSubmissions } from "@/lib/queries/forms";

/**
 * GET /api/admin/notifications/count
 * Returns unread form submissions count for the notification bell.
 */
export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const unreadCount = await countFormSubmissions({ read: false });
    return NextResponse.json({ data: { unreadCount }, error: null });
  } catch (err) {
    console.error("[admin/notifications/count]", err);
    return NextResponse.json({ data: null, error: "Something went wrong" }, { status: 500 });
  }
}
