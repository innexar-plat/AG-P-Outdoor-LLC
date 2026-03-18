import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { listActiveBanners } from "@/lib/queries/banners";
import { getUserById } from "@/lib/queries/users";
import { parseAllowedModules } from "@/lib/modules";
import { Sidebar } from "@/components/admin/Sidebar";
import { MobileNav } from "@/components/admin/MobileNav";
import { RightPanel } from "@/components/admin/RightPanel";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const [activeBanners, userRecord] = await Promise.all([
    listActiveBanners("dashboard"),
    getUserById(session.user.id),
  ]);

  const role = (userRecord?.role ?? "editor") as "admin" | "editor";
  const allowedModules = parseAllowedModules(role, userRecord?.allowedModules ?? null);

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
        <div className="p-6 pt-16 lg:pt-6 lg:p-8 max-w-7xl">{children}</div>
      </main>
      <RightPanel banners={activeBanners} isAdmin={role === "admin"} />
    </div>
  );
}
