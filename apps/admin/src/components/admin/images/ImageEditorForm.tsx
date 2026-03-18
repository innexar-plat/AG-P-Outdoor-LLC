"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SlideOver } from "@/components/ui/SlideOver";
import { FileUpload } from "@/components/ui/FileUpload";
import { PAGE_SECTIONS, SECTIONS, DISPLAY_TYPES, CAROUSEL_EFFECTS } from "./types";
import type { SiteImage, CarouselItem } from "./types";
import { displayLabel } from "./utils";

function CarouselItemsEditor({
  items,
  primaryUrl,
  onPrimaryChange,
  onChange,
  folder,
  t,
}: {
  items: CarouselItem[];
  primaryUrl: string;
  onPrimaryChange: (url: string) => void;
  onChange: (items: CarouselItem[]) => void;
  folder: string;
  t: (k: string) => string;
}) {
  const list = items.length > 0 ? items : (primaryUrl ? [{ url: primaryUrl, altText: null, sortOrder: 0 }] : []);

  function addItem() {
    onChange([...list, { url: "", altText: null, sortOrder: list.length }]);
  }

  function removeItem(idx: number) {
    const next = list.filter((_, i) => i !== idx);
    onChange(next);
    if (idx === 0 && next.length > 0) onPrimaryChange(next[0].url);
  }

  function updateItem(idx: number, patch: Partial<CarouselItem>) {
    const next = list.map((item, i) => (i === idx ? { ...item, ...patch } : item));
    onChange(next);
    if (idx === 0 && patch.url) onPrimaryChange(patch.url);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-700">{t("carouselImages")}</label>
        <Button type="button" size="sm" variant="outline" onClick={addItem}>
          + {t("addImage")}
        </Button>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {list.map((item, idx) => (
          <div key={idx} className="flex gap-2 items-start p-2 rounded-lg border border-slate-200 bg-slate-50">
            <div className="flex flex-col gap-1.5 shrink-0">
              {item.url ? (
                <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.altText ?? `Image ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              ) : null}
              <FileUpload folder={folder} onUpload={(url) => updateItem(idx, { url })} maxSizeMb={10} />
            </div>
            <input
              value={item.url}
              onChange={(e) => updateItem(idx, { url: e.target.value })}
              placeholder="URL or upload above"
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm min-w-0"
            />
            <Button type="button" size="sm" variant="ghost" onClick={() => removeItem(idx)} className="shrink-0">
              ×
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ImageEditorFormProps {
  editing: SiteImage | null;
  onClose: () => void;
  onSave: (data: SiteImage) => Promise<void>;
}

export function ImageEditorForm({ editing, onClose, onSave }: ImageEditorFormProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<SiteImage | null>(editing);

  useEffect(() => {
    setForm(editing);
    setError(null);
  }, [editing]);

  if (!editing) return null;

  const handleSave = async () => {
    if (!form) return;
    const slotKey = (form.slotKey ?? "").trim();
    const label = (form.label ?? "").trim();
    const url = (form.url ?? "").trim();
    const isCarouselOrGallery = form.displayType === "carousel" || form.displayType === "gallery";
    const carouselItems = (() => {
      const raw = form.carouselItems;
      if (Array.isArray(raw)) return raw;
      try {
        return typeof raw === "string" ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    })();
    const hasCarouselUrl = isCarouselOrGallery && carouselItems.some((i: CarouselItem) => (i?.url ?? "").trim().length > 0);

    if (!slotKey) {
      setError("Slot key is required");
      return;
    }
    if (!label) {
      setError("Label is required");
      return;
    }
    if (!isCarouselOrGallery && !url) {
      setError("Image URL is required for single image");
      return;
    }
    if (isCarouselOrGallery && !url && !hasCarouselUrl) {
      setError("Add at least one image URL (carousel or primary URL)");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SlideOver
      open={!!editing}
      onClose={onClose}
      title={editing.id === 0 ? t("addSlot") : t("edit")}
    >
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        <Select
          label={t("page")}
          value={form?.section ?? editing.section}
          onChange={(e) => form && setForm({ ...form, section: e.target.value })}
          options={PAGE_SECTIONS.map((key, idx) => ({
            value: key,
            label: SECTIONS[idx] ?? key,
          }))}
        />
        <Input
          label={t("slotKey")}
          value={form?.slotKey ?? editing.slotKey}
          onChange={(e) => form && setForm({ ...form, slotKey: e.target.value })}
          placeholder="hero-banner"
          disabled={editing.id !== 0}
          hint="unique-identifier"
        />
        <Input
          label={t("imageLabel")}
          value={form?.label ?? editing.label}
          onChange={(e) => form && setForm({ ...form, label: e.target.value })}
          placeholder="Hero Banner"
        />
        <Select
          label={t("displayType")}
          value={form?.displayType ?? editing.displayType}
          onChange={(e) => form && setForm({ ...form, displayType: e.target.value })}
          options={DISPLAY_TYPES.map((dt) => ({
            value: dt,
            label: displayLabel(dt, t),
          }))}
        />

        {(form?.displayType === "carousel" || form?.displayType === "gallery") && (
          <CarouselItemsEditor
            items={(() => {
              const raw = form?.carouselItems ?? (editing as { carouselItems?: string })?.carouselItems;
              if (Array.isArray(raw)) return raw;
              try {
                return raw ? JSON.parse(raw) : [];
              } catch {
                return [];
              }
            })()}
            primaryUrl={form?.url ?? editing.url}
            onPrimaryChange={(url) => form && setForm({ ...form, url })}
            onChange={(items) => form && setForm({ ...form, carouselItems: items } as SiteImage)}
            folder={`site-images/${form?.section ?? editing.section}`}
            t={(k) => t(k as "carouselImages" | "addImage")}
          />
        )}

        {(form?.displayType === "carousel") && (
          <>
            <Input
              label={t("carouselInterval")}
              type="number"
              value={String(form?.carouselInterval ?? (editing as { carouselInterval?: number })?.carouselInterval ?? 5)}
              onChange={(e) =>
                form && setForm({ ...form, carouselInterval: Math.max(1, Math.min(60, Number(e.target.value) || 5)) })
              }
              placeholder="5"
            />
            <Select
              label={t("carouselEffect")}
              value={form?.carouselEffect ?? (editing as { carouselEffect?: string })?.carouselEffect ?? "slide"}
              onChange={(e) => form && setForm({ ...form, carouselEffect: e.target.value })}
              options={CAROUSEL_EFFECTS.map((eff) => ({ value: eff, label: eff.charAt(0).toUpperCase() + eff.slice(1) }))}
            />
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {t("fileUpload")}
          </label>
          <FileUpload
            folder={`site-images/${form?.section ?? editing.section}`}
            onUpload={(url) => form && setForm({ ...form, url })}
            maxSizeMb={10}
          />
        </div>

        <Input
          label={t("imageUrl")}
          value={form?.url ?? editing.url}
          onChange={(e) => form && setForm({ ...form, url: e.target.value })}
          placeholder="https://example.com/image.jpg"
        />

        {(form?.url ?? editing.url) && (
          <div className="space-y-2">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{t("ctaPreview")}</p>
            <div className="rounded-lg overflow-hidden border border-surface-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form?.url ?? editing.url} alt="Preview" className="w-full h-40 object-cover" />
            </div>
          </div>
        )}

        <Input
          label={t("altText")}
          value={form?.altText ?? editing.altText ?? ""}
          onChange={(e) => form && setForm({ ...form, altText: e.target.value })}
          placeholder="Image description"
        />
        <Input
          label={t("sortOrder")}
          type="number"
          value={String(form?.sortOrder ?? editing.sortOrder)}
          onChange={(e) => form && setForm({ ...form, sortOrder: Number(e.target.value) })}
        />

        <div className="flex gap-2 pt-4">
          <Button loading={loading} onClick={handleSave}>{t("save")}</Button>
          <Button variant="ghost" onClick={onClose}>{t("cancel")}</Button>
        </div>
      </div>
    </SlideOver>
  );
}
