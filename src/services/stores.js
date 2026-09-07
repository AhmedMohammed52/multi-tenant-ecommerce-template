import { supabase } from "../lib/supabase";

export async function fetchStoreBySlug(slug) {
  const { data, error } = await supabase
    .from("stores")
    .select(
      `
      id,
      name,
      slug,
      logo_url,
      favicon_url,
      theme,
      phone,
      email,
      address,
      currency,
      shipping_fee,
      social_links,
      description,
      tagline,
      created_at,
      updated_at
    `,
    )
    .eq("slug", slug)
    .single();

  if (error) {
    throw error;
  }

  return data;
}
