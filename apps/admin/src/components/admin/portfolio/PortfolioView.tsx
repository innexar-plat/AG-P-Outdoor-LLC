"use client";

import { useState } from "react";
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

  async function handleSave(data: PortfolioItem) {
    const isNew = data.id === 0;
    const url = isNew ? apiBase : `${apiBase}/${data.id}`;
    const method = isNew ? "POST" : "PUT";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: data.title,
        description: data.description,
        category: data.category,
        imageUrl: data.imageUrl,
        beforeImageUrl: data.beforeImageUrl || null,
        sortOrder: data.sortOrder,
        visible: data.visible,
      }),
    });
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
        onClose={() => setEditing(null)}
        onSave={handleSave}
      />
    </div>
  );
}
