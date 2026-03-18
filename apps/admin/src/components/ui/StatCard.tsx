import { Card, CardBody } from "./Card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: string; positive: boolean };
  className?: string;
}

/** Dashboard metric card with icon and optional trend indicator */
export function StatCard({ title, value, icon, trend, className = "" }: StatCardProps) {
  return (
    <Card hover className={`animate-slide-up ${className}`}>
      <CardBody className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-slate-900">{value}</p>
          {trend && (
            <p className={`text-xs font-medium ${trend.positive ? "text-emerald-600" : "text-red-600"}`}>
              {trend.positive ? "+" : ""}{trend.value}
            </p>
          )}
        </div>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            {icon}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
