"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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

type CategoryFilter = "all" | "none" | number;

function hasCategory(item: PortfolioItem, categoryId: number) {
  return Array.isArray(item.categories) && item.categories.some((category) => category.id === categoryId);
}

function matchesCategoryFilter(item: PortfolioItem, filter: CategoryFilter) {
  if (filter === "all") return true;
  if (filter === "none") return !item.categories || item.categories.length === 0;
  return hasCategory(item, filter);
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
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);
  const [mobileReorderMode, setMobileReorderMode] = useState(false);
  const [taxonomyOpen, setTaxonomyOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [categoryDrafts, setCategoryDrafts] = useState<Record<number, string>>({});
  const [tagDrafts, setTagDrafts] = useState<Record<number, string>>({});

  const filterCategories = useMemo(() => {
    const itemCategories: TaxonomyOption[] = items
      .flatMap((item) => item.categories ?? [])
      .map((category) => ({ id: category.id, name: category.name, slug: category.slug }));

    const map = new Map<number, TaxonomyOption>();
    for (const category of [...categories, ...itemCategories]) {
      map.set(category.id, category);
    }

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [categories, items]);

  const filteredItems = useMemo(
    () => items.filter((item) => matchesCategoryFilter(item, categoryFilter)),
    [items, categoryFilter],
  );

  const nextSortOrderForNewItem = useMemo(() => {
    if (filteredItems.length === 0) return items.length;
    return Math.max(...filteredItems.map((item) => item.sortOrder)) + 1;
  }, [filteredItems, items.length]);

  const syncCategoryOnItems = useCallback((category: TaxonomyOption) => {
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        categories: item.categories?.map((current) =>
          current.id === category.id ? { ...current, name: category.name, slug: category.slug } : current,
        ),
      })),
    );
  }, []);

  const syncTagOnItems = useCallback((tag: TaxonomyOption) => {
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        tags: item.tags?.map((current) =>
          current.id === tag.id ? { ...current, name: tag.name, slug: tag.slug } : current,
        ),
      })),
    );
  }, []);

  const removeCategoryFromItems = useCallback((categoryId: number) => {
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        categories: item.categories?.filter((category) => category.id !== categoryId) ?? [],
      })),
    );
    setCategoryFilter((current) => (current === categoryId ? "all" : current));
  }, []);

  const removeTagFromItems = useCallback((tagId: number) => {
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        tags: item.tags?.filter((tag) => tag.id !== tagId) ?? [],
      })),
    );
  }, []);

  const applyTaxonomyCreated = useCallback(
    (next: { type: "category" | "tag"; item: TaxonomyOption }) => {
      if (next.type === "category") {
        setCategories((prev) => [next.item, ...prev.filter((item) => item.id !== next.item.id)]);
        setCategoryDrafts((prev) => ({ ...prev, [next.item.id]: next.item.name }));
      } else {
        setTags((prev) => [next.item, ...prev.filter((item) => item.id !== next.item.id)]);
        setTagDrafts((prev) => ({ ...prev, [next.item.id]: next.item.name }));
      }
    },
    [],
  );

  const applyTaxonomyDeleted = useCallback(
    (next: { type: "category" | "tag"; id: number }) => {
      if (next.type === "category") {
        setCategories((prev) => prev.filter((item) => item.id !== next.id));
        setCategoryDrafts((prev) => {
          const copy = { ...prev };
          delete copy[next.id];
          return copy;
        });
        removeCategoryFromItems(next.id);
      } else {
        setTags((prev) => prev.filter((item) => item.id !== next.id));
        setTagDrafts((prev) => {
          const copy = { ...prev };
          delete copy[next.id];
          return copy;
        });
        removeTagFromItems(next.id);
      }
    },
    [removeCategoryFromItems, removeTagFromItems],
  );

  const loadTaxonomy = useCallback(async () => {
    try {
      const [categoriesRes, tagsRes] = await Promise.all([
        fetch("/admin/api/admin/portfolio/categories"),
        fetch("/admin/api/admin/portfolio/tags"),
      ]);

      const categoriesJson = await categoriesRes.json().catch(() => ({ data: [] }));
      const tagsJson = await tagsRes.json().catch(() => ({ data: [] }));

      const nextCategories = Array.isArray(categoriesJson.data) ? categoriesJson.data : [];
      const nextTags = Array.isArray(tagsJson.data) ? tagsJson.data : [];

      setCategories(nextCategories);
      setTags(nextTags);
      setCategoryDrafts(Object.fromEntries(nextCategories.map((item: TaxonomyOption) => [item.id, item.name])));
      setTagDrafts(Object.fromEntries(nextTags.map((item: TaxonomyOption) => [item.id, item.name])));
    } catch {
      setCategories([]);
      setTags([]);
      setCategoryDrafts({});
      setTagDrafts({});
    }
  }, []);

  useEffect(() => {
    loadTaxonomy();
  }, [loadTaxonomy]);

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
        await loadTaxonomy();
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
      await loadTaxonomy();
      router.refresh();
    }
  }

  async function createTaxonomy(type: "category" | "tag") {
    const isCategory = type === "category";
    const name = (isCategory ? newCategoryName : newTagName).trim();
    if (!name) return;

    const endpoint = isCategory ? "/admin/api/admin/portfolio/categories" : "/admin/api/admin/portfolio/tags";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json?.data) {
      throw new Error(json?.error ?? t("requestFailed"));
    }

    applyTaxonomyCreated({ type, item: json.data });
    if (isCategory) {
      setNewCategoryName("");
    } else {
      setNewTagName("");
    }
  }

  async function renameTaxonomy(type: "category" | "tag", item: TaxonomyOption) {
    const isCategory = type === "category";
    const name = (isCategory ? categoryDrafts[item.id] : tagDrafts[item.id])?.trim();
    if (!name || name === item.name) return;

    const endpoint = isCategory
      ? `/admin/api/admin/portfolio/categories/${item.id}`
      : `/admin/api/admin/portfolio/tags/${item.id}`;

    const res = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json?.data) {
      throw new Error(json?.error ?? t("requestFailed"));
    }

    if (isCategory) {
      setCategories((prev) => prev.map((current) => (current.id === item.id ? json.data : current)));
      setCategoryDrafts((prev) => ({ ...prev, [item.id]: json.data.name }));
      syncCategoryOnItems(json.data);
    } else {
      setTags((prev) => prev.map((current) => (current.id === item.id ? json.data : current)));
      setTagDrafts((prev) => ({ ...prev, [item.id]: json.data.name }));
      syncTagOnItems(json.data);
    }
  }

  async function deleteTaxonomy(type: "category" | "tag", item: TaxonomyOption) {
    const confirmMessage = type === "category" ? t("confirmRemoveCategory") : t("confirmRemoveTag");
    if (!confirm(confirmMessage)) return;

    const endpoint = type === "category"
      ? `/admin/api/admin/portfolio/categories/${item.id}`
      : `/admin/api/admin/portfolio/tags/${item.id}`;

    const res = await fetch(endpoint, { method: "DELETE" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json?.error ?? t("requestFailed"));
    }

    applyTaxonomyDeleted({ type, id: item.id });
  }

  async function handleDelete(id: number) {
    if (!confirm(t("confirmRemoveProject"))) return;
    await fetch(`${apiBase}/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
    router.refresh();
  }

  async function handleReorder(id: number, direction: "up" | "down") {
    const idx = filteredItems.findIndex((i) => i.id === id);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= filteredItems.length) return;

    const a = filteredItems[idx];
    const b = filteredItems[swapIdx];
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

    const newItems = items.map((current) => {
      if (current.id === a.id) return { ...current, sortOrder: b.sortOrder };
      if (current.id === b.id) return { ...current, sortOrder: a.sortOrder };
      return current;
    });
    newItems.sort((x, y) => x.sortOrder - y.sortOrder);
    setItems(newItems);
  }

  async function handleDropReorder(targetId: number) {
    if (draggingId == null || draggingId === targetId) {
      setDragOverId(null);
      return;
    }

    const sourceIdx = filteredItems.findIndex((item) => item.id === draggingId);
    const targetIdx = filteredItems.findIndex((item) => item.id === targetId);
    if (sourceIdx < 0 || targetIdx < 0) {
      setDragOverId(null);
      return;
    }

    const reordered = [...filteredItems];
    const [moved] = reordered.splice(sourceIdx, 1);
    reordered.splice(targetIdx, 0, moved);

    const sortOrders = [...filteredItems.map((item) => item.sortOrder)].sort((a, b) => a - b);
    const nextOrderById = new Map<number, number>();
    reordered.forEach((item, idx) => {
      nextOrderById.set(item.id, sortOrders[idx]);
    });

    const updates = reordered
      .map((item) => ({
        id: item.id,
        sortOrder: nextOrderById.get(item.id) ?? item.sortOrder,
        currentSortOrder: item.sortOrder,
      }))
      .filter((entry) => entry.sortOrder !== entry.currentSortOrder);

    if (updates.length === 0) {
      setDragOverId(null);
      setDraggingId(null);
      return;
    }

    await Promise.all(
      updates.map((entry) =>
        fetch(`${apiBase}/${entry.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: entry.sortOrder }),
        }),
      ),
    );

    const nextItems = items
      .map((item) => {
        const nextSortOrder = nextOrderById.get(item.id);
        return nextSortOrder != null ? { ...item, sortOrder: nextSortOrder } : item;
      })
      .sort((a, b) => a.sortOrder - b.sortOrder);

    setItems(nextItems);
    setDragOverId(null);
    setDraggingId(null);
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
          <Button
            onClick={() => {
              const selectedCategory =
                typeof categoryFilter === "number"
                  ? filterCategories.find((category) => category.id === categoryFilter)
                  : null;

              setEditing({
                ...EMPTY,
                sortOrder: nextSortOrderForNewItem,
                category: selectedCategory?.slug ?? EMPTY.category,
                categories: selectedCategory
                  ? [{ id: selectedCategory.id, name: selectedCategory.name, slug: selectedCategory.slug }]
                  : [],
              });
            }}
          >
            {t("newProject")}
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant={mobileReorderMode ? "secondary" : "ghost"}
          onClick={() => setMobileReorderMode((prev) => !prev)}
        >
          {mobileReorderMode ? t("doneOrdering") : t("orderMode")}
        </Button>
        <Button
          size="sm"
          variant={categoryFilter === "all" ? "secondary" : "ghost"}
          onClick={() => setCategoryFilter("all")}
        >
          {t("allCategories")} ({items.length})
        </Button>
        {filterCategories.map((category) => {
          const count = items.filter((item) => hasCategory(item, category.id)).length;
          return (
            <Button
              key={category.id}
              size="sm"
              variant={categoryFilter === category.id ? "secondary" : "ghost"}
              onClick={() => setCategoryFilter(category.id)}
            >
              {category.name} ({count})
            </Button>
          );
        })}
        <Button
          size="sm"
          variant={categoryFilter === "none" ? "secondary" : "ghost"}
          onClick={() => setCategoryFilter("none")}
        >
          {t("uncategorized")} ({items.filter((item) => !item.categories || item.categories.length === 0).length})
        </Button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <Card>
        <CardBody className="space-y-5">
          <button
            type="button"
            onClick={() => setTaxonomyOpen((prev) => !prev)}
            className="flex w-full items-center justify-between gap-3 text-left"
          >
            <div>
              <h3 className="text-sm font-semibold text-slate-900">{t("manageTaxonomy")}</h3>
              <p className="text-xs text-slate-500">
                {categories.length} {t("categoriesLabel").toLowerCase()} • {tags.length} {t("tagsLabel").toLowerCase()}
              </p>
            </div>
            <span className="text-sm font-medium text-slate-600">{taxonomyOpen ? "Ocultar" : "Expandir"}</span>
          </button>

          {taxonomyOpen && (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-end gap-2">
                  <Input
                    label={t("categoriesLabel")}
                    value={newCategoryName}
                    onChange={(event) => setNewCategoryName(event.target.value)}
                    placeholder={t("addCategory")}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={async () => {
                      try {
                        await createTaxonomy("category");
                      } catch (err) {
                        setError(err instanceof Error ? err.message : String(err));
                      }
                    }}
                  >
                    {t("addCategory")}
                  </Button>
                </div>

                {categories.length === 0 && <p className="text-sm text-slate-500">{t("noCategories")}</p>}

                <div className="space-y-3 max-h-[32rem] overflow-y-auto pr-1">
                  {categories.map((category) => (
                    <div key={category.id} className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3 sm:flex-row sm:items-center">
                      <Input
                        value={categoryDrafts[category.id] ?? category.name}
                        onChange={(event) =>
                          setCategoryDrafts((prev) => ({ ...prev, [category.id]: event.target.value }))
                        }
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={async () => {
                            try {
                              await renameTaxonomy("category", category);
                            } catch (err) {
                              setError(err instanceof Error ? err.message : String(err));
                            }
                          }}
                        >
                          {t("saveChanges")}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          onClick={async () => {
                            try {
                              await deleteTaxonomy("category", category);
                            } catch (err) {
                              setError(err instanceof Error ? err.message : String(err));
                            }
                          }}
                        >
                          {t("remove")}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-end gap-2">
                  <Input
                    label={t("tagsLabel")}
                    value={newTagName}
                    onChange={(event) => setNewTagName(event.target.value)}
                    placeholder={t("addTag")}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={async () => {
                      try {
                        await createTaxonomy("tag");
                      } catch (err) {
                        setError(err instanceof Error ? err.message : String(err));
                      }
                    }}
                  >
                    {t("addTag")}
                  </Button>
                </div>

                {tags.length === 0 && <p className="text-sm text-slate-500">{t("noTags")}</p>}

                <div className="space-y-3 max-h-[32rem] overflow-y-auto pr-1">
                  {tags.map((tag) => (
                    <div key={tag.id} className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3 sm:flex-row sm:items-center">
                      <Input
                        value={tagDrafts[tag.id] ?? tag.name}
                        onChange={(event) =>
                          setTagDrafts((prev) => ({ ...prev, [tag.id]: event.target.value }))
                        }
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={async () => {
                            try {
                              await renameTaxonomy("tag", tag);
                            } catch (err) {
                              setError(err instanceof Error ? err.message : String(err));
                            }
                          }}
                        >
                          {t("saveChanges")}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          onClick={async () => {
                            try {
                              await deleteTaxonomy("tag", tag);
                            } catch (err) {
                              setError(err instanceof Error ? err.message : String(err));
                            }
                          }}
                        >
                          {t("remove")}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {items.length === 0 && (
        <>
          <Card><CardBody className="text-center py-12 text-slate-400">{t("noProjects")}</CardBody></Card>
          <SiteFallbackCard
            items={items}
            onAddFromFallback={(partial) =>
              setEditing({
                ...EMPTY,
                ...partial,
                sortOrder: nextSortOrderForNewItem,
              })
            }
            onPreview={setPreviewImg}
          />
        </>
      )}

      {items.length > 0 && filteredItems.length === 0 && (
        <Card>
          <CardBody className="text-center py-10 text-slate-500">{t("noPhotosForFilter")}</CardBody>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item, idx) => (
          <PortfolioCard
            key={item.id}
            item={item}
            index={idx}
            total={filteredItems.length}
            mobileReorderMode={mobileReorderMode}
            disablePreviewClick={mobileReorderMode}
            isDragging={draggingId === item.id}
            isDragOver={dragOverId === item.id && draggingId !== item.id}
            onReorder={handleReorder}
            onDragStart={(id) => {
              setDraggingId(id);
              setDragOverId(null);
            }}
            onDragOver={(id) => {
              if (draggingId != null && draggingId !== id) {
                setDragOverId(id);
              }
            }}
            onDrop={handleDropReorder}
            onDragEnd={() => {
              setDragOverId(null);
              setDraggingId(null);
            }}
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
        onTaxonomyCreated={applyTaxonomyCreated}
        onTaxonomyDeleted={applyTaxonomyDeleted}
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
