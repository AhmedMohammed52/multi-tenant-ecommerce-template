import { supabase } from "../lib/supabase";

function generateSlug(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function getProducts(storeId) {
  if (!storeId) {
    throw new Error("Store ID is required");
  }

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      category:categories (
        id,
        name,
        slug
      ),
      images:product_images (
        id,
        image_url,
        sort_order
      )
    `,
    )
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getProducts error:", error);
    throw new Error(error.message || "Could not load products");
  }

  return data || [];
}

export async function getProductById(productId, storeId) {
  if (!productId) {
    throw new Error("Product ID is required");
  }

  if (!storeId) {
    throw new Error("Store ID is required");
  }

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      category:categories (
        id,
        name,
        slug
      ),
      images:product_images (
        id,
        image_url,
        sort_order
      )
    `,
    )
    .eq("id", productId)
    .eq("store_id", storeId)
    .single();

  if (error) {
    console.error("getProductById error:", error);
    throw new Error(error.message || "Could not load product details");
  }

  return data;
}

async function uploadProductImage({ file, storeId, productId }) {
  if (!file) {
    throw new Error("Image file is required");
  }

  const extension = file.name?.split(".").pop()?.toLowerCase() || "jpg";
  const randomPart = crypto.randomUUID();
  const filePath = `${storeId}/products/${productId}/${Date.now()}-${randomPart}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("store-assets")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    console.error("Product image upload error:", uploadError);
    throw new Error(uploadError.message || "Could not upload product image");
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("store-assets").getPublicUrl(filePath);

  return {
    image_url: publicUrl,
    path: filePath,
  };
}

async function deleteStorageImage(path) {
  if (!path) return;

  const { error } = await supabase.storage.from("store-assets").remove([path]);

  if (error) {
    console.error("deleteStorageImage error:", error);
  }
}

export async function saveProduct(
  productData,
  isNew,
  productId,
  storeId,
  images = [],
) {
  if (!storeId) {
    throw new Error("Store ID is required");
  }

  if (!productData.name?.trim()) {
    throw new Error("Product name is required");
  }

  const slug = productData.slug?.trim() || generateSlug(productData.name);

  // الكائن الشامل لكل الحقول في DB Schema
  const payload = {
    store_id: storeId,
    category_id: productData.categoryId || null,
    name: productData.name.trim(),
    slug,
    description: productData.description?.trim() || null,
    short_description: productData.shortDescription?.trim() || null,

    // الأسعار
    price:
      productData.price === "" ||
      productData.price === null ||
      productData.price === undefined
        ? 0
        : Number(productData.price),

    compare_price:
      productData.comparePrice !== "" &&
      productData.comparePrice !== null &&
      productData.comparePrice !== undefined
        ? Number(productData.comparePrice)
        : null,

    cost_per_item:
      productData.costPerItem !== "" &&
      productData.costPerItem !== null &&
      productData.costPerItem !== undefined
        ? Number(productData.costPerItem)
        : null,

    // المخزون والتتبع
    stock:
      productData.stock !== undefined
        ? Number(productData.stock) || 0
        : Number(productData.quantity) || 0,

    track_quantity:
      typeof productData.trackQuantity === "boolean"
        ? productData.trackQuantity
        : true,

    low_stock_threshold:
      productData.lowStockThreshold !== "" &&
      productData.lowStockThreshold !== null &&
      productData.lowStockThreshold !== undefined
        ? Number(productData.lowStockThreshold)
        : 10,

    // المعرفات والحالة
    sku: productData.sku?.trim() || null,
    status: productData.status || "active",
    is_active: productData.status === "active",

    updated_at: new Date().toISOString(),
  };

  let product;

  if (isNew) {
    const { data, error } = await supabase
      .from("products")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("Create product error:", error);
      throw new Error(error.message || "Could not create product");
    }

    product = data;
  } else {
    if (!productId) {
      throw new Error("Product ID is required");
    }

    const { data, error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", productId)
      .eq("store_id", storeId)
      .select()
      .single();

    if (error) {
      console.error("Update product error:", error);
      throw new Error(error.message || "Could not update product");
    }

    product = data;
  }

  if (images) {
    await syncProductImages({
      productId: product.id,
      storeId,
      images,
    });
  }

  return product;
}

async function syncProductImages({ productId, storeId, images }) {
  const { data: existingImages, error: existingError } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });

  if (existingError) {
    console.error("Load existing product images error:", existingError);
    throw new Error(
      existingError.message || "Could not load existing product images",
    );
  }

  const currentImages = existingImages || [];

  const keptIds = new Set(
    images.filter((image) => image?.id).map((image) => image.id),
  );

  const removedImages = currentImages.filter((image) => !keptIds.has(image.id));

  for (const image of removedImages) {
    const path = getStoragePathFromPublicUrl(image.image_url);

    if (path) {
      await deleteStorageImage(path);
    }

    const { error } = await supabase
      .from("product_images")
      .delete()
      .eq("id", image.id)
      .eq("product_id", productId);

    if (error) {
      console.error("Delete product image DB error:", error);
      throw new Error(error.message || "Could not delete product image");
    }
  }

  const normalizedImages = [];

  for (const [index, image] of images.entries()) {
    if (image?.file instanceof File) {
      const uploaded = await uploadProductImage({
        file: image.file,
        storeId,
        productId,
      });

      const { data, error } = await supabase
        .from("product_images")
        .insert({
          product_id: productId,
          image_url: uploaded.image_url,
          sort_order: index,
        })
        .select()
        .single();

      if (error) {
        await deleteStorageImage(uploaded.path);
        console.error("Insert product image error:", error);
        throw new Error(error.message || "Could not save product image");
      }

      normalizedImages.push(data);
    } else if (image?.id) {
      normalizedImages.push({
        ...image,
        sort_order: index,
      });
    }
  }

  for (const [index, image] of normalizedImages.entries()) {
    if (!image?.id) continue;

    const { error } = await supabase
      .from("product_images")
      .update({
        sort_order: index,
      })
      .eq("id", image.id)
      .eq("product_id", productId);

    if (error) {
      console.error("Update image order error:", error);
      throw new Error(error.message || "Could not update image order");
    }
  }
}

function getStoragePathFromPublicUrl(url) {
  if (!url) return null;

  const marker = "/storage/v1/object/public/store-assets/";
  const index = url.indexOf(marker);

  if (index === -1) {
    return null;
  }

  return decodeURIComponent(url.substring(index + marker.length));
}

export async function deleteProduct(productId, storeId) {
  if (!productId) {
    throw new Error("Product ID is required");
  }

  if (!storeId) {
    throw new Error("Store ID is required");
  }

  const { data: images, error: imagesError } = await supabase
    .from("product_images")
    .select("id, image_url")
    .eq("product_id", productId);

  if (imagesError) {
    console.error("Load product images before delete:", imagesError);
    throw new Error(imagesError.message || "Could not load product images");
  }

  for (const image of images || []) {
    const path = getStoragePathFromPublicUrl(image.image_url);

    if (path) {
      await deleteStorageImage(path);
    }
  }

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .eq("store_id", storeId);

  if (error) {
    console.error("Delete product error:", error);
    throw new Error(error.message || "Could not delete product");
  }

  return true;
}

export async function getCategories(storeId) {
  if (!storeId) {
    throw new Error("Store ID is required");
  }

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, image_url")
    .eq("store_id", storeId)
    .order("name", { ascending: true });

  if (error) {
    console.error("getCategories error:", error);
    throw new Error(error.message || "Could not load categories");
  }

  return data || [];
}
