import { requireModule } from "@/lib/guards";
import { getAnalyticsSummary } from "@/lib/services/analytics";
import { AnalyticsView } from "@/components/admin/AnalyticsView";

export default async function AnalyticsPage() {
  await requireModule("analytics");
  const data = await getAnalyticsSummary(30);
  return <AnalyticsView data={data} />;
}
