import { describe, it, expect, vi, beforeEach } from "vitest";

let mockImagesResult: unknown[] = [];

vi.mock("@/lib/queries/images", () => ({
  getSiteImagesBySection: vi.fn(() => Promise.resolve(mockImagesResult)),
}));

import { GET } from "./route";

describe("GET /api/site/images/[section]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with images for section", async () => {
    mockImagesResult = [
      { id: 1, section: "hero", url: "https://example.com/1.jpg" },
    ];
    const req = new Request("https://example.com/api/site/images/hero");
    const res = await GET(req, { params: Promise.resolve({ section: "hero" }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toHaveLength(1);
    expect(json.data[0].section).toBe("hero");
  });

  it("returns 200 with empty array when no images", async () => {
    mockImagesResult = [];
    const req = new Request("https://example.com/api/site/images/empty");
    const res = await GET(req, { params: Promise.resolve({ section: "empty" }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toEqual([]);
  });
});
