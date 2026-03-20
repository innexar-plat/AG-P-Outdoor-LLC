import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getUserById } from "@/lib/queries/users";
import { hasModuleAccess } from "@/lib/modules";
import type { ModuleKey } from "@/lib/schema";

/** Map route prefixes to module keys */
const PATH_MODULE_MAP: Record<string, ModuleKey> = {
  "/admin/dashboard": "dashboard",
  "/admin/analytics": "analytics",
  "/admin/blog": "blog",
  "/admin/portfolio": "portfolio",
  "/admin/testimonials": "testimonials",
  "/admin/forms": "forms",
  "/admin/images": "images",
  "/admin/banners": "banners",
  "/admin/seo": "seo",
  "/admin/pixels": "pixels",
  "/admin/settings": "settings",
  "/admin/users": "users",
  "/admin/social": "social",
  "/admin/api-docs": "api-docs",
};

/**
 * Verifies user session. Redirects to /login if none.
 */
export async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  return session;
}

/**
 * Gets the role of the currently authenticated user.
 */
export async function getCurrentUserRole(userId: string): Promise<"admin" | "editor"> {
  const userRecord = await getUserById(userId);
  return (userRecord?.role as "admin" | "editor") ?? "editor";
}

/**
 * Requires admin role. Redirects non-admins to /admin/dashboard.
 */
export async function requireAdmin() {
  const session = await requireSession();
  const role = await getCurrentUserRole(session.user.id);
  if (role !== "admin") {
    redirect("/dashboard");
  }
  return { session, role };
}

/**
 * Requires access to a specific module based on user's allowed modules.
 * Admin always has access. Editor users are checked against their allowedModules config.
 */
export async function requireModule(moduleKey: ModuleKey) {
  const session = await requireSession();
  const userRecord = await getUserById(session.user.id);
  const role = (userRecord?.role as "admin" | "editor") ?? "editor";
  const allowed = hasModuleAccess(role, userRecord?.allowedModules ?? null, moduleKey);

  if (!allowed) {
    redirect("/dashboard");
  }

  return { session, role, userRecord };
}

/**
 * Resolves which module a path belongs to.
 */
export function getModuleForPath(pathname: string): ModuleKey | null {
  for (const [prefix, mod] of Object.entries(PATH_MODULE_MAP)) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      return mod;
    }
  }
  return null;
}

/**
 * Legacy: checks if a path is admin-only.
 */
export function isAdminOnlyPath(pathname: string): boolean {
  const mod = getModuleForPath(pathname);
  if (!mod) return false;
  return ["images", "banners", "seo", "pixels", "users", "api-docs"].includes(mod);
}
