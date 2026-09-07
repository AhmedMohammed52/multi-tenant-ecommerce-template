import { useState, useEffect } from "react";
import { Plus, Loader2 } from "lucide-react";
import PageHeader from "../../components/admin/PageHeader";
import { Button } from "../../components/admin/Button";
import CategoryModal from "../../components/admin/categories/CategoryModal";
import CategoryItem from "../../components/admin/categories/CategoryItem";
import ConfirmDeleteModal from "../../components/admin/ConfirmDeleteModal";
import { useAuth } from "../../contexts/AuthContext";
import {
  getCategories,
  saveCategory,
  deleteCategory,
} from "../../services/categories";
import { toast } from "sonner";

export default function CategoriesPage() {
  const { storeId, loading: authLoading } = useAuth();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);

  const fetchCategories = async () => {
    if (!storeId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getCategories(storeId);
      setCategories(data || []);
    } catch (error) {
      console.error("Failed to load categories:", error);
      toast.error("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (storeId) {
        fetchCategories();
      } else {
        setLoading(false);
      }
    }
  }, [storeId, authLoading]);

  const handleOpenAddModal = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (formData, imageFile) => {
    try {
      await saveCategory(
        formData,
        imageFile,
        storeId,
        Boolean(selectedCategory),
        selectedCategory?.id,
      );

      toast.success(
        selectedCategory
          ? "Category updated successfully!"
          : "Category created successfully!",
      );
      fetchCategories();
    } catch (error) {
      console.error("Failed to save category:", error);
      toast.error(error?.message || "Failed to save category.");
      throw error;
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;
    try {
      await deleteCategory(deletingCategory.id, storeId);
      toast.success("Category deleted successfully!");
      setCategories((prev) =>
        prev.filter((cat) => cat.id !== deletingCategory.id),
      );
      setDeletingCategory(null);
    } catch (error) {
      console.error("Failed to delete category:", error);
      toast.error("Failed to delete category.");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading categories...
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Categories"
        subtitle="Manage how categories appear in your storefront and filters."
      >
        <Button onClick={handleOpenAddModal}>
          <Plus className="size-4" />
          Add category
        </Button>
      </PageHeader>

      {categories.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <p className="text-sm text-muted-foreground mb-3">
            No categories found.
          </p>
          <Button onClick={handleOpenAddModal} variant="outline" size="sm">
            <Plus className="size-4 mr-1" /> Add your first category
          </Button>
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <CategoryItem
              key={category.id}
              category={category}
              onEdit={handleOpenEditModal}
              onDelete={() => setDeletingCategory(category)}
            />
          ))}
        </ul>
      )}

      <CategoryModal
        isOpen={isModalOpen}
        categoryData={selectedCategory}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveCategory}
      />

      <ConfirmDeleteModal
        isOpen={Boolean(deletingCategory)}
        title={`Delete ${deletingCategory?.name}?`}
        description="Products in this category will stay in your catalog but lose this grouping."
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
