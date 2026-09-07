import { useEffect, useState, useMemo } from "react";
import { ArrowLeft, Trash2, Save, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import PageHeader from "../../components/admin/PageHeader";
import { Button } from "../../components/admin/Button";

import Basics from "../../components/admin/product-details/Basics";
import Media from "../../components/admin/product-details/Media";
import Pricing from "../../components/admin/product-details/Pricing";
import Inventory from "../../components/admin/product-details/Inventory";
import Organisation from "../../components/admin/product-details/Organisation";

import { useAuth } from "../../contexts/AuthContext";

import {
  getProductById,
  saveProduct,
  deleteProduct,
} from "../../services/products";
import { toast } from "sonner";

function generateSimpleSKU(productName) {
  if (!productName || !productName.trim()) {
    return `PRD-${Math.floor(1000 + Math.random() * 9000)}`;
  }
  const cleanPrefix = productName
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  const prefix = cleanPrefix.length >= 2 ? cleanPrefix.substring(0, 3) : "PRD";
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randomNum}`;
}

const initialProductState = {
  name: "",
  shortDescription: "",
  description: "",
  slug: "",

  price: "",
  comparePrice: "",
  costPerItem: "",

  trackQuantity: true,
  stock: 0,
  lowStockThreshold: 10,

  status: "active",

  categoryId: "",
  collectionId: "",

  sku: "",
  updatedAt: "",
};

export default function ProductDetailsPage() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const isNew = !productId || productId === "new";

  const { storeId, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState(initialProductState);
  const [images, setImages] = useState([]);

  // الاحتفاظ بالبيانات الأولية للمقارنة
  const [initialData, setInitialData] = useState(initialProductState);
  const [initialImages, setInitialImages] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      if (isNew) {
        setFormData(initialProductState);
        setInitialData(initialProductState);
        setImages([]);
        setInitialImages([]);
        return;
      }

      if (!productId || !storeId) {
        return;
      }

      try {
        setLoading(true);

        const data = await getProductById(productId, storeId);

        if (cancelled) {
          return;
        }

        if (!data) {
          throw new Error("Product not found");
        }

        const formattedDate = data.updated_at
          ? new Date(data.updated_at).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0];

        const loadedFormData = {
          name: data.name || "",
          shortDescription: data.short_description || "",
          description: data.description || "",
          slug: data.slug || "",

          price:
            data.price !== null && data.price !== undefined ? data.price : "",

          comparePrice:
            data.compare_price !== null && data.compare_price !== undefined
              ? data.compare_price
              : "",

          costPerItem: data.cost_per_item ?? "",

          trackQuantity: data.track_quantity ?? true,

          stock:
            data.stock !== null && data.stock !== undefined ? data.stock : 0,

          lowStockThreshold: data.low_stock_threshold ?? 10,

          status: data.status || (data.is_active ? "active" : "draft"),

          categoryId: data.category_id || "",

          collectionId: "",

          sku: data.sku || "",
          updatedAt: formattedDate,
        };

        const loadedImages = (data.images || [])
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
          .map((image) => ({
            id: image.id,
            image_url: image.image_url,
            sort_order: image.sort_order ?? 0,
            file: null,
            preview: image.image_url,
          }));

        setFormData(loadedFormData);
        setInitialData(loadedFormData);

        setImages(loadedImages);
        setInitialImages(loadedImages);
      } catch (error) {
        console.error("Failed to load product:", error);
        toast.error(error?.message || "Failed to load product");
        navigate("/admin/products");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (!authLoading) {
      loadProduct();
    }

    return () => {
      cancelled = true;
    };
  }, [productId, storeId, isNew, authLoading, navigate]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((prev) => {
      const updatedValue = type === "checkbox" ? checked : value;
      const newState = { ...prev, [name]: updatedValue };

      if (name === "name" && !prev.sku) {
        newState.sku = generateSimpleSKU(updatedValue);
      }

      return newState;
    });
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      toast.error("Please enter a product name.");
      return;
    }

    if (!storeId) {
      toast.error("Store information is not available.");
      return;
    }

    try {
      setSaving(true);

      await saveProduct(formData, isNew, productId, storeId, images);

      toast.success(
        isNew
          ? "Product created successfully!"
          : "Product updated successfully!",
      );

      navigate("/admin/products");
    } catch (error) {
      console.error("Failed to save product:", error);
      toast.error(error?.message || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (isNew || !productId) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this product? This action cannot be undone.",
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      await deleteProduct(productId, storeId);

      toast.success("Product deleted successfully!");

      navigate("/admin/products");
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error(error?.message || "Failed to delete product.");
      setLoading(false);
    }
  };

  // التحقق مما إذا كانت البيانات قد تغيرت بالفعل
  const isDirty = useMemo(() => {
    // 1. فحص التغييرات في نصوص الحقول
    const formChanged =
      JSON.stringify(formData) !== JSON.stringify(initialData);

    // 2. فحص التغييرات في الصور (عددها، ترتيبها، أو إضافة ملفات جديدة)
    const imagesChanged =
      images.length !== initialImages.length ||
      images.some((img, idx) => {
        const initImg = initialImages[idx];
        return !initImg || img.id !== initImg.id || img.file !== null;
      });

    return formChanged || imagesChanged;
  }, [formData, initialData, images, initialImages]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading product...
        </div>
      </div>
    );
  }

  const isFormInvalid =
    !formData.name?.trim() ||
    formData.price === "" ||
    formData.price === null ||
    Number(formData.price) < 0;

  const breadcrumbs = [
    { label: "Products", path: "/admin/products" },
    { label: isNew ? "Add product" : formData.name || "Product details" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={isNew ? "Add Product" : formData.name || "Edit Product"}
        subtitle={formData.sku ? `SKU ${formData.sku}` : undefined}
        status={!isNew ? formData.status : undefined}
        updatedAt={!isNew ? formData.updatedAt : undefined}
        breadcrumbs={breadcrumbs}
      >
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/products")}
            disabled={saving}
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>

          {!isNew && (
            <Button
              type="button"
              variant="outline"
              onClick={handleDelete}
              disabled={saving}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="size-4" />
              Delete
            </Button>
          )}

          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || isFormInvalid || (!isNew && !isDirty)}
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="size-4" />
                Save Product
              </>
            )}
          </Button>
        </div>
      </PageHeader>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Basics formData={formData} handleChange={handleChange} />
          <Media images={images} setImages={setImages} />
        </div>

        <div className="space-y-4">
          <Pricing formData={formData} handleChange={handleChange} />
          <Inventory formData={formData} handleChange={handleChange} />
          <Organisation formData={formData} handleChange={handleChange} />
        </div>
      </div>
    </div>
  );
}
