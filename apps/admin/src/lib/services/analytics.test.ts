import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetPageViewsSummary = vi.fn();
const mockGetSourcesSummary = vi.fn();
const mockGetDevicesSummary = vi.fn();
const mockGetTotalSessions = vi.fn();

vi.mock("@/lib/queries/analytics", () => ({
  getPageViewsSummary: (...args: unknown[]) => mockGetPageViewsSummary(...args),
  getSourcesSummary: (...args: unknown[]) => mockGetSourcesSummary(...args),
  getDevicesSummary: (...args: unknown[]) => mockGetDevicesSummary(...args),
  getTotalSessions: (...args: unknown[]) => mockGetTotalSessions(...args),
}));

import { getAnalyticsSummary } from "./analytics";

describe("getAnalyticsSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetPageViewsSummary.mockResolvedValue([
      { pagePath: "/", screenPageViews: "100" },
    ]);
    mockGetSourcesSummary.mockResolvedValue([
      { sessionSource: "google", sessions: "50" },
    ]);
    mockGetDevicesSummary.mockResolvedValue([
      { deviceCategory: "desktop", sessions: "80" },
    ]);
    mockGetTotalSessions.mockResolvedValue(150);
  });

  it("returns combined analytics summary", async () => {
    const result = await getAnalyticsSummary(30);
    expect(result).toMatchObject({
      pageViews: [{ pagePath: "/", screenPageViews: "100" }],
      sources: [{ sessionSource: "google", sessions: "50" }],
      devices: [{ deviceCategory: "desktop", sessions: "80" }],
      totalSessions: 150,
    });
  });

  it("calls query functions with days parameter", async () => {
    await getAnalyticsSummary(7);
    expect(mockGetPageViewsSummary).toHaveBeenCalledWith(7);
    expect(mockGetSourcesSummary).toHaveBeenCalledWith(7);
    expect(mockGetDevicesSummary).toHaveBeenCalledWith(7);
    expect(mockGetTotalSessions).toHaveBeenCalledWith(7);
  });

  it("defaults to 30 days when not specified", async () => {
    await getAnalyticsSummary();
    expect(mockGetPageViewsSummary).toHaveBeenCalledWith(30);
  });
});
