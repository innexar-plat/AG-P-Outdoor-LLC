import { requireModule } from "@/lib/guards";
import { listUsers } from "@/lib/queries/users";
import { UsersView } from "@/components/admin/users";

/** Users admin page (Server Component) */
export default async function UsersPage() {
  const { session } = await requireModule("users");
  const users = await listUsers();
  return <UsersView users={users} currentUserId={session.user.id} />;
}
