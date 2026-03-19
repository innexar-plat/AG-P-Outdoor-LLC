"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { SlideOver } from "@/components/ui/SlideOver";
import { FileUpload } from "@/components/ui/FileUpload";
import { MultiFileUpload } from "@/components/ui/MultiFileUpload";
import type { PortfolioItem } from "./types";

type PortfolioSavePayload = PortfolioItem & {
  _batchImageUrls?: string[];
  _batchMode?: boolean;
};

interface PortfolioEditorFormProps {
  editing: PortfolioItem | null;
  onClose: () => void;
  onSave: (data: PortfolioSavePayload) => Promise<void>;
}

export function PortfolioEditorForm({ editing, onClose, onSave }: PortfolioEditorFormProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<PortfolioItem | null>(editing);
  const [batchImageUrls, setBatchImageUrls] = useState<string[]>([]);
  const [batchMode, setBatchMode] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm(editing);
    setBatchImageUrls([]);
    setBatchMode(true);
    setError(null);
  }, [editing]);

  if (!editing) return null;

  const handleSave = async () => {
    if (!form) return;
    const title = (form.title ?? "").trim();
    const imageUrl = (form.imageUrl ?? "").trim();
    if (!title && batchImageUrls.length <= 1) {
      setError("Title is required.");
      return;
    }
    if (!imageUrl && batchImageUrls.length === 0) {
      setError("Upload at least one image before saving.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSave({
        ...form,
        _batchImageUrls: batchImageUrls,
        _batchMode: batchMode,
      });
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
      title={editing.id === 0 ? t("newProject") : t("editProject")}
    >
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        <Input
          label={t("title")}
          value={form?.title ?? editing.title}
          onChange={(e) => form && setForm({ ...form, title: e.target.value })}
          required
        />
        <Textarea
          label={t("description")}
          value={form?.description ?? editing.description ?? ""}
          onChange={(e) => form && setForm({ ...form, description: e.target.value })}
          rows={4}
        />
        <Select
          label={t("category")}
          value={form?.category ?? editing.category ?? "residential"}
          onChange={(e) => form && setForm({ ...form, category: e.target.value })}
          options={[
            { value: "residential", label: t("residential") },
            { value: "commercial", label: t("commercial") },
            { value: "sports", label: t("sports") },
          ]}
        />

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {t("mainImage")} (or drag multiple images)
          </label>
          <MultiFileUpload
            folder="portfolio"
            maxFiles={15}
            onUpload={(urls) => {
              setBatchImageUrls(urls);
              if (form && urls.length > 0) {
                setForm({ ...form, imageUrl: urls[0] });
              }
              if (urls.length > 1) {
                setBatchMode(true);
              }
            }}
          />
          {batchImageUrls.length > 1 && (
            <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={batchMode}
                onChange={(e) => setBatchMode(e.target.checked)}
                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              Create one project per uploaded image ({batchImageUrls.length} items)
            </label>
          )}
        </div>
        <Input
          label={t("imageUrl")}
          value={form?.imageUrl ?? editing.imageUrl}
          onChange={(e) => form && setForm({ ...form, imageUrl: e.target.value })}
          required
          placeholder="https://example.com/image.jpg"
        />
        {(form?.imageUrl ?? editing.imageUrl) && (
          <div className="rounded-lg overflow-hidden border border-surface-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={form?.imageUrl ?? editing.imageUrl} alt="Main preview" className="w-full h-36 object-cover" />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {t("beforeImage")}
          </label>
          <FileUpload
            folder="portfolio/before"
            onUpload={(url) => form && setForm({ ...form, beforeImageUrl: url })}
          />
        </div>
        <Input
          label={`${t("beforeImage")} URL`}
          value={form?.beforeImageUrl ?? editing.beforeImageUrl ?? ""}
          onChange={(e) => form && setForm({ ...form, beforeImageUrl: e.target.value || null })}
          placeholder="https://example.com/before.jpg"
        />
        {(form?.beforeImageUrl ?? editing.beforeImageUrl) && (
          <div className="rounded-lg overflow-hidden border border-surface-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={form?.beforeImageUrl ?? editing.beforeImageUrl ?? ""} alt="Before preview" className="w-full h-36 object-cover" />
          </div>
        )}

        <Input
          label={t("sortOrder")}
          type="number"
          value={String(form?.sortOrder ?? editing.sortOrder)}
          onChange={(e) => form && setForm({ ...form, sortOrder: Number(e.target.value) })}
        />
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form?.visible ?? editing.visible}
            onChange={(e) => form && setForm({ ...form, visible: e.target.checked })}
            className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <label className="text-sm text-slate-700">{t("visible")}</label>
        </div>
        <div className="flex gap-2 pt-4">
          <Button loading={loading} onClick={handleSave}>{t("save")}</Button>
          <Button variant="ghost" onClick={onClose}>{t("cancel")}</Button>
        </div>
      </div>
    </SlideOver>
  );
}
