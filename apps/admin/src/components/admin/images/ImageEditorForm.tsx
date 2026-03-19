"use client";

import { useState, useEffect, useRef, type PointerEvent } from "react";
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

function FocalPointPicker({
  url,
  focalX,
  focalY,
  onChange,
}: {
  url: string;
  focalX: number;
  focalY: number;
  onChange: (x: number, y: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  function getPos(e: PointerEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return {
      x: Math.round(Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100))),
      y: Math.round(Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100))),
    };
  }

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    const pos = getPos(e);
    if (pos) onChange(pos.x, pos.y);
    setDragging(true);
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    const pos = getPos(e);
    if (pos) onChange(pos.x, pos.y);
  }

  function handlePointerUp() {
    setDragging(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-700">Ponto Focal</label>
        <span className="text-xs text-slate-400 tabular-nums">{focalX}% / {focalY}%</span>
      </div>
      <p className="text-xs text-slate-500 -mt-2">Clique ou arraste para definir onde a imagem e centralizada</p>

      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative rounded-lg overflow-hidden cursor-crosshair border border-slate-200 select-none"
        style={{ aspectRatio: "16/9" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt="Selecionar ponto focal"
          className="w-full h-full object-cover pointer-events-none"
          draggable={false}
          style={{ objectPosition: `${focalX}% ${focalY}%` }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              linear-gradient(to right, transparent calc(${focalX}% - 0.5px), rgba(255,255,255,0.55) calc(${focalX}% - 0.5px), rgba(255,255,255,0.55) calc(${focalX}% + 0.5px), transparent calc(${focalX}% + 0.5px)),
              linear-gradient(to bottom, transparent calc(${focalY}% - 0.5px), rgba(255,255,255,0.55) calc(${focalY}% - 0.5px), rgba(255,255,255,0.55) calc(${focalY}% + 0.5px), transparent calc(${focalY}% + 0.5px))
            `,
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{ left: `${focalX}%`, top: `${focalY}%`, transform: "translate(-50%, -50%)" }}
        >
          <div className="w-5 h-5 rounded-full border-2 border-white shadow-lg bg-white/20 ring-1 ring-black/30" />
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-medium text-slate-500">Previa da area de exibicao</p>
        <div className="relative rounded-lg overflow-hidden border border-slate-200" style={{ aspectRatio: "16/6" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt="Previa"
            className="w-full h-full object-cover"
            style={{ objectPosition: `${focalX}% ${focalY}%` }}
            draggable={false}
          />
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <span className="text-[10px] text-white/80 bg-black/35 px-2 py-0.5 rounded-full">
              area visivel no site
            </span>
          </div>
        </div>
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
  const [heroMediaType, setHeroMediaType] = useState<"image" | "video">("image");

  useEffect(() => {
    setForm(editing);
    setError(null);

    const currentUrl = editing?.url ?? "";
    const isVideo = /\.(mp4|webm|mov|avi)(\?|$)/i.test(currentUrl);
    setHeroMediaType(isVideo ? "video" : "image");
  }, [editing]);

  const focalX = form?.focalX ?? 50;
  const focalY = form?.focalY ?? 50;

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

        {(() => {
          const isHero = (form?.slotKey ?? editing.slotKey ?? "").includes("hero");
          const currentUrl = form?.url ?? editing.url ?? "";
          const isVideoUrl = /\.(mp4|webm|mov|avi)(\?|$)/i.test(currentUrl);
          const uploadAccept = isHero
            ? heroMediaType === "video"
              ? "video/mp4,video/webm,video/quicktime"
              : "image/*"
            : "image/*";
          return (
            <>
              {isHero && (
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">Hero media type</label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={heroMediaType === "image" ? "primary" : "outline"}
                      onClick={() => setHeroMediaType("image")}
                    >
                      Image
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={heroMediaType === "video" ? "primary" : "outline"}
                      onClick={() => setHeroMediaType("video")}
                    >
                      Video
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500">
                    Select Video to upload MP4/WebM for hero backgrounds.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {isHero ? t("fileUpload") + " (image or video)" : t("fileUpload")}
                </label>
                <FileUpload
                  folder={`site-images/${form?.section ?? editing.section}`}
                  onUpload={(url) => form && setForm({ ...form, url })}
                  maxSizeMb={isHero ? 200 : 10}
                  accept={uploadAccept}
                />
              </div>

              <Input
                label={t("imageUrl")}
                value={currentUrl}
                onChange={(e) => form && setForm({ ...form, url: e.target.value })}
                placeholder={isHero ? "https://cdn.example.com/hero.mp4  or  /image.jpg" : "https://example.com/image.jpg"}
              />

              {currentUrl && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{t("ctaPreview")}</p>
                  {isVideoUrl ? (
                    <div className="rounded-lg overflow-hidden border border-surface-border">
                      <video
                        src={currentUrl}
                        className="w-full h-40 object-cover"
                        muted
                        playsInline
                        controls
                      />
                    </div>
                  ) : (
                    <FocalPointPicker
                      url={currentUrl}
                      focalX={focalX}
                      focalY={focalY}
                      onChange={(x, y) => form && setForm({ ...form, focalX: x, focalY: y })}
                    />
                  )}
                </div>
              )}
            </>
          );
        })()}

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
