import {
  getPageViewsSummary,
  getSourcesSummary,
  getDevicesSummary,
  getTotalSessions,
} from "@/lib/queries/analytics";

export type PageViewsRow = { pagePath: string; screenPageViews: string };
export type SourceRow = { sessionSource: string; sessions: string };
export type DeviceRow = { deviceCategory: string; sessions: string };

export interface AnalyticsSummary {
  pageViews: PageViewsRow[];
  sources: SourceRow[];
  devices: DeviceRow[];
  totalSessions: number;
}

/**
 * Returns analytics summary from page_views table.
 * @param days - Number of days to aggregate (default 30)
 */
export async function getAnalyticsSummary(days: number = 30): Promise<AnalyticsSummary> {
  const [pageViews, sources, devices, totalSessions] = await Promise.all([
    getPageViewsSummary(days),
    getSourcesSummary(days),
    getDevicesSummary(days),
    getTotalSessions(days),
  ]);
  return {
    pageViews,
    sources,
    devices,
    totalSessions,
  };
}
