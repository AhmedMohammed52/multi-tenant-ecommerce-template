import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useAdminStore } from "../../contexts/AdminStoreContext";
import {
  Search,
  ExternalLink,
  Plus,
  Moon,
  Bell,
  Package,
  FolderPlus,
  ShoppingCart,
  Settings,
  User,
  LogOut,
  Store,
  ChevronDown,
  TextAlignJustify,
  Sun,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import {
  getNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../services/notifications";
import { supabase } from "../../lib/supabase";

export default function AdminHeader({ onMenuClick }) {
  const { user, profile, signOut } = useAuth();
  const { store, isLoading } = useAdminStore();
  const { isDark, toggleTheme } = useTheme();

  const [openMenu, setOpenMenu] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const headerRef = useRef(null);

  const adminName = profile?.full_name || user?.email?.split("@")[0] || "Admin";

  const adminInitials = adminName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0])
    .join("")
    .toUpperCase();

  const loadNotifications = async () => {
    if (!user?.id) return;

    try {
      setNotificationsLoading(true);

      const [notificationList, unread] = await Promise.all([
        getNotifications(user.id, 10),
        getUnreadNotificationsCount(user.id),
      ]);

      setNotifications(notificationList);
      setUnreadCount(unread);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification?.id) return;

    try {
      if (!notification.is_read) {
        await markNotificationAsRead(notification.id);

        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id ? { ...item, is_read: true } : item,
          ),
        );

        setUnreadCount((current) => Math.max(0, current - 1));
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllNotificationsAsRead = async () => {
    if (!user?.id || unreadCount === 0) return;

    try {
      await markAllNotificationsAsRead(user.id);

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          is_read: true,
        })),
      );

      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    loadNotifications();

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new;

          setNotifications((current) =>
            [newNotification, ...current].slice(0, 10),
          );

          if (!newNotification.is_read) {
            setUnreadCount((current) => current + 1);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const formatNotificationTime = (date) => {
    if (!date) return "";

    const notificationDate = new Date(date);
    const now = new Date();

    const diffMs = now - notificationDate;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return notificationDate.toLocaleDateString();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleMenu = (menu) => {
    setOpenMenu((current) => (current === menu ? null : menu));
  };

  const handleViewStore = () => {
    if (!store?.slug) return;

    window.open(`/${store.slug}`, "_blank");

    setOpenMenu(null);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-surface/85 px-3 backdrop-blur sm:px-5"
    >
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open sidebar"
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9 lg:hidden"
      >
        <TextAlignJustify className="size-5" />
      </button>

      <div className="relative hidden flex-1 md:block md:max-w-sm">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

        <input
          type="text"
          placeholder="Search orders, products, customers…"
          className="flex w-full rounded-md border border-input px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm h-9 bg-surface-muted pl-8"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleViewStore}
          disabled={!store?.slug || isLoading}
          className="items-center justify-center gap-2 whitespace-nowrap font-medium cursor-pointer transition-colors border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs hidden sm:inline-flex disabled:pointer-events-none disabled:opacity-50"
        >
          <ExternalLink className="size-4" />

          {isLoading ? "Loading..." : "View store"}
        </button>

        <div className="relative hidden sm:block">
          <button
            type="button"
            onClick={() => toggleMenu("create")}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium cursor-pointer transition-colors bg-primary text-primary-foreground shadow hover:bg-primary/90 h-8 rounded-md px-3 text-xs"
          >
            <Plus className="size-4" />
            Create
          </button>

          {openMenu === "create" && (
            <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-lg border border-border bg-surface p-1 shadow-lg">
              <div className="px-2 py-1.5 font-semibold text-xs text-muted-foreground">
                Quick create
              </div>

              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-surface-muted"
                onClick={() => setOpenMenu(null)}
              >
                <Package className="size-4 text-muted-foreground" />

                <span>Add Product</span>
              </button>

              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-surface-muted"
                onClick={() => setOpenMenu(null)}
              >
                <FolderPlus className="size-4 text-muted-foreground" />

                <span>Add Category</span>
              </button>

              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-surface-muted"
                onClick={() => setOpenMenu(null)}
              >
                <ShoppingCart className="size-4 text-muted-foreground" />

                <span>Create Order</span>
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          title={isDark ? "Light mode" : "Dark mode"}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9"
        >
          {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => toggleMenu("notifications")}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9"
          >
            <span className="relative">
              <Bell className="size-4" />

              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex min-w-2 items-center justify-center rounded-full bg-brand px-1 text-[8px] font-semibold leading-3 text-brand-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </span>
          </button>

          {openMenu === "notifications" && (
            <div className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-lg border border-border bg-surface p-1 shadow-lg">
              <div className="flex items-center justify-between px-2 py-1.5">
                <span className="font-semibold text-xs text-muted-foreground">
                  Notifications
                </span>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllNotificationsAsRead}
                    className="text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {notificationsLoading ? (
                <div className="px-2 py-6 text-center text-xs text-muted-foreground">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-2 py-6 text-center text-xs text-muted-foreground">
                  No notifications yet.
                </div>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => handleNotificationClick(notification)}
                    className={`relative flex w-full cursor-pointer select-none rounded-sm px-2 text-left text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground flex-col items-start gap-0.5 py-2 hover:bg-surface-muted ${
                      !notification.is_read ? "bg-surface-muted/40" : ""
                    }`}
                  >
                    <span className="flex w-full items-center gap-2">
                      <span className="text-sm font-medium">
                        {notification.title}
                      </span>

                      {!notification.is_read && (
                        <span className="size-1.5 rounded-full bg-brand" />
                      )}

                      <span className="ml-auto text-[11px] text-muted-foreground">
                        {formatNotificationTime(notification.created_at)}
                      </span>
                    </span>

                    <span className="text-xs text-muted-foreground">
                      {notification.message}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => toggleMenu("profile")}
            className="flex items-center gap-2 rounded-md p-1 pr-2 transition-colors hover:bg-surface-muted"
          >
            {profile?.avatar_url || profile?.avatarUrl ? (
              <img
                src={profile.avatar_url || profile.avatarUrl}
                alt={profile.full_name || profile.name || "Avatar"}
                className="size-8 rounded-full object-cover border"
              />
            ) : (
              <span className="flex size-8 items-center justify-center rounded-full bg-brand text-xs font-semibold text-brand-foreground">
                {adminInitials}
              </span>
            )}

            <span className="hidden text-left sm:block">
              <span className="block text-xs font-medium leading-tight">
                {adminName}
              </span>

              <span className="block text-[11px] text-muted-foreground">
                {profile?.role === "admin" ? "Admin" : "User"}
              </span>
            </span>

            <ChevronDown
              className={`hidden size-3 text-muted-foreground transition-transform sm:block ${
                openMenu === "profile" ? "rotate-180" : ""
              }`}
            />
          </button>

          {openMenu === "profile" && (
            <div className="absolute right-0 top-full mt-2 w-55 overflow-hidden rounded-lg border border-border bg-surface p-1 shadow-lg">
              <div className="border-b border-border p-2 text-sm font-semibold">
                <span className="block text-sm">{adminName}</span>

                <span className="block text-xs font-normal text-muted-foreground">
                  {user?.email}
                </span>
              </div>

              <div className="py-1.5">
                <Link
                  to="/admin/settings"
                  className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 hover:bg-surface-muted"
                  onClick={() => setOpenMenu(null)}
                >
                  <User className="size-4" />
                  Profile
                </Link>

                <Link
                  className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 hover:bg-surface-muted"
                  onClick={() => {
                    handleViewStore();
                    setOpenMenu(null);
                  }}
                >
                  <Store className="size-4" />
                  View Store
                </Link>
              </div>

              <div className="border-t border-border py-1">
                <Link
                  onClick={handleSignOut}
                  className="relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-700 dark:hover:text-red-300 focus:bg-red-50 dark:focus:bg-red-950/50 data-disabled:pointer-events-none data-disabled:opacity-50"
                >
                  <LogOut className="size-4" />
                  Sign out
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
