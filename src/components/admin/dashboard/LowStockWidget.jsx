import { Box } from "lucide-react";
import { Link } from "react-router-dom";

const lowStockItems = [
  { id: 1, name: "Classic Oversized Hoodie", count: 4 },
  { id: 2, name: "Structured Leather Tote", count: 7 },
  { id: 3, name: "Tailored Wool Trousers", count: 9 },
];

export default function LowStockWidget() {
  return (
    <section className="panel p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Low stock alerts</h2>

          <p className="mt-0.5 text-xs text-muted-foreground">
            Products at or below their threshold
          </p>
        </div>

        <Link
          to="/admin/products"
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs"
        >
          <Box className="size-4" />
          Inventory
        </Link>
      </div>

      <ul className="space-y-2.5">
        {lowStockItems.map((item) => (
          <li key={item.id} className="flex items-center gap-3">
            <span className="min-w-0 flex-1 truncate text-sm">{item.name}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium capitalize bg-warning-soft text-warning-foreground border-warning/35">
              {item.count} Left
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
