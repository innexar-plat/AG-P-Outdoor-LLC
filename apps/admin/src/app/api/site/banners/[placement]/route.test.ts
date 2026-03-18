import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/queries/banners", () => ({
  listActiveBanners: vi.fn(() => Promise.resolve([])),
}));

import { GET } from "./route";

describe("GET /api/site/banners/[placement]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with empty array for valid placement", async () => {
    const req = new Request("http://localhost/api/site/banners/dashboard");
    const res = await GET(req, {
      params: Promise.resolve({ placement: "dashboard" }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toEqual([]);
    expect(json.error).toBeNull();
  });

  it("returns 200 with empty array for site_header placement", async () => {
    const req = new Request("http://localhost/api/site/banners/site_header");
    const res = await GET(req, {
      params: Promise.resolve({ placement: "site_header" }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toEqual([]);
  });

  it("returns 200 with empty array for invalid placement", async () => {
    const req = new Request("http://localhost/api/site/banners/invalid");
    const res = await GET(req, {
      params: Promise.resolve({ placement: "invalid" }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toEqual([]);
  });
});
