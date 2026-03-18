"use client";

import {
  getEffectiveDimensions,
} from "./utils";
import type { Banner } from "./types";
import type { BannerLayout } from "@/lib/schema";

interface BannerPreviewProps {
  banner: Banner;
}

export function BannerPreview({ banner }: BannerPreviewProps) {
  const dim = getEffectiveDimensions(banner);
  const scale = Math.min(1, 280 / dim.w);
  const layout = banner.layout as BannerLayout;

  const textContent = (
    <div className="flex-1 min-w-0 p-3">
      <p className="font-bold text-sm truncate">{banner.title || "Banner title"}</p>
      {banner.subtitle && <p className="text-xs opacity-80 truncate mt-0.5">{banner.subtitle}</p>}
      {banner.linkText && (
        <span className="inline-block text-xs font-semibold px-3 py-1 rounded-lg bg-white/20 mt-2">
          {banner.linkText} →
        </span>
      )}
    </div>
  );

  const imageContent = banner.imageUrl ? (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={banner.imageUrl}
      alt=""
      className="object-cover"
      style={{
        width: layout === "text_left" || layout === "text_right" ? "50%" : "100%",
        height: layout === "text_below" || layout === "card" ? dim.h * 0.55 : "100%",
      }}
    />
  ) : null;

  const flexDir = layout === "text_left" ? "row-reverse" : layout === "text_right" ? "row" : "column";
  const isOverlay = layout === "text_overlay" || layout === "image_only";

  return (
    <div className="flex justify-center">
      <div
        className="overflow-hidden shadow-lg relative"
        style={{
          width: dim.w * scale,
          height: dim.h * scale,
          borderRadius: banner.borderRadius,
          backgroundColor: banner.bgColor ?? "#0f172a",
          color: banner.textColor ?? "#fff",
          opacity: banner.opacity / 100,
          transform: `scale(${scale})`,
          transformOrigin: "top center",
        }}
      >
        {isOverlay ? (
          <div className="relative w-full h-full">
            {imageContent && <div className="absolute inset-0">{imageContent}</div>}
            {layout !== "image_only" && (
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent">
                {textContent}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex" style={{ flexDirection: flexDir as "row" | "column" | "row-reverse" }}>
            {imageContent}
            {textContent}
          </div>
        )}
      </div>
    </div>
  );
}
