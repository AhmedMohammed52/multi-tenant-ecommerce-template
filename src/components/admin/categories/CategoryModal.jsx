import { useState, useEffect, useRef } from "react";
import {
  X,
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  ChevronDown,
  Check,
} from "lucide-react";
import { Button } from "../Button";

export default function CategoryModal({
  isOpen,
  onClose,
  onSubmit,
  categoryData = null,
}) {
  const [shouldRender, setShouldRender] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const isEditMode = Boolean(categoryData);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    status: "Active",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // إغلاق الدروب داون عند النقر خارجه
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsStatusOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (categoryData) {
      setFormData({
        name: categoryData.name || "",
        slug: categoryData.slug || "",
        description: categoryData.description || "",
        status: categoryData.status || "Active",
      });
      setImagePreview(categoryData.image_url || categoryData.image || "");
    } else {
      setFormData({
        name: "",
        slug: "",
        description: "",
        status: "Active",
      });
      setImagePreview("");
    }
    setImageFile(null);
  }, [categoryData, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const timer = setTimeout(() => setAnimate(true), 10);
      return () => clearTimeout(timer);
    } else {
      setAnimate(false);
      const timer = setTimeout(() => setShouldRender(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // --- شروط تعطيل زر الحفظ (Save Button Validation) ---
  const isNameEmpty = !formData.name.trim();

  const originalImage = categoryData
    ? categoryData.image_url || categoryData.image || ""
    : "";

  const isFormChanged = isEditMode
    ? formData.name !== (categoryData?.name || "") ||
      formData.slug !== (categoryData?.slug || "") ||
      formData.description !== (categoryData?.description || "") ||
      formData.status !== (categoryData?.status || "Active") ||
      imagePreview !== originalImage ||
      imageFile !== null
    : true; // في حال إضافة جديدة تعتبر البيانات تغيرت طالما تم ملء المطلوب

  // يعطل الزر إذا كان جاري التحميل، أو الاسم فارغ، أو لم يتم تغيير أي بيانات في وضع التعديل
  const isSaveDisabled = loading || isNameEmpty || !isFormChanged;

  if (!shouldRender) return null;

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith("image/")) {
      if (imageFile && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    const generatedSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    setFormData((prev) => ({
      ...prev,
      name,
      slug: !isEditMode ? generatedSlug : prev.slug,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaveDisabled) return;

    try {
      setLoading(true);

      await onSubmit(
        {
          ...formData,
          image_url: imagePreview,
        },
        imageFile,
      );

      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: "Active", label: "Active", description: "Visible in storefront" },
    { value: "Draft", label: "Draft", description: "Hidden from storefront" },
  ];

  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ease-out ${
        animate ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-xl border border-border bg-card text-card-foreground shadow-2xl overflow-hidden transition-all duration-200 ease-out ${
          animate
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-2"
        }`}
      >
        {/* Header - ثابت في الأعلى */}
        <div className="flex items-center justify-between border-b border-border p-6 pb-4 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {isEditMode ? `Edit ${categoryData?.name}` : "New category"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Categories appear in storefront navigation and filters.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form Body - منطقة السكرول */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40"
        >
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Category Image
            </label>

            {imagePreview ? (
              <div className="relative rounded-lg border border-border overflow-hidden bg-muted/30 group">
                <img
                  src={imagePreview}
                  alt="Category preview"
                  className="w-full h-40 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 bg-background/80 hover:bg-background text-foreground rounded-full transition-colors cursor-pointer"
                  >
                    <UploadCloud className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="p-2 bg-destructive/80 hover:bg-destructive text-destructive-foreground rounded-full transition-colors cursor-pointer"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/50 bg-background"
                }`}
              >
                <div className="p-3 bg-muted rounded-full mb-2">
                  <ImageIcon className="size-6 text-muted-foreground" />
                </div>
                <p className="text-xs font-medium text-foreground mb-1">
                  Click to upload or drag & drop
                </p>
                <p className="text-[11px] text-muted-foreground">
                  PNG, JPG, WEBP up to 5MB
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                e.target.files?.[0] && handleFileSelect(e.target.files[0])
              }
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={formData.name}
              onChange={handleNameChange}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Slug</label>
            <input
              type="text"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
            />
          </div>

          {/* Custom Status Dropdown */}
          <div className="space-y-1.5 relative" ref={dropdownRef}>
            <label className="text-xs font-medium text-foreground">
              Status
            </label>
            <button
              type="button"
              onClick={() => setIsStatusOpen(!isStatusOpen)}
              className="w-full flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
            >
              <span>{formData.status}</span>
              <ChevronDown
                className={`size-4 text-muted-foreground transition-transform duration-200 ${
                  isStatusOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isStatusOpen && (
              <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, status: option.value });
                      setIsStatusOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors cursor-pointer hover:bg-accent ${
                      formData.status === option.value
                        ? "bg-accent/50 text-foreground font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium leading-none">
                        {option.label}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {option.description}
                      </p>
                    </div>
                    {formData.status === option.value && (
                      <Check className="size-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Description
            </label>
            <textarea
              rows="3"
              placeholder="Optional storefront description"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-border pt-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button type="submit" variant="default" disabled={isSaveDisabled}>
              {loading ? "Saving..." : "Save category"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
