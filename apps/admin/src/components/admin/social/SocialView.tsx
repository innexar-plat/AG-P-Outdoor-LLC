"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { SocialAddPostCard } from "./SocialAddPostCard";
import { YouTubeFeedCard } from "./YouTubeFeedCard";
import { SocialPostCard } from "./SocialPostCard";
import { SocialPreviewSlideOver } from "./SocialPreviewSlideOver";
import type { SocialPost } from "./types";
import type { YouTubeRSSItem } from "@/lib/social-embed";

interface SocialViewProps {
  posts: SocialPost[];
  youtubeChannelUrl: string | null;
}

export function SocialView({ posts: initial, youtubeChannelUrl }: SocialViewProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [posts, setPosts] = useState(initial);
  const [newUrl, setNewUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [ytVideos, setYtVideos] = useState<YouTubeRSSItem[]>([]);
  const [ytLoading, setYtLoading] = useState(false);
  const [ytChannelInput, setYtChannelInput] = useState(youtubeChannelUrl ?? "");
  const [previewPost, setPreviewPost] = useState<SocialPost | null>(null);

  const addPost = useCallback(async () => {
    if (!newUrl.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/admin/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postUrl: newUrl.trim() }),
      });
      if (res.ok) {
        const { data } = await res.json();
        setPosts((prev) => [data, ...prev]);
        setNewUrl("");
        router.refresh();
      } else {
        const { error } = await res.json();
        alert(error ?? t("requestFailed"));
      }
    } finally {
      setAdding(false);
    }
  }, [newUrl, router, t]);

  const deletePost = useCallback(async (id: number) => {
    if (!confirm(t("confirmRemove"))) return;
    await fetch(`/api/admin/social/${id}`, { method: "DELETE" });
    setPosts((prev) => prev.filter((p) => p.id !== id));
    router.refresh();
  }, [router, t]);

  const togglePin = useCallback(async (post: SocialPost) => {
    await fetch(`/api/admin/social/${post.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned: !post.pinned }),
    });
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, pinned: !p.pinned } : p)),
    );
  }, []);

  const fetchYouTube = useCallback(async () => {
    if (!ytChannelInput.trim()) return;
    setYtLoading(true);
    try {
      const res = await fetch(`/api/admin/social/youtube-feed?channelUrl=${encodeURIComponent(ytChannelInput.trim())}`);
      if (res.ok) {
        const { data } = await res.json();
        setYtVideos(data ?? []);
      }
    } finally {
      setYtLoading(false);
    }
  }, [ytChannelInput]);

  const addYouTubeVideo = useCallback(async (video: YouTubeRSSItem) => {
    const res = await fetch("/api/admin/social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postUrl: video.link,
        title: video.title,
        thumbnailUrl: video.thumbnailUrl,
      }),
    });
    if (res.ok) {
      const { data } = await res.json();
      setPosts((prev) => [data, ...prev]);
      setYtVideos((prev) => prev.filter((v) => v.videoId !== video.videoId));
      router.refresh();
    }
  }, [router]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("socialMedia")}
        description={t("socialMediaDesc")}
      />

      <SocialAddPostCard
        newUrl={newUrl}
        setNewUrl={setNewUrl}
        addPost={addPost}
        adding={adding}
      />

      <YouTubeFeedCard
        ytChannelInput={ytChannelInput}
        setYtChannelInput={setYtChannelInput}
        fetchYouTube={fetchYouTube}
        ytLoading={ytLoading}
        ytVideos={ytVideos}
        posts={posts}
        addYouTubeVideo={addYouTubeVideo}
      />

      <Card>
        <CardBody>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            {t("savedPosts")} ({posts.length})
          </h3>

          {posts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📱</span>
              </div>
              <p className="text-sm text-slate-400">{t("noSocialPosts")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map((post) => (
                <SocialPostCard
                  key={post.id}
                  post={post}
                  onTogglePin={togglePin}
                  onDelete={deletePost}
                  onPreview={setPreviewPost}
                />
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <SocialPreviewSlideOver
        previewPost={previewPost}
        onClose={() => setPreviewPost(null)}
      />
    </div>
  );
}
