import { supabase } from "../lib/supabase";

const BUCKET = "store-assets";

const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_FAVICON_SIZE = 512 * 1024; // 512KB

const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
];

const ALLOWED_FAVICON_TYPES = ["image/png", "image/webp", "image/svg+xml"];

function getFileExtension(file) {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "jpeg") {
    return "jpg";
  }

  return extension || "png";
}

function getImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);

      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Unable to read image dimensions."));
    };

    image.src = objectUrl;
  });
}

async function validateImage(file, type) {
  if (!file) {
    throw new Error("No file selected.");
  }

  const allowedTypes =
    type === "favicon" ? ALLOWED_FAVICON_TYPES : ALLOWED_IMAGE_TYPES;

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      type === "favicon"
        ? "Favicon must be PNG, WebP, or SVG."
        : "Logo must be PNG, JPG, WebP, or SVG.",
    );
  }

  const maxSize = type === "logo" ? MAX_LOGO_SIZE : MAX_FAVICON_SIZE;

  if (file.size > maxSize) {
    throw new Error(
      type === "logo"
        ? "Logo must be smaller than 2MB."
        : "Favicon must be smaller than 512KB.",
    );
  }

  // SVG dimensions cannot be reliably checked this way.
  if (file.type !== "image/svg+xml") {
    const { width, height } = await getImageDimensions(file);

    if (width > 2048 || height > 2048) {
      throw new Error("Image dimensions must not exceed 2048×2048px.");
    }

    if (type === "favicon") {
      if (width !== height) {
        throw new Error("Favicon must be square.");
      }

      if (width < 64 || height < 64) {
        throw new Error("Favicon must be at least 64×64px.");
      }
    }
  }
}

export async function uploadStoreAsset(storeId, file, type) {
  if (!storeId) {
    throw new Error("Store ID is required.");
  }

  if (!["logo", "favicon"].includes(type)) {
    throw new Error("Invalid asset type.");
  }

  await validateImage(file, type);

  const extension = getFileExtension(file);

  const filePath = `${storeId}/${type}-${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      cacheControl: "31536000",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);

  if (!data?.publicUrl) {
    // Cleanup uploaded file if public URL could not be generated.
    await supabase.storage.from(BUCKET).remove([filePath]);

    throw new Error("Failed to generate public image URL.");
  }

  return {
    url: data.publicUrl,
    path: filePath,
  };
}

export async function deleteStoreAsset(filePath) {
  if (!filePath) {
    return;
  }

  const { error } = await supabase.storage.from(BUCKET).remove([filePath]);

  if (error) {
    throw error;
  }
}

export function getStoreAssetPathFromUrl(url) {
  if (!url) {
    return null;
  }

  try {
    const parsedUrl = new URL(url);

    const marker = `/storage/v1/object/public/${BUCKET}/`;

    const index = parsedUrl.pathname.indexOf(marker);

    if (index === -1) {
      return null;
    }

    return decodeURIComponent(
      parsedUrl.pathname.substring(index + marker.length),
    );
  } catch {
    return null;
  }
}

export async function updateStoreSettings(storeId, settings) {
  const { data, error } = await supabase
    .from("stores")
    .update({
      name: settings.storeName,
      tagline: settings.tagline,
      description: settings.description,

      email: settings.supportEmail,
      phone: settings.phone,
      address: settings.address,

      logo_url: settings.logoUrl || null,
      favicon_url: settings.faviconUrl || null,

      social_links: {
        facebook: settings.facebook || "",
        instagram: settings.instagram || "",
        whatsapp: settings.whatsapp || "",
        tiktok: settings.tiktok || "",
        youtube: settings.youtube || "",
      },

      updated_at: new Date().toISOString(),
    })
    .eq("id", storeId)
    .select(
      `
        id,
        name,
        slug,
        logo_url,
        favicon_url,
        description,
        tagline,
        theme,
        phone,
        email,
        address,
        currency,
        shipping_fee,
        social_links,
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
