interface DashboardCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
}

export default function DashboardCard({
  title,
  value,
  description,
  icon,
  iconBg,
}: DashboardCardProps) {
  return (
    <div className="w-md rounded-4xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-xl text-primary-foreground ${iconBg}`}
        >
          {icon}
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            {title}
          </p>

          <h2 className="mt-1 text-4xl font-bold text-card-foreground">
            {value}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}