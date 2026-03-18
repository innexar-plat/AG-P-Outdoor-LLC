import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(() => Promise.resolve(null)),
    },
  },
}));

vi.mock("@/lib/queries/social", () => ({
  listSocialPosts: vi.fn(() => Promise.resolve([])),
  createSocialPost: vi.fn(() =>
    Promise.resolve({ id: 1, platform: "youtube", postUrl: "https://youtube.com/watch?v=1" })
  ),
}));

vi.mock("@/lib/social-embed", () => ({
  detectPlatform: vi.fn(() => "youtube"),
  generateEmbed: vi.fn(() => "<iframe></iframe>"),
}));

import { GET, POST } from "./route";
import { auth } from "@/lib/auth";
import { listSocialPosts } from "@/lib/queries/social";
import { detectPlatform } from "@/lib/social-embed";

const mockGetSession = vi.mocked(auth.api.getSession);
const mockList = vi.mocked(listSocialPosts);
const mockDetect = vi.mocked(detectPlatform);

describe("GET /api/admin/social", () => {
  beforeEach(() => {
    mockGetSession.mockResolvedValue(null);
  });

  it("returns 401 when no session", async () => {
    const req = new Request("http://localhost/api/admin/social");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns 200 with data when session present", async () => {
    mockGetSession.mockResolvedValueOnce({ user: { id: "1" } } as never);
    mockList.mockResolvedValueOnce([{ id: 1 }] as never);
    const req = new Request("http://localhost/api/admin/social");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toEqual([{ id: 1 }]);
  });
});

describe("POST /api/admin/social", () => {
  beforeEach(() => {
    mockGetSession.mockResolvedValue(null);
  });

  it("returns 401 when no session", async () => {
    const req = new Request("http://localhost/api/admin/social", { method: "POST" });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 when platform is unsupported", async () => {
    mockGetSession.mockResolvedValueOnce({ user: { id: "1" } } as never);
    mockDetect.mockReturnValueOnce(null as never);
    const req = new Request("http://localhost/api/admin/social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postUrl: "https://unknown.com/post" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 201 when post is created", async () => {
    mockGetSession.mockResolvedValueOnce({ user: { id: "1" } } as never);
    const req = new Request("http://localhost/api/admin/social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postUrl: "https://youtube.com/watch?v=1" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.id).toBe(1);
  });
});
