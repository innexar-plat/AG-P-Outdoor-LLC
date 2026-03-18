import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(() => Promise.resolve(null)),
    },
  },
}));

vi.mock("@/lib/r2", () => ({
  r2: null,
}));

import { POST } from "./route";
import { auth } from "@/lib/auth";

const mockGetSession = vi.mocked(auth.api.getSession);

function createMockFile(content: BlobPart[], options: { name: string; type: string; size?: number }): File {
  const blob = new Blob(content, { type: options.type });
  return new File([blob], options.name, {
    type: options.type,
    lastModified: Date.now(),
  });
}

describe("POST /api/admin/upload", () => {
  beforeEach(() => {
    mockGetSession.mockResolvedValue(null);
  });

  it("returns 401 when no session", async () => {
    const file = createMockFile(["test"], { name: "test.png", type: "image/png" });
    const formData = new FormData();
    formData.set("file", file);

    const req = new Request("http://localhost/api/admin/upload", {
      method: "POST",
      body: formData,
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 400 when no file provided", async () => {
    mockGetSession.mockResolvedValueOnce({ user: { id: "1" } } as never);
    const formData = new FormData();

    const req = new Request("http://localhost/api/admin/upload", {
      method: "POST",
      body: formData,
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("No file provided");
  });

  it("returns 400 when file is too large", async () => {
    mockGetSession.mockResolvedValueOnce({ user: { id: "1" } } as never);
    const largeContent = new Array(6 * 1024 * 1024).fill("x").join("");
    const file = createMockFile([largeContent], {
      name: "large.png",
      type: "image/png",
    });
    const formData = new FormData();
    formData.set("file", file);

    const req = new Request("http://localhost/api/admin/upload", {
      method: "POST",
      body: formData,
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("File too large (max 5MB)");
  });

  it("returns 200 with base64 data URL when R2 not configured", async () => {
    mockGetSession.mockResolvedValueOnce({ user: { id: "1" } } as never);
    const file = createMockFile(["small image content"], {
      name: "test.png",
      type: "image/png",
    });
    const formData = new FormData();
    formData.set("file", file);

    const req = new Request("http://localhost/api/admin/upload", {
      method: "POST",
      body: formData,
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toBeDefined();
    expect(json.data.url).toMatch(/^data:image\/png;base64,/);
    expect(json.data.r2).toBe(false);
    expect(json.error).toBeNull();
  });
});
