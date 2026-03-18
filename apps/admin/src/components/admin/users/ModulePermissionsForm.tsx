"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { ALL_MODULES, type ModuleKey } from "@/lib/schema";
import { MODULE_LABELS } from "@/lib/modules";
import { Button } from "@/components/ui/Button";
import { SlideOver } from "@/components/ui/SlideOver";
import { parseAllowedModules } from "@/lib/modules";
import type { UserRow } from "./types";

interface ModulePermissionsFormProps {
  user: UserRow | null;
  onClose: () => void;
  onSave: (userId: string, modules: string[]) => Promise<void>;
}

export function ModulePermissionsForm({ user, onClose, onSave }: ModulePermissionsFormProps) {
  const { t, locale } = useI18n();
  const [selectedModules, setSelectedModules] = useState<ModuleKey[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setSelectedModules(parseAllowedModules(user.role as "admin" | "editor", user.allowedModules));
    }
  }, [user]);

  const getModuleLabel = (key: ModuleKey) => MODULE_LABELS[key][locale];

  const toggleModule = (mod: ModuleKey) => {
    setSelectedModules((prev) =>
      prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod],
    );
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await onSave(user.id, selectedModules);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <SlideOver
      open={!!user}
      onClose={onClose}
      title={`Modules — ${user.name}`}
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-500">
          {locale === "pt"
            ? "Selecione quais módulos este usuário pode acessar no painel."
            : "Select which modules this user can access in the panel."}
        </p>

        <div className="flex gap-2 mb-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedModules([...ALL_MODULES])}
          >
            {t("all")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedModules(["dashboard"])}
          >
            Min
          </Button>
        </div>

        <div className="space-y-1">
          {ALL_MODULES.map((mod) => (
            <label
              key={mod}
              className={`
                flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition-colors
                ${selectedModules.includes(mod)
                  ? "bg-brand-50 border border-brand-200"
                  : "bg-white border border-slate-200 hover:border-slate-300"
                }
              `.trim()}
            >
              <input
                type="checkbox"
                checked={selectedModules.includes(mod)}
                onChange={() => toggleModule(mod)}
                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm font-medium text-slate-700 flex-1">
                {getModuleLabel(mod)}
              </span>
              <span className="text-xs text-slate-400 font-mono">{mod}</span>
            </label>
          ))}
        </div>

        <div className="pt-2 text-xs text-slate-400">
          {selectedModules.length}/{ALL_MODULES.length} {locale === "pt" ? "módulos selecionados" : "modules selected"}
        </div>

        <div className="flex gap-2 pt-4">
          <Button loading={loading} onClick={handleSave}>{t("save")}</Button>
          <Button variant="ghost" onClick={onClose}>{t("cancel")}</Button>
        </div>
      </div>
    </SlideOver>
  );
}
