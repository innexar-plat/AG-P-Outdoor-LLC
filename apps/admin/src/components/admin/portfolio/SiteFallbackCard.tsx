"use client";

import { useI18n } from "@/lib/i18n";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SITE_FALLBACK, EMPTY } from "./types";
import type { PortfolioItem } from "./types";

interface SiteFallbackCardProps {
  items: PortfolioItem[];
  onAddFromFallback: (item: Partial<PortfolioItem>) => void;
  onPreview: (url: string) => void;
}

export function SiteFallbackCard({ items, onAddFromFallback, onPreview }: SiteFallbackCardProps) {
  const { t } = useI18n();

  return (
    <Card>
      <CardBody>
        <h3 className="font-semibold text-slate-700 mb-2">{t("siteFallback")}</h3>
        <p className="text-sm text-slate-500 mb-4">{t("siteFallbackDesc")}</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {SITE_FALLBACK.map((fb, idx) => (
            <div
              key={idx}
              className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50"
            >
              <div
                className="relative h-36 bg-slate-100 cursor-pointer group"
                onClick={() => onPreview(fb.url)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={fb.url}
                  alt={fb.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </div>
              <div className="p-3 space-y-2">
                <p className="font-medium text-sm text-slate-800 truncate">{fb.title}</p>
                <Badge variant="default">{fb.category}</Badge>
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    const cat = fb.category.toLowerCase();
                    const category = cat === "commercial" ? "commercial" : cat.includes("putting") ? "sports" : "residential";
                    onAddFromFallback({
                      ...EMPTY,
                      title: fb.title,
                      category,
                      imageUrl: fb.url,
                      sortOrder: items.length,
                    });
                  }}
                >
                  {t("addFromFallback")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
