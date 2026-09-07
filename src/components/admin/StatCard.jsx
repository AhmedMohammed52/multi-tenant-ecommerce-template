import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function StatCard({
  icon: Icon,
  title,
  value,
  change,
  isPositive = true,
  comparisonText,
}) {
  return (
    <article className="panel group p-5 transition-shadow hover:shadow-card">
      <div className="flex items-start justify-between gap-3">
        {Icon && (
          <span className="flex size-9 items-center justify-center rounded-md border border-border bg-surface-muted text-muted-foreground transition-colors group-hover:border-brand/30 group-hover:text-brand">
            <Icon className="size-4" />
          </span>
        )}

        {change && (
          <span
            className={`num inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-xs font-medium ${
              isPositive
                ? "border-success/25 bg-success-soft text-success"
                : "border-destructive/25 bg-destructive-soft text-destructive"
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="size-3.5" />
            ) : (
              <ArrowDownRight className="size-3.5" />
            )}
            <span>{change}</span>
          </span>
        )}
      </div>

      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </p>

      <p className="num mt-1 text-2xl font-semibold">{value}</p>

      {comparisonText && (
        <p className="mt-1 text-xs text-muted-foreground">{comparisonText}</p>
      )}
    </article>
  );
}
