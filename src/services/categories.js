import { supabase } from "../lib/supabase";

function getStoragePathFromPublicUrl(url) {
  if (!url) return null;

  const marker = "/storage/v1/object/public/store-assets/";
  const index = url.indexOf(marker);

  if (index === -1) {
    return null;
  }

  return decodeURIComponent(url.substring(index + marker.length));
}

async function deleteStorageImage(path) {
  if (!path) return;

  const { error } = await supabase.storage.from("store-assets").remove([path]);

  if (error) {
    console.error("deleteStorageImage error:", error);
  }
}

export async function uploadCategoryImage(file, storeId, categoryId) {
  if (!file) throw new Error("Image file is required");
  if (!storeId) throw new Error("Store ID is required");

  const extension = file.name?.split(".").pop()?.toLowerCase() || "jpg";
  const randomPart = crypto.randomUUID();
  // بناء مسار نظيف مماثل للمنتجات: {storeId}/categories/{categoryId}/{timestamp}-{random}.ext
  const filePath = `${storeId}/categories/${categoryId}/${Date.now()}-${randomPart}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("store-assets")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    console.error("Category image upload error:", uploadError);
    throw new Error(uploadError.message || "Could not upload category image");
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("store-assets").getPublicUrl(filePath);

  return publicUrl;
}

export async function getCategories(storeId) {
  if (!storeId) return [];

  const { data, error } = await supabase
    .from("categories")
    .select(
      `
      *,
      category_images (
        id,
        image_url,
        sort_order
      ),
      products:products(count)
    `,
    )
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getCategories error:", error);
    throw new Error(error.message || "Could not load categories");
  }

  return (data || []).map((cat) => {
    const sortedImages = cat.category_images?.sort(
      (a, b) => a.sort_order - b.sort_order,
    );
    const mainImage = sortedImages?.[0]?.image_url || null;

    return {
      ...cat,
      image_url: mainImage,
      image: mainImage || "https://picsum.photos/seed/placeholder/240/240",
      productsCount: cat.products?.[0]?.count || 0,
    };
  });
}

export async function saveCategory(
  formData,
  imageFile,
  storeId,
  isEdit = false,
  categoryId = null,
) {
  if (!storeId) throw new Error("Store ID is required");

  let currentCategoryId = categoryId;

  const categoryPayload = {
    store_id: storeId,
    name: formData.name,
    slug: formData.slug,
    description: formData.description,
    status: formData.status || "Active",
  };

  try {
    if (isEdit && categoryId) {
      const { error } = await supabase
        .from("categories")
        .update(categoryPayload)
        .eq("id", categoryId)
        .eq("store_id", storeId);

      if (error) throw error;
    } else {
      const { data: newCategory, error } = await supabase
        .from("categories")
        .insert(categoryPayload)
        .select()
        .single();

      if (error) throw error;
      currentCategoryId = newCategory.id;
    }
  } catch (err) {
    if (err.code === "23505") {
      throw new Error("A category with this name/slug already exists.", {
        cause: err,
      });
    }
    throw err;
  }

  // 1. في حالة تم اختيار صورة جديدة
  if (imageFile) {
    // مسح الصور القديمة وملفاتها إن وجدت في وضع التعديل
    if (isEdit && currentCategoryId) {
      const { data: oldImages } = await supabase
        .from("category_images")
        .select("image_url")
        .eq("category_id", currentCategoryId);

      for (const img of oldImages || []) {
        const path = getStoragePathFromPublicUrl(img.image_url);
        if (path) await deleteStorageImage(path);
      }

      await supabase
        .from("category_images")
        .delete()
        .eq("category_id", currentCategoryId);
    }

    // رفع الصورة الجديدة وتخزين الرابط
    const imageUrl = await uploadCategoryImage(
      imageFile,
      storeId,
      currentCategoryId,
    );

    if (imageUrl) {
      const { error: imgError } = await supabase
        .from("category_images")
        .insert({
          category_id: currentCategoryId,
          image_url: imageUrl,
          sort_order: 0,
        });

      if (imgError) throw imgError;
    }
  }
  // 2. في حالة التعديل وإزالة الصورة الحالية دون إرفاق غيرها
  else if (isEdit && formData.image_url === "") {
    const { data: oldImages } = await supabase
      .from("category_images")
      .select("image_url")
      .eq("category_id", currentCategoryId);

    for (const img of oldImages || []) {
      const path = getStoragePathFromPublicUrl(img.image_url);
      if (path) await deleteStorageImage(path);
    }

    await supabase
      .from("category_images")
      .delete()
      .eq("category_id", currentCategoryId);
  }

  return { id: currentCategoryId };
}

export async function deleteCategory(categoryId, storeId) {
  if (!categoryId || !storeId) {
    throw new Error("Category ID and Store ID are required");
  }

  // جلب الصور وحذف ملفاتها من التخزين
  const { data: images } = await supabase
    .from("category_images")
    .select("image_url")
    .eq("category_id", categoryId);

  for (const img of images || []) {
    const path = getStoragePathFromPublicUrl(img.image_url);
    if (path) await deleteStorageImage(path);
  }

  // حذف سجلات الصور من DB
  const { error: imagesError } = await supabase
    .from("category_images")
    .delete()
    .eq("category_id", categoryId);

  if (imagesError) throw imagesError;

  // حذف القسم نفسه
  const { error: categoryError } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId)
    .eq("store_id", storeId);

  if (categoryError) throw categoryError;

  return true;
}
