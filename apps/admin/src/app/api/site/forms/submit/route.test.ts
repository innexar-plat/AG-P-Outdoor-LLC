import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/schema", () => ({
  formSubmissions: { id: "id" },
}));

vi.mock("@/lib/queries/forms", () => ({
  createFormSubmission: vi.fn(() => Promise.resolve(1)),
}));
vi.mock("@/lib/queries/settings", () => ({
  getSetting: vi.fn(() => Promise.resolve("notify@test.com")),
}));
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn(() => true),
}));
vi.mock("@/lib/services/email", () => ({
  sendNotificationEmail: vi.fn(() => Promise.resolve(true)),
}));

import { POST } from "./route";

describe("POST /api/site/forms/submit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when body is invalid JSON", async () => {
    const req = new Request("http://localhost/api/site/forms/submit", {
      method: "POST",
      body: "not json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeDefined();
  });

  it("returns 400 when required fields are missing", async () => {
    const req = new Request("http://localhost/api/site/forms/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formType: "contact" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeDefined();
  });

  it("returns 201 with id when valid body", async () => {
    const req = new Request("http://localhost/api/site/forms/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        formType: "contact",
        name: "Test User",
        email: "test@example.com",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data).toBeDefined();
    expect(json.data.id).toBe(1);
    expect(json.error).toBeNull();
  });

  it("returns 429 when rate limit exceeded", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    vi.mocked(checkRateLimit).mockReturnValue(false);
    const req = new Request("http://localhost/api/site/forms/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        formType: "contact",
        name: "Test",
        email: "test@example.com",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(429);
    const json = await res.json();
    expect(json.error).toBeDefined();
    expect(json.code).toBe("RATE_LIMIT");
  });
});
