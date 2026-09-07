// import { useAuth } from "../../contexts/AuthContext";
import { useAdminStore } from "../../contexts/AdminStoreContext";
import PageHeader from "../../components/admin/PageHeader";
import StatCard from "../../components/admin/StatCard";
import { DollarSign, ShoppingCart, Users, Boxes } from "lucide-react";
import RevenueChart from "../../components/admin/dashboard/RevenueChart";
import OrdersChart from "../../components/admin/dashboard/OrdersChart";
import RecentOrders from "../../components/admin/dashboard/RecentOrders";
import TopProducts from "../../components/admin/dashboard/TopProducts";
import LowStockWidget from "../../components/admin/dashboard/LowStockWidget";
import ReviewsWidget from "../../components/admin/dashboard/ReviewsWidget";
import QuickActionsWidget from "../../components/admin/dashboard/QuickActionsWidget";

const analyticsData = [
  { date: "Aug 20", revenue: 2900, orders: 38 },
  { date: "Aug 21", revenue: 3100, orders: 44 },
  { date: "Aug 22", revenue: 3000, orders: 41 },
  { date: "Aug 23", revenue: 3600, orders: 52 },
  { date: "Aug 24", revenue: 4210, orders: 61 },
  { date: "Aug 25", revenue: 3900, orders: 55 },
  { date: "Aug 26", revenue: 3900, orders: 57 },
];

export default function AdminDashboard() {
  const { store, isLoading, isError } = useAdminStore();

  if (isLoading) {
    return (
      <div className="flex min-h-75 items-center justify-center">
        <p className="text-muted-foreground">Loading store...</p>
      </div>
    );
  }

  if (isError || !store) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-600">
        Failed to load store information.
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Store performance overview for Ahmed Fashion."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={DollarSign}
          title="TOTAL REVENUE"
          value="24,580 EGP"
          change="+12.4%"
          isPositive={true}
          comparisonText="vs previous 7D"
        />
        <StatCard
          icon={ShoppingCart}
          title="ORDERS"
          value="348"
          change="+8.1%"
          isPositive={true}
          comparisonText="vs previous 7D"
        />
        <StatCard
          icon={Users}
          title="CUSTOMERS"
          value="1,498"
          change="+4.6%"
          isPositive={true}
          comparisonText="New + returning"
        />
        <StatCard
          icon={Boxes}
          title="AVG. ORDER VALUE"
          value="71 EGP"
          change="-1.8%"
          isPositive={false}
          comparisonText="Across all channels"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <RevenueChart data={analyticsData} />
        <OrdersChart data={analyticsData} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <RecentOrders />
        <TopProducts />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <LowStockWidget />
        <ReviewsWidget />
        <QuickActionsWidget />
      </div>
    </>
  );
}