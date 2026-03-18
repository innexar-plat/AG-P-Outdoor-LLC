"use client";

import { useI18n } from "@/lib/i18n";
import { ALL_MODULES, type ModuleKey } from "@/lib/schema";
import { parseAllowedModules } from "@/lib/modules";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Table, Thead, Th, Td, TableEmpty } from "@/components/ui/Table";
import { formatDate } from "@/lib/format-date";
import type { UserRow } from "./types";

interface UsersTableProps {
  users: UserRow[];
  currentUserId: string;
  loading: string | null;
  onRoleChange: (userId: string, role: string) => void;
  onDelete: (userId: string) => void;
  onOpenModules: (user: UserRow) => void;
}

function countModules(u: UserRow): number {
  if (u.role === "admin") return ALL_MODULES.length;
  const mods = parseAllowedModules(u.role as "admin" | "editor", u.allowedModules);
  return mods.length;
}

export function UsersTable({
  users,
  currentUserId,
  loading,
  onRoleChange,
  onDelete,
  onOpenModules,
}: UsersTableProps) {
  const { t, locale } = useI18n();
  return (
    <Card>
      <Table>
        <Thead>
          <tr>
            <Th>{t("name")}</Th>
            <Th>{t("email")}</Th>
            <Th>{t("role")}</Th>
            <Th>Modules</Th>
            <Th>{t("createdAt")}</Th>
            <Th>{t("actions")}</Th>
          </tr>
        </Thead>
        <tbody>
          {users.length === 0 && <TableEmpty colSpan={6} message={t("noUsers")} />}
          {users.map((u) => (
            <tr key={u.id} className="border-b border-surface-border last:border-0">
              <Td>
                <span className="font-medium">{u.name}</span>
                {u.id === currentUserId && (
                  <Badge variant="info" className="ml-2">You</Badge>
                )}
              </Td>
              <Td className="text-sm">{u.email}</Td>
              <Td>
                <Select
                  value={u.role}
                  onChange={(e) => onRoleChange(u.id, e.target.value)}
                  options={[
                    { value: "admin", label: t("admin") },
                    { value: "editor", label: t("editor") },
                  ]}
                  disabled={loading === u.id}
                />
              </Td>
              <Td>
                <button
                  onClick={() => onOpenModules(u)}
                  className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
                  disabled={u.role === "admin"}
                >
                  {u.role === "admin" ? (
                    <Badge variant="info">{t("all")} ({ALL_MODULES.length})</Badge>
                  ) : (
                    <Badge variant="default" className="cursor-pointer hover:bg-slate-200 transition-colors">
                      {countModules(u)}/{ALL_MODULES.length}
                    </Badge>
                  )}
                </button>
              </Td>
              <Td className="text-sm">{formatDate(u.createdAt)}</Td>
              <Td>
                <div className="flex gap-1">
                  {u.role !== "admin" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onOpenModules(u)}
                    >
                      Modules
                    </Button>
                  )}
                  {u.id !== currentUserId && (
                    <Button
                      size="sm"
                      variant="danger"
                      loading={loading === u.id}
                      onClick={() => onDelete(u.id)}
                    >
                      {t("remove")}
                    </Button>
                  )}
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}
