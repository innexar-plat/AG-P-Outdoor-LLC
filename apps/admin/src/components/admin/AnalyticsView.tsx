"use client";

import type { AnalyticsSummary } from "@/lib/services/analytics";
import { useI18n } from "@/lib/i18n";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Table, Thead, Th, Td, TableEmpty } from "@/components/ui/Table";

function HorizontalBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-600 w-20 truncate">{label}</span>
      <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-slate-700 w-12 text-right">{value}</span>
    </div>
  );
}

function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return null;

  let cumPct = 0;
  const gradientParts = segments.map((seg) => {
    const startPct = cumPct;
    const pct = (seg.value / total) * 100;
    cumPct += pct;
    return `${seg.color} ${startPct}% ${cumPct}%`;
  });

  return (
    <div className="flex items-center gap-6">
      <div
        className="w-28 h-28 rounded-full shrink-0"
        style={{
          background: `conic-gradient(${gradientParts.join(", ")})`,
          WebkitMask: "radial-gradient(farthest-side, transparent 60%, black 61%)",
          mask: "radial-gradient(farthest-side, transparent 60%, black 61%)",
        }}
      />
      <div className="space-y-1.5">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-xs text-slate-600">{seg.label}</span>
            <span className="text-xs font-semibold text-slate-700 ml-auto">
              {Math.round((seg.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const BAR_COLORS = [
  "bg-brand-500",
  "bg-sky-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-amber-500",
  "bg-rose-500",
];

const DONUT_COLORS = ["#0ea5e9", "#6366f1", "#14b8a6", "#f59e0b", "#ef4444"];

/** Analytics data visualization with charts and i18n */
export function AnalyticsView({ data }: { data: AnalyticsSummary }) {
  const { t } = useI18n();
  const maxPageViews = Math.max(...data.pageViews.map((r) => Number(r.screenPageViews)), 1);
  const maxSources = Math.max(...data.sources.map((r) => Number(r.sessions)), 1);

  return (
    <div className="space-y-6">
      <PageHeader title={t("analytics")} description={t("analyticsDesc")} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title={t("totalSessions")} value={data.totalSessions} />
        <StatCard title={t("pagesTracked")} value={data.pageViews.length} />
        <StatCard title={t("trafficSources")} value={data.sources.length} />
      </div>

      <Card>
        <CardHeader><h2 className="section-title">{t("pageViews")}</h2></CardHeader>
        <CardBody className="space-y-3">
          {data.pageViews.length === 0 ? (
            <p className="text-sm text-slate-400">{t("noData")}</p>
          ) : (
            data.pageViews.map((row, i) => (
              <HorizontalBar
                key={i}
                label={row.pagePath || "/"}
                value={Number(row.screenPageViews)}
                max={maxPageViews}
                color={BAR_COLORS[i % BAR_COLORS.length]}
              />
            ))
          )}
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><h2 className="section-title">{t("trafficSources")}</h2></CardHeader>
          <CardBody className="space-y-3">
            {data.sources.length === 0 ? (
              <p className="text-sm text-slate-400">{t("noData")}</p>
            ) : (
              data.sources.map((row, i) => (
                <HorizontalBar
                  key={i}
                  label={row.sessionSource}
                  value={Number(row.sessions)}
                  max={maxSources}
                  color={BAR_COLORS[(i + 2) % BAR_COLORS.length]}
                />
              ))
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><h2 className="section-title">{t("devices")}</h2></CardHeader>
          <CardBody>
            {data.devices.length === 0 ? (
              <p className="text-sm text-slate-400">{t("noData")}</p>
            ) : (
              <DonutChart
                segments={data.devices.map((d, i) => ({
                  label: d.deviceCategory,
                  value: Number(d.sessions),
                  color: DONUT_COLORS[i % DONUT_COLORS.length],
                }))}
              />
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader><h2 className="section-title">{t("pageViews")} — {t("all")}</h2></CardHeader>
        <CardBody className="p-0">
          <Table>
            <Thead><tr><Th>{t("page")}</Th><Th>{t("views")}</Th></tr></Thead>
            <tbody>
              {data.pageViews.length === 0 ? (
                <TableEmpty colSpan={2} message={t("noData")} />
              ) : (
                data.pageViews.map((row, i) => (
                  <tr key={i} className="border-t border-surface-border">
                    <Td className="font-mono text-xs">{row.pagePath || "/"}</Td>
                    <Td className="font-semibold">{row.screenPageViews}</Td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}
