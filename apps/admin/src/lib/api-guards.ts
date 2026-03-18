import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserById } from "@/lib/queries/users";

type GuardResult =
  | { authorized: true; session: Awaited<ReturnType<typeof auth.api.getSession>> & object; role: "admin" | "editor" }
  | { authorized: false; response: NextResponse };

/** Verifies session exists. Returns 401 if not authenticated. */
export async function requireAuth(request: Request): Promise<GuardResult> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return { authorized: false, response: NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 }) };
  }
  const userRecord = await getUserById(session.user.id);
  const role = (userRecord?.role as "admin" | "editor") ?? "editor";
  return { authorized: true, session, role };
}

/** Verifies session exists AND user is admin. Returns 403 if not admin. */
export async function requireAdminApi(request: Request): Promise<GuardResult> {
  const result = await requireAuth(request);
  if (!result.authorized) return result;
  if (result.role !== "admin") {
    return { authorized: false, response: NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 }) };
  }
  return result;
}
