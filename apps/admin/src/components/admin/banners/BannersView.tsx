"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SlideOver } from "@/components/ui/SlideOver";
import { Table, Thead, Th, TableEmpty } from "@/components/ui/Table";
import { BannerSizeReference } from "./BannerSizeReference";
import { BannerTableRow } from "./BannerTableRow";
import { BannerEditorForm } from "./BannerEditorForm";
import { EMPTY, type Banner, type Tab } from "./types";

interface BannersViewProps {
  banners: Banner[];
}

export function BannersView({ banners: initial }: BannersViewProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("content");

  async function handleSave() {
    if (!editing) return;
    setLoading(true);
    try {
      const isNew = editing.id === 0;
      const url = isNew ? "/api/admin/banners" : `/api/admin/banners/${editing.id}`;
      const res = await fetch(url, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editing.title,
          subtitle: editing.subtitle,
          imageUrl: editing.imageUrl,
          linkUrl: editing.linkUrl,
          linkText: editing.linkText,
          placement: editing.placement,
          bgColor: editing.bgColor,
          textColor: editing.textColor,
          active: editing.active,
          sortOrder: editing.sortOrder,
          startsAt: editing.startsAt ? new Date(editing.startsAt).toISOString() : null,
          endsAt: editing.endsAt ? new Date(editing.endsAt).toISOString() : null,
          size: editing.size,
          customWidth: editing.customWidth,
          customHeight: editing.customHeight,
          layout: editing.layout,
          animation: editing.animation,
          carouselGroup: editing.carouselGroup,
          carouselInterval: editing.carouselInterval,
          borderRadius: editing.borderRadius,
          opacity: editing.opacity,
        }),
      });
      if (res.ok) {
        const { data } = await res.json();
        if (isNew) setItems((prev) => [...prev, data]);
        else setItems((prev) => prev.map((i) => (i.id === data.id ? data : i)));
        setEditing(null);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm(t("confirmRemoveBanner"))) return;
    await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
    router.refresh();
  }

  async function toggleActive(item: Banner) {
    await fetch(`/api/admin/banners/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !item.active }),
    });
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, active: !i.active } : i)));
  }

  function openEditor(b: Banner) {
    setEditing(b);
    setTab("content");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("banners")}
        description={t("bannersDesc")}
        actions={
          <Button onClick={() => openEditor({ ...EMPTY, sortOrder: items.length })}>
            {t("newBanner")}
          </Button>
        }
      />

      <BannerSizeReference />

      <Card>
        <Table>
          <Thead>
            <tr>
              <Th>{t("title")}</Th>
              <Th>{t("bannerSize")}</Th>
              <Th>{t("bannerLayout")}</Th>
              <Th>{t("bannerPlacement")}</Th>
              <Th>{t("bannerAnimation")}</Th>
              <Th>{t("status")}</Th>
              <Th>{t("actions")}</Th>
            </tr>
          </Thead>
          <tbody>
            {items.length === 0 && <TableEmpty colSpan={7} message={t("noBanners")} />}
            {items.map((item) => (
              <BannerTableRow
                key={item.id}
                item={item}
                onToggleActive={toggleActive}
                onEdit={openEditor}
                onDelete={handleDelete}
              />
            ))}
          </tbody>
        </Table>
      </Card>

      <SlideOver
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id === 0 ? t("newBanner") : t("editBanner")}
      >
        {editing && (
          <BannerEditorForm
            editing={editing}
            tab={tab}
            loading={loading}
            onTabChange={setTab}
            onEditingChange={setEditing}
            onSave={handleSave}
            onCancel={() => setEditing(null)}
          />
        )}
      </SlideOver>
    </div>
  );
}
