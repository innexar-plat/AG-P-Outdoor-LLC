"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SlideOver } from "@/components/ui/SlideOver";
import { Table, Thead, Th, Td, TableEmpty } from "@/components/ui/Table";

type PageSeoRow = {
  pageKey: string;
  titleTag: string | null;
  metaDescription: string | null;
  ogImage: string | null;
};

const DEFAULT_PAGES = [
  "home",
  "about",
  "services",
  "portfolio",
  "blog",
  "contact",
  "reviews",
  "faq",
  "residential-turf",
  "putting-green",
  "pet-turf",
  "commercial-turf",
  "pavers",
  "drainage-grading",
  "grass-removal",
];

interface SeoViewProps {
  pages: PageSeoRow[];
}

function charColor(len: number, max: number): string {
  if (len === 0) return "text-slate-400";
  if (len <= max * 0.7) return "text-green-600";
  if (len <= max) return "text-amber-600";
  return "text-red-600";
}

function formatPageLabel(key: string): string {
  return key
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** SEO editor with character counters. Uses SlideOver like BannersView/PortfolioView. */
export function SeoView({ pages: initial }: SeoViewProps) {
  const { t } = useI18n();
  const router = useRouter();
  const allPages = DEFAULT_PAGES.map((key) => {
    const existing = initial.find((p) => p.pageKey === key);
    return existing ?? { pageKey: key, titleTag: "", metaDescription: "", ogImage: "" };
  });

  const [pages, setPages] = useState(allPages);
  const [editing, setEditing] = useState<PageSeoRow | null>(null);
  const [form, setForm] = useState<PageSeoRow>({ pageKey: "", titleTag: "", metaDescription: "", ogImage: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openEditor(page: PageSeoRow) {
    setEditing(page);
    setForm({
      pageKey: page.pageKey,
      titleTag: page.titleTag ?? "",
      metaDescription: page.metaDescription ?? "",
      ogImage: page.ogImage ?? "",
    });
    setError(null);
  }

  async function handleSave() {
    if (!editing) return;
    setLoading(true);
    setError(null);
    try {
      const payload = {
        pageKey: form.pageKey,
        titleTag: form.titleTag?.trim() || null,
        metaDescription: form.metaDescription?.trim() || null,
        ogImage: form.ogImage?.trim() || null,
      };
      const res = await fetch("/api/admin/seo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setPages((prev) => prev.map((p) => (p.pageKey === form.pageKey ? json.data : p)));
        setEditing(null);
        router.refresh();
      } else {
        setError(json.error || "Failed to save");
      }
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("seo")} description={t("seoDesc")} />

      <Card>
        <Table>
          <Thead>
            <tr>
              <Th>{t("page")}</Th>
              <Th>{t("titleTag")}</Th>
              <Th>{t("metaDescription")}</Th>
              <Th>{t("actions")}</Th>
            </tr>
          </Thead>
          <tbody>
            {pages.length === 0 && <TableEmpty colSpan={4} message={t("noData")} />}
            {pages.map((page) => (
              <tr key={page.pageKey} className="border-b border-surface-border last:border-0">
                <Td className="font-medium">{formatPageLabel(page.pageKey)}</Td>
                <Td>
                  <span className="text-xs truncate max-w-[200px] block">{page.titleTag || "—"}</span>
                </Td>
                <Td>
                  <span className="text-xs truncate max-w-[260px] block">{page.metaDescription || "—"}</span>
                </Td>
                <Td>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => openEditor(page)}
                  >
                    {t("edit")}
                  </Button>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <SlideOver
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing ? `${formatPageLabel(editing.pageKey)} — SEO` : t("seo")}
      >
        {editing && (
          <div className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            <Input
              label={t("titleTag")}
              value={form.titleTag ?? ""}
              onChange={(e) => setForm({ ...form, titleTag: e.target.value })}
              placeholder="Page title for search engines"
            />
            <p className={`text-xs -mt-2 ${charColor((form.titleTag ?? "").length, 60)}`}>
              {(form.titleTag ?? "").length}/60 {t("charCount")}
            </p>
            <Input
              label={t("metaDescription")}
              value={form.metaDescription ?? ""}
              onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
              placeholder="Short description for search results"
            />
            <p className={`text-xs -mt-2 ${charColor((form.metaDescription ?? "").length, 160)}`}>
              {(form.metaDescription ?? "").length}/160 {t("charCount")}
            </p>
            <Input
              label={t("ogImage")}
              value={form.ogImage ?? ""}
              onChange={(e) => setForm({ ...form, ogImage: e.target.value })}
              placeholder="https://example.com/og-image.jpg"
            />
            <div className="flex gap-2 pt-2">
              <Button type="button" loading={loading} onClick={handleSave}>
                {t("save")}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                {t("cancel")}
              </Button>
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  );
}
