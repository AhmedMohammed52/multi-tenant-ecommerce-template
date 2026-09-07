import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function OrdersChart({ data = [] }) {
  return (
    <section className="panel p-5">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-foreground">Orders</h3>
        <p className="text-xs text-muted-foreground">Order volume trend</p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border, #e5e7eb)"
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#888888" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#888888" }}
            />
            <Tooltip cursor={{ fill: "transparent" }} />
            <Bar
              dataKey="orders"
              fill="#D4AF37"
              radius={[4, 4, 0, 0]}
              barSize={26}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
