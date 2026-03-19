import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { listActiveBanners } from "@/lib/queries/banners";
import { getUserById } from "@/lib/queries/users";
import { parseAllowedModules } from "@/lib/modules";
import { Sidebar } from "@/components/admin/Sidebar";
import { MobileNav } from "@/components/admin/MobileNav";
import { RightPanel } from "@/components/admin/RightPanel";
import { NotificationsBell } from "@/components/admin/NotificationsBell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/admin/login");
  }

  const [activeBanners, userRecord] = await Promise.all([
    listActiveBanners("dashboard"),
    getUserById(session.user.id),
  ]);

  const role = (userRecord?.role ?? "editor") as "admin" | "editor";
  const allowedModules = parseAllowedModules(role, userRecord?.allowedModules ?? null);
  const displayName = userRecord?.name || session.user.name || session.user.email || "User";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("") || "U";

  const sidebar = <Sidebar role={role} allowedModules={allowedModules} />;

  return (
    <div className="min-h-screen flex bg-surface-muted">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        {sidebar}
      </div>

      {/* Mobile sidebar drawer */}
      <MobileNav>
        {sidebar}
      </MobileNav>

      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 z-20 border-b border-surface-border bg-white/90 backdrop-blur">
          <div className="flex items-center justify-between px-6 py-3 lg:px-8">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">AG&P Admin</p>
              <p className="text-sm font-semibold text-slate-700">{displayName}</p>
            </div>
            <div className="flex items-center gap-2">
              <NotificationsBell variant="light" />
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white text-xs font-bold flex items-center justify-center shadow-sm">
                {initials}
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 lg:p-8 max-w-7xl">{children}</div>
      </main>
      <RightPanel banners={activeBanners} isAdmin={role === "admin"} />
    </div>
  );
}
