"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SlideOver } from "@/components/ui/SlideOver";

interface CreateUserFormState {
  name: string;
  email: string;
  password: string;
  role: string;
}

interface CreateUserFormProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: CreateUserFormState) => Promise<void>;
}

export function CreateUserForm({ open, onClose, onCreate }: CreateUserFormProps) {
  const { t } = useI18n();
  const [form, setForm] = useState<CreateUserFormState>({ name: "", email: "", password: "", role: "editor" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setError(null);
    if (!form.name || !form.email || !form.password) {
      setError(t("requestFailed"));
      return;
    }
    if (form.password.length < 8) {
      setError(t("minPassword"));
      return;
    }
    setLoading(true);
    try {
      await onCreate(form);
      setForm({ name: "", email: "", password: "", role: "editor" });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("requestFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({ name: "", email: "", password: "", role: "editor" });
    setError(null);
    onClose();
  };

  return (
    <SlideOver
      open={open}
      onClose={handleClose}
      title={t("newUser")}
    >
      <div className="space-y-4">
        <Input
          label={t("name")}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <Input
          label={t("email")}
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <Input
          label={t("password")}
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          hint={t("minPassword")}
          required
        />
        <Select
          label={t("role")}
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          options={[
            { value: "editor", label: `${t("editor")} — ${t("client")}` },
            { value: "admin", label: `${t("admin")} — Innexar` },
          ]}
        />
        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}
        <div className="flex gap-2 pt-4">
          <Button loading={loading} onClick={handleCreate}>{t("create")}</Button>
          <Button variant="ghost" onClick={handleClose}>{t("cancel")}</Button>
        </div>
      </div>
    </SlideOver>
  );
}
