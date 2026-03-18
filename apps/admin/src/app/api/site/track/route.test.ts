import { describe, it, expect, vi, beforeEach } from "vitest";

const mockInsertPageView = vi.fn();

vi.mock("@/lib/queries/analytics", () => ({
  insertPageView: (...args: unknown[]) => mockInsertPageView(...args),
}));

import { POST } from "./route";

describe("POST /api/site/track", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsertPageView.mockResolvedValue(undefined);
  });

  it("returns 400 when body is invalid JSON", async () => {
    const req = new Request("https://example.com/api/site/track", {
      method: "POST",
      body: "invalid",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 201 and records page view with defaults", async () => {
    const req = new Request("https://example.com/api/site/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    expect(mockInsertPageView).toHaveBeenCalledWith(
      expect.objectContaining({
        pagePath: "/",
        deviceCategory: "desktop",
      })
    );
  });

  it("records custom path, referrer, device", async () => {
    const req = new Request("https://example.com/api/site/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: "/about",
        sessionId: "s1",
        referrer: "https://google.com",
        device: "mobile",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    expect(mockInsertPageView).toHaveBeenCalledWith(
      expect.objectContaining({
        pagePath: "/about",
        sessionId: "s1",
        referrer: "https://google.com",
        deviceCategory: "mobile",
      })
    );
  });
});
