"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Table, Thead, Th, Td, TableEmpty } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/format-date";

type Submission = {
  id: number;
  formType: string;
  name: string;
  email: string;
  read: boolean;
  createdAt: Date | string;
};

interface DashboardViewProps {
  totalSessions: number;
  leadsLast7Days: number;
  unreadCount: number;
  topPage: string;
  lastFive: Submission[];
}

/** Client-side dashboard — banners agora ficam no RightPanel do layout */
export function DashboardView({ totalSessions, leadsLast7Days, unreadCount, topPage, lastFive }: DashboardViewProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-8">
      <PageHeader title={t("dashboard")} description={t("dashboardDesc")} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t("todayVisits")} value={totalSessions} icon={<VisitIcon />} />
        <StatCard title={t("newLeads7d")} value={leadsLast7Days} icon={<LeadIcon />} />
        <StatCard title={t("unread")} value={unreadCount} icon={<UnreadIcon />} />
        <StatCard title={t("topPage")} value={topPage} icon={<PageIcon />} />
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="section-title">{t("recentSubmissions")}</h2>
          <Link href="/admin/forms">
            <Button variant="ghost" size="sm">{t("viewAll")}</Button>
          </Link>
        </CardHeader>
        <CardBody className="p-0">
          <Table>
            <Thead>
              <tr>
                <Th>{t("date")}</Th>
                <Th>{t("type")}</Th>
                <Th>{t("name")}</Th>
                <Th>{t("email")}</Th>
                <Th>{t("status")}</Th>
              </tr>
            </Thead>
            <tbody>
              {lastFive.length === 0 ? (
                <TableEmpty colSpan={5} message={t("noSubmissions")} />
              ) : (
                lastFive.map((s) => (
                  <tr key={s.id} className="border-t border-surface-border hover:bg-surface-muted transition-colors">
                    <Td className="text-slate-500 text-xs">
                      {formatDate(s.createdAt)}
                    </Td>
                    <Td><Badge variant="info">{s.formType}</Badge></Td>
                    <Td className="font-medium text-slate-900">{s.name}</Td>
                    <Td>{s.email}</Td>
                    <Td>
                      {s.read
                        ? <Badge variant="default">{t("read")}</Badge>
                        : <Badge variant="warning" dot>{t("newBadge")}</Badge>
                      }
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <h2 className="section-title mb-4">{t("quickAccess")}</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/admin/analytics", label: t("analytics") },
              { href: "/admin/portfolio", label: t("portfolio") },
              { href: "/admin/blog", label: t("blog") },
              { href: "/admin/forms", label: t("forms") },
              { href: "/admin/testimonials", label: t("testimonials") },
              { href: "/admin/settings", label: t("settings") },
            ].map((link) => (
              <Link key={link.href} href={link.href}>
                <Button variant="outline" size="sm">{link.label}</Button>
              </Link>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function VisitIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function LeadIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function UnreadIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

function PageIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  );
}
