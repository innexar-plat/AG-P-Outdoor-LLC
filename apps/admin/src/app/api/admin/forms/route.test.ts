import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/queries/forms", () => ({
  listFormSubmissions: vi.fn(() => Promise.resolve([])),
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(() => Promise.resolve(null)),
    },
  },
}));

import { GET } from "./route";

describe("GET /api/admin/forms", () => {
  it("returns 401 when no session", async () => {
    const req = new Request("http://localhost/api/admin/forms");
    const res = await GET(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Unauthorized");
  });
});
