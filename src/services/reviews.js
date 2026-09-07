import { supabase } from "../lib/supabase";

export const getReviews = async () => {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

export const getProductsForSelect = async () => {
  const { data, error } = await supabase.from("products").select("id, name");

  if (error) throw error;
  return data || [];
};

export const uploadReviewScreenshot = async (file) => {
  if (!file || typeof file === "string") return file;

  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `reviews/${fileName}`; // توجيه الصورة داخل مجلد reviews

  // 1. رفع الصورة إلى store-assets
  const { error: uploadError } = await supabase.storage
    .from("store-assets")
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  // 2. الحصول على الرابط العام من store-assets
  const { data: publicUrlData } = supabase.storage
    .from("store-assets")
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
};

export const createReview = async (formData) => {
  let screenshotUrl = null;

  if (formData.screenshot) {
    screenshotUrl = await uploadReviewScreenshot(formData.screenshot);
  }

  const { data, error } = await supabase
    .from("reviews")
    .insert([
      {
        customer_name: formData.customerName,
        rating: formData.rating,
        title: formData.title,
        content: formData.text,
        product_name: formData.product,
        product_id: formData.productId || null,
        source: formData.source,
        review_date: formData.reviewDate,
        screenshot_url: screenshotUrl,
        status: "Pending",
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateReviewStatus = async (id, newStatus) => {
  const { data, error } = await supabase
    .from("reviews")
    .update({ status: newStatus })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};
