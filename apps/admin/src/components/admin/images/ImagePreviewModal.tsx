"use client";

import { useI18n } from "@/lib/i18n";
import type { SiteImage } from "./types";

interface ImagePreviewModalProps {
  img: SiteImage;
  onClose: () => void;
  displayLabel: (type: string) => string;
}

function isVideoUrl(url?: string | null) {
  if (!url) return false;
  return /\.(mp4|webm|mov|avi)(\?|$)/i.test(url);
}

export function ImagePreviewModal({ img, onClose, displayLabel: displayLabelFn }: ImagePreviewModalProps) {
  const { t } = useI18n();
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-[90vh] mx-4" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/80 hover:text-white text-sm font-medium flex items-center gap-1"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          {t("close")}
        </button>
        {isVideoUrl(img.url) ? (
          <video
            src={img.url ?? undefined}
            className="max-w-full max-h-[75vh] rounded-xl shadow-2xl object-contain"
            controls
            muted
            playsInline
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img.url}
            alt={img.altText ?? img.label}
            className="max-w-full max-h-[75vh] rounded-xl shadow-2xl object-contain"
          />
        )}
        <div className="mt-3 bg-white/10 backdrop-blur rounded-lg px-4 py-3 text-white text-sm space-y-1">
          <p className="font-semibold">{img.label}</p>
          <div className="flex items-center gap-3 text-xs text-white/70">
            <span>{img.section}</span>
            <span>·</span>
            <span className="font-mono">{img.slotKey}</span>
            <span>·</span>
            <span>{displayLabelFn(img.displayType)}</span>
          </div>
          {img.altText && <p className="text-xs text-white/60 italic">{img.altText}</p>}
        </div>
      </div>
    </div>
  );
}
