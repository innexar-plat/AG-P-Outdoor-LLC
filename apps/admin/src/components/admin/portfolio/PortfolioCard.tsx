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
  onReorder: (id: number, direction: "up" | "down") => void;
  onToggleVisibility: (item: PortfolioItem) => void;
  onEdit: (item: PortfolioItem) => void;
  onDelete: (id: number) => void;
  onPreview: (url: string) => void;
}

export function PortfolioCard({
  item,
  index,
  total,
  onReorder,
  onToggleVisibility,
  onEdit,
  onDelete,
  onPreview,
}: PortfolioCardProps) {
  const { t } = useI18n();

  return (
    <Card hover>
      <div
        className="relative h-44 bg-slate-100 overflow-hidden rounded-t-xl cursor-pointer group"
        onClick={() => onPreview(item.imageUrl)}
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
        {item.category && (
          <Badge>{t(item.category as "residential" | "commercial" | "sports")}</Badge>
        )}
        <div className="flex items-center gap-1 pt-2">
          <Button size="sm" variant="ghost" onClick={() => onReorder(item.id, "up")} disabled={index === 0}>↑</Button>
          <Button size="sm" variant="ghost" onClick={() => onReorder(item.id, "down")} disabled={index === total - 1}>↓</Button>
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
      </CardBody>
    </Card>
  );
}
