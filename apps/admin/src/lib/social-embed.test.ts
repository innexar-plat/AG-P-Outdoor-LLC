import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  detectPlatform,
  generateEmbed,
  extractYouTubeChannelId,
  fetchYouTubeRSS,
  PLATFORM_META,
} from "./social-embed";

describe("detectPlatform", () => {
  it("returns youtube for youtube.com", () => {
    expect(detectPlatform("https://www.youtube.com/watch?v=abc")).toBe("youtube");
  });

  it("returns youtube for youtu.be", () => {
    expect(detectPlatform("https://youtu.be/abc123")).toBe("youtube");
  });

  it("returns instagram for instagram.com", () => {
    expect(detectPlatform("https://www.instagram.com/p/xyz/")).toBe("instagram");
  });

  it("returns facebook for facebook.com", () => {
    expect(detectPlatform("https://www.facebook.com/post/123")).toBe("facebook");
  });

  it("returns facebook for fb.com", () => {
    expect(detectPlatform("https://fb.com/watch/123")).toBe("facebook");
  });

  it("returns facebook for fb.watch", () => {
    expect(detectPlatform("https://www.fb.watch/abc")).toBe("facebook");
  });

  it("returns twitter for twitter.com", () => {
    expect(detectPlatform("https://twitter.com/user/status/123")).toBe("twitter");
  });

  it("returns twitter for x.com", () => {
    expect(detectPlatform("https://x.com/user/status/123")).toBe("twitter");
  });

  it("returns tiktok for tiktok.com", () => {
    expect(detectPlatform("https://www.tiktok.com/@user/video/123")).toBe("tiktok");
  });

  it("returns linkedin for linkedin.com", () => {
    expect(detectPlatform("https://www.linkedin.com/feed/update/123")).toBe("linkedin");
  });

  it("returns null for unknown URL", () => {
    expect(detectPlatform("https://example.com/video")).toBe(null);
  });

  it("is case insensitive", () => {
    expect(detectPlatform("https://YOUTUBE.COM/watch?v=abc")).toBe("youtube");
  });
});

describe("generateEmbed", () => {
  it("returns iframe for youtube with valid video ID", () => {
    const result = generateEmbed("youtube", "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    expect(result).toContain("youtube.com/embed/dQw4w9WgXcQ");
    expect(result).toContain("<iframe");
  });

  it("returns null for youtube with invalid URL", () => {
    const result = generateEmbed("youtube", "https://youtube.com/");
    expect(result).toBe(null);
  });

  it("returns iframe for instagram", () => {
    const url = "https://www.instagram.com/p/ABC123/";
    const result = generateEmbed("instagram", url);
    expect(result).toContain(url + "embed/");
    expect(result).toContain("<iframe");
  });

  it("returns iframe for facebook", () => {
    const url = "https://www.facebook.com/post/123";
    const result = generateEmbed("facebook", url);
    expect(result).toContain("facebook.com/plugins/post.php");
    expect(result).toContain(encodeURIComponent(url));
  });

  it("returns blockquote for twitter", () => {
    const url = "https://twitter.com/user/status/123";
    const result = generateEmbed("twitter", url);
    expect(result).toContain("twitter-tweet");
    expect(result).toContain(url);
  });

  it("returns iframe for tiktok with valid video ID", () => {
    const result = generateEmbed("tiktok", "https://www.tiktok.com/@user/video/7123456789");
    expect(result).toContain("tiktok.com/embed/v2/7123456789");
  });

  it("returns null for tiktok with invalid URL", () => {
    const result = generateEmbed("tiktok", "https://tiktok.com/@user");
    expect(result).toBe(null);
  });

  it("returns iframe for linkedin", () => {
    const url = "https://www.linkedin.com/feed/update/urn:li:activity:123456";
    const result = generateEmbed("linkedin", url);
    expect(result).toContain("linkedin.com/embed/feed/update");
  });

});

describe("extractYouTubeChannelId", () => {
  it("extracts from /channel/ URL", () => {
    expect(extractYouTubeChannelId("https://youtube.com/channel/UC123abc")).toBe("UC123abc");
  });

  it("extracts from /@ handle", () => {
    expect(extractYouTubeChannelId("https://youtube.com/@myhandle")).toBe("myhandle");
  });

  it("extracts from /c/ custom URL", () => {
    expect(extractYouTubeChannelId("https://youtube.com/c/MyChannel")).toBe("MyChannel");
  });

  it("extracts from /user/ URL", () => {
    expect(extractYouTubeChannelId("https://youtube.com/user/oldusername")).toBe("oldusername");
  });

  it("returns null for video URL", () => {
    expect(extractYouTubeChannelId("https://youtube.com/watch?v=abc")).toBe(null);
  });

  it("returns null for unrelated URL", () => {
    expect(extractYouTubeChannelId("https://example.com")).toBe(null);
  });
});

describe("fetchYouTubeRSS", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("returns empty array when channel URL has no channel ID", async () => {
    const result = await fetchYouTubeRSS("https://example.com/not-youtube");
    expect(result).toEqual([]);
  });

  it("returns empty array when fetch fails", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("Network error"));
    const result = await fetchYouTubeRSS("https://youtube.com/channel/UC123");
    expect(result).toEqual([]);
  });

  it("returns empty array when response is not ok", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
    } as Response);
    const result = await fetchYouTubeRSS("https://youtube.com/channel/UC123");
    expect(result).toEqual([]);
  });

  it("parses RSS and returns items", async () => {
    const xml = `
      <feed>
        <entry>
          <yt:videoId>abc123</yt:videoId>
          <title>Test Video &amp; More</title>
          <published>2024-01-01T00:00:00Z</published>
          <name>Channel Name</name>
        </entry>
      </feed>
    `;
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(xml),
    } as Response);
    const result = await fetchYouTubeRSS("https://youtube.com/channel/UC123");
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      videoId: "abc123",
      title: "Test Video & More",
      channelName: "Channel Name",
      link: "https://www.youtube.com/watch?v=abc123",
    });
    expect(result[0].thumbnailUrl).toContain("i.ytimg.com");
  });

  it("limits to 6 items", async () => {
    const entries = Array.from({ length: 10 }, (_, i) => `
      <entry>
        <yt:videoId>vid${i}</yt:videoId>
        <title>T${i}</title>
        <published>2024-01-01</published>
        <name>Ch</name>
      </entry>
    `).join("");
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(`<feed>${entries}</feed>`),
    } as Response);
    const result = await fetchYouTubeRSS("https://youtube.com/channel/UC123");
    expect(result).toHaveLength(6);
  });
});

describe("PLATFORM_META", () => {
  it("has metadata for all platforms", () => {
    const platforms = ["youtube", "instagram", "facebook", "twitter", "tiktok", "linkedin"] as const;
    for (const p of platforms) {
      expect(PLATFORM_META[p]).toBeDefined();
      expect(PLATFORM_META[p].label).toBeTruthy();
      expect(PLATFORM_META[p].color).toBeTruthy();
      expect(PLATFORM_META[p].icon).toBeTruthy();
    }
  });
});
