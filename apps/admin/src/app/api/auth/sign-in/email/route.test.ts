import { describe, it, expect, vi } from "vitest";
import { GET, POST } from "./route";
import { auth } from "@/lib/auth";

vi.mock("@/lib/auth", () => ({
  auth: {
    handler: vi.fn((req: Request) =>
      Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }))
    ),
  },
}));

describe("POST /api/auth/sign-in/email (explicit route for basePath fix)", () => {
  it("forwards request to auth.handler", async () => {
    const req = new Request("http://localhost/api/auth/sign-in/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "a@b.com", password: "secret" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(auth.handler).toHaveBeenCalledWith(req);
  });
});

describe("GET /api/auth/sign-in/email", () => {
  it("forwards request to auth.handler", async () => {
    const req = new Request("http://localhost/api/auth/sign-in/email");
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(auth.handler).toHaveBeenCalledWith(req);
  });
});
