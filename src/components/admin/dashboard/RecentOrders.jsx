import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const defaultOrders = [
  {
    id: "#10248",
    customer: "Nour Ibrahim",
    date: "Aug 26, 2026",
    status: "Paid",
    amount: "2,280 EGP",
  },
  {
    id: "#10247",
    customer: "Youssef Kamal",
    date: "Aug 26, 2026",
    status: "Pending",
    amount: "1,860 EGP",
  },
  {
    id: "#10246",
    customer: "Salma Adel",
    date: "Aug 25, 2026",
    status: "Paid",
    amount: "2,255 EGP",
  },
  {
    id: "#10245",
    customer: "Omar Sherif",
    date: "Aug 25, 2026",
    status: "Failed",
    amount: "1,730 EGP",
  },
  {
    id: "#10244",
    customer: "Hana Mostafa",
    date: "Aug 24, 2026",
    status: "Paid",
    amount: "2,020 EGP",
  },
  {
    id: "#10243",
    customer: "Kareem Fouad",
    date: "Aug 23, 2026",
    status: "Refunded",
    amount: "1,530 EGP",
  },
];

const getStatusBadge = (status) => {
  switch (status) {
    case "Paid":
      return "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400";
    case "Pending":
      return "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400";
    case "Failed":
      return "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-400";
    case "Refunded":
      return "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400";
    default:
      return "border-gray-200 bg-gray-50 text-gray-600";
  }
};

export default function RecentOrders({ orders = defaultOrders }) {
  return (
    <section className="panel p-5 xl:col-span-2">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Recent orders</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Latest activity across all channels
          </p>
        </div>

        <Link
          to="/admin/orders"
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs"
        >
          View all
          <ArrowUpRight className="size-4" />
        </Link>
      </div>

      <ul className="divide-y divide-border">
        {orders.map((order) => (
          <li
            key={order.id}
            className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
          >
            <div className="flex items-center gap-4">
              <span className="num text-xs font-semibold text-foreground/80">
                {order.id}
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {order.customer}
                </p>
                <p className="text-xs text-muted-foreground">{order.date}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(order.status)}`}
              >
                • {order.status}
              </span>
              <span className="num text-sm font-semibold text-foreground min-w-20 text-right">
                {order.amount}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
