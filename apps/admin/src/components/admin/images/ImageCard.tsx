"use client";

import { useI18n } from "@/lib/i18n";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { SiteImage } from "./types";
import { displayLabel } from "./utils";

interface ImageCardProps {
  img: SiteImage;
  onEdit: (img: SiteImage) => void;
  onPreview: (img: SiteImage) => void;
}

function isVideoUrl(url?: string | null) {
  if (!url) return false;
  return /\.(mp4|webm|mov|avi)(\?|$)/i.test(url);
}

export function ImageCard({ img, onEdit, onPreview }: ImageCardProps) {
  const { t } = useI18n();
  return (
    <Card hover>
      <div
        className="relative h-44 bg-slate-100 overflow-hidden rounded-t-xl cursor-pointer group"
        onClick={() => onPreview(img)}
      >
        {isVideoUrl(img.url) ? (
          <video
            src={img.url ?? undefined}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            muted
            playsInline
            controls
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img.url}
            alt={img.altText ?? img.label}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <svg className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
          </svg>
        </div>
        <div className="absolute top-2 right-2">
          <Badge variant="info">{displayLabel(img.displayType, t)}</Badge>
        </div>
      </div>
      <CardBody className="space-y-2">
        <p className="text-sm font-medium text-slate-700">{img.label}</p>
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400 font-mono truncate">{img.slotKey}</p>
          <p className="text-xs text-slate-400">#{img.sortOrder}</p>
        </div>
        {img.altText && (
          <p className="text-xs text-slate-400 italic truncate">{img.altText}</p>
        )}
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onEdit(img)}
        >
          {t("edit")}
        </Button>
      </CardBody>
    </Card>
  );
}
