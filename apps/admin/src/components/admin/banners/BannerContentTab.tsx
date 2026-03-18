"use client";

import { useI18n } from "@/lib/i18n";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FileUpload } from "@/components/ui/FileUpload";
import type { Banner } from "./types";

interface BannerContentTabProps {
  editing: Banner;
  onEditingChange: (banner: Banner) => void;
}

export function BannerContentTab({ editing, onEditingChange }: BannerContentTabProps) {
  const { t } = useI18n();
  return (
    <div className="space-y-4">
      <Input
        label={t("bannerTitle")}
        value={editing.title}
        onChange={(e) => onEditingChange({ ...editing, title: e.target.value })}
        required
      />
      <Input
        label={t("bannerSubtitle")}
        value={editing.subtitle ?? ""}
        onChange={(e) => onEditingChange({ ...editing, subtitle: e.target.value || null })}
      />
      <FileUpload
        folder="banners"
        onUpload={(url) => onEditingChange({ ...editing, imageUrl: url })}
      />
      <Input
        label={t("bannerImage")}
        value={editing.imageUrl ?? ""}
        onChange={(e) => onEditingChange({ ...editing, imageUrl: e.target.value || null })}
        placeholder="https://example.com/banner.jpg"
      />
      {editing.imageUrl && (
        <div className="rounded-lg overflow-hidden border border-surface-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={editing.imageUrl} alt="Preview" className="w-full h-32 object-cover" />
        </div>
      )}
      <Input
        label={t("bannerLink")}
        value={editing.linkUrl ?? ""}
        onChange={(e) => onEditingChange({ ...editing, linkUrl: e.target.value || null })}
        placeholder="https://example.com/promo"
      />
      <Input
        label={t("bannerLinkText")}
        value={editing.linkText ?? ""}
        onChange={(e) => onEditingChange({ ...editing, linkText: e.target.value || null })}
        placeholder="Saiba mais"
      />
      <Select
        label={t("bannerPlacement")}
        value={editing.placement}
        onChange={(e) => onEditingChange({ ...editing, placement: e.target.value })}
        options={[
          { value: "dashboard", label: t("placementDashboard") },
          { value: "site_header", label: t("placementSiteHeader") },
          { value: "site_footer", label: t("placementSiteFooter") },
          { value: "site_popup", label: t("placementSitePopup") },
        ]}
      />
    </div>
  );
}
