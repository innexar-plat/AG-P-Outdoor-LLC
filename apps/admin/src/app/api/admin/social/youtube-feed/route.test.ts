import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetSession = vi.fn();
const mockFetchYouTubeRSS = vi.fn();

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
    },
  },
}));

vi.mock("@/lib/social-embed", () => ({
  fetchYouTubeRSS: (...args: unknown[]) => mockFetchYouTubeRSS(...args),
}));

import { GET } from "./route";

describe("GET /api/admin/social/youtube-feed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const req = new Request("https://example.com/api/admin/social/youtube-feed");
    const res = await GET(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 400 when channelUrl is missing", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "1" } });
    const req = new Request("https://example.com/api/admin/social/youtube-feed");
    const res = await GET(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("channelUrl");
  });

  it("returns 400 when channelUrl is invalid URL", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "1" } });
    const req = new Request(
      "https://example.com/api/admin/social/youtube-feed?channelUrl=not-a-url"
    );
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns 200 with videos when valid channelUrl", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "1" } });
    mockFetchYouTubeRSS.mockResolvedValue([
      { videoId: "abc", title: "Test", thumbnailUrl: "x", publishedAt: "2024-01-01", channelName: "Ch", link: "l" },
    ]);
    const req = new Request(
      "https://example.com/api/admin/social/youtube-feed?channelUrl=https://youtube.com/channel/UC123"
    );
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toHaveLength(1);
    expect(json.data[0].videoId).toBe("abc");
  });
});
