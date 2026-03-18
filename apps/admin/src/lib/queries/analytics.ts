import { sql, gte, desc } from "drizzle-orm";
import { db } from "../db";
import { pageViews } from "@/lib/schema";

/**
 * Records a page view for analytics.
 */
export async function insertPageView(data: {
  pagePath: string;
  sessionId?: string | null;
  referrer?: string | null;
  deviceCategory?: string;
}) {
  await db.insert(pageViews).values({
    pagePath: data.pagePath,
    sessionId: data.sessionId ?? null,
    referrer: data.referrer ?? null,
    deviceCategory: data.deviceCategory ?? "desktop",
    createdAt: new Date(),
  });
}

/**
 * Aggregates page views from the last N days.
 */
export async function getPageViewsSummary(days: number = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const rows = await db
    .select({
      pagePath: pageViews.pagePath,
      screenPageViews: sql<string>`cast(count(*) as text)`,
    })
    .from(pageViews)
    .where(gte(pageViews.createdAt, since))
    .groupBy(pageViews.pagePath)
    .orderBy(desc(sql`count(*)`))
    .limit(50);

  return rows;
}

function parseSource(referrer: string | null): string {
  if (!referrer || referrer.trim() === "") return "(direct)";
  const r = referrer.toLowerCase();
  if (r.includes("google")) return "google";
  if (r.includes("facebook")) return "facebook";
  if (r.includes("instagram")) return "instagram";
  if (r.includes("twitter") || r.includes("x.com")) return "twitter";
  if (r.includes("linkedin")) return "linkedin";
  if (r.includes("bing")) return "bing";
  if (r.includes("yahoo")) return "yahoo";
  return "(other)";
}

/**
 * Aggregates traffic sources (from referrer) for the last N days.
 */
export async function getSourcesSummary(days: number = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const rows = await db
    .select({ referrer: pageViews.referrer })
    .from(pageViews)
    .where(gte(pageViews.createdAt, since));

  const bySource: Record<string, number> = {};
  for (const r of rows) {
    const src = parseSource(r.referrer);
    bySource[src] = (bySource[src] ?? 0) + 1;
  }
  return Object.entries(bySource)
    .map(([sessionSource, count]) => ({ sessionSource, sessions: String(count) }))
    .sort((a, b) => Number(b.sessions) - Number(a.sessions))
    .slice(0, 20);
}

/**
 * Aggregates device categories for the last N days.
 */
export async function getDevicesSummary(days: number = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const rows = await db
    .select({ deviceCategory: pageViews.deviceCategory })
    .from(pageViews)
    .where(gte(pageViews.createdAt, since));

  const byDevice: Record<string, number> = {};
  for (const r of rows) {
    const d = r.deviceCategory?.trim() || "desktop";
    byDevice[d] = (byDevice[d] ?? 0) + 1;
  }
  return Object.entries(byDevice)
    .map(([deviceCategory, count]) => ({ deviceCategory, sessions: String(count) }))
    .sort((a, b) => Number(b.sessions) - Number(a.sessions))
    .slice(0, 10);
}

/**
 * Total page views (sessions) in the last N days.
 */
export async function getTotalSessions(days: number = 30): Promise<number> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(pageViews)
    .where(gte(pageViews.createdAt, since));
  return Number(row?.count ?? 0);
}
