import { describe, it, expect, vi } from "vitest";
import { GET } from "./route";

vi.mock("@/lib/queries/settings", () => ({
  getPublicSettings: vi.fn(() =>
    Promise.resolve({ gtm_id: null, ga4_id: null, company_name: null })
  ),
}));

describe("GET /api/site/settings", () => {
  it("returns 200 with public settings (no auth required)", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toBeDefined();
    expect(json.data).toHaveProperty("gtm_id");
    expect(json.error).toBeNull();
  });
});
