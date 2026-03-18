import {
  BANNER_SIZE_DIMENSIONS,
  type BannerSize,
} from "@/lib/schema";
import type { Banner } from "./types";
import { PANEL_WIDTH, PANEL_HEIGHT_VISIBLE } from "./types";

export function getEffectiveDimensions(banner: Banner): { w: number; h: number } {
  if (banner.size === "custom") {
    return { w: banner.customWidth ?? PANEL_WIDTH, h: banner.customHeight ?? 200 };
  }
  const dim = BANNER_SIZE_DIMENSIONS[banner.size as BannerSize];
  if (!dim) return { w: PANEL_WIDTH, h: 200 };
  return { w: dim.w ?? PANEL_WIDTH, h: dim.h ?? 200 };
}

export function calcHowManyFit(banner: Banner): number {
  const { h } = getEffectiveDimensions(banner);
  if (h <= 0) return 1;
  const gapPerBanner = 16;
  return Math.max(1, Math.floor(PANEL_HEIGHT_VISIBLE / (h + gapPerBanner)));
}
