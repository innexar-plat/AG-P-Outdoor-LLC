"use client";

import { useI18n } from "@/lib/i18n";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import {
  BANNER_SIZES,
  BANNER_SIZE_DIMENSIONS,
  BANNER_ANIMATIONS,
  BANNER_LAYOUTS,
} from "@/lib/schema";
import { getEffectiveDimensions, calcHowManyFit } from "./utils";
import type { Banner } from "./types";

interface BannerAppearanceTabProps {
  editing: Banner;
  onEditingChange: (banner: Banner) => void;
}

type LayoutKey = "layoutImageOnly" | "layoutTextOverlay" | "layoutTextBelow" | "layoutTextLeft" | "layoutTextRight" | "layoutCard";
type AnimKey = "animNone" | "animFade" | "animSlide" | "animZoom" | "animPulse";

function layoutLabel(l: string, t: (k: LayoutKey) => string): string {
  switch (l) {
    case "image_only": return t("layoutImageOnly");
    case "text_overlay": return t("layoutTextOverlay");
    case "text_below": return t("layoutTextBelow");
    case "text_left": return t("layoutTextLeft");
    case "text_right": return t("layoutTextRight");
    case "card": return t("layoutCard");
    default: return l;
  }
}

function animLabel(a: string, t: (k: AnimKey) => string): string {
  switch (a) {
    case "none": return t("animNone");
    case "fade": return t("animFade");
    case "slide": return t("animSlide");
    case "zoom": return t("animZoom");
    case "pulse": return t("animPulse");
    default: return a;
  }
}

export function BannerAppearanceTab({ editing, onEditingChange }: BannerAppearanceTabProps) {
  const { t } = useI18n();
  const dims = getEffectiveDimensions(editing);

  return (
    <div className="space-y-4">
      <Select
        label={t("bannerSize")}
        value={editing.size}
        onChange={(e) => onEditingChange({ ...editing, size: e.target.value })}
        options={BANNER_SIZES.map((s) => ({
          value: s,
          label: BANNER_SIZE_DIMENSIONS[s].label,
        }))}
      />
      {editing.size === "custom" && (
        <div className="grid grid-cols-2 gap-3">
          <Input
            label={t("bannerCustomWidth")}
            type="number"
            value={String(editing.customWidth ?? 300)}
            onChange={(e) => onEditingChange({ ...editing, customWidth: Number(e.target.value) || null })}
          />
          <Input
            label={t("bannerCustomHeight")}
            type="number"
            value={String(editing.customHeight ?? 200)}
            onChange={(e) => onEditingChange({ ...editing, customHeight: Number(e.target.value) || null })}
          />
        </div>
      )}
      <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">{t("bannerDimensionPreview")}</span>
          <span className="font-mono font-semibold text-slate-700">{dims.w}×{dims.h}px</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-slate-500">{t("bannerCapacity")}</span>
          <Badge variant="info">{calcHowManyFit(editing)}</Badge>
        </div>
        <div className="mt-3 flex justify-center">
          <div
            className="bg-brand-100 border-2 border-dashed border-brand-300 flex items-center justify-center text-[10px] text-brand-600 font-mono"
            style={{
              width: Math.min(dims.w, 240),
              height: Math.min(dims.h, 150),
              borderRadius: editing.borderRadius,
            }}
          >
            {dims.w}×{dims.h}
          </div>
        </div>
      </div>
      <Select
        label={t("bannerLayout")}
        value={editing.layout}
        onChange={(e) => onEditingChange({ ...editing, layout: e.target.value })}
        options={BANNER_LAYOUTS.map((l) => ({ value: l, label: layoutLabel(l, t) }))}
      />
      <Select
        label={t("bannerAnimation")}
        value={editing.animation}
        onChange={(e) => onEditingChange({ ...editing, animation: e.target.value })}
        options={BANNER_ANIMATIONS.map((a) => ({ value: a, label: animLabel(a, t) }))}
      />
      <div>
        <Input
          label={t("bannerCarouselGroup")}
          value={editing.carouselGroup ?? ""}
          onChange={(e) => onEditingChange({ ...editing, carouselGroup: e.target.value || null })}
          placeholder="promo-sidebar"
        />
        <p className="text-[11px] text-slate-400 mt-1">{t("bannerCarouselGroupHint")}</p>
      </div>
      <Input
        label={t("bannerCarouselInterval")}
        type="number"
        min={1}
        max={60}
        value={String(editing.carouselInterval)}
        onChange={(e) => onEditingChange({ ...editing, carouselInterval: Number(e.target.value) || 5 })}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label={t("bannerBgColor")}
          type="color"
          value={editing.bgColor ?? "#0f172a"}
          onChange={(e) => onEditingChange({ ...editing, bgColor: e.target.value })}
        />
        <Input
          label={t("bannerTextColor")}
          type="color"
          value={editing.textColor ?? "#ffffff"}
          onChange={(e) => onEditingChange({ ...editing, textColor: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">{t("bannerBorderRadius")}</label>
          <input
            type="range"
            min={0}
            max={50}
            value={editing.borderRadius}
            onChange={(e) => onEditingChange({ ...editing, borderRadius: Number(e.target.value) })}
            className="w-full accent-brand-600"
          />
          <span className="text-xs text-slate-500">{editing.borderRadius}px</span>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">{t("bannerOpacity")}</label>
          <input
            type="range"
            min={10}
            max={100}
            value={editing.opacity}
            onChange={(e) => onEditingChange({ ...editing, opacity: Number(e.target.value) })}
            className="w-full accent-brand-600"
          />
          <span className="text-xs text-slate-500">{editing.opacity}%</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={editing.active}
          onChange={(e) => onEditingChange({ ...editing, active: e.target.checked })}
          className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        />
        <label className="text-sm text-slate-700">{t("bannerActive")}</label>
      </div>
    </div>
  );
}
