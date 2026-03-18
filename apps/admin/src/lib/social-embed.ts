import type { SocialPlatform } from "@/lib/schema";

/**
 * Detects the social platform from a URL.
 */
export function detectPlatform(url: string): SocialPlatform | null {
  const u = url.toLowerCase();
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("instagram.com")) return "instagram";
  if (u.includes("facebook.com") || u.includes("fb.com") || u.includes("fb.watch")) return "facebook";
  if (u.includes("twitter.com") || u.includes("x.com")) return "twitter";
  if (u.includes("tiktok.com")) return "tiktok";
  if (u.includes("linkedin.com")) return "linkedin";
  return null;
}

/**
 * Generates an embed iframe URL or HTML from a post URL.
 * These work without API keys — native platform embeds.
 */
export function generateEmbed(platform: SocialPlatform, postUrl: string): string | null {
  switch (platform) {
    case "youtube": {
      const videoId = extractYouTubeId(postUrl);
      if (!videoId) return null;
      return `<iframe src="https://www.youtube.com/embed/${videoId}" width="100%" height="200" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border-radius:8px"></iframe>`;
    }
    case "instagram":
      return `<iframe src="${postUrl}embed/" width="100%" height="480" frameborder="0" scrolling="no" style="border-radius:8px;overflow:hidden"></iframe>`;
    case "facebook":
      return `<iframe src="https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(postUrl)}&show_text=true&width=400" width="100%" height="300" frameborder="0" scrolling="no" style="border-radius:8px;overflow:hidden" allowfullscreen></iframe>`;
    case "twitter":
      return `<blockquote class="twitter-tweet" data-width="100%"><a href="${postUrl}"></a></blockquote>`;
    case "tiktok": {
      const tiktokId = extractTikTokId(postUrl);
      if (!tiktokId) return null;
      return `<iframe src="https://www.tiktok.com/embed/v2/${tiktokId}" width="100%" height="400" frameborder="0" style="border-radius:8px" allowfullscreen></iframe>`;
    }
    case "linkedin":
      return `<iframe src="https://www.linkedin.com/embed/feed/update/${extractLinkedInId(postUrl)}" width="100%" height="300" frameborder="0" style="border-radius:8px"></iframe>`;
    default:
      return null;
  }
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function extractTikTokId(url: string): string | null {
  const m = url.match(/\/video\/(\d+)/);
  return m ? m[1] : null;
}

function extractLinkedInId(url: string): string {
  const m = url.match(/(?:activity-|ugcPost-)(\d+)/);
  return m ? `urn:li:share:${m[1]}` : encodeURIComponent(url);
}

/**
 * Extracts a YouTube channel ID from various URL formats.
 */
export function extractYouTubeChannelId(url: string): string | null {
  const patterns = [
    /youtube\.com\/channel\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/@([a-zA-Z0-9_-]+)/,
    /youtube\.com\/c\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/user\/([a-zA-Z0-9_-]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

/**
 * Fetches the latest videos from a YouTube channel via public RSS feed.
 * No API key needed.
 */
export async function fetchYouTubeRSS(channelUrl: string): Promise<YouTubeRSSItem[]> {
  const channelId = extractYouTubeChannelId(channelUrl);
  if (!channelId) return [];

  const isHandle = channelUrl.includes("/@");
  const feedUrl = isHandle
    ? `https://www.youtube.com/feeds/videos.xml?user=${channelId}`
    : `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

  try {
    const res = await fetch(feedUrl, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseYouTubeRSS(xml);
  } catch {
    return [];
  }
}

export interface YouTubeRSSItem {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
  channelName: string;
  link: string;
}

function parseYouTubeRSS(xml: string): YouTubeRSSItem[] {
  const items: YouTubeRSSItem[] = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match: RegExpExecArray | null;
  while ((match = entryRegex.exec(xml)) !== null) {
    const entry = match[1];
    const videoId = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1] ?? "";
    const title = entry.match(/<title>(.*?)<\/title>/)?.[1] ?? "";
    const published = entry.match(/<published>(.*?)<\/published>/)?.[1] ?? "";
    const channelName = entry.match(/<name>(.*?)<\/name>/)?.[1] ?? "";

    if (videoId) {
      items.push({
        videoId,
        title: decodeXml(title),
        thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
        publishedAt: published,
        channelName: decodeXml(channelName),
        link: `https://www.youtube.com/watch?v=${videoId}`,
      });
    }
  }
  return items.slice(0, 6);
}

function decodeXml(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/** Platform metadata for UI */
export const PLATFORM_META: Record<SocialPlatform, { label: string; color: string; icon: string }> = {
  youtube:   { label: "YouTube",   color: "#FF0000", icon: "▶" },
  instagram: { label: "Instagram", color: "#E4405F", icon: "📷" },
  facebook:  { label: "Facebook",  color: "#1877F2", icon: "f" },
  twitter:   { label: "X (Twitter)", color: "#000000", icon: "𝕏" },
  tiktok:    { label: "TikTok",    color: "#000000", icon: "♪" },
  linkedin:  { label: "LinkedIn",  color: "#0A66C2", icon: "in" },
};
