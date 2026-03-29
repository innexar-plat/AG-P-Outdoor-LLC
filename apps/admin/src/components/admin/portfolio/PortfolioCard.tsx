"use client";

import { useI18n } from "@/lib/i18n";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { PortfolioItem } from "./types";

interface PortfolioCardProps {
  item: PortfolioItem;
  index: number;
  total: number;
  mobileReorderMode?: boolean;
  disablePreviewClick?: boolean;
  isDragging?: boolean;
  isDragOver?: boolean;
  onReorder: (id: number, direction: "up" | "down") => void;
  onDragStart?: (id: number) => void;
  onDragOver?: (id: number) => void;
  onDrop?: (id: number) => void;
  onDragEnd?: () => void;
  onToggleVisibility: (item: PortfolioItem) => void;
  onEdit: (item: PortfolioItem) => void;
  onDelete: (id: number) => void;
  onPreview: (url: string) => void;
}

export function PortfolioCard({
  item,
  index,
  total,
  mobileReorderMode = false,
  disablePreviewClick = false,
  isDragging = false,
  isDragOver = false,
  onReorder,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onToggleVisibility,
  onEdit,
  onDelete,
  onPreview,
}: PortfolioCardProps) {
  const { t } = useI18n();
  const canMoveUp = index > 0;
  const canMoveDown = index < total - 1;

  return (
    <Card
      hover
      draggable
      onDragStart={() => onDragStart?.(item.id)}
      onDragOver={(event) => {
        event.preventDefault();
        onDragOver?.(item.id);
      }}
      onDrop={(event) => {
        event.preventDefault();
        onDrop?.(item.id);
      }}
      onDragEnd={() => onDragEnd?.()}
      className={`${isDragging ? "opacity-50" : ""} ${isDragOver ? "ring-2 ring-brand-500" : ""}`.trim()}
    >
      <div
        className={`relative h-44 bg-slate-100 overflow-hidden rounded-t-xl ${disablePreviewClick ? "cursor-default" : "cursor-pointer"} group`}
        onClick={() => {
          if (!disablePreviewClick) {
            onPreview(item.imageUrl);
          }
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <svg className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
          </svg>
        </div>
        <div className="absolute top-2 right-2 flex gap-1">
          <Badge variant={item.visible ? "success" : "warning"}>
            {item.visible ? t("visible") : t("hidden")}
          </Badge>
        </div>
      </div>
      <CardBody className="space-y-2">
        <h3 className="font-semibold text-sm">{item.title}</h3>
        {item.categories && item.categories.length > 0 && (
          <Badge>{item.categories[0].name}</Badge>
        )}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map((tag) => (
              <Badge key={tag.id} variant="warning">{tag.name}</Badge>
            ))}
            {item.tags.length > 3 && <Badge variant="warning">+{item.tags.length - 3}</Badge>}
          </div>
        )}
        <div className="flex items-center gap-1 pt-2">
          <Button size="sm" variant="ghost" onClick={() => onReorder(item.id, "up")} disabled={!canMoveUp}>↑</Button>
          <Button size="sm" variant="ghost" onClick={() => onReorder(item.id, "down")} disabled={!canMoveDown}>↓</Button>
          <Button size="sm" variant="ghost" onClick={() => onToggleVisibility(item)}>
            {item.visible ? "👁" : "👁‍🗨"}
          </Button>
          <Button size="sm" variant="secondary" onClick={() => onEdit(item)}>
            {t("edit")}
          </Button>
          <Button size="sm" variant="danger" onClick={() => onDelete(item.id)}>
            {t("remove")}
          </Button>
        </div>

        {mobileReorderMode && (
          <div className="grid grid-cols-2 gap-2 pt-2 sm:hidden">
            <Button
              size="sm"
              variant="secondary"
              className="w-full"
              onClick={() => onReorder(item.id, "up")}
              disabled={!canMoveUp}
            >
              {t("moveUp")}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="w-full"
              onClick={() => onReorder(item.id, "down")}
              disabled={!canMoveDown}
            >
              {t("moveDown")}
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
