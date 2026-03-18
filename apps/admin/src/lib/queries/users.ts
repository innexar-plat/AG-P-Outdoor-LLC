import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";

/** Lists all users */
export async function listUsers() {
  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      allowedModules: user.allowedModules,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(user.createdAt);
}

/** Gets a user by id */
export async function getUserById(id: string) {
  const [row] = await db.select().from(user).where(eq(user.id, id)).limit(1);
  return row ?? null;
}

/** Updates a user's role and/or allowed modules */
export async function updateUser(
  id: string,
  data: { role?: "admin" | "editor"; allowedModules?: string }
) {
  const set: Record<string, unknown> = { updatedAt: new Date() };
  if (data.role !== undefined) set.role = data.role;
  if (data.allowedModules !== undefined) set.allowedModules = data.allowedModules;

  const [row] = await db
    .update(user)
    .set(set)
    .where(eq(user.id, id))
    .returning({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      allowedModules: user.allowedModules,
    });
  return row ?? null;
}

/** Deletes a user by id */
export async function deleteUser(id: string) {
  await db.delete(user).where(eq(user.id, id));
}
