import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetSession = vi.fn();
const mockGetUserById = vi.fn();

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
    },
  },
}));

vi.mock("@/lib/queries/users", () => ({
  getUserById: (id: string) => mockGetUserById(id),
}));

import { requireAuth, requireAdminApi } from "./api-guards";

describe("requireAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when session is null", async () => {
    mockGetSession.mockResolvedValue(null);
    const request = new Request("https://example.com/api/test", {
      headers: {},
    });
    const result = await requireAuth(request);
    expect(result.authorized).toBe(false);
    if (!result.authorized) {
      expect(result.response.status).toBe(401);
      const json = await result.response.json();
      expect(json.error).toBe("Unauthorized");
    }
  });

  it("returns authorized with session and role when user exists", async () => {
    const session = { user: { id: "user-1" } };
    mockGetSession.mockResolvedValue(session);
    mockGetUserById.mockResolvedValue({ id: "user-1", role: "admin" });
    const request = new Request("https://example.com/api/test", {
      headers: {},
    });
    const result = await requireAuth(request);
    expect(result.authorized).toBe(true);
    if (result.authorized) {
      expect(result.session).toEqual(session);
      expect(result.role).toBe("admin");
    }
  });

  it("defaults to editor when user record is null", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    mockGetUserById.mockResolvedValue(null);
    const request = new Request("https://example.com/api/test", {
      headers: {},
    });
    const result = await requireAuth(request);
    expect(result.authorized).toBe(true);
    if (result.authorized) {
      expect(result.role).toBe("editor");
    }
  });

  it("defaults to editor when user record has no role", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    mockGetUserById.mockResolvedValue({ id: "user-1" });
    const request = new Request("https://example.com/api/test", {
      headers: {},
    });
    const result = await requireAuth(request);
    expect(result.authorized).toBe(true);
    if (result.authorized) {
      expect(result.role).toBe("editor");
    }
  });
});

describe("requireAdminApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when session is null", async () => {
    mockGetSession.mockResolvedValue(null);
    const request = new Request("https://example.com/api/test", {
      headers: {},
    });
    const result = await requireAdminApi(request);
    expect(result.authorized).toBe(false);
    if (!result.authorized) {
      expect(result.response.status).toBe(401);
    }
  });

  it("returns 403 when user is editor", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    mockGetUserById.mockResolvedValue({ id: "user-1", role: "editor" });
    const request = new Request("https://example.com/api/test", {
      headers: {},
    });
    const result = await requireAdminApi(request);
    expect(result.authorized).toBe(false);
    if (!result.authorized) {
      expect(result.response.status).toBe(403);
      const json = await result.response.json();
      expect(json.error).toBe("Forbidden");
    }
  });

  it("returns authorized when user is admin", async () => {
    const session = { user: { id: "user-1" } };
    mockGetSession.mockResolvedValue(session);
    mockGetUserById.mockResolvedValue({ id: "user-1", role: "admin" });
    const request = new Request("https://example.com/api/test", {
      headers: {},
    });
    const result = await requireAdminApi(request);
    expect(result.authorized).toBe(true);
    if (result.authorized) {
      expect(result.role).toBe("admin");
    }
  });
});
