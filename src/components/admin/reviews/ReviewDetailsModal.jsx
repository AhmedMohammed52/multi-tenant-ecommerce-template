import { useState, useEffect } from "react";
import { X, Star, ExternalLink, Maximize2 } from "lucide-react";

export default function ReviewDetailsModal({ isOpen, onClose, review }) {
  const [shouldRender, setShouldRender] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const timer = setTimeout(() => setAnimate(true), 10);
      return () => clearTimeout(timer);
    }

    setAnimate(false);
    const timer = setTimeout(() => setShouldRender(false), 200);
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (isImagePreviewOpen) {
          setIsImagePreviewOpen(false);
        } else {
          onClose?.();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, isImagePreviewOpen]);

  if (!shouldRender || !review) return null;

  const screenshotUrl = review.screenshot_url || review.screenshot;

  const getStatusBadge = (status = "") => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50";
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50";
      case "rejected":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-800";
    }
  };

  const getStatusDot = (status = "") => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-emerald-500";
      case "pending":
        return "bg-amber-500";
      case "rejected":
        return "bg-rose-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <>
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
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border p-6 pb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Review details
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Verified purchase / order review
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

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 scrollbar-track-transparent">
            <div className="grid grid-cols-3 gap-y-4 text-sm">
              {/* Customer */}
              <span className="text-xs font-semibold uppercase text-muted-foreground">
                CUSTOMER
              </span>
              <span className="col-span-2 font-medium text-foreground">
                {review.customer_name ||
                  review.customerName ||
                  review.author ||
                  "Anonymous"}
              </span>

              {/* Rating */}
              <span className="text-xs font-semibold uppercase text-muted-foreground">
                RATING
              </span>
              <div className="col-span-2 flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`size-4 ${
                      i < (Number(review.rating) || 0)
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>

              {/* Title */}
              <span className="text-xs font-semibold uppercase text-muted-foreground">
                TITLE
              </span>
              <span className="col-span-2 font-medium text-foreground">
                {review.title || "—"}
              </span>

              {/* Review Content */}
              <span className="text-xs font-semibold uppercase text-muted-foreground">
                REVIEW
              </span>
              <p className="col-span-2 text-muted-foreground leading-relaxed">
                {review.text || review.content || "—"}
              </p>

              {/* Product */}
              <span className="text-xs font-semibold uppercase text-muted-foreground">
                PRODUCT
              </span>
              <span className="col-span-2 font-medium text-foreground">
                {review.product_name || review.product || "No product"}
              </span>

              {/* Source */}
              <span className="text-xs font-semibold uppercase text-muted-foreground">
                SOURCE
              </span>
              <div className="col-span-2">
                <span className="inline-flex items-center rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground border border-border">
                  {review.source || "Website"}
                </span>
              </div>

              {/* Date */}
              <span className="text-xs font-semibold uppercase text-muted-foreground">
                DATE
              </span>
              <span className="col-span-2 text-foreground">
                {review.reviewDate ||
                  review.date ||
                  (review.created_at &&
                    new Date(review.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })) ||
                  "—"}
              </span>

              {/* Status */}
              <span className="text-xs font-semibold uppercase text-muted-foreground">
                STATUS
              </span>
              <div className="col-span-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${getStatusBadge(
                    review.status,
                  )}`}
                >
                  <span
                    className={`size-1.5 rounded-full ${getStatusDot(
                      review.status,
                    )}`}
                  />
                  {review.status || "Pending"}
                </span>
              </div>

              {/* Screenshot */}
              <span className="text-xs font-semibold uppercase text-muted-foreground self-start pt-1">
                SCREENSHOT
              </span>
              <div className="col-span-2">
                {screenshotUrl ? (
                  <div className="flex flex-col gap-2 items-start">
                    {/* الصورة المصغرة المقابلة للنقر */}
                    <div
                      onClick={() => setIsImagePreviewOpen(true)}
                      className="group relative cursor-pointer overflow-hidden rounded-lg border border-border bg-muted/50 hover:border-primary/50 transition-all duration-200"
                    >
                      <img
                        src={screenshotUrl}
                        alt="Review screenshot"
                        className="h-28 w-28 object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Maximize2 className="size-5 text-white drop-shadow-md" />
                      </div>
                    </div>

                    {/* زر لفتح الصورة في نافذة جديدة مباشرة إذا رغب المستخدم */}
                    <a
                      href={screenshotUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
                    >
                      <span>Open original</span>
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    No screenshot attached
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end p-4 border-t border-border bg-card">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-input px-4 py-2 text-xs font-medium hover:bg-accent transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox / Full Image Modal */}
      {isImagePreviewOpen && screenshotUrl && (
        <div
          onClick={() => setIsImagePreviewOpen(false)}
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div className="relative max-w-4xl max-h-[90vh] flex items-center justify-center">
            <button
              type="button"
              onClick={() => setIsImagePreviewOpen(false)}
              className="absolute -top-10 right-0 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X className="size-6" />
            </button>
            <img
              src={screenshotUrl}
              alt="Review screenshot full"
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
}
