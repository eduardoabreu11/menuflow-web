import { ReactNode } from "react";

type MasterMetricCardProps = {
  title: string;
  value: string;
  description?: string;
  icon: ReactNode;
};

export function MasterMetricCard({
  title,
  value,
  description,
  icon,
}: MasterMetricCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>

        <div className="flex-1">
          <p className="text-sm text-muted-foreground">
            {title}
          </p>

          <h3 className="mt-1 text-2xl font-bold text-foreground">
            {value}
          </h3>

          {description && (
            <p className="mt-2 text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}