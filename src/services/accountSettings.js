import { supabase } from "../lib/supabase";

export async function getUserProfile(userId) {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      store_id,
      full_name,
      phone,
      avatar_url,
      role,
      created_at,
      updated_at
    `,
    )
    .eq("id", userId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function uploadAvatar(userId, storeId, file) {
  if (!storeId) {
    throw new Error("Store ID is required to upload assets.");
  }

  const fileExt = file.name.split(".").pop();
  const filePath = `${storeId}/avatars/${userId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("store-assets")
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from("store-assets").getPublicUrl(filePath);
  return data.publicUrl;
}

export async function updateUserProfile(userId, values) {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({
      full_name: values.fullName?.trim() || null,
      phone: values.phone?.trim() || null,
      avatar_url: values.avatarUrl ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select(
      `
      id,
      store_id,
      full_name,
      phone,
      avatar_url,
      role,
      created_at,
      updated_at
    `,
    )
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateUserEmail(email) {
  if (!email?.trim()) {
    throw new Error("Email is required.");
  }

  const redirectTo = `${window.location.origin}/settings?email_confirmed=true`;

  const { data, error } = await supabase.auth.updateUser(
    { email: email.trim() },
    { emailRedirectTo: redirectTo },
  );

  if (error) {
    throw error;
  }

  return data;
}

const DEFAULT_NOTIFICATION_SETTINGS = {
  new_orders: true,
  low_stock: true,
  reviews: true,
  payouts: false,
  weekly_digest: true,
};

export async function getNotificationSettings(userId) {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const { data, error } = await supabase
    .from("user_notification_settings")
    .select(
      `
      user_id,
      new_orders,
      low_stock,
      reviews,
      payouts,
      weekly_digest,
      created_at,
      updated_at
    `,
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data) {
    return data;
  }

  const { data: createdData, error: createError } = await supabase
    .from("user_notification_settings")
    .insert({
      user_id: userId,
      ...DEFAULT_NOTIFICATION_SETTINGS,
    })
    .select(
      `
      user_id,
      new_orders,
      low_stock,
      reviews,
      payouts,
      weekly_digest,
      created_at,
      updated_at
    `,
    )
    .single();

  if (createError) {
    throw createError;
  }

  return createdData;
}

export async function updateNotificationSettings(userId, values) {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const { data, error } = await supabase
    .from("user_notification_settings")
    .upsert(
      {
        user_id: userId,

        new_orders: Boolean(values.new_orders),
        low_stock: Boolean(values.low_stock),
        reviews: Boolean(values.reviews),
        payouts: Boolean(values.payouts),
        weekly_digest: Boolean(values.weekly_digest),

        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      },
    )
    .select(
      `
      user_id,
      new_orders,
      low_stock,
      reviews,
      payouts,
      weekly_digest,
      created_at,
      updated_at
    `,
    )
    .single();

  if (error) {
    throw error;
  }

  return data;
}
