import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/schema", () => ({
  formSubmissions: { id: "id", read: "read" },
}));

vi.mock("@/lib/queries/forms", () => ({
  getFormSubmissionById: vi.fn(() => Promise.resolve(null)),
  updateFormSubmissionRead: vi.fn(() => Promise.resolve({ id: 1, read: true })),
  updateFormSubmission: vi.fn(() => Promise.resolve({ id: 1, read: true, leadStatus: "called", crmComment: "ligado" })),
  deleteFormSubmission: vi.fn(() => Promise.resolve()),
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(() => Promise.resolve(null)),
    },
  },
}));

import { PATCH, DELETE } from "./route";
import { auth } from "@/lib/auth";

describe("PATCH /api/admin/forms/[id]", () => {
  it("returns 401 when no session", async () => {
    const req = new Request("http://localhost/api/admin/forms/1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: true }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 400 when body read is not boolean", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({
      user: { id: "u1", name: "Admin", email: "a@b.com", emailVerified: false, image: null, role: "admin" as const, createdAt: new Date(), updatedAt: new Date() },
      session: { id: "s1", userId: "u1", token: "t", expiresAt: new Date(), createdAt: new Date(), updatedAt: new Date() },
    } as never);
    const req = new Request("http://localhost/api/admin/forms/1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: "yes" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeDefined();
  });

  it("accepts lead status and CRM comment updates", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({
      user: { id: "u1", name: "Admin", email: "a@b.com", emailVerified: false, image: null, role: "admin" as const, createdAt: new Date(), updatedAt: new Date() },
      session: { id: "s1", userId: "u1", token: "t", expiresAt: new Date(), createdAt: new Date(), updatedAt: new Date() },
    } as never);

    const forms = await import("@/lib/queries/forms");
    vi.mocked(forms.getFormSubmissionById).mockResolvedValueOnce({ id: 1, read: true, leadStatus: "new", crmComment: null } as never);

    const req = new Request("http://localhost/api/admin/forms/1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadStatus: "called", crmComment: "ligado" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toMatchObject({ leadStatus: "called", crmComment: "ligado" });
  });
});

describe("DELETE /api/admin/forms/[id]", () => {
  it("returns 401 when no session", async () => {
    const req = new Request("http://localhost/api/admin/forms/1", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Unauthorized");
  });
});
