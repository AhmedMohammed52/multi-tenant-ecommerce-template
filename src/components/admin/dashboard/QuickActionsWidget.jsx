import { Box, Tag, Users, Star } from "lucide-react";
import { Link } from "react-router-dom";

const quickActions = [
  {
    id: 1,
    label: "Add a product",
    icon: Box,
    path: "/admin/products",
  },
  {
    id: 2,
    label: "Create a coupon",
    icon: Tag,
    path: "/admin/settings",
  },
  {
    id: 3,
    label: "Review customers",
    icon: Users,
    path: "/admin/orders",
  },
  {
    id: 4,
    label: "Edit storefront theme",
    icon: Star,
    path: "/admin/settings",
  },
];

export default function QuickActionsWidget() {
  return (
    <section className="panel p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Quick actions</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Jump into common tasks
          </p>
        </div>
      </div>

      <div className="grid gap-2">
        {quickActions.map((action) => {
          const IconComponent = action.icon;
          return (
            <Link
              to={action.path}
              key={action.id}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 justify-start"
            >
              <IconComponent className="size-4" />
              {action.label}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
