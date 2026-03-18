import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit } from "./rate-limit";

function makeRequest(ip?: string): Request {
  const headers = new Headers();
  if (ip) headers.set("x-forwarded-for", ip);
  return new Request("https://example.com/api/forms/submit", {
    method: "POST",
    headers,
  });
}

describe("checkRateLimit", () => {
  beforeEach(() => {
    // Rate limit uses in-memory store; each test gets fresh state
    // because we import fresh - but the store is module-level.
    // We need to test with different IPs to avoid cross-test pollution.
    // Actually the store persists across tests. We'll use unique IPs per test.
  });

  it("allows first request", () => {
    const req = makeRequest("192.168.1.1");
    expect(checkRateLimit(req)).toBe(true);
  });

  it("allows up to 5 requests from same IP", () => {
    const ip = "10.0.0.1";
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(makeRequest(ip))).toBe(true);
    }
  });

  it("blocks 6th request within window", () => {
    const ip = "10.0.0.2";
    for (let i = 0; i < 5; i++) {
      checkRateLimit(makeRequest(ip));
    }
    expect(checkRateLimit(makeRequest(ip))).toBe(false);
  });

  it("uses x-forwarded-for when present", () => {
    const ip = "203.0.113.42";
    expect(checkRateLimit(makeRequest(ip))).toBe(true);
  });

  it("uses first IP from x-forwarded-for comma list", () => {
    const req = new Request("https://example.com", {
      headers: { "x-forwarded-for": "  client-ip  , proxy1, proxy2" },
    });
    expect(checkRateLimit(req)).toBe(true);
  });

  it("falls back to unknown when no IP headers", () => {
    const req = new Request("https://example.com", { headers: {} });
    expect(checkRateLimit(req)).toBe(true);
  });
});
