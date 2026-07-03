import { ReactNode } from "react";

type MasterDashboardCardProps = {
  title: string;
  value: string;
  icon: ReactNode;
  description?: string;
};

export function MasterDashboardCard({
  title,
  value,
  icon,
  description,
}: MasterDashboardCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {title}
          </p>

          <h3 className="mt-2 text-3xl font-bold text-foreground">
            {value}
          </h3>

          {description && (
            <p className="mt-2 text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
    </div>
  );
}