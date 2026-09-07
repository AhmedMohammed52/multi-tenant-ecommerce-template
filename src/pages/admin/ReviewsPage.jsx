import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import PageHeader from "../../components/admin/PageHeader";
import { Button } from "../../components/admin/Button";
import ReviewsTable from "../../components/admin/reviews/ReviewsTable";
import ReviewModal from "../../components/admin/reviews/AddReviewModal";
import {
  getReviews,
  getProductsForSelect,
  createReview,
} from "../../services/reviews";
import { toast } from "sonner";

export default function ReviewsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reviewsData, productsData] = await Promise.all([
        getReviews(),
        getProductsForSelect(),
      ]);
      setReviews(reviewsData);
      setProducts(productsData);
    } catch (err) {
      console.error("Error loading reviews:", err);
      toast.error("Failed to load reviews data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateReview = async (formData) => {
    setIsSubmitting(true);
    try {
      await createReview(formData);
      toast.success("Review created successfully!");
      setIsAddModalOpen(false); // 🔴 إغلاق المودال بعد الإضافة بنجاح
      await loadData(); // 🔴 إعادة جلب البيانات ليظهر الريفيو الجديد فوراً
    } catch (err) {
      console.error("Save Review Error:", err);
      toast.error("Failed to save review");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingCount = reviews.filter((r) => r.status === "Pending").length;
  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) /
          reviews.length
        ).toFixed(1)
      : "0.0";

  return (
    <>
      <PageHeader
        title="Reviews"
        subtitle={`${pendingCount} awaiting moderation · ${avgRating} average rating`}
      >
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="size-4" />
          Add review
        </Button>
      </PageHeader>

      <ReviewsTable
        reviewsData={reviews}
        loading={loading}
        onRefresh={loadData}
      />

      <ReviewModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        products={products}
        onSubmit={handleCreateReview}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
