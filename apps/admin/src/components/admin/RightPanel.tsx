"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import type { BannerLayout, BannerAnimation } from "@/lib/schema";

type BannerItem = {
  id: number;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  linkText: string | null;
  bgColor: string | null;
  textColor: string | null;
  size: string;
  customWidth: number | null;
  customHeight: number | null;
  layout: string;
  animation: string;
  carouselGroup: string | null;
  carouselInterval: number;
  borderRadius: number;
  opacity: number;
  sortOrder: number;
};

interface RightPanelProps {
  banners: BannerItem[];
  isAdmin: boolean;
}

function groupByCarousel(banners: BannerItem[]): { solo: BannerItem[]; groups: Record<string, BannerItem[]> } {
  const solo: BannerItem[] = [];
  const groups: Record<string, BannerItem[]> = {};
  for (const b of banners) {
    if (b.carouselGroup) {
      if (!groups[b.carouselGroup]) groups[b.carouselGroup] = [];
      groups[b.carouselGroup].push(b);
    } else {
      solo.push(b);
    }
  }
  return { solo, groups };
}

const ANIMATION_CLASSES: Record<BannerAnimation, string> = {
  none: "",
  fade: "animate-[fadeIn_0.5s_ease-in-out]",
  slide: "animate-[slideIn_0.4s_ease-out]",
  zoom: "animate-[zoomIn_0.4s_ease-out]",
  pulse: "animate-[pulse_2s_infinite]",
};

export function RightPanel({ banners, isAdmin }: RightPanelProps) {
  const { t } = useI18n();
  const sorted = [...banners].sort((a, b) => a.sortOrder - b.sortOrder);
  const { solo, groups } = groupByCarousel(sorted);

  return (
    <aside className="w-72 shrink-0 hidden xl:flex flex-col h-screen sticky top-0 border-l border-surface-border bg-white overflow-y-auto">
      <div className="px-4 py-4 border-b border-surface-border">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {t("promotions")}
          </h2>
          {isAdmin && (
            <Link href="/admin/banners">
              <Button variant="ghost" size="sm">{t("edit")}</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4">
        {banners.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
              </svg>
            </div>
            <p className="text-xs text-slate-400">{t("noBannersActive")}</p>
            {isAdmin && (
              <Link href="/admin/banners" className="mt-3 inline-block">
                <Button variant="outline" size="sm">{t("newBanner")}</Button>
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Carousel groups */}
            {Object.entries(groups).map(([groupName, groupBanners]) => (
              <BannerCarousel key={groupName} banners={groupBanners} />
            ))}
            {/* Solo banners */}
            {solo.map((b) => (
              <SingleBanner key={b.id} banner={b} />
            ))}
          </>
        )}
      </div>

      <div className="px-4 py-3 border-t border-surface-border">
        <p className="text-[10px] text-slate-400 text-center">
          Powered by Innexar
        </p>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes zoomIn {
          from { transform: scale(0.92); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </aside>
  );
}

function BannerCarousel({ banners }: { banners: BannerItem[] }) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const intervalMs = (banners[0]?.carouselInterval ?? 5) * 1000;

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prev = useCallback(() => {
    setCurrent((p) => (p - 1 + banners.length) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (isPaused || banners.length <= 1) return;
    intervalRef.current = setInterval(next, intervalMs);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, next, intervalMs, banners.length]);

  const banner = banners[current];
  if (!banner) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <SingleBanner banner={banner} key={banner.id} animKey={current} />

      {banners.length > 1 && (
        <>
          {/* Navigation arrows */}
          <button
            onClick={prev}
            className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors text-xs"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors text-xs"
          >
            ›
          </button>

          {/* Dots */}
          <div className="flex justify-center gap-1.5 mt-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === current ? "bg-brand-600 w-3" : "bg-slate-300 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SingleBanner({ banner, animKey }: { banner: BannerItem; animKey?: number }) {
  const layout = (banner.layout || "card") as BannerLayout;
  const animation = (banner.animation || "fade") as BannerAnimation;
  const animClass = ANIMATION_CLASSES[animation] ?? "";
  const br = banner.borderRadius ?? 12;

  const wrapperStyle: React.CSSProperties = {
    backgroundColor: banner.bgColor ?? "#0f172a",
    color: banner.textColor ?? "#fff",
    borderRadius: br,
    opacity: (banner.opacity ?? 100) / 100,
  };

  const image = banner.imageUrl ? (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={banner.imageUrl}
      alt={banner.title}
      className="object-cover"
      style={{
        borderRadius: layout === "image_only" ? br : undefined,
        width: layout === "text_left" || layout === "text_right" ? "45%" : "100%",
        height: layout === "text_below" || layout === "card" ? 120 : "100%",
      }}
    />
  ) : null;

  const text = layout !== "image_only" ? (
    <div className="flex-1 min-w-0 p-3 space-y-1">
      <p className="font-bold text-sm leading-snug">{banner.title}</p>
      {banner.subtitle && <p className="text-xs opacity-80 leading-relaxed">{banner.subtitle}</p>}
      {banner.linkUrl && (
        <a
          href={banner.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors mt-1"
        >
          {banner.linkText ?? "→"} →
        </a>
      )}
    </div>
  ) : null;

  const content = (() => {
    switch (layout) {
      case "image_only":
        return (
          <a href={banner.linkUrl ?? "#"} target="_blank" rel="noopener noreferrer" className="block">
            {image}
          </a>
        );
      case "text_overlay":
        return (
          <div className="relative overflow-hidden" style={{ borderRadius: br }}>
            {image && <div className="w-full h-32">{image}</div>}
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 to-transparent">
              {text}
            </div>
          </div>
        );
      case "text_left":
        return (
          <div className="flex flex-row-reverse items-stretch overflow-hidden" style={{ borderRadius: br }}>
            {image}
            {text}
          </div>
        );
      case "text_right":
        return (
          <div className="flex items-stretch overflow-hidden" style={{ borderRadius: br }}>
            {image}
            {text}
          </div>
        );
      case "text_below":
        return (
          <div className="overflow-hidden" style={{ borderRadius: br }}>
            {image}
            {text}
          </div>
        );
      case "card":
      default:
        return (
          <div className="overflow-hidden" style={{ borderRadius: br }}>
            {image && <div className="w-full h-28">{image}</div>}
            {text}
          </div>
        );
    }
  })();

  return (
    <div
      key={animKey}
      className={`shadow-card transition-transform hover:scale-[1.02] ${animClass}`}
      style={wrapperStyle}
    >
      {content}
    </div>
  );
}
