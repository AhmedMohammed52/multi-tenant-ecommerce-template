import { ShieldCheck } from "lucide-react";

const rolesData = [
  {
    id: "owner",
    title: "Owner",
    description: "Full access including billing and store deletion",
  },
  {
    id: "admin",
    title: "Admin",
    description: "Everything except billing and ownership transfer",
  },
  {
    id: "manager",
    title: "Manager",
    description: "Catalog, orders, customers and coupons",
  },
  {
    id: "editor",
    title: "Editor",
    description: "Storefront content, homepage and appearance",
  },
  {
    id: "support",
    title: "Support",
    description: "Read-only orders and customers, review moderation",
  },
];

export default function RolesPermissions() {
  return (
    <section className="panel p-5 bg-card border border-border rounded-xl shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Roles &amp; permissions
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            What each role can do
          </p>
        </div>
      </div>

      <ul className="divide-y divide-border">
        {rolesData.map((role) => (
          <li
            key={role.id}
            className="flex items-start gap-3 py-3 px-2 -mx-2 rounded-md transition-colors hover:bg-accent/50"
          >
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" />
            <span>
              <span className="block text-sm font-medium text-foreground">
                {role.title}
              </span>
              <span className="block text-xs text-muted-foreground">
                {role.description}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
