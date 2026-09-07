import { supabase } from "../lib/supabase";

export async function getNotifications(userId, limit = 10) {
  if (!userId) return [];

  const { data, error } = await supabase
    .from("notifications")
    .select(
      `
      id,
      user_id,
      store_id,
      type,
      title,
      message,
      data,
      is_read,
      created_at
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch notifications:", error);
    throw error;
  }

  return data || [];
}

export async function getUnreadNotificationsCount(userId) {
  if (!userId) return 0;

  const { count, error } = await supabase
    .from("notifications")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    console.error("Failed to fetch unread notifications count:", error);
    throw error;
  }

  return count || 0;
}

export async function markNotificationAsRead(notificationId) {
  if (!notificationId) return;

  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
    })
    .eq("id", notificationId);

  if (error) {
    console.error("Failed to mark notification as read:", error);
    throw error;
  }
}

export async function markAllNotificationsAsRead(userId) {
  if (!userId) return;

  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
    })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    console.error("Failed to mark all notifications as read:", error);
    throw error;
  }
}
