import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

const AdminStoreContext = createContext(null);

async function fetchAdminStore(storeId) {
  const { data, error } = await supabase
    .from("stores")
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
    .eq("id", storeId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export function AdminStoreProvider({ children }) {
  const { profile } = useAuth();

  const storeId = profile?.store_id;

  const {
    data: store,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin-store", storeId],
    queryFn: () => fetchAdminStore(storeId),
    enabled: !!storeId,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <AdminStoreContext.Provider
      value={{
        store,
        isLoading,
        isError,
        error,
      }}
    >
      {children}
    </AdminStoreContext.Provider>
  );
}

export function useAdminStore() {
  const context = useContext(AdminStoreContext);

  if (!context) {
    throw new Error("useAdminStore must be used within AdminStoreProvider");
  }

  return context;
}
