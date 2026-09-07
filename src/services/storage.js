import { supabase } from "../lib/supabase";

const BUCKET_NAME = "store-assets";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

function validateImage(file) {
  if (!file) {
    throw new Error("No file selected");
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Only PNG, JPG, and WEBP images are allowed");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Image size must be less than 2MB");
  }
}

export async function uploadStoreBranding(storeId, file, type) {
  validateImage(file);

  const extension = file.name.split(".").pop().toLowerCase();

  const filePath = `${storeId}/branding/${type}.${extension}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    });

  if (error) {
    throw error;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

  return {
    url: publicUrl,
    path: filePath,
  };
}
