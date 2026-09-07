import { supabase } from "../lib/supabase";

export const ADMIN_USER_ROLES = [
  "Owner",
  "Admin",
  "Manager",
  "Editor",
  "Support",
];

export const roleToDatabase = (role) =>
  String(role || "")
    .trim()
    .toLowerCase();

export const roleToLabel = (role) => {
  const roles = {
    owner: "Owner",
    admin: "Admin",
    manager: "Manager",
    editor: "Editor",
    support: "Support",
  };

  return roles[String(role || "").toLowerCase()] || role;
};

export const getInitials = (name, email) => {
  const source =
    String(name || "").trim() || String(email || "").split("@")[0] || "User";

  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
};

export const formatLastActive = (value, status) => {
  if (status === "invited") {
    return "Invite pending";
  }

  if (!value) {
    return "Never";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Never";
  }

  const diff = Date.now() - date.getTime();

  const minutes = Math.floor(diff / 60000);

  const hours = Math.floor(minutes / 60);

  const days = Math.floor(hours / 24);

  if (minutes < 1) {
    return "just now";
  }

  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  if (days === 1) {
    return "Yesterday";
  }

  if (days < 7) {
    return `${days} days ago`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const normalizeUser = (user) => {
  const name =
    String(user.full_name || "").trim() ||
    String(user.email || "").split("@")[0] ||
    "User";

  return {
    id: user.id,
    name,
    email: user.email || "",
    initials: getInitials(name, user.email),
    role: roleToLabel(user.role),
    status: user.status || "active",
    lastActive: formatLastActive(user.last_active, user.status),
  };
};

export async function getAdminUsers() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log("CURRENT AUTH USER:", user);
  console.log("AUTH USER ERROR:", userError);

  const { data: storeId, error: storeError } = await supabase.rpc(
    "get_current_store_id",
  );

  console.log("CURRENT STORE ID:", storeId);
  console.log("CURRENT STORE ERROR:", storeError);

  const { data, error } = await supabase.rpc("get_admin_users");

  console.log("ADMIN USERS DATA:", data);
  console.log("ADMIN USERS ERROR:", error);

  if (error) {
    throw new Error(error.message || "Failed to load admin users.");
  }

  return (data || []).map(normalizeUser);
}

export async function updateAdminUserRole(userId, role) {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const databaseRole = roleToDatabase(role);

  if (
    !["owner", "admin", "manager", "editor", "support"].includes(databaseRole)
  ) {
    throw new Error("Invalid user role.");
  }

  const { data, error } = await supabase.rpc("update_admin_user_role", {
    target_user_id: userId,
    new_role: databaseRole,
  });

  if (error) {
    throw new Error(error.message || "Failed to update user role.");
  }

  return data;
}

export async function removeAdminUser(userId) {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const { data, error } = await supabase.rpc("remove_admin_user", {
    target_user_id: userId,
  });

  if (error) {
    throw new Error(error.message || "Failed to remove user.");
  }

  return data;
}

export async function inviteAdminUser({ fullName, email, role }) {
  const cleanName = String(fullName || "").trim();
  const cleanEmail = String(email || "")
    .trim()
    .toLowerCase();

  const databaseRole = roleToDatabase(role);

  if (!cleanName) {
    throw new Error("Full name is required.");
  }

  if (!cleanEmail) {
    throw new Error("Email is required.");
  }

  if (
    !["owner", "admin", "manager", "editor", "support"].includes(databaseRole)
  ) {
    throw new Error("Invalid role.");
  }

  // Get current store ID
  const { data: storeId, error: storeError } = await supabase.rpc(
    "get_current_store_id",
  );

  if (storeError) {
    throw new Error(storeError.message || "Failed to get current store.");
  }

  if (!storeId) {
    throw new Error("No active store found.");
  }

  const { data, error } = await supabase.functions.invoke("admin-users", {
    body: {
      action: "invite",
      storeId,
      fullName: cleanName,
      email: cleanEmail,
      role: databaseRole,
    },
  });

  if (error) {
    console.error("INVITE EDGE FUNCTION ERROR:", error);

    let message = error.message || "Failed to invite user.";

    try {
      if (error.context) {
        const response = await error.context.json();

        console.error("EDGE FUNCTION RESPONSE:", response);

        if (response?.message) {
          message = response.message;
        }
      }
    } catch (parseError) {
      console.error("Failed to parse Edge Function response:", parseError);
    }

    throw new Error(message);
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data;
}
