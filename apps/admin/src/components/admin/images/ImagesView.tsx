"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PAGE_SECTIONS, SECTIONS, EMPTY_SLOT, SLOT_DEFINITIONS } from "./types";
import type { SiteImage } from "./types";
import { ImageCard } from "./ImageCard";
import { ImagePreviewModal } from "./ImagePreviewModal";
import { ImageEditorForm } from "./ImageEditorForm";
import { displayLabel } from "./utils";

interface ImagesViewProps {
  images: SiteImage[];
}

/** Enhanced site images management with preview modal */
export function ImagesView({ images: initial }: ImagesViewProps) {
  const { t } = useI18n();
  const [images, setImages] = useState(initial);
  const [editing, setEditing] = useState<SiteImage | null>(null);
  const [success, setSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("all");
  const [previewImg, setPreviewImg] = useState<SiteImage | null>(null);

  const filtered = activeSection === "all"
    ? images
    : images.filter((img) => img.section.toLowerCase() === activeSection.toLowerCase());

  const grouped = PAGE_SECTIONS.reduce(
    (acc, sectionKey, idx) => {
      const sectionLabel = SECTIONS[idx] ?? sectionKey;
      acc[sectionLabel] = filtered.filter((img) => img.section.toLowerCase() === sectionKey);
      return acc;
    },
    {} as Record<string, SiteImage[]>,
  );

  async function handleSave(data: SiteImage): Promise<void> {
    const payload: Record<string, unknown> = {
      section: data.section.toLowerCase(),
      slotKey: data.slotKey.trim(),
      label: data.label.trim(),
      url: (data.url ?? "").trim(),
      altText: data.altText ?? null,
      displayType: data.displayType || "single",
      sortOrder: typeof data.sortOrder === "number" ? data.sortOrder : 0,
    };
    if (Array.isArray(data.carouselItems) && data.carouselItems.length > 0) {
      payload.carouselItems = data.carouselItems;
    }
    if (typeof data.carouselInterval === "number") payload.carouselInterval = data.carouselInterval;
    if (data.carouselEffect) payload.carouselEffect = data.carouselEffect;

    const res = await fetch("/admin/api/admin/images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = (await res.json()) as { data?: SiteImage; error?: string };
    if (!res.ok) {
      throw new Error(json.error ?? `Request failed (${res.status})`);
    }
    const saved = json.data;
    if (!saved) throw new Error("No data returned");
    if (data.id === 0) {
      setImages((prev) => [...prev, saved]);
    } else {
      setImages((prev) => prev.map((i) => (i.slotKey === saved.slotKey ? saved : i)));
    }
    setSuccess(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("siteImages")}
        description={t("siteImagesDesc")}
        actions={
          <Button
            onClick={() => {
              const section = activeSection === "all" ? "home" : activeSection;
              const slots = SLOT_DEFINITIONS[section as keyof typeof SLOT_DEFINITIONS];
              const first = slots?.[0];
              const slotKey = first
                ? `${section.replace(/-/g, "_")}_${first.slotKey}`
                : `${section.replace(/-/g, "_")}_hero`;
              const label = first?.label ?? "Hero";
              const existing = images.find((i) => i.slotKey === slotKey);
              setEditing(
                existing ?? {
                  ...EMPTY_SLOT,
                  section,
                  slotKey,
                  label,
                  sortOrder: images.length,
                }
              );
            }}
          >
            {t("addSlot")}
          </Button>
        }
      />

      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3">
          <p className="text-sm text-green-700">{t("savedSuccess")}</p>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <Button
          variant={activeSection === "all" ? "primary" : "outline"}
          size="sm"
          onClick={() => setActiveSection("all")}
        >
          {t("all")}
        </Button>
        {PAGE_SECTIONS.map((s) => (
          <Button
            key={s}
            variant={activeSection === s ? "primary" : "outline"}
            size="sm"
            onClick={() => setActiveSection(s)}
          >
            {SECTIONS[PAGE_SECTIONS.indexOf(s)] ?? s}
          </Button>
        ))}
      </div>

      {SECTIONS.map((sectionLabel) => {
        const sectionImages = grouped[sectionLabel] ?? [];
        const sectionKey = PAGE_SECTIONS[SECTIONS.indexOf(sectionLabel)] ?? sectionLabel.toLowerCase();
        if (sectionImages.length === 0 && activeSection !== "all" && activeSection !== sectionKey) return null;
        if (sectionImages.length === 0) return null;
        return (
          <div key={sectionLabel}>
            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3">
              {sectionLabel}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sectionImages.map((img) => (
                <ImageCard
                  key={img.slotKey}
                  img={img}
                  onEdit={setEditing}
                  onPreview={setPreviewImg}
                />
              ))}
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <Card>
          <CardBody className="text-center py-12 text-slate-400">{t("noData")}</CardBody>
        </Card>
      )}

      {previewImg && (
        <ImagePreviewModal
          img={previewImg}
          onClose={() => setPreviewImg(null)}
          displayLabel={(type) => displayLabel(type, t)}
        />
      )}

      <ImageEditorForm
        editing={editing}
        onClose={() => setEditing(null)}
        onSave={handleSave}
      />
    </div>
  );
}
