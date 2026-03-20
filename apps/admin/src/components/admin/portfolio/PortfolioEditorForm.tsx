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
  categoryIds?: number[];
  tagIds?: number[];
  _batchImageUrls?: string[];
  _batchMode?: boolean;
};

type TaxonomyOption = { id: number; name: string; slug: string };

interface PortfolioEditorFormProps {
  editing: PortfolioItem | null;
  categories: TaxonomyOption[];
  tags: TaxonomyOption[];
  onClose: () => void;
  onSave: (data: PortfolioSavePayload) => Promise<void>;
  onTaxonomyCreated?: (payload: { type: "category" | "tag"; item: TaxonomyOption }) => void;
}

export function PortfolioEditorForm({
  editing,
  categories,
  tags,
  onClose,
  onSave,
  onTaxonomyCreated,
}: PortfolioEditorFormProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<PortfolioItem | null>(editing);
  const [batchImageUrls, setBatchImageUrls] = useState<string[]>([]);
  const [batchMode, setBatchMode] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newTagName, setNewTagName] = useState("");

  useEffect(() => {
    setForm(editing);
    setBatchImageUrls([]);
    setBatchMode(true);
    setError(null);

    const initialCategoryId = editing?.categories?.[0]?.id ?? null;
    setSelectedCategoryId(initialCategoryId);
    setSelectedTagIds(Array.isArray(editing?.tags) ? editing.tags.map((t) => t.id) : []);
    setNewCategoryName("");
    setNewTagName("");
  }, [editing]);

  if (!editing) return null;

  async function createCategoryQuick() {
    const name = newCategoryName.trim();
    if (!name) return;
    try {
      const res = await fetch("/admin/api/admin/portfolio/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.data) {
        throw new Error(json?.error ?? "Failed to create category");
      }
      onTaxonomyCreated?.({ type: "category", item: json.data });
      setSelectedCategoryId(json.data.id);
      setNewCategoryName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function createTagQuick() {
    const name = newTagName.trim();
    if (!name) return;
    try {
      const res = await fetch("/admin/api/admin/portfolio/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.data) {
        throw new Error(json?.error ?? "Failed to create tag");
      }
      onTaxonomyCreated?.({ type: "tag", item: json.data });
      setSelectedTagIds((prev) => (prev.includes(json.data.id) ? prev : [...prev, json.data.id]));
      setNewTagName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

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
        categoryIds: selectedCategoryId ? [selectedCategoryId] : [],
        tagIds: selectedTagIds,
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
          value={selectedCategoryId ? String(selectedCategoryId) : ""}
          onChange={(e) => {
            const val = Number(e.target.value);
            setSelectedCategoryId(Number.isNaN(val) ? null : val);
            if (form) {
              const selected = categories.find((c) => c.id === val);
              setForm({ ...form, category: selected?.slug ?? null });
            }
          }}
          options={[
            { value: "", label: "No category" },
            ...categories.map((c) => ({ value: String(c.id), label: c.name })),
          ]}
        />

        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <Input
            label="New category"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="e.g. Backyard Transformations"
          />
          <div className="pt-7">
            <Button type="button" variant="secondary" onClick={createCategoryQuick}>
              Add category
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Tags</label>
          <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 p-2">
            {tags.map((tag) => {
              const selected = selectedTagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => {
                    setSelectedTagIds((prev) =>
                      prev.includes(tag.id)
                        ? prev.filter((id) => id !== tag.id)
                        : [...prev, tag.id],
                    );
                  }}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    selected
                      ? "bg-brand-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {tag.name}
                </button>
              );
            })}
            {tags.length === 0 && <span className="text-xs text-slate-500">No tags yet</span>}
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <Input
            label="New tag"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="e.g. premium, modern, pet-friendly"
          />
          <div className="pt-7">
            <Button type="button" variant="secondary" onClick={createTagQuick}>
              Add tag
            </Button>
          </div>
        </div>

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
