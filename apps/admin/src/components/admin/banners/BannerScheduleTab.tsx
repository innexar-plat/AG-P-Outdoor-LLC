"use client";

import { useI18n } from "@/lib/i18n";
import { Input } from "@/components/ui/Input";
import type { Banner } from "./types";

interface BannerScheduleTabProps {
  editing: Banner;
  onEditingChange: (banner: Banner) => void;
}

export function BannerScheduleTab({ editing, onEditingChange }: BannerScheduleTabProps) {
  const { t } = useI18n();
  return (
    <div className="space-y-4">
      <Input
        label={t("startsAt")}
        type="datetime-local"
        value={editing.startsAt ? new Date(editing.startsAt).toISOString().slice(0, 16) : ""}
        onChange={(e) => onEditingChange({ ...editing, startsAt: e.target.value ? new Date(e.target.value) : null })}
      />
      <Input
        label={t("endsAt")}
        type="datetime-local"
        value={editing.endsAt ? new Date(editing.endsAt).toISOString().slice(0, 16) : ""}
        onChange={(e) => onEditingChange({ ...editing, endsAt: e.target.value ? new Date(e.target.value) : null })}
      />
      <Input
        label={t("sortOrder")}
        type="number"
        value={String(editing.sortOrder)}
        onChange={(e) => onEditingChange({ ...editing, sortOrder: Number(e.target.value) || 0 })}
      />
    </div>
  );
}
