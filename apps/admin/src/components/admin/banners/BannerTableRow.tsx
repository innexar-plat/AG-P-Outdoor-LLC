"use client";

import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Td } from "@/components/ui/Table";
import { getEffectiveDimensions } from "./utils";
import type { Banner } from "./types";

interface BannerTableRowProps {
  item: Banner;
  onToggleActive: (item: Banner) => void;
  onEdit: (item: Banner) => void;
  onDelete: (id: number) => void;
}

export function BannerTableRow({ item, onToggleActive, onEdit, onDelete }: BannerTableRowProps) {
  const { t } = useI18n();
  const dim = getEffectiveDimensions(item);

  function placementLabel(p: string) {
    switch (p) {
      case "dashboard": return t("placementDashboard");
      case "site_header": return t("placementSiteHeader");
      case "site_footer": return t("placementSiteFooter");
      case "site_popup": return t("placementSitePopup");
      default: return p;
    }
  }

  function layoutLabel(l: string) {
    switch (l) {
      case "image_only": return t("layoutImageOnly");
      case "text_overlay": return t("layoutTextOverlay");
      case "text_below": return t("layoutTextBelow");
      case "text_left": return t("layoutTextLeft");
      case "text_right": return t("layoutTextRight");
      case "card": return t("layoutCard");
      default: return l;
    }
  }

  function animLabel(a: string) {
    switch (a) {
      case "none": return t("animNone");
      case "fade": return t("animFade");
      case "slide": return t("animSlide");
      case "zoom": return t("animZoom");
      case "pulse": return t("animPulse");
      default: return a;
    }
  }

  return (
    <tr className="border-b border-surface-border last:border-0">
      <Td>
        <div className="flex items-center gap-3">
          {item.imageUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={item.imageUrl} alt="" className="w-10 h-10 rounded object-cover" />
          )}
          {!item.imageUrl && item.bgColor && (
            <div className="w-10 h-10 rounded" style={{ backgroundColor: item.bgColor }} />
          )}
          <div>
            <p className="font-medium text-sm">{item.title}</p>
            {item.subtitle && <p className="text-xs text-slate-400 truncate max-w-[200px]">{item.subtitle}</p>}
          </div>
        </div>
      </Td>
      <Td>
        <span className="text-xs font-mono text-slate-600">
          {dim.w}×{dim.h}
        </span>
      </Td>
      <Td><Badge variant="default">{layoutLabel(item.layout)}</Badge></Td>
      <Td><Badge>{placementLabel(item.placement)}</Badge></Td>
      <Td><Badge variant="info">{animLabel(item.animation)}</Badge></Td>
      <Td>
        <Badge variant={item.active ? "success" : "warning"} dot>
          {item.active ? t("bannerActive") : t("bannerInactive")}
        </Badge>
      </Td>
      <Td>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => onToggleActive(item)}>
            {item.active ? "⏸" : "▶"}
          </Button>
          <Button size="sm" variant="secondary" onClick={() => onEdit(item)}>
            {t("edit")}
          </Button>
          <Button size="sm" variant="danger" onClick={() => onDelete(item.id)}>
            {t("remove")}
          </Button>
        </div>
      </Td>
    </tr>
  );
}
