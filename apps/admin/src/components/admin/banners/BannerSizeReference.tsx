"use client";

import { useI18n } from "@/lib/i18n";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  BANNER_SIZES,
  BANNER_SIZE_DIMENSIONS,
} from "@/lib/schema";
import { PANEL_HEIGHT_VISIBLE } from "./types";

export function BannerSizeReference() {
  const { t } = useI18n();
  return (
    <Card>
      <CardBody>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">{t("bannerSizeDesc")}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {BANNER_SIZES.filter((s) => s !== "custom").map((s) => {
            const d = BANNER_SIZE_DIMENSIONS[s];
            const fits = d.h ? Math.floor(PANEL_HEIGHT_VISIBLE / (d.h + 16)) : "—";
            return (
              <div key={s} className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
                <p className="text-xs font-mono font-semibold text-slate-600">
                  {d.w ? `${d.w}×${d.h}` : "100%"}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">{d.label.split("(")[0].trim()}</p>
                {typeof fits === "number" && (
                  <Badge variant="info" className="mt-1.5 text-[10px]">
                    {fits} {t("bannerCapacity")}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
