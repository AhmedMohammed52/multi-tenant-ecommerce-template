import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ChevronDown, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ProductModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  categories = [],
  isSubmitting = false,
}) {
  const [shouldRender, setShouldRender] = useState(false);
  const [animate, setAnimate] = useState(false);

  const [formData, setFormData] = useState({
    id: null,
    name: "",
    sku: "",
    category: "",
    categoryId: "",
    price: "",
    comparePrice: "",
    stock: "",
    description: "",
    slug: "",
    image: "",
    status: "active",
    sold: 0,
  });

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [coords, setCoords] = useState({
    top: 0,
    left: 0,
    width: 0,
    openUpward: false,
  });

  const categoryBtnRef = useRef(null);
  const statusBtnRef = useRef(null);
  const dropdownRef = useRef(null);

  const categoryOptions = [
    { label: "Select a category", value: "", id: "" },
    ...(categories || []).map((category) => ({
      label: category.name,
      value: category.name,
      id: category.id,
    })),
  ];

  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Draft", value: "draft" },
    { label: "Archived", value: "archived" },
  ];

  const parseStatus = (data) => {
    if (!data) return "active";
    if (data.status) return String(data.status).toLowerCase();
    if (typeof data.is_active === "boolean") {
      return data.is_active ? "active" : "draft";
    }
    return "active";
  };

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          id: initialData.id || null,
          name: initialData.name || "",
          sku: initialData.sku || "",
          category: initialData.category || "",
          categoryId: initialData.categoryId || initialData.category_id || "",
          price: initialData.price ?? "",
          comparePrice:
            initialData.comparePrice ?? initialData.compare_price ?? "",
          stock: initialData.stock ?? "",
          description: initialData.description || "",
          slug: initialData.slug || "",
          image: initialData.image || "",
          status: parseStatus(initialData),
          sold: initialData.sold || 0,
        });
      } else {
        setFormData({
          id: null,
          name: "",
          sku: "",
          category: "",
          categoryId: "",
          price: "",
          comparePrice: "",
          stock: "",
          description: "",
          slug: "",
          image: "",
          status: "active",
          sold: 0,
        });
      }

      setShouldRender(true);
      const timer = setTimeout(() => setAnimate(true), 10);
      return () => clearTimeout(timer);
    }

    setAnimate(false);
    setActiveDropdown(null);
    const timer = setTimeout(() => setShouldRender(false), 200);
    return () => clearTimeout(timer);
  }, [isOpen, initialData]);

  const isFormUnchanged = Boolean(
    initialData &&
    formData.name === (initialData.name || "") &&
    formData.sku === (initialData.sku || "") &&
    formData.category === (initialData.category || "") &&
    String(formData.categoryId) ===
      String(initialData.categoryId || initialData.category_id || "") &&
    String(formData.price) === String(initialData.price ?? "") &&
    String(formData.comparePrice) ===
      String(initialData.comparePrice ?? initialData.compare_price ?? "") &&
    String(formData.stock) === String(initialData.stock ?? "") &&
    formData.description === (initialData.description || "") &&
    formData.status === parseStatus(initialData),
  );

  const updateCoords = (type) => {
    const targetRef = type === "category" ? categoryBtnRef : statusBtnRef;
    if (!targetRef.current) return;

    const rect = targetRef.current.getBoundingClientRect();
    const dropdownHeight = 180;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUpward =
      spaceBelow < dropdownHeight && spaceAbove > dropdownHeight;

    setCoords({
      top: openUpward ? rect.top - 4 : rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      openUpward,
    });
  };

  const handleToggleDropdown = (e, type) => {
    e.stopPropagation();
    if (activeDropdown !== type) {
      updateCoords(type);
      setActiveDropdown(type);
    } else {
      setActiveDropdown(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        categoryBtnRef.current &&
        !categoryBtnRef.current.contains(event.target) &&
        statusBtnRef.current &&
        !statusBtnRef.current.contains(event.target)
      ) {
        setActiveDropdown(null);
      }
    };

    const handleReposition = () => {
      if (activeDropdown) updateCoords(activeDropdown);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [activeDropdown]);

  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || isFormUnchanged) return;

    const payload = {
      ...formData,
      id: formData.id,
      name: formData.name.trim(),
      price: formData.price === "" ? 0 : Number(formData.price),
      compare_price:
        formData.comparePrice === "" ? null : Number(formData.comparePrice),
      comparePrice:
        formData.comparePrice === "" ? null : Number(formData.comparePrice),
      stock: formData.stock === "" ? 0 : Number(formData.stock),
      category: formData.category || "",
      category_id: formData.categoryId || null,
      categoryId: formData.categoryId || null,

      // التمرير بالصيغتين لحل مشكلة حفظ الـ Status بـ Supabase
      status: formData.status,
      is_active: formData.status === "active",
    };

    try {
      if (onSubmit) {
        await onSubmit(payload);
        toast.success(
          initialData
            ? "Product updated successfully!"
            : "Product created successfully!",
        );
      }
      setActiveDropdown(null);
      onClose();
    } catch (error) {
      console.error("Product form submit failed:", error);
      toast.error(error?.message || "Failed to save product.");
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isSubmitting) onClose?.();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!shouldRender) return null;

  const isEditing = Boolean(initialData);

  const selectedCategory = categoryOptions.find(
    (category) =>
      category.value.toLowerCase() ===
      String(formData.category || "").toLowerCase(),
  );
  const selectedCategoryLabel = selectedCategory?.label || "Select a category";

  const selectedStatusObj = statusOptions.find(
    (opt) => opt.value === formData.status,
  );
  const selectedStatusLabel = selectedStatusObj?.label || "Active";

  return (
    <div
      onClick={() => {
        if (!isSubmitting) onClose();
      }}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ease-out ${
        animate ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card text-card-foreground shadow-2xl p-6 transition-all duration-200 ease-out ${
          animate
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-2"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {isEditing ? "Edit Product" : "Add New Product"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isEditing
                ? "Update product details and save changes."
                : "Fill in the product details to add it to your store."}
            </p>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Product Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isSubmitting}
                placeholder="e.g. Premium Leather Shoes"
                className="w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-60"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
            </div>

            {/* SKU */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                SKU Code
              </label>
              <input
                type="text"
                disabled={isSubmitting}
                placeholder="SNK-PRM-01"
                className="w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-60"
                value={formData.sku}
                onChange={(e) => updateField("sku", e.target.value)}
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Category
              </label>
              <button
                ref={categoryBtnRef}
                type="button"
                disabled={isSubmitting}
                onClick={(e) => handleToggleDropdown(e, "category")}
                className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-60"
              >
                <span className="truncate">{selectedCategoryLabel}</span>
                <ChevronDown
                  className={`size-4 opacity-50 transition-transform ${
                    activeDropdown === "category" ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Price (EGP) <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                disabled={isSubmitting}
                placeholder="0.00"
                className="w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-60"
                value={formData.price}
                onChange={(e) => updateField("price", e.target.value)}
              />
            </div>

            {/* Compare Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Compare-at Price
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                disabled={isSubmitting}
                placeholder="0.00"
                className="w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-60"
                value={formData.comparePrice}
                onChange={(e) => updateField("comparePrice", e.target.value)}
              />
            </div>

            {/* Stock */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Stock Quantity
              </label>
              <input
                type="number"
                min="0"
                step="1"
                disabled={isSubmitting}
                placeholder="0"
                className="w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-60"
                value={formData.stock}
                onChange={(e) => updateField("stock", e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Description
            </label>
            <textarea
              rows={3}
              disabled={isSubmitting}
              placeholder="Enter product description..."
              className="w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-60"
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </div>

          {/* Status Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Status
            </label>
            <button
              ref={statusBtnRef}
              type="button"
              disabled={isSubmitting}
              onClick={(e) => handleToggleDropdown(e, "status")}
              className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-60"
            >
              <span className="truncate capitalize">{selectedStatusLabel}</span>
              <ChevronDown
                className={`size-4 opacity-50 transition-transform ${
                  activeDropdown === "status" ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="rounded-md border border-input px-4 py-2 text-xs font-medium hover:bg-accent transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || (isEditing && isFormUnchanged)} // 🔴 تعطيل الزر طالما لم يحدث تغيير
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-xs font-medium hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
              {isSubmitting
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Create Product"}
            </button>
          </div>
        </form>
      </div>

      {/* Dropdown Portal */}
      {activeDropdown &&
        createPortal(
          <div
            ref={dropdownRef}
            onClick={(e) => e.stopPropagation()}
            className="fixed z-50 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80 max-h-60 overflow-y-auto"
            style={{
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              transform: coords.openUpward ? "translateY(-100%)" : "none",
            }}
          >
            {activeDropdown === "category" &&
              categoryOptions.map((category) => (
                <div
                  key={category.id || category.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateField("category", category.value);
                    updateField("categoryId", category.id);
                    setActiveDropdown(null);
                  }}
                  className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm hover:bg-accent hover:text-accent-foreground ${
                    formData.category.toLowerCase() ===
                    category.value.toLowerCase()
                      ? "bg-accent/50 font-semibold"
                      : ""
                  }`}
                >
                  <span className="truncate">{category.label}</span>
                  {formData.category.toLowerCase() ===
                    category.value.toLowerCase() && (
                    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                      <Check className="size-4 text-primary" />
                    </span>
                  )}
                </div>
              ))}

            {activeDropdown === "status" &&
              statusOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateField("status", option.value);
                    setActiveDropdown(null);
                  }}
                  className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm hover:bg-accent hover:text-accent-foreground ${
                    formData.status === option.value
                      ? "bg-accent/50 font-semibold"
                      : ""
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {formData.status === option.value && (
                    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                      <Check className="size-4 text-primary" />
                    </span>
                  )}
                </div>
              ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
