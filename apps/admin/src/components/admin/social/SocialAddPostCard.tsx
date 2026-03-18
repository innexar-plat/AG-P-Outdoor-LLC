"use client";

import { useI18n } from "@/lib/i18n";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PLATFORM_META } from "@/lib/social-embed";
import type { SocialPlatform } from "@/lib/schema";

interface SocialAddPostCardProps {
  newUrl: string;
  setNewUrl: (v: string) => void;
  addPost: () => void;
  adding: boolean;
}

export function SocialAddPostCard({ newUrl, setNewUrl, addPost, adding }: SocialAddPostCardProps) {
  const { t } = useI18n();
  const meta = (p: string) => PLATFORM_META[p as SocialPlatform] ?? { label: p, color: "#666", icon: "?" };

  return (
    <Card>
      <CardBody>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">{t("addSocialPost")}</h3>
        <p className="text-xs text-slate-400 mb-3">{t("addSocialPostHint")}</p>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... / https://www.instagram.com/p/..."
              onKeyDown={(e) => e.key === "Enter" && addPost()}
            />
          </div>
          <Button loading={adding} onClick={addPost} disabled={!newUrl.trim()}>
            {t("addSocialPost")}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {(["youtube", "instagram", "facebook", "twitter", "tiktok", "linkedin"] as SocialPlatform[]).map((p) => {
            const m = meta(p);
            return (
              <span
                key={p}
                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full text-white font-medium"
                style={{ backgroundColor: m.color }}
              >
                <span>{m.icon}</span>
                {m.label}
              </span>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
