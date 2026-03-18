"use client";

import { useI18n } from "@/lib/i18n";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/format-date";
import type { YouTubeRSSItem } from "@/lib/social-embed";

interface YouTubeFeedCardProps {
  ytChannelInput: string;
  setYtChannelInput: (v: string) => void;
  fetchYouTube: () => void;
  ytLoading: boolean;
  ytVideos: YouTubeRSSItem[];
  posts: { postUrl: string }[];
  addYouTubeVideo: (video: YouTubeRSSItem) => void;
}

export function YouTubeFeedCard({
  ytChannelInput,
  setYtChannelInput,
  fetchYouTube,
  ytLoading,
  ytVideos,
  posts,
  addYouTubeVideo,
}: YouTubeFeedCardProps) {
  const { t } = useI18n();

  return (
    <Card>
      <CardBody>
        <h3 className="text-sm font-semibold text-slate-700 mb-1">
          <span className="mr-2">▶</span>
          {t("youtubeAutoFeed")}
        </h3>
        <p className="text-xs text-slate-400 mb-3">{t("youtubeAutoFeedDesc")}</p>
        <div className="flex gap-2 mb-4">
          <div className="flex-1">
            <Input
              value={ytChannelInput}
              onChange={(e) => setYtChannelInput(e.target.value)}
              placeholder="https://www.youtube.com/@channel ou /channel/UCxxxx"
            />
          </div>
          <Button loading={ytLoading} onClick={fetchYouTube} variant="secondary">
            {t("fetchVideos")}
          </Button>
        </div>

        {ytVideos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ytVideos.map((v) => {
              const alreadyAdded = posts.some((p) => p.postUrl.includes(v.videoId));
              return (
                <div key={v.videoId} className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={v.thumbnailUrl} alt={v.title} className="w-full h-32 object-cover" />
                  <div className="p-3">
                    <p className="text-xs font-semibold text-slate-700 line-clamp-2 mb-2">{v.title}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        {formatDate(v.publishedAt)}
                      </span>
                      {alreadyAdded ? (
                        <Badge variant="success">{t("added")}</Badge>
                      ) : (
                        <Button size="sm" onClick={() => addYouTubeVideo(v)}>+ {t("addSocialPost")}</Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
