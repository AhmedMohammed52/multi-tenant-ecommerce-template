import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function PageHeader({
  title,
  subtitle,
  children,
  breadcrumbs,
  status,
  updatedAt,
}) {
  const isDashboardHome = title?.toLowerCase() === "dashboard";

  return (
    <header className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-2">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            <li className="flex items-center gap-1">
              <Link
                to="/admin"
                className="rounded hover:text-foreground transition-colors"
              >
                Home
              </Link>
              {(!isDashboardHome ||
                (breadcrumbs && breadcrumbs.length > 0)) && (
                <ChevronRight className="size-3" />
              )}
            </li>

            {breadcrumbs && breadcrumbs.length > 0
              ? breadcrumbs.map((item, index) => {
                  const isLast = index === breadcrumbs.length - 1;
                  return (
                    <li key={index} className="flex items-center gap-1">
                      {item.path && !isLast ? (
                        <Link
                          to={item.path}
                          className="rounded hover:text-foreground transition-colors"
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <span className="text-foreground truncate max-w-xs">
                          {item.label}
                        </span>
                      )}
                      {!isLast && <ChevronRight className="size-3" />}
                    </li>
                  );
                })
              : !isDashboardHome && (
                  <li className="flex items-center gap-1">
                    <span className="text-foreground">{title}</span>
                  </li>
                )}
          </ol>
        </nav>

        {/* Title */}
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>

        {/* Subtitle / SKU */}
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}

        {/* Status Badge & Updated Date */}
        {(status || updatedAt) && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {status && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${
                  status.toLowerCase() === "active"
                    ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/25 dark:bg-emerald-500/20 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground border-border"
                }`}
              >
                <span
                  className="size-1.5 rounded-full bg-current opacity-80"
                  aria-hidden="true"
                />
                {status}
              </span>
            )}

            {updatedAt && (
              <span className="text-xs text-muted-foreground">
                Updated {updatedAt}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {children && (
        <div className="flex flex-wrap items-center gap-2">{children}</div>
      )}
    </header>
  );
}
