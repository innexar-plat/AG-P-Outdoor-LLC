"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EMPTY } from "./types";
import type { PortfolioItem } from "./types";
import { SiteFallbackCard } from "./SiteFallbackCard";
import { PortfolioCard } from "./PortfolioCard";
import { ImagePreviewModal } from "./ImagePreviewModal";
import { PortfolioEditorForm } from "./PortfolioEditorForm";

type PortfolioSavePayload = PortfolioItem & {
  categoryIds?: number[];
  tagIds?: number[];
  _batchImageUrls?: string[];
  _batchMode?: boolean;
};

type TaxonomyOption = { id: number; name: string; slug: string };

interface PortfolioViewProps {
  items: PortfolioItem[];
}

/** Portfolio CRUD with file upload, reorder and visibility toggle */
export function PortfolioView({ items: initial }: PortfolioViewProps) {
  const { t } = useI18n();
  const router = useRouter();
  const apiBase = "/admin/api/admin/portfolio";
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<PortfolioItem | null>(null);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<TaxonomyOption[]>([]);
  const [tags, setTags] = useState<TaxonomyOption[]>([]);

  useEffect(() => {
    async function loadTaxonomy() {
      try {
        const [categoriesRes, tagsRes] = await Promise.all([
          fetch("/admin/api/admin/portfolio/categories"),
          fetch("/admin/api/admin/portfolio/tags"),
        ]);

        const categoriesJson = await categoriesRes.json().catch(() => ({ data: [] }));
        const tagsJson = await tagsRes.json().catch(() => ({ data: [] }));

        setCategories(Array.isArray(categoriesJson.data) ? categoriesJson.data : []);
        setTags(Array.isArray(tagsJson.data) ? tagsJson.data : []);
      } catch {
        setCategories([]);
        setTags([]);
      }
    }

    loadTaxonomy();
  }, []);

  async function handleSave(data: PortfolioSavePayload) {
    setError(null);
    const isNew = data.id === 0;
    const uploaded = Array.isArray(data._batchImageUrls) ? data._batchImageUrls.filter(Boolean) : [];
    const baseTitle = (data.title ?? "").trim() || "Portfolio Project";
    const primaryImageUrl = (data.imageUrl ?? "").trim() || uploaded[0] || "";

    if (!primaryImageUrl) {
      throw new Error("Upload at least one image before saving.");
    }

    const shouldBatchCreate = isNew && !!data._batchMode && uploaded.length > 1;

    if (shouldBatchCreate) {
      const created: PortfolioItem[] = [];
      const failures: string[] = [];
      for (let idx = 0; idx < uploaded.length; idx += 1) {
        const imageUrl = uploaded[idx];
        const batchTitle = uploaded.length > 1 ? `${baseTitle} ${idx + 1}` : baseTitle;
        const res = await fetch(apiBase, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: batchTitle,
            description: data.description,
            category: data.category,
            categoryIds: data.categoryIds,
            tagIds: data.tagIds,
            imageUrl,
            beforeImageUrl: null,
            sortOrder: data.sortOrder + idx,
            visible: data.visible,
          }),
        });
        if (res.ok) {
          const { data: saved } = await res.json();
          created.push(saved);
        } else {
          const json = await res.json().catch(() => ({}));
          failures.push(json.error ?? `Item ${idx + 1}: request failed (${res.status})`);
        }
      }
      if (failures.length > 0) {
        throw new Error(`Failed to create some items: ${failures.join(" | ")}`);
      }
      if (created.length > 0) {
        setItems((prev) => [...prev, ...created]);
        router.refresh();
      }
      return;
    }

    const url = isNew ? apiBase : `${apiBase}/${data.id}`;
    const method = isNew ? "POST" : "PUT";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: baseTitle,
        description: data.description,
        category: data.category,
        categoryIds: data.categoryIds,
        tagIds: data.tagIds,
        imageUrl: primaryImageUrl,
        beforeImageUrl: data.beforeImageUrl || null,
        sortOrder: data.sortOrder,
        visible: data.visible,
      }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error ?? `Request failed (${res.status})`);
    }
    if (res.ok) {
      const { data: saved } = await res.json();
      if (isNew) {
        setItems((prev) => [...prev, saved]);
      } else {
        setItems((prev) => prev.map((i) => (i.id === saved.id ? saved : i)));
      }
      router.refresh();
    }
  }

  async function handleDelete(id: number) {
    if (!confirm(t("confirmRemoveProject"))) return;
    await fetch(`${apiBase}/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
    router.refresh();
  }

  async function handleReorder(id: number, direction: "up" | "down") {
    const idx = items.findIndex((i) => i.id === id);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= items.length) return;

    const a = items[idx];
    const b = items[swapIdx];
    await Promise.all([
      fetch(`${apiBase}/${a.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sortOrder: b.sortOrder }),
      }),
      fetch(`${apiBase}/${b.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sortOrder: a.sortOrder }),
      }),
    ]);
    const newItems = [...items];
    newItems[idx] = { ...b, sortOrder: a.sortOrder };
    newItems[swapIdx] = { ...a, sortOrder: b.sortOrder };
    newItems.sort((x, y) => x.sortOrder - y.sortOrder);
    setItems(newItems);
  }

  async function toggleVisibility(item: PortfolioItem) {
    await fetch(`${apiBase}/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible: !item.visible }),
    });
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, visible: !i.visible } : i)));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("portfolio")}
        description={t("portfolioDesc")}
        actions={
          <Button onClick={() => setEditing({ ...EMPTY, sortOrder: items.length })}>
            {t("newProject")}
          </Button>
        }
      />

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {items.length === 0 && (
        <>
          <Card><CardBody className="text-center py-12 text-slate-400">{t("noProjects")}</CardBody></Card>
          <SiteFallbackCard
            items={items}
            onAddFromFallback={(partial) => setEditing({ ...EMPTY, ...partial, sortOrder: items.length })}
            onPreview={setPreviewImg}
          />
        </>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, idx) => (
          <PortfolioCard
            key={item.id}
            item={item}
            index={idx}
            total={items.length}
            onReorder={handleReorder}
            onToggleVisibility={toggleVisibility}
            onEdit={setEditing}
            onDelete={handleDelete}
            onPreview={setPreviewImg}
          />
        ))}
      </div>

      <ImagePreviewModal
        imageUrl={previewImg}
        onClose={() => setPreviewImg(null)}
      />

      <PortfolioEditorForm
        editing={editing}
        categories={categories}
        tags={tags}
        onClose={() => setEditing(null)}
        onTaxonomyCreated={(next) => {
          if (next.type === "category") {
            setCategories((prev) => [next.item, ...prev.filter((i) => i.id !== next.item.id)]);
          } else {
            setTags((prev) => [next.item, ...prev.filter((i) => i.id !== next.item.id)]);
          }
        }}
        onSave={async (payload) => {
          try {
            await handleSave(payload);
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            setError(message);
            throw err;
          }
        }}
      />
    </div>
  );
}
