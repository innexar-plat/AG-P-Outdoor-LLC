"use client";

import { useI18n } from "@/lib/i18n";

interface ImagePreviewModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export function ImagePreviewModal({ imageUrl, onClose }: ImagePreviewModalProps) {
  const { t } = useI18n();
  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-[85vh] mx-4">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/80 hover:text-white text-sm font-medium"
        >
          ✕ {t("close")}
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="Preview"
          className="max-w-full max-h-[85vh] rounded-xl shadow-2xl object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
}
