import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/api-guards";
import {
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "@/lib/queries/users";
import { z } from "zod";

const updateRoleSchema = z.object({
  role: z.enum(["admin", "editor"]),
  allowedModules: z.string().optional(),
});

const createUserSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["admin", "editor"]).optional(),
});

/**
 * GET /api/admin/users — list all users (admin only)
 */
export async function GET(request: Request) {
  const guard = await requireAdminApi(request);
  if (!guard.authorized) return guard.response;
  try {
    const rows = await listUsers();
    return NextResponse.json({ data: rows, error: null });
  } catch (err) {
    console.error("[admin/users GET]", err);
    return NextResponse.json({ data: null, error: "Something went wrong" }, { status: 500 });
  }
}

/**
 * POST /api/admin/users — create a new user (admin only)
 * Uses Better Auth sign-up internally
 */
export async function POST(request: Request) {
  const guard = await requireAdminApi(request);
  if (!guard.authorized) return guard.response;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ data: null, error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.errors.map((e) => e.message).join("; ") }, { status: 400 });
  }
  try {
    const { auth } = await import("@/lib/auth");
    const result = await auth.api.signUpEmail({
      body: {
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
      },
    });
    if (!result || !result.user) {
      return NextResponse.json({ data: null, error: "Failed to create user" }, { status: 400 });
    }
    if (parsed.data.role && parsed.data.role !== "editor") {
      await updateUser(result.user.id, { role: parsed.data.role });
    }
    const created = await getUserById(result.user.id);
    return NextResponse.json({ data: created, error: null }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("UNIQUE") || msg.includes("unique")) {
      return NextResponse.json({ data: null, error: "Email already exists" }, { status: 409 });
    }
    console.error("[admin/users POST]", err);
    return NextResponse.json({ data: null, error: "Something went wrong" }, { status: 500 });
  }
}

/**
 * PUT /api/admin/users — update user role (admin only)
 */
export async function PUT(request: Request) {
  const guard = await requireAdminApi(request);
  if (!guard.authorized) return guard.response;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ data: null, error: "Invalid JSON" }, { status: 400 });
  }
  const idZ = z.object({ id: z.string() }).safeParse(body);
  if (!idZ.success) {
    return NextResponse.json({ data: null, error: "Missing user id" }, { status: 400 });
  }
  const parsed = updateRoleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.errors.map((e) => e.message).join("; ") }, { status: 400 });
  }
  try {
    const targetId = (body as { id: string }).id;
    const target = await getUserById(targetId);
    if (!target) {
      return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
    }
    const row = await updateUser(targetId, {
      role: parsed.data.role,
      allowedModules: parsed.data.allowedModules,
    });
    return NextResponse.json({ data: row, error: null });
  } catch (err) {
    console.error("[admin/users PUT]", err);
    return NextResponse.json({ data: null, error: "Something went wrong" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/users — delete a user (admin only, cannot delete self)
 */
export async function DELETE(request: Request) {
  const guard = await requireAdminApi(request);
  if (!guard.authorized) return guard.response;
  const { searchParams } = new URL(request.url);
  const targetId = searchParams.get("id");
  if (!targetId) {
    return NextResponse.json({ data: null, error: "Missing id" }, { status: 400 });
  }
  if (targetId === guard.session.user.id) {
    return NextResponse.json({ data: null, error: "Cannot delete your own account" }, { status: 400 });
  }
  try {
    const target = await getUserById(targetId);
    if (!target) {
      return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
    }
    await deleteUser(targetId);
    return NextResponse.json({ data: { ok: true }, error: null });
  } catch (err) {
    console.error("[admin/users DELETE]", err);
    return NextResponse.json({ data: null, error: "Something went wrong" }, { status: 500 });
  }
}
