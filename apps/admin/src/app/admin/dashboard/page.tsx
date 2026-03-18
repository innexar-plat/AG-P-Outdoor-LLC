import { requireModule } from "@/lib/guards";
import { listFormSubmissions, countFormSubmissions } from "@/lib/queries/forms";
import { getAnalyticsSummary } from "@/lib/services/analytics";
import { DashboardView } from "@/components/admin/DashboardView";

export default async function DashboardPage() {
  await requireModule("dashboard");

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [lastFive, leadsLast7Days, unreadCount, analytics] = await Promise.all([
    listFormSubmissions({ limit: 5 }),
    countFormSubmissions({ since: sevenDaysAgo }),
    countFormSubmissions({ read: false }),
    getAnalyticsSummary(1),
  ]);

  const topPage =
    analytics.pageViews.length > 0
      ? analytics.pageViews[0].pagePath || "/"
      : "—";

  return (
    <DashboardView
      totalSessions={analytics.totalSessions}
      leadsLast7Days={leadsLast7Days}
      unreadCount={unreadCount}
      topPage={topPage}
      lastFive={lastFive}
    />
  );
}
