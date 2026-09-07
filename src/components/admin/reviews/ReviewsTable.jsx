import { useState, useRef, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  Check,
  Star,
  X as XIcon,
} from "lucide-react";
import { toast } from "sonner";
import { updateReviewStatus } from "../../../services/reviews";
import ReviewDetailsModal from "../../../components/admin/reviews/ReviewDetailsModal";

const statuses = ["All statuses", "Approved", "Pending", "Rejected"];

export default function ReviewsList({
  reviewsData = [],
  loading = false,
  onRefresh,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All statuses");
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const [selectedReview, setSelectedReview] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const statusRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (statusRef.current && !statusRef.current.contains(event.target)) {
        setIsStatusOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredReviews = reviewsData.filter((review) => {
    const author = review.customer_name || review.author || "";
    const title = review.title || "";
    const content = review.content || "";
    const product = review.product_name || review.product || "";
    const status = review.status || "";

    const matchesSearch =
      author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === "All statuses" ||
      status.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status = "") => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "rejected":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
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

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await updateReviewStatus(id, newStatus);
      toast.success(`Review status changed to ${newStatus}`);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenDetails = (review) => {
    setSelectedReview(review);
    setIsDetailsOpen(true);
  };

  return (
    <>
      {/* تم إزالة overflow-hidden هنا لعدم قص القائمة */}
      <section className="rounded-xl border border-border bg-card shadow-sm relative">
        {/* ─── Header Controls ─── */}
        <div className="flex flex-col gap-2 border-b border-border p-3 sm:flex-row sm:items-center rounded-t-xl bg-card">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search reviews, products or customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex w-full rounded-md border border-input px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring h-9 bg-background pl-8 md:text-sm"
            />
          </div>

          <div className="flex items-center gap-2 sm:ml-auto">
            <div className="relative w-full sm:w-auto" ref={statusRef}>
              <button
                type="button"
                onClick={() => setIsStatusOpen(!isStatusOpen)}
                className="flex items-center justify-between gap-2 whitespace-nowrap rounded-md border border-input px-3 py-2 text-sm shadow-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring h-9 w-full min-w-38 bg-background sm:w-auto"
              >
                <div className="flex items-center gap-2 truncate">
                  <SlidersHorizontal className="size-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">{selectedStatus}</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 opacity-50 transition-transform duration-200 ${
                    isStatusOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* القائمة المنسدلة أصبحت تظهر أعلى كل العناصر من خلال z-50 وعدم قيد الـ overflow */}
              {isStatusOpen && (
                <div className="absolute right-0 top-full z-50 mt-1 min-w-40 rounded-md border border-border bg-popover text-popover-foreground shadow-lg p-1">
                  {statuses.map((st) => (
                    <div
                      key={st}
                      onClick={() => {
                        setSelectedStatus(st);
                        setIsStatusOpen(false);
                      }}
                      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${
                        selectedStatus === st
                          ? "bg-accent/50 font-semibold"
                          : ""
                      }`}
                    >
                      <span>{st}</span>
                      {selectedStatus === st && (
                        <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                          <Check className="size-4 text-primary" />
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Reviews List ─── */}
        <ul className="divide-y divide-border rounded-b-xl overflow-hidden">
          {loading ? (
            <li className="py-12 text-center text-sm text-muted-foreground animate-pulse">
              Loading reviews...
            </li>
          ) : filteredReviews.length > 0 ? (
            filteredReviews.map((review) => {
              const currentStatus = review.status?.toLowerCase() || "";
              const isApproved = currentStatus === "approved";
              const isRejected = currentStatus === "rejected";
              const isUpdating = updatingId === review.id;

              return (
                <li
                  key={review.id}
                  className="p-4 flex flex-col md:flex-row md:items-start md:justify-between gap-4 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* User Avatar */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                      {review.avatar ||
                        (review.customer_name
                          ? review.customer_name.substring(0, 2).toUpperCase()
                          : "AN")}
                    </div>

                    {/* Review Body */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Customer Name */}
                        <span className="text-xs font-semibold text-foreground">
                          {review.customer_name || review.author}
                        </span>

                        {/* Star Rating */}
                        <div className="flex items-center text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`size-3.5 ${
                                i < review.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>

                        {/* Status Badge */}
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
                          {review.status}
                        </span>
                      </div>

                      {/* Review Title */}
                      {review.title && (
                        <h4 className="text-sm font-bold text-foreground tracking-tight pt-0.5">
                          {review.title}
                        </h4>
                      )}

                      {/* Review Content */}
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {review.content}
                      </p>

                      {/* Product Reference */}
                      <div className="pt-1 text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
                        <span>On</span>
                        <span className="font-medium text-foreground">
                          {review.product_name ||
                            review.product ||
                            "No product"}
                        </span>
                        <span>·</span>
                        <button
                          type="button"
                          onClick={() => handleOpenDetails(review)}
                          className="font-medium text-foreground hover:underline underline-offset-4 cursor-pointer transition-all"
                        >
                          View details
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between md:flex-col md:items-end gap-3 shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {review.date ||
                        (review.created_at &&
                          new Date(review.created_at).toLocaleDateString())}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Approve Button */}
                      <button
                        type="button"
                        disabled={isUpdating || isApproved}
                        onClick={() =>
                          handleStatusChange(review.id, "Approved")
                        }
                        className={`inline-flex items-center gap-1 h-8 px-2.5 rounded-md border text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer disabled:cursor-not-allowed ${
                          isApproved
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700 opacity-80"
                            : "border-input bg-background text-foreground hover:bg-accent disabled:opacity-50"
                        }`}
                      >
                        <Check className="size-3.5" />
                        Approve
                      </button>

                      {/* Reject Button */}
                      <button
                        type="button"
                        disabled={isUpdating || isRejected}
                        onClick={() =>
                          handleStatusChange(review.id, "Rejected")
                        }
                        className={`inline-flex items-center gap-1 h-8 px-2.5 rounded-md border text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer disabled:cursor-not-allowed ${
                          isRejected
                            ? "bg-rose-50 border-rose-200 text-rose-700 opacity-80"
                            : "border-input bg-background text-foreground hover:bg-accent disabled:opacity-50"
                        }`}
                      >
                        <XIcon className="size-3.5" />
                        Reject
                      </button>
                    </div>
                  </div>
                </li>
              );
            })
          ) : (
            <li className="py-12 text-center text-xs text-muted-foreground">
              No reviews found.
            </li>
          )}
        </ul>
      </section>

      <ReviewDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        review={selectedReview}
      />
    </>
  );
}
