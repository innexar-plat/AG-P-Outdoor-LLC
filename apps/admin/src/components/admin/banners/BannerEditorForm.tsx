"use client";

import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { BannerPreview } from "./BannerPreview";
import { BannerContentTab } from "./BannerContentTab";
import { BannerAppearanceTab } from "./BannerAppearanceTab";
import { BannerScheduleTab } from "./BannerScheduleTab";
import type { Banner, Tab } from "./types";

interface BannerEditorFormProps {
  editing: Banner;
  tab: Tab;
  loading: boolean;
  onTabChange: (tab: Tab) => void;
  onEditingChange: (banner: Banner) => void;
  onSave: () => void;
  onCancel: () => void;
}

const TABS: Tab[] = ["content", "appearance", "schedule"];

export function BannerEditorForm({
  editing,
  tab,
  loading,
  onTabChange,
  onEditingChange,
  onSave,
  onCancel,
}: BannerEditorFormProps) {
  const { t } = useI18n();

  const tabLabels: Record<Tab, string> = {
    content: t("bannerContentTab"),
    appearance: t("bannerAppearanceTab"),
    schedule: t("bannerScheduleTab"),
  };

  return (
    <div className="space-y-5">
      <div className="flex border-b border-surface-border">
        {TABS.map((tb) => (
          <button
            key={tb}
            onClick={() => onTabChange(tb)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === tb
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {tabLabels[tb]}
          </button>
        ))}
      </div>

      {tab === "content" && <BannerContentTab editing={editing} onEditingChange={onEditingChange} />}
      {tab === "appearance" && <BannerAppearanceTab editing={editing} onEditingChange={onEditingChange} />}
      {tab === "schedule" && <BannerScheduleTab editing={editing} onEditingChange={onEditingChange} />}

      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">{t("ctaPreview")}</p>
        <BannerPreview banner={editing} />
      </div>

      <div className="flex gap-2 pt-2">
        <Button loading={loading} onClick={onSave}>{t("save")}</Button>
        <Button variant="ghost" onClick={onCancel}>{t("cancel")}</Button>
      </div>
    </div>
  );
}
