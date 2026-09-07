import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Star,
  ChevronDown,
  ImagePlus,
  X,
  Check,
  Loader2,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

const SOURCES = [
  "WhatsApp",
  "Facebook",
  "Instagram",
  "Email",
  "Store Checkout",
];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function AddReviewModel({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  products = [],
  isSubmitting = false,
}) {
  const [shouldRender, setShouldRender] = useState(false);
  const [animate, setAnimate] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    id: null,
    source: "WhatsApp",
    customerName: "",
    rating: 5,
    title: "",
    text: "",
    product: "No product",
    productId: "",
    reviewDate: new Date().toISOString().split("T")[0],
    screenshot: null,
  });

  const [screenshotPreview, setScreenshotPreview] = useState(null);

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [coords, setCoords] = useState({
    top: 0,
    left: 0,
    width: 0,
    openUpward: false,
  });

  const [viewDate, setViewDate] = useState(new Date());

  const sourceBtnRef = useRef(null);
  const productBtnRef = useRef(null);
  const dateBtnRef = useRef(null);
  const dropdownRef = useRef(null);

  const isEditing = Boolean(initialData);

  const sourceOptions = SOURCES.map((src) => ({ label: src, value: src }));

  const productOptions = [
    { label: "No product", value: "No product", id: "" },
    ...(products || []).map((prod) =>
      typeof prod === "string"
        ? { label: prod, value: prod, id: prod }
        : {
            label: prod.name || prod.title,
            value: prod.name || prod.title,
            id: prod.id,
          },
    ),
  ];

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const initialDateStr =
          initialData.reviewDate ||
          initialData.created_at?.split("T")[0] ||
          new Date().toISOString().split("T")[0];

        setFormData({
          id: initialData.id || null,
          source: initialData.source || "WhatsApp",
          customerName:
            initialData.customerName || initialData.customer_name || "",
          rating: Number(initialData.rating) || 5,
          title: initialData.title || "",
          text: initialData.text || initialData.content || "",
          product: initialData.product || "No product",
          productId: initialData.productId || initialData.product_id || "",
          reviewDate: initialDateStr,
          screenshot: initialData.screenshot || null,
        });
        setScreenshotPreview(initialData.screenshot || null);
        setViewDate(new Date(initialDateStr));
      } else {
        const todayStr = new Date().toISOString().split("T")[0];
        setFormData({
          id: null,
          source: "WhatsApp",
          customerName: "",
          rating: 5,
          title: "",
          text: "",
          product: "No product",
          productId: "",
          reviewDate: todayStr,
          screenshot: null,
        });
        setScreenshotPreview(null);
        setViewDate(new Date());
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

  const isFormValid =
    formData.customerName.trim().length > 0 &&
    formData.text.trim().length > 0 &&
    formData.rating > 0 &&
    Boolean(formData.source);

  const isFormUnchanged = Boolean(
    initialData &&
    formData.source === (initialData.source || "WhatsApp") &&
    formData.customerName ===
      (initialData.customerName || initialData.customer_name || "") &&
    Number(formData.rating) === Number(initialData.rating || 5) &&
    formData.title === (initialData.title || "") &&
    formData.text === (initialData.text || initialData.content || "") &&
    formData.product === (initialData.product || "No product") &&
    formData.reviewDate ===
      (initialData.reviewDate || initialData.created_at?.split("T")[0] || "") &&
    formData.screenshot === (initialData.screenshot || null),
  );

  const isSubmitDisabled =
    isSubmitting || !isFormValid || (isEditing && isFormUnchanged);

  const updateCoords = (type) => {
    let targetRef = sourceBtnRef;
    let dropdownHeight = 180;

    if (type === "product") targetRef = productBtnRef;
    if (type === "date") {
      targetRef = dateBtnRef;
      dropdownHeight = 300;
    }

    if (!targetRef.current) return;

    const rect = targetRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUpward =
      spaceBelow < dropdownHeight && spaceAbove > dropdownHeight;

    setCoords({
      top: openUpward ? rect.top - 4 : rect.bottom + 4,
      left: rect.left,
      width: type === "date" ? Math.max(rect.width, 280) : rect.width,
      openUpward,
    });
  };

  const handleToggleDropdown = (e, type) => {
    e.stopPropagation();
    if (activeDropdown !== type) {
      updateCoords(type);
      if (type === "date" && formData.reviewDate) {
        setViewDate(new Date(formData.reviewDate));
      }
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
        sourceBtnRef.current &&
        !sourceBtnRef.current.contains(event.target) &&
        productBtnRef.current &&
        !productBtnRef.current.contains(event.target) &&
        dateBtnRef.current &&
        !dateBtnRef.current.contains(event.target)
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

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isSubmitting) onClose?.();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      updateField("screenshot", file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    updateField("screenshot", null);
    setScreenshotPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitDisabled) return;

    const payload = {
      ...formData,
      customer_name: formData.customerName.trim(),
      customerName: formData.customerName.trim(),
      title: formData.title.trim(),
      text: formData.text.trim(),
      content: formData.text.trim(),
      rating: Number(formData.rating),
      product_id: formData.productId || null,
      review_date: formData.reviewDate,
    };

    try {
      if (onSubmit) {
        await onSubmit(payload);
        toast.success(
          initialData
            ? "Review updated successfully!"
            : "Review added successfully!",
        );
      }
      setActiveDropdown(null);
      onClose();
    } catch (error) {
      console.error("Review form submit failed:", error);
      toast.error(error?.message || "Failed to save review.");
    }
  };

  if (!shouldRender) return null;

  const selectedSourceObj = sourceOptions.find(
    (opt) => opt.value === formData.source,
  );
  const selectedSourceLabel = selectedSourceObj?.label || "WhatsApp";

  const selectedProductObj = productOptions.find(
    (opt) => opt.value === formData.product,
  );
  const selectedProductLabel = selectedProductObj?.label || "No product";

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(year, month + 1, 1));
  };

  // 2. إصلاح دالة اختيار التاريخ لتفادي مشاكل الفروق الزمانية Timezones
  const handleSelectDate = (day) => {
    const formattedMonth = String(month + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    const formattedDate = `${year}-${formattedMonth}-${formattedDay}`;

    updateField("reviewDate", formattedDate);
    setActiveDropdown(null);
  };

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
        className={`relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-xl border border-border bg-card text-card-foreground shadow-2xl overflow-hidden transition-all duration-200 ease-out ${
          animate
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-2"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-6 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {isEditing ? "Edit Review" : "Add Review"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Record feedback received outside the store checkout flow.
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

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 scrollbar-track-transparent"
        >
          {/* Review Source Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Review Source <span className="text-destructive">*</span>
            </label>
            <button
              ref={sourceBtnRef}
              type="button"
              disabled={isSubmitting}
              onClick={(e) => handleToggleDropdown(e, "source")}
              className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-60 cursor-pointer"
            >
              <span className="truncate">{selectedSourceLabel}</span>
              <ChevronDown
                className={`size-4 opacity-50 transition-transform ${
                  activeDropdown === "source" ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {/* Customer Name & Rating */}
          <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Customer Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isSubmitting}
                placeholder="Name shown with the review"
                value={formData.customerName}
                onChange={(e) => updateField("customerName", e.target.value)}
                className="w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Rating <span className="text-destructive">*</span>
              </label>
              <div className="flex items-center gap-1 pt-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => updateField("rating", star)}
                    className="rounded p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer disabled:opacity-50"
                  >
                    <Star
                      className={`size-5 transition-colors ${
                        star <= formData.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Review Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Review Title
            </label>
            <input
              type="text"
              disabled={isSubmitting}
              placeholder="e.g. Great quality"
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)}
              className="w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-60"
            />
            <p className="text-[11px] text-muted-foreground">Optional.</p>
          </div>

          {/* Review Text */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Review Text <span className="text-destructive">*</span>
            </label>
            <textarea
              required
              rows={3}
              disabled={isSubmitting}
              placeholder="Paste the customer's feedback"
              value={formData.text}
              onChange={(e) => updateField("text", e.target.value)}
              className="w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-60 resize-none"
            />
          </div>

          {/* Product & Date */}
          <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Product
              </label>
              <button
                ref={productBtnRef}
                type="button"
                disabled={isSubmitting}
                onClick={(e) => handleToggleDropdown(e, "product")}
                className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-60 cursor-pointer"
              >
                <span className="truncate">{selectedProductLabel}</span>
                <ChevronDown
                  className={`size-4 opacity-50 transition-transform ${
                    activeDropdown === "product" ? "rotate-180" : ""
                  }`}
                />
              </button>
              <p className="text-[11px] text-muted-foreground">Optional.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Review Date
              </label>
              <button
                ref={dateBtnRef}
                type="button"
                disabled={isSubmitting}
                onClick={(e) => handleToggleDropdown(e, "date")}
                className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-60 cursor-pointer"
              >
                <span className="truncate">{formData.reviewDate}</span>
                <CalendarIcon className="size-4 opacity-50 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Screenshot Upload */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Screenshot
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png, image/jpeg"
              className="hidden"
              onChange={handleFileChange}
            />

            {screenshotPreview ? (
              <div className="relative flex items-center justify-between rounded-md border border-border p-2 bg-background">
                <img
                  src={screenshotPreview}
                  alt="Screenshot preview"
                  className="h-16 w-16 rounded object-cover"
                />
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleRemoveImage}
                  className="rounded-md p-1.5 hover:bg-accent text-destructive transition-colors cursor-pointer disabled:opacity-50"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center gap-1.5 rounded-md border border-dashed border-border px-4 py-5 text-center transition-colors hover:border-primary hover:bg-accent/50 cursor-pointer disabled:opacity-50"
              >
                <ImagePlus className="size-5 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">
                  Upload screenshot
                </span>
                <span className="text-[11px] text-muted-foreground">
                  PNG or JPG up to 5 MB.
                </span>
              </button>
            )}
            <p className="text-[11px] text-muted-foreground">
              Optional proof — chat or review screenshot. Admin-side only.
            </p>
          </div>

          {/* Action Buttons */}
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
              disabled={isSubmitDisabled}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-xs font-medium hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
              {isSubmitting
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Save Review"}
            </button>
          </div>
        </form>
      </div>

      {/* Custom Dropdowns Portal */}
      {activeDropdown &&
        createPortal(
          <div
            ref={dropdownRef}
            onClick={(e) => e.stopPropagation()}
            className="fixed z-50 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80 max-h-72 overflow-y-auto"
            style={{
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              transform: coords.openUpward ? "translateY(-100%)" : "none",
            }}
          >
            {activeDropdown === "source" &&
              sourceOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateField("source", option.value);
                    setActiveDropdown(null);
                  }}
                  className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-xs hover:bg-accent hover:text-accent-foreground ${
                    formData.source === option.value
                      ? "bg-accent/50 font-semibold"
                      : ""
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {formData.source === option.value && (
                    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                      <Check className="size-4 text-primary" />
                    </span>
                  )}
                </div>
              ))}

            {activeDropdown === "product" &&
              productOptions.map((product) => (
                <div
                  key={product.id || product.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateField("product", product.value);
                    updateField("productId", product.id);
                    setActiveDropdown(null);
                  }}
                  className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-xs hover:bg-accent hover:text-accent-foreground ${
                    formData.product.toLowerCase() ===
                    product.value.toLowerCase()
                      ? "bg-accent/50 font-semibold"
                      : ""
                  }`}
                >
                  <span className="truncate">{product.label}</span>
                  {formData.product.toLowerCase() ===
                    product.value.toLowerCase() && (
                    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                      <Check className="size-4 text-primary" />
                    </span>
                  )}
                </div>
              ))}

            {/* Calendar Dropdown */}
            {activeDropdown === "date" && (
              <div className="p-2 space-y-3 min-w-65">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    {MONTHS[month]} {year}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="p-1 rounded hover:bg-accent transition-colors"
                    >
                      <ChevronLeft className="size-4 text-muted-foreground" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="p-1 rounded hover:bg-accent transition-colors"
                    >
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 text-center text-[11px] font-medium text-muted-foreground">
                  <span>Su</span>
                  <span>Mo</span>
                  <span>Tu</span>
                  <span>We</span>
                  <span>Th</span>
                  <span>Fr</span>
                  <span>Sa</span>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {Array.from({ length: firstDayIndex }).map((_, index) => (
                    <div key={`empty-${index}`} />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, index) => {
                    const day = index + 1;
                    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
                      day,
                    ).padStart(2, "0")}`;
                    const isSelected = formData.reviewDate === dateStr;

                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleSelectDate(day)}
                        className={`size-7 rounded-md flex items-center justify-center transition-colors cursor-pointer text-xs ${
                          isSelected
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "hover:bg-accent text-foreground"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
