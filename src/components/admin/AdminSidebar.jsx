import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Store,
  Tags,
  X,
} from "lucide-react";
import { useAdminStore } from "../../contexts/AdminStoreContext";
import { supabase } from "../../lib/supabase";

export default function AdminSidebar({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onMobileClose,
}) {
  const { store } = useAdminStore();

  const [counts, setCounts] = useState({
    products: null,
    orders: null,
    reviews: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchCounts() {
      if (!store?.id) return;

      try {
        // 1. جلب عدد المنتجات ومعرفاتها
        const { data: storeProducts, count: productsCount } = await supabase
          .from("products")
          .select("id", { count: "exact" })
          .eq("store_id", store.id);

        // 2. جلب عدد الطلبات
        const { count: ordersCount } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("store_id", store.id);

        // 3. جلب عدد التقييمات التابعة لمنتجات هذا المتجر
        let reviewsCount = 0;
        const productIds = storeProducts?.map((p) => p.id) || [];

        if (productIds.length > 0) {
          const { count } = await supabase
            .from("reviews")
            .select("*", { count: "exact", head: true })
            .in("product_id", productIds);

          reviewsCount = count || 0;
        }

        if (isMounted) {
          setCounts({
            products: productsCount ?? 0,
            orders: ordersCount ?? 0,
            reviews: reviewsCount,
          });
        }
      } catch (error) {
        console.error("Failed to fetch sidebar counts:", error);
      }
    }

    fetchCounts();

    return () => {
      isMounted = false;
    };
  }, [store?.id]);

  const navLinkClass = ({ isActive }) =>
    `group relative flex items-center rounded-md py-2 text-sm transition-colors ${
      isCollapsed ? "justify-center px-2" : "gap-2.5 px-2"
    } ${
      isActive
        ? "bg-sidebar-accent text-sidebar-accent-foreground"
        : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
    }`;

  const navTextClass = (isActive) =>
    `min-w-0 flex-1 truncate ${
      isActive ? "font-medium" : "font-normal"
    } ${isCollapsed ? "hidden" : ""}`;

  const navIconClass = (isActive) =>
    `size-4 shrink-0 ${isActive ? "text-brand" : "opacity-80"}`;

  const badgeClass = `num rounded-full bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground ${
    isCollapsed ? "hidden" : ""
  }`;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 h-screen shrink-0 border-r border-sidebar-border bg-sidebar transition-[width,transform] duration-200 w-64
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:sticky lg:top-0 lg:translate-x-0 lg:block
        ${isCollapsed ? "lg:w-16" : "lg:w-64"}
      `}
    >
      <div className="flex h-full flex-col bg-sidebar">
        <div
          className={`
            flex h-14 shrink-0 items-center
            border-b border-sidebar-border
            ${isCollapsed ? "justify-center px-2" : "gap-2 px-3"}
          `}
        >
          {store?.favicon_url ? (
            <img
              src={store.favicon_url}
              alt={store.name || "Store Logo"}
              className="size-8 rounded-md object-contain shrink-0 dark:brightness-0 dark:invert"
            />
          ) : (
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-brand">
              <Sparkles className="size-4 text-surface" />
            </span>
          )}

          {!isCollapsed && (
            <span className="min-w-0 flex-1">
              <span
                className="block truncate text-sm font-semibold"
                title={store?.name || "Commerce OS"}
              >
                {store?.name || "Commerce OS"}
              </span>

              <span className="block text-[11px] text-muted-foreground">
                Admin console
              </span>
            </span>
          )}

          {!isCollapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground lg:block"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="size-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onMobileClose}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {!isCollapsed && (
              <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Overview
              </p>
            )}

            <ul className="space-y-0.5">
              <li>
                <NavLink
                  to="/admin"
                  end
                  className={navLinkClass}
                  onClick={onMobileClose}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brand" />
                      )}

                      <LayoutDashboard className={navIconClass(isActive)} />

                      <span className={navTextClass(isActive)}>Dashboard</span>
                    </>
                  )}
                </NavLink>
              </li>
            </ul>
          </div>

          <div className="my-4 border-t border-sidebar-border" />

          <div className="space-y-1">
            {!isCollapsed && (
              <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Catalog
              </p>
            )}

            <ul className="space-y-0.5">
              <li>
                <NavLink
                  to="/admin/products"
                  className={navLinkClass}
                  onClick={onMobileClose}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brand" />
                      )}

                      <Package className={navIconClass(isActive)} />

                      <span className={navTextClass(isActive)}>Products</span>

                      {counts.products !== null && (
                        <span className={badgeClass}>{counts.products}</span>
                      )}
                    </>
                  )}
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/admin/categories"
                  className={navLinkClass}
                  onClick={onMobileClose}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brand" />
                      )}

                      <Tags className={navIconClass(isActive)} />

                      <span className={navTextClass(isActive)}>Categories</span>
                    </>
                  )}
                </NavLink>
              </li>
            </ul>
          </div>

          <div className="my-4 border-t border-sidebar-border" />

          <div className="space-y-1">
            {!isCollapsed && (
              <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Sales
              </p>
            )}

            <ul className="space-y-0.5">
              <li>
                <NavLink
                  to="/admin/orders"
                  className={navLinkClass}
                  onClick={onMobileClose}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brand" />
                      )}

                      <ShoppingCart className={navIconClass(isActive)} />

                      <span className={navTextClass(isActive)}>Orders</span>

                      {counts.orders !== null && (
                        <span className={badgeClass}>{counts.orders}</span>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            </ul>
          </div>

          <div className="my-4 border-t border-sidebar-border" />

          <div className="space-y-1">
            {!isCollapsed && (
              <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Store
              </p>
            )}

            <ul className="space-y-0.5">
              <li>
                <NavLink
                  to="/admin/store-settings"
                  className={navLinkClass}
                  onClick={onMobileClose}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brand" />
                      )}

                      <Store className={navIconClass(isActive)} />

                      <span className={navTextClass(isActive)}>
                        Store Setting
                      </span>
                    </>
                  )}
                </NavLink>
              </li>
            </ul>
          </div>

          <div className="my-4 border-t border-sidebar-border" />

          <div className="space-y-1">
            {!isCollapsed && (
              <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Engagement
              </p>
            )}

            <ul className="space-y-0.5">
              <li>
                <NavLink
                  to="/admin/reviews"
                  className={navLinkClass}
                  onClick={onMobileClose}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brand" />
                      )}

                      <Star className={navIconClass(isActive)} />

                      <span className={navTextClass(isActive)}>Reviews</span>

                      {counts.reviews !== null && (
                        <span className={badgeClass}>{counts.reviews}</span>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            </ul>
          </div>

          <div className="my-4 border-t border-sidebar-border" />

          <div className="space-y-1">
            {!isCollapsed && (
              <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                System
              </p>
            )}

            <ul className="space-y-0.5">
              <li>
                <NavLink
                  to="/admin/users"
                  className={navLinkClass}
                  onClick={onMobileClose}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brand" />
                      )}

                      <ShieldCheck className={navIconClass(isActive)} />

                      <span className={navTextClass(isActive)}>
                        Admin Users
                      </span>
                    </>
                  )}
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/admin/settings"
                  className={navLinkClass}
                  onClick={onMobileClose}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brand" />
                      )}

                      <Settings className={navIconClass(isActive)} />

                      <span className={navTextClass(isActive)}>Settings</span>
                    </>
                  )}
                </NavLink>
              </li>
            </ul>
          </div>
        </nav>

        {isCollapsed && (
          <div className="hidden shrink-0 border-t border-sidebar-border p-3 lg:block">
            <button
              type="button"
              onClick={onToggleCollapse}
              className="
                flex
                h-9
                w-full
                items-center
                justify-center
                rounded-md
                text-muted-foreground
                transition-colors
                hover:bg-sidebar-accent
                hover:text-foreground
              "
              aria-label="Open sidebar"
            >
              <PanelLeftOpen className="size-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
