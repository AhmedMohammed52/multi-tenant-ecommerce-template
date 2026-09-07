import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-popover p-2.5 shadow-md">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xs font-semibold text-foreground">
          revenue : {payload[0].value.toLocaleString()} EGP
        </p>
      </div>
    );
  }
  return null;
};

export default function RevenueChart({ data = [] }) {
  return (
    <section className="panel p-5 xl:col-span-2">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-foreground">Revenue</h3>
        <p className="text-xs text-muted-foreground">
          Gross revenue over the selected period
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                {/* 💡 استخدام currentColor أو متغيرات الـ Chart عشان يتفاعل مع الدارك مود */}
                <stop
                  offset="0%"
                  stopColor="var(--color-primary)"
                  stopOpacity={0.25}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-primary)"
                  stopOpacity={0.0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--color-border)"
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} // 💡 يتغير مع الـ Dark Mode
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} // 💡 يتغير مع الـ Dark Mode
              tickFormatter={(val) => `${val / 1000}K`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-primary)" // 💡 الخط هيبقى فاتح في الدارك مود وداكن في اللايت مود
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
