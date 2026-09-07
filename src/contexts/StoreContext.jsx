import { createContext, useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchStoreBySlug } from "../services/stores";

const StoreContext = createContext(null);

const defaultTheme = {
  primary: "#2563eb",
  secondary: "#0f172a",
  accent: "#f59e0b",
  background: "#ffffff",
  foreground: "#0f172a",
};

function applyStoreTheme(theme, logoUrl, storeName, storeDescription) {
  const activeTheme = theme || defaultTheme;
  const root = document.documentElement;

  root.style.setProperty(
    "--store-primary",
    activeTheme.primary || defaultTheme.primary,
  );

  root.style.setProperty(
    "--store-secondary",
    activeTheme.secondary || defaultTheme.secondary,
  );

  root.style.setProperty(
    "--store-accent",
    activeTheme.accent || defaultTheme.accent,
  );

  root.style.setProperty(
    "--store-background",
    activeTheme.background || defaultTheme.background,
  );

  root.style.setProperty(
    "--store-foreground",
    activeTheme.foreground || defaultTheme.foreground,
  );

  if (storeName) {
    document.title = storeName;
  }

  if (storeDescription) {
    let metaDescription = document.querySelector("meta[name='description']");

    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.name = "description";
      document.head.appendChild(metaDescription);
    }

    metaDescription.content = storeDescription;
  }

  // Favicon
  if (logoUrl) {
    let favicon = document.querySelector("link[rel*='icon']");

    if (!favicon) {
      favicon = document.createElement("link");
      favicon.rel = "icon";
      document.head.appendChild(favicon);
    }

    favicon.type = "image/png";
    favicon.href = logoUrl;
  }
}

export function StoreProvider({ children }) {
  const { storeSlug } = useParams();

  const activeSlug = storeSlug || "test-store";

  const {
    data: store,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["store", activeSlug],
    queryFn: () => fetchStoreBySlug(activeSlug),
    enabled: !!activeSlug,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!store) return;

    applyStoreTheme(store.theme, store.logo_url, store.name, store.description);
  }, [store]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center font-medium">
        Loading store...
      </div>
    );
  }

  if (isError || !store) {
    console.error("Store loading error:", error);

    return (
      <div className="flex min-h-screen items-center justify-center text-red-500 font-bold">
        Store not found!
      </div>
    );
  }

  return (
    <StoreContext.Provider
      value={{
        store,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error("useStore must be used within StoreProvider");
  }

  return context;
}
