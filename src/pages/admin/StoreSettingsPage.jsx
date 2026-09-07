import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save } from "lucide-react";

import PageHeader from "../../components/admin/PageHeader";
import { Button } from "../../components/admin/Button";

import GeneralTab from "../../components/admin/store-settings/GeneralTab";
import ContactTab from "../../components/admin/store-settings/ContactTab";
import SocialTab from "../../components/admin/store-settings/SocialTab";

import ConfirmDeleteModal from "../../components/admin/ConfirmDeleteModal";

import { useAdminStore } from "../../contexts/AdminStoreContext";

import {
  updateStoreSettings,
  uploadStoreAsset,
  deleteStoreAsset,
  getStoreAssetPathFromUrl,
} from "../../services/storeSettings";

function buildFormData(store) {
  return {
    storeName: store?.name || "",
    tagline: store?.tagline || "",
    description: store?.description || "",

    supportEmail: store?.email || "",
    phone: store?.phone || "",
    address: store?.address || "",

    instagram: store?.social_links?.instagram || "",
    facebook: store?.social_links?.facebook || "",
    whatsapp: store?.social_links?.whatsapp || "",
    tiktok: store?.social_links?.tiktok || "",
    youtube: store?.social_links?.youtube || "",

    logoUrl: store?.logo_url || "",
    faviconUrl: store?.favicon_url || "",
  };
}

