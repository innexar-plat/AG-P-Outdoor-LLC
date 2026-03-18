import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "./middleware";

function createRequest(
  pathname: string,
  options?: { method?: string; origin?: string; cookie?: string }
): NextRequest {
  const url = `http://localhost:3000${pathname}`;
  const headers = new Headers();
  if (options?.origin) headers.set("origin", options.origin);
  if (options?.cookie) headers.set("cookie", options.cookie);
  return new NextRequest(url, {
    method: options?.method ?? "GET",
    headers,
  });
}

describe("middleware", () => {
  it("allows public path /admin/login", () => {
    const req = createRequest("/admin/login");
    const res = middleware(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("location")).toBeNull();
  });

  it("allows public path /", () => {
    const req = createRequest("/");
    const res = middleware(req);
    expect(res.status).toBe(200);
  });

  it("allows /api/auth paths", () => {
    const req = createRequest("/api/auth/sign-in/email");
    const res = middleware(req);
    expect(res.status).toBe(200);
  });

  it("allows /api/site paths", () => {
    const req = createRequest("/api/site/settings");
    const res = middleware(req);
    expect(res.status).toBe(200);
  });

  it("handles OPTIONS for /api/site with 204", () => {
    const req = createRequest("/api/site/forms/submit", { method: "OPTIONS" });
    const res = middleware(req);
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Methods")).toContain("GET");
  });

  it("redirects to /login when no session on protected path", () => {
    const req = createRequest("/admin/dashboard");
    const res = middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/admin/login");
    expect(res.headers.get("location")).toContain("callbackUrl=%2Fadmin%2Fdashboard");
  });

  it("redirects /api/admin path to login when no session", () => {
    const req = createRequest("/api/admin/users");
    const res = middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/admin/login");
  });

  it("allows access when session cookie is present", () => {
    const req = createRequest("/admin/dashboard", {
      cookie: "better-auth.session_token=abc123",
    });
    const res = middleware(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("location")).toBeNull();
  });

  it("allows access with __Secure- prefixed session cookie", () => {
    const req = createRequest("/admin/dashboard", {
      cookie: "__Secure-better-auth.session_token=xyz",
    });
    const res = middleware(req);
    expect(res.status).toBe(200);
  });

  it("sets CORS headers for /api/site responses", () => {
    const req = createRequest("/api/site/settings");
    const res = middleware(req);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeTruthy();
    expect(res.headers.get("Access-Control-Allow-Methods")).toContain("POST");
  });
});
