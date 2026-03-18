"use client";

import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PLATFORM_META } from "@/lib/social-embed";
import type { SocialPlatform } from "@/lib/schema";
import type { SocialPost } from "./types";

interface SocialPostCardProps {
  post: SocialPost;
  onTogglePin: (post: SocialPost) => void;
  onDelete: (id: number) => void;
  onPreview: (post: SocialPost) => void;
}

export function SocialPostCard({ post, onTogglePin, onDelete, onPreview }: SocialPostCardProps) {
  const { t } = useI18n();
  const m = PLATFORM_META[post.platform as SocialPlatform] ?? { label: post.platform, color: "#666", icon: "?" };

  return (
    <div
      className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: m.color }}
          >
            {m.icon}
          </span>
          <span className="text-xs font-medium text-slate-600">{m.label}</span>
        </div>
        <div className="flex items-center gap-1">
          {post.pinned && <Badge variant="info">📌</Badge>}
        </div>
      </div>

      {post.thumbnailUrl ? (
        <div
          className="relative h-36 bg-slate-100 cursor-pointer group"
          onClick={() => onPreview(post)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.thumbnailUrl}
            alt={post.title ?? ""}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
            <span className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-lg shadow">
              ▶
            </span>
          </div>
        </div>
      ) : (
        <div
          className="h-36 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center cursor-pointer"
          onClick={() => onPreview(post)}
        >
          <span className="text-4xl opacity-30">{m.icon}</span>
        </div>
      )}

      <div className="p-3">
        <p className="text-xs font-medium text-slate-700 line-clamp-2 mb-2">
          {post.title || post.postUrl}
        </p>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onTogglePin(post)}
            title={post.pinned ? "Unpin" : "Pin"}
          >
            {post.pinned ? "📌" : "📍"}
          </Button>
          <a href={post.postUrl} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="ghost">🔗</Button>
          </a>
          <Button size="sm" variant="ghost" onClick={() => onPreview(post)}>
            👁
          </Button>
          <Button size="sm" variant="danger" onClick={() => onDelete(post.id)}>
            {t("remove")}
          </Button>
        </div>
      </div>
    </div>
  );
}