export default function StoreSettingsPage() {
  const { store, isLoading } = useAdminStore();

  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("General");

  const [formData, setFormData] = useState(buildFormData(null));

  const [assetAction, setAssetAction] = useState(null);

  /*
   * assetAction:
   *
   * {
   *   type: "logo" | "favicon",
   *   action: "delete",
   *   url: string
   * }
   */

  useEffect(() => {
    if (!store) return;

    setFormData(buildFormData(store));
  }, [store]);

  /*
   * Compare form data with current database data.
   */
  const initialFormData = buildFormData(store);

  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialFormData);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
   * =========================
   * Store settings mutation
   * =========================
   */
  const updateMutation = useMutation({
    mutationFn: () => {
      return updateStoreSettings(store.id, formData);
    },

    onSuccess: (updatedStore) => {
      queryClient.setQueryData(["admin-store", store.id], updatedStore);

      queryClient.invalidateQueries({
        queryKey: ["store", updatedStore.slug],
      });

      toast.success("Store settings updated successfully.");
    },

    onError: (error) => {
      console.error("Failed to update store:", error);

      toast.error(error?.message || "Failed to update store settings.");
    },
  });

  const handleSave = () => {
    if (!store?.id || updateMutation.isPending) {
      return;
    }

    updateMutation.mutate();
  };

  /*
   * =========================
   * Upload helpers
   * =========================
   */

  const handleUploadAsset = async (event, type) => {
    const file = event.target.files?.[0];

    // Allows selecting the same file again.
    event.target.value = "";

    if (!file || !store?.id) {
      return;
    }

    setAssetAction({
      type,
      action: "upload",
    });

    try {
      /*
       * Upload new file first.
       */
      const uploadedAsset = await uploadStoreAsset(store.id, file, type);

      const fieldName = type === "logo" ? "logoUrl" : "faviconUrl";

      const previousUrl = formData[fieldName];

      /*
       * Update DB immediately.
       *
       * This means the asset is not dependent
       * on the general "Save changes" button.
       */
      const updatedStore = await updateStoreSettings(store.id, {
        ...formData,
        [fieldName]: uploadedAsset.url,
      });

      /*
       * Update local form.
       */
      setFormData(buildFormData(updatedStore));

      /*
       * Update React Query cache.
       */
      queryClient.setQueryData(["admin-store", store.id], updatedStore);

      queryClient.invalidateQueries({
        queryKey: ["store", updatedStore.slug],
      });

      /*
       * Delete old asset only after DB
       * successfully points to the new one.
       */
      if (previousUrl) {
        const previousPath = getStoreAssetPathFromUrl(previousUrl);

        if (previousPath) {
          try {
            await deleteStoreAsset(previousPath);
          } catch (deleteError) {
            /*
             * The new asset is already active.
             * If old cleanup fails, don't break
             * the successful upload.
             */
            console.error("Failed to remove old asset:", deleteError);
          }
        }
      }

      toast.success(
        `${type === "logo" ? "Logo" : "Favicon"} uploaded successfully.`,
      );
    } catch (error) {
      console.error(`Failed to upload ${type}:`, error);

      toast.error(error?.message || `Failed to upload ${type}.`);
    } finally {
      setAssetAction(null);
    }
  };

  /*
   * =========================
   * Delete confirmation
   * =========================
   */

  const requestDeleteAsset = (type) => {
    const fieldName = type === "logo" ? "logoUrl" : "faviconUrl";

    const currentUrl = formData[fieldName];

    if (!currentUrl) {
      return;
    }

    setAssetAction({
      type,
      action: "delete",
      url: currentUrl,
    });
  };

  /*
   * =========================
   * Actual delete
   * =========================
   */

  const handleConfirmDeleteAsset = async () => {
    if (!store?.id || !assetAction?.type || !assetAction?.url) {
      return;
    }

    const { type, url } = assetAction;

    const fieldName = type === "logo" ? "logoUrl" : "faviconUrl";

    /*
     * First update database.
     *
     * If this fails, Storage image stays untouched.
     */
    const updatedStore = await updateStoreSettings(store.id, {
      ...formData,
      [fieldName]: "",
    });

    /*
     * Update local state immediately.
     */
    setFormData(buildFormData(updatedStore));

    /*
     * Update React Query.
     */
    queryClient.setQueryData(["admin-store", store.id], updatedStore);

    queryClient.invalidateQueries({
      queryKey: ["store", updatedStore.slug],
    });

    /*
     * Then remove physical file from Storage.
     */
    const path = getStoreAssetPathFromUrl(url);

    if (path) {
      try {
        await deleteStoreAsset(path);
      } catch (storageError) {
        /*
         * DB already removed the reference.
         * The storefront is therefore safe.
         *
         * Storage cleanup can be retried later.
         */
        console.error("Failed to delete storage asset:", storageError);
      }
    }

    toast.success(
      `${type === "logo" ? "Logo" : "Favicon"} removed successfully.`,
    );

    setAssetAction(null);
  };

  const isUploadingLogo =
    assetAction?.type === "logo" && assetAction?.action === "upload";

  const isUploadingFavicon =
    assetAction?.type === "favicon" && assetAction?.action === "upload";

  const tabs = ["General", "Contact", "Social"];

  if (isLoading) {
    return (
      <div className="flex min-h-75 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Loading store settings...
        </p>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex min-h-75 items-center justify-center">
        <p className="text-sm text-destructive">Store not found.</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Store Settings"
        subtitle={`Identity and configuration for ${
          store.name || "your store"
        }.`}
      >
        <Button
          onClick={handleSave}
          disabled={!isDirty || updateMutation.isPending}
        >
          <Save className="size-4" />

          {updateMutation.isPending ? "Saving..." : "Save changes"}
        </Button>
      </PageHeader>

      <div dir="ltr">
        {/* Tabs */}
        <div
          role="tablist"
          aria-orientation="horizontal"
          className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab;

            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={isActive}
                data-state={isActive ? "active" : "inactive"}
                onClick={() => setActiveTab(tab)}
                className="inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="mt-4">
          {activeTab === "General" && (
            <GeneralTab
              formData={formData}
              onChange={handleChange}
              onUploadLogo={(event) => handleUploadAsset(event, "logo")}
              onRemoveLogo={() => requestDeleteAsset("logo")}
              onUploadFavicon={(event) => handleUploadAsset(event, "favicon")}
              onRemoveFavicon={() => requestDeleteAsset("favicon")}
              isUploadingLogo={isUploadingLogo}
              isUploadingFavicon={isUploadingFavicon}
            />
          )}

          {activeTab === "Contact" && (
            <ContactTab formData={formData} onChange={handleChange} />
          )}

          {activeTab === "Social" && (
            <SocialTab formData={formData} onChange={handleChange} />
          )}
        </div>
      </div>

      {/* Delete Modal */}
      <ConfirmDeleteModal
        isOpen={assetAction?.action === "delete"}
        onClose={() => {
          if (assetAction?.action !== "delete") {
            return;
          }

          setAssetAction(null);
        }}
        onConfirm={handleConfirmDeleteAsset}
        title={
          assetAction?.type === "logo"
            ? "Delete Store Logo?"
            : "Delete Store Favicon?"
        }
        description={
          assetAction?.type === "logo"
            ? "The current store logo will be permanently removed from your store. This action cannot be undone."
            : "The current store favicon will be permanently removed from your store. This action cannot be undone."
        }
      />
    </>
  );
}
