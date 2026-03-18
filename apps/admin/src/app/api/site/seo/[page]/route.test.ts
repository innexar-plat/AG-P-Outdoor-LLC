import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetPageSeo = vi.fn();

vi.mock("@/lib/queries/seo", () => ({
  getPageSeo: (page: string) => mockGetPageSeo(page),
}));

import { GET } from "./route";

describe("GET /api/site/seo/[page]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 404 when page not found", async () => {
    mockGetPageSeo.mockResolvedValue(null);
    const req = new Request("https://example.com/api/site/seo/missing");
    const res = await GET(req, { params: Promise.resolve({ page: "missing" }) });
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("Not found");
  });

  it("returns 200 with SEO data when found", async () => {
    mockGetPageSeo.mockResolvedValue({
      page: "home",
      title: "Home",
      description: "Welcome",
    });
    const req = new Request("https://example.com/api/site/seo/home");
    const res = await GET(req, { params: Promise.resolve({ page: "home" }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toMatchObject({ page: "home", title: "Home" });
  });
});
