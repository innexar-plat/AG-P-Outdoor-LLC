import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(() => Promise.resolve(null)),
    },
  },
}));

vi.mock("@/lib/queries/forms", () => ({
  countFormSubmissions: vi.fn(() => Promise.resolve(3)),
}));

import { GET } from "./route";
import { auth } from "@/lib/auth";
import { countFormSubmissions } from "@/lib/queries/forms";

const mockGetSession = vi.mocked(auth.api.getSession);
const mockCount = vi.mocked(countFormSubmissions);

describe("GET /api/admin/notifications/count", () => {
  beforeEach(() => {
    mockGetSession.mockResolvedValue(null);
  });

  it("returns 401 when no session", async () => {
    const req = new Request("http://localhost/api/admin/notifications/count");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns unread count when session present", async () => {
    mockGetSession.mockResolvedValueOnce({ user: { id: "1" } } as never);
    mockCount.mockResolvedValueOnce(5 as never);
    const req = new Request("http://localhost/api/admin/notifications/count");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.unreadCount).toBe(5);
    expect(json.error).toBeNull();
  });
});
