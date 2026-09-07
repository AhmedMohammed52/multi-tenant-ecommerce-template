import { Bell } from "lucide-react";
import Switch from "../Switch";

export default function NotificationsTab({ notifications, onChange }) {
  const list = [
    {
      id: "newOrders",
      label: "New orders",
      desc: "Notify me when a new order is placed.",
    },
    {
      id: "lowStock",
      label: "Low stock",
      desc: "Notify me when a product reaches its stock threshold.",
    },
    {
      id: "reviews",
      label: "Reviews",
      desc: "Notify me when a new review needs moderation.",
    },
    {
      id: "payouts",
      label: "Payouts",
      desc: "Notify me when a payout is completed.",
    },
    {
      id: "weeklyDigest",
      label: "Weekly digest",
      desc: "Show me a weekly summary of store activity.",
    },
  ];

  return (
    <div className="mt-4">
      <section className="panel p-5 border rounded-lg bg-card text-card-foreground shadow-sm">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Notifications</h2>

            <p className="mt-0.5 text-xs text-muted-foreground">
              Choose what you want to hear about
            </p>
          </div>
        </div>

        <ul className="divide-y divide-border">
          {list.map((item) => (
            <li key={item.id} className="flex items-center gap-4 py-3">
              <Bell className="size-4 shrink-0 text-muted-foreground" />

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{item.label}</span>

                <span className="block text-xs text-muted-foreground">
                  {item.desc}
                </span>
              </span>

              <Switch
                checked={notifications[item.id]}
                onCheckedChange={(val) => onChange(item.id, val)}
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
