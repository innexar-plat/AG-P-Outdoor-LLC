"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { UsersTable } from "./UsersTable";
import { CreateUserForm } from "./CreateUserForm";
import { ModulePermissionsForm } from "./ModulePermissionsForm";
import type { UserRow } from "./types";

interface UsersViewProps {
  users: UserRow[];
  currentUserId: string;
}

/** Users management with role editing, user creation, and module permissions */
export function UsersView({ users: initial, currentUserId }: UsersViewProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [users, setUsers] = useState(initial);
  const [loading, setLoading] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editingModules, setEditingModules] = useState<UserRow | null>(null);

  async function handleRoleChange(userId: string, role: string) {
    setLoading(userId);
    try {
      const res = await fetch("/admin/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, role }),
      });
      if (res.ok) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
      }
    } finally {
      setLoading(null);
    }
  }

  async function handleDelete(userId: string) {
    if (userId === currentUserId) {
      alert(t("cannotDeleteSelf"));
      return;
    }
    if (!confirm(t("confirmRemoveUser"))) return;
    setLoading(userId);
    try {
      const res = await fetch(`/admin/api/admin/users?id=${userId}`, { method: "DELETE" });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        router.refresh();
      }
    } finally {
      setLoading(null);
    }
  }

  async function handleCreate(data: { name: string; email: string; password: string; role: string }) {
    const res = await fetch("/admin/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (res.ok && json.data) {
      setUsers((prev) => [...prev, json.data]);
      router.refresh();
    } else {
      throw new Error(json.error ?? t("requestFailed"));
    }
  }

  function openModulesEditor(user: UserRow) {
    setEditingModules(user);
  }

  async function saveModules(userId: string, modules: string[]): Promise<void> {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    const res = await fetch("/admin/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: userId,
        role: user.role,
        allowedModules: JSON.stringify(modules),
      }),
    });
    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, allowedModules: JSON.stringify(modules) } : u,
        ),
      );
      setEditingModules(null);
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("users")}
        description={t("usersDesc")}
        actions={
          <Button onClick={() => setCreating(true)}>
            {t("newUser")}
          </Button>
        }
      />

      <UsersTable
        users={users}
        currentUserId={currentUserId}
        loading={loading}
        onRoleChange={handleRoleChange}
        onDelete={handleDelete}
        onOpenModules={openModulesEditor}
      />

      <CreateUserForm
        open={creating}
        onClose={() => setCreating(false)}
        onCreate={handleCreate}
      />

      <ModulePermissionsForm
        user={editingModules}
        onClose={() => setEditingModules(null)}
        onSave={saveModules}
      />
    </div>
  );
}
