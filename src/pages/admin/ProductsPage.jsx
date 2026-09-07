import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Plus, Trash2 } from "lucide-react";
import PageHeader from "../../components/admin/PageHeader";
import ProductModal from "../../components/admin/products/ProductModel";
import ProductsTable from "../../components/admin/products/ProductsTable";
import ConfirmDeleteModal from "../../components/admin/ConfirmDeleteModal";
import { Button } from "../../components/admin/Button";
import { toast } from "sonner";

export default function ProductsPage() {
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [productToDelete, setProductToDelete] = useState(null);

  const tableRef = useRef(null);

  const handleAddProductClick = () => {
    navigate("/admin/products/new");
  };

  const handleOpenFullEditor = (productId) => {
    navigate(`/admin/products/${productId}`);
  };

  const handleQuickEdit = (productData) => {
    setEditingProduct(productData);
    setIsModalOpen(true);
  };

  const handleSaveQuickEdit = async (updatedData) => {
    try {
      // 1. التحديث في Supabase باستخدام دالة saveProduct المجهزة
      // نمرر: (productData, isNew = false, productId, storeId)
      const updatedProductFromDB = await saveProduct(
        updatedData,
        false, // ليس منتج جديد
        updatedData.id,
        updatedData.store_id || storeId, // تأكد من وجود storeId
      );

      // 2. تحديث جدول المنتجات فوراً في الـ UI
      if (tableRef.current?.updateProductInState) {
        tableRef.current.updateProductInState(updatedProductFromDB);
      } else if (tableRef.current?.fetchProducts) {
        // أو إعادة جلب البيانات لو الجدول فيه دالة إعادة جلب
        await tableRef.current.fetchProducts();
      }

      toast.success("Product updated successfully!");
      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (error) {
      console.error("Failed to quick edit product:", error);
      toast.error(error?.message || "Failed to update product");
    }
  };

  const handleExportClick = () => {
    if (tableRef.current) {
      tableRef.current.exportData();
    }
  };

  const handleSingleDeleteRequest = (productId) => {
    setProductToDelete(productId);
    setIsDeleteModalOpen(true);
  };

  const handleBulkDeleteRequest = () => {
    setProductToDelete(null);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (!tableRef.current) return;

      if (productToDelete) {
        await tableRef.current.deleteSingleProduct(productToDelete);
        setSelectedIds((prev) => prev.filter((id) => id !== productToDelete));

        toast.success("Product deleted successfully!");
      } else {
        await tableRef.current.deleteSelectedProducts();
        setSelectedIds([]);

        toast.success("Selected products deleted successfully!");
      }
    } catch (error) {
      console.error("Failed to delete product(s):", error);
      toast.error(error?.message || "Failed to delete product(s)");
    } finally {
      setProductToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Products"
        subtitle="Manage your products and inventory."
      >
        <Button variant="outline" onClick={handleExportClick}>
          <Download className="size-4" />
          Export
        </Button>

        <Button
          variant="outline"
          disabled={selectedIds.length === 0}
          onClick={handleBulkDeleteRequest}
          className="text-destructive hover:text-destructive border-destructive/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 className="size-4" />
          Delete {selectedIds.length > 0 && `(${selectedIds.length})`}
        </Button>

        <Button onClick={handleAddProductClick}>
          <Plus className="size-4" />
          Add product
        </Button>
      </PageHeader>

      <ProductsTable
        ref={tableRef}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onDeleteSingle={handleSingleDeleteRequest}
        onProductClick={handleOpenFullEditor}
        onOpenFullEditor={handleOpenFullEditor}
        onQuickEdit={handleQuickEdit}
      />

      <ProductModal
        isOpen={isModalOpen}
        initialData={editingProduct}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSaveQuickEdit}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={
          productToDelete ? "Delete Product?" : "Delete Selected Products?"
        }
        description={
          productToDelete
            ? "Are you sure you want to delete this product? This action cannot be undone."
            : `Are you sure you want to delete ${selectedIds.length} selected product(s)? This action cannot be undone.`
        }
      />
    </>
  );
}
