import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(() => Promise.resolve(null)),
    },
  },
}));

vi.mock("@/lib/services/analytics", () => ({
  getAnalyticsSummary: vi.fn(() =>
    Promise.resolve({
      pageViews: [{ pagePath: "/", screenPageViews: "120" }],
      sources: [{ sessionSource: "google", sessions: "80" }],
      devices: [{ deviceCategory: "desktop", sessions: "100" }],
      totalSessions: 170,
    })
  ),
}));

import { GET } from "./route";
import { auth } from "@/lib/auth";

const mockGetSession = vi.mocked(auth.api.getSession);

describe("GET /api/admin/analytics/summary", () => {
  beforeEach(() => {
    mockGetSession.mockResolvedValue(null);
  });

  it("returns 401 when no session", async () => {
    const req = new Request("http://localhost/api/admin/analytics/summary");
    const res = await GET(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 200 with data when session present", async () => {
    mockGetSession.mockResolvedValueOnce({ user: { id: "1" } } as never);
    const req = new Request("http://localhost/api/admin/analytics/summary");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toBeDefined();
    expect(json.data.totalSessions).toBe(170);
    expect(json.data.pageViews).toBeDefined();
    expect(json.error).toBeNull();
  });
});
