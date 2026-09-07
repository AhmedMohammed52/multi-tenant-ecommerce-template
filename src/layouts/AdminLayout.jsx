import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";
import { useAdminStore } from "../contexts/AdminStoreContext";

export default function AdminLayout() {
  const { store } = useAdminStore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (store?.name) {
      document.title = `${store.name} - Admin Console`;
    }

    if (store?.favicon_url) {
      let link = document.querySelector("link[rel*='icon']");

      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }

      const cacheBuster = store.updated_at
        ? `?v=${new Date(store.updated_at).getTime()}`
        : "";

      link.href = `${store.favicon_url}${cacheBuster}`;
    }
  }, [store?.favicon_url, store?.name, store?.updated_at]);

  const toggleDesktopSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const openMobileSidebar = () => {
    setIsMobileSidebarOpen(true);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleDesktopSidebar}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={closeMobileSidebar}
      />

      {isMobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={closeMobileSidebar}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col max-w-full overflow-hidden">
        <AdminHeader onMenuClick={openMobileSidebar} />

        <main className="mx-auto w-full min-w-0 max-w-[105rem] flex-1 space-y-6 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
