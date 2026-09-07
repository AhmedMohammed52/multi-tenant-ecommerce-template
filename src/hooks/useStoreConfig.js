import { useStore } from "../contexts/StoreContext";

export function useStoreConfig() {
  const { store } = useStore();

  return {
    id: store?.id,
    name: store?.name,
    slug: store?.slug,
    logoUrl: store?.logo_url,
    currency: store?.currency || "EGP",
    shippingFee: store?.shipping_fee || 0,
    contact: {
      phone: store?.phone,
      email: store?.email,
      address: store?.address,
    },
    socialLinks: store?.social_links || {},
    theme: store?.theme,
  };
}
