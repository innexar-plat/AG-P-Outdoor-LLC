"use client";

import { useI18n } from "@/lib/i18n";
import { SlideOver } from "@/components/ui/SlideOver";
import { PLATFORM_META } from "@/lib/social-embed";
import type { SocialPlatform } from "@/lib/schema";
import type { SocialPost } from "./types";
import { EmbedScript } from "./EmbedScript";

interface SocialPreviewSlideOverProps {
  previewPost: SocialPost | null;
  onClose: () => void;
}

export function SocialPreviewSlideOver({ previewPost, onClose }: SocialPreviewSlideOverProps) {
  const { t } = useI18n();
  const meta = (p: string) => PLATFORM_META[p as SocialPlatform] ?? { label: p, color: "#666", icon: "?" };

  return (
    <SlideOver
      open={!!previewPost}
      onClose={onClose}
      title={previewPost?.title ?? t("ctaPreview")}
    >
      {previewPost && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: meta(previewPost.platform).color }}
            >
              {meta(previewPost.platform).icon}
            </span>
            <div>
              <p className="text-sm font-semibold">{meta(previewPost.platform).label}</p>
              <a
                href={previewPost.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-brand-600 hover:underline truncate block max-w-[300px]"
              >
                {previewPost.postUrl}
              </a>
            </div>
          </div>

          {previewPost.embedHtml ? (
            <div
              className="rounded-lg overflow-hidden border border-slate-200"
              dangerouslySetInnerHTML={{ __html: previewPost.embedHtml }}
            />
          ) : previewPost.thumbnailUrl ? (
            <div className="rounded-lg overflow-hidden border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewPost.thumbnailUrl}
                alt={previewPost.title ?? ""}
                className="w-full object-cover"
              />
            </div>
          ) : (
            <div className="rounded-lg bg-slate-100 p-8 text-center">
              <p className="text-sm text-slate-400">{t("noPreviewAvailable")}</p>
            </div>
          )}

          {previewPost.platform === "twitter" && (
            <EmbedScript src="https://platform.twitter.com/widgets.js" />
          )}

          <div className="space-y-2 text-xs text-slate-500">
            <p><strong>URL:</strong> {previewPost.postUrl}</p>
            {previewPost.createdAt && (
              <p><strong>{t("createdAt")}:</strong> {new Date(previewPost.createdAt).toLocaleString()}</p>
            )}
          </div>
        </div>
      )}
    </SlideOver>
  );
}
