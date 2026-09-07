import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { createPortal } from "react-dom";
import {
  Search,
  SlidersHorizontal,
  MoreHorizontal,
  ChevronDown,
  Check,
  Pencil,
  Copy,
  Archive,
  Trash2,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ProductModal from "./ProductModel";
import * as XLSX from "xlsx";

import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../contexts/AuthContext";
import { getProducts, getCategories } from "../../../services/products";

const statuses = ["All statuses", "Active", "Draft", "Archived"];

const ITEMS_PER_PAGE = 5;

const ProductsTable = forwardRef(
  (
    {
      products: defaultProducts = [],
      selectedIds = [],
      onSelectionChange,
      onDeleteSingle,
    },
    ref,
  ) => {
    const navigate = useNavigate();
    const { storeId } = useAuth();

    const [products, setProducts] = useState(defaultProducts);
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All categories");
    const [selectedStatus, setSelectedStatus] = useState("All statuses");

    const [currentPage, setCurrentPage] = useState(1);

    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);

    const [categoryPos, setCategoryPos] = useState({
      top: 0,
      left: 0,
      width: 0,
    });

    const [statusPos, setStatusPos] = useState({
      top: 0,
      left: 0,
      width: 0,
    });

    const [activeActionId, setActiveActionId] = useState(null);

    const [dropdownPos, setDropdownPos] = useState({
      top: 0,
      left: 0,
      openUpward: false,
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const [savingProduct, setSavingProduct] = useState(false);
    const [processingProductId, setProcessingProductId] = useState(null);

    const categoryRef = useRef(null);
    const statusRef = useRef(null);

    const categoryMenuRef = useRef(null);
    const statusMenuRef = useRef(null);

    const buttonRefs = useRef({});
    const menuRef = useRef(null);

    const normalizeProduct = (product) => {
      const category =
        product?.categories?.name ||
        product?.category?.name ||
        product?.category?.label ||
        product?.category ||
        "";

      const image =
        product?.product_images?.[0]?.image_url ||
        product?.images?.[0]?.image_url ||
        product?.image ||
        "";

      return {
        ...product,

        id: product.id,

        name: product.name || "",

        sku: product.sku || "",

        category,

        categoryId:
          product.category_id ||
          product.categoryId ||
          product?.category?.id ||
          "",

        price: Number(product.price || 0),

        stock: Number(product.stock || 0),

        sold: Number(product.sold || 0),

        status: product.status || (product.is_active ? "Active" : "Draft"),

        image,

        description: product.description || "",

        comparePrice: product.compare_price ?? product.comparePrice ?? "",

        images: product.product_images || product.images || [],
      };
    };

    const reloadProducts = async () => {
      if (!storeId) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [productsData, categoriesData] = await Promise.all([
          getProducts(storeId),
          getCategories(storeId),
        ]);

        const normalizedProducts = (productsData || []).map(normalizeProduct);

        setProducts(normalizedProducts);
        setCategories(categoriesData || []);
      } catch (err) {
        console.error("Failed to load products:", err);
        setError(err?.message || "Failed to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      reloadProducts();
    }, [storeId]);

    useEffect(() => {
      if (defaultProducts?.length) {
        setProducts(defaultProducts.map(normalizeProduct));
      }
    }, [defaultProducts]);

    useEffect(() => {
      setCurrentPage(1);
    }, [searchQuery, selectedCategory, selectedStatus]);

    useEffect(() => {
      function handleClickOutside(event) {
        if (
          categoryRef.current &&
          !categoryRef.current.contains(event.target) &&
          categoryMenuRef.current &&
          !categoryMenuRef.current.contains(event.target)
        ) {
          setIsCategoryOpen(false);
        }

        if (
          statusRef.current &&
          !statusRef.current.contains(event.target) &&
          statusMenuRef.current &&
          !statusMenuRef.current.contains(event.target)
        ) {
          setIsStatusOpen(false);
        }

        if (
          menuRef.current &&
          !menuRef.current.contains(event.target) &&
          !Object.values(buttonRefs.current).some((btn) =>
            btn?.contains(event.target),
          )
        ) {
          setActiveActionId(null);
        }
      }

      function handleScrollOrResize() {
        if (activeActionId !== null) {
          setActiveActionId(null);
        }

        if (isCategoryOpen) {
          setIsCategoryOpen(false);
        }

        if (isStatusOpen) {
          setIsStatusOpen(false);
        }
      }

      document.addEventListener("mousedown", handleClickOutside);

      document.addEventListener("touchstart", handleClickOutside);

      window.addEventListener("scroll", handleScrollOrResize, true);

      window.addEventListener("resize", handleScrollOrResize);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);

        document.removeEventListener("touchstart", handleClickOutside);

        window.removeEventListener("scroll", handleScrollOrResize, true);

        window.removeEventListener("resize", handleScrollOrResize);
      };
    }, [activeActionId, isCategoryOpen, isStatusOpen]);

    const handleToggleCategory = () => {
      if (!isCategoryOpen && categoryRef.current) {
        const rect = categoryRef.current.getBoundingClientRect();

        setCategoryPos({
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width,
        });
      }

      setIsCategoryOpen((prev) => !prev);
      setIsStatusOpen(false);
    };

    const handleToggleStatus = () => {
      if (!isStatusOpen && statusRef.current) {
        const rect = statusRef.current.getBoundingClientRect();

        setStatusPos({
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width,
        });
      }

      setIsStatusOpen((prev) => !prev);
      setIsCategoryOpen(false);
    };

    const handleToggleActions = (productId) => {
      if (activeActionId === productId) {
        setActiveActionId(null);
        return;
      }

      const buttonEl = buttonRefs.current[productId];

      if (buttonEl) {
        const rect = buttonEl.getBoundingClientRect();

        const spaceBelow = window.innerHeight - rect.bottom;

        const menuHeight = 160;

        const openUpward = spaceBelow < menuHeight;

        setDropdownPos({
          left: Math.max(8, rect.right - 176),
          top: openUpward ? rect.top - 4 : rect.bottom + 4,
          openUpward,
        });

        setActiveActionId(productId);
      }
    };

    const handleEditClick = (product) => {
      setEditingProduct(product);
      setIsModalOpen(true);
      setActiveActionId(null);
    };

    const handleOpenFullEditor = (productId) => {
      setActiveActionId(null);
      navigate(`/admin/products/${productId}`);
    };

    const handleSaveModal = async (formData) => {
      if (!storeId) {
        throw new Error("Store ID is missing.");
      }

      try {
        setSavingProduct(true);

        const categoryId =
          formData.categoryId ||
          categories.find(
            (category) =>
              category.name?.toLowerCase() === formData.category?.toLowerCase(),
          )?.id ||
          null;

        // 1. القيمة النصية للحالة القادمة من المودال
        const statusValue = formData.status || "Active";

        const productPayload = {
          name: formData.name.trim(),
          slug: formData.slug?.trim() || generateSlug(formData.name),
          description: formData.description?.trim() || null,
          price: Number(formData.price || 0),
          compare_price:
            formData.comparePrice !== "" && formData.comparePrice !== null
              ? Number(formData.comparePrice)
              : null,
          stock: Number(formData.stock || 0),

          // 2. تحديث الحقل النصي والحقل البولياني معاً لـ Supabase
          status: statusValue,
          is_active: statusValue.toLowerCase() === "active",

          category_id: categoryId,
          updated_at: new Date().toISOString(),
        };

        if (!productPayload.name) {
          throw new Error("Product name is required.");
        }

        if (editingProduct?.id) {
          const { data, error } = await supabase
            .from("products")
            .update(productPayload)
            .eq("id", editingProduct.id)
            .eq("store_id", storeId)
            .select(
              `
            *,
            categories (
              id,
              name
            ),
            product_images (
              id,
              image_url,
              sort_order
            )
          `,
            )
            .single();

          if (error) throw error;

          // 3. تطبيع البيانات مع ضمان إبقاء الحالة النصية متزامنة في الـ State
          const updatedProduct = {
            ...normalizeProduct(data),
            status: statusValue,
          };

          // 4. تحديث الجدول فوراً بدلاً من الـ Refresh
          setProducts((prev) =>
            prev.map((product) =>
              product.id === updatedProduct.id ? updatedProduct : product,
            ),
          );
        } else {
          const { data, error } = await supabase
            .from("products")
            .insert({
              ...productPayload,
              store_id: storeId,
            })
            .select(
              `
            *,
            categories (
              id,
              name
            ),
            product_images (
              id,
              image_url,
              sort_order
            )
          `,
            )
            .single();

          if (error) throw error;

          const newProduct = {
            ...normalizeProduct(data),
            status: statusValue,
          };

          setProducts((prev) => [newProduct, ...prev]);
        }

        setIsModalOpen(false);
        setEditingProduct(null);
        return true;
      } catch (err) {
        console.error("Failed to save product:", err);
        throw err;
      } finally {
        setSavingProduct(false);
      }
    };

    const handleArchiveProduct = async (productId) => {
      if (!storeId) return;

      try {
        setProcessingProductId(productId);

        const { data, error } = await supabase
          .from("products")
          .update({
            is_active: false,
            updated_at: new Date().toISOString(),
          })
          .eq("id", productId)
          .eq("store_id", storeId)
          .select(
            `
              *,
              categories (
                id,
                name
              ),
              product_images (
                id,
                image_url,
                sort_order
              )
            `,
          )
          .single();

        if (error) throw error;

        const updatedProduct = normalizeProduct(data);

        setProducts((prev) =>
          prev.map((product) =>
            product.id === productId
              ? {
                  ...updatedProduct,
                  status: "Archived",
                }
              : product,
          ),
        );

        setActiveActionId(null);
      } catch (err) {
        console.error("Failed to archive product:", err);

        setError(err?.message || "Failed to archive product.");
      } finally {
        setProcessingProductId(null);
      }
    };

    const handleDuplicateProduct = async (product) => {
      if (!storeId) return;

      try {
        setProcessingProductId(product.id);

        const baseSlug = generateSlug(`${product.name} copy`);

        const uniqueSlug = `${baseSlug}-${Date.now()}`;

        const { data, error } = await supabase
          .from("products")
          .insert({
            store_id: storeId,

            category_id: product.categoryId || null,

            name: `${product.name} (Copy)`,

            slug: uniqueSlug,

            description: product.description || null,

            price: Number(product.price || 0),

            compare_price:
              product.comparePrice !== "" ? Number(product.comparePrice) : null,

            stock: Number(product.stock || 0),

            is_active: true,

            updated_at: new Date().toISOString(),
          })
          .select(
            `
              *,
              categories (
                id,
                name
              ),
              product_images (
                id,
                image_url,
                sort_order
              )
            `,
          )
          .single();

        if (error) throw error;

        const duplicatedProduct = normalizeProduct(data);

        setProducts((prev) => [duplicatedProduct, ...prev]);

        setActiveActionId(null);
      } catch (err) {
        console.error("Failed to duplicate product:", err);

        setError(err?.message || "Failed to duplicate product.");
      } finally {
        setProcessingProductId(null);
      }
    };

    const filteredProducts = products.filter((product) => {
      const query = searchQuery.trim().toLowerCase();

      const matchesSearch =
        !query ||
        product.name?.toLowerCase().includes(query) ||
        product.sku?.toLowerCase().includes(query);

      const matchesCategory =
        selectedCategory === "All categories" ||
        product.category === selectedCategory;

      const matchesStatus =
        selectedStatus === "All statuses" ||
        product.status?.toLowerCase() === selectedStatus.toLowerCase();

      return matchesSearch && matchesCategory && matchesStatus;
    });

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;

    const safeCurrentPage = Math.min(currentPage, totalPages);

    const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;

    const endIndex = startIndex + ITEMS_PER_PAGE;

    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    const isCurrentPageSelected =
      paginatedProducts.length > 0 &&
      paginatedProducts.every((product) => selectedIds.includes(product.id));

    const handleSelectAllCurrentPage = () => {
      const currentPageIds = paginatedProducts.map((product) => product.id);

      if (isCurrentPageSelected) {
        onSelectionChange(
          selectedIds.filter((id) => !currentPageIds.includes(id)),
        );
      } else {
        const newSelected = Array.from(
          new Set([...selectedIds, ...currentPageIds]),
        );

        onSelectionChange(newSelected);
      }
    };

    const handleSelectRow = (productId) => {
      if (selectedIds.includes(productId)) {
        onSelectionChange(selectedIds.filter((id) => id !== productId));
      } else {
        onSelectionChange([...selectedIds, productId]);
      }
    };

    const deleteSelectedProducts = async () => {
      if (!storeId || selectedIds.length === 0) {
        return;
      }

      const { error } = await supabase
        .from("products")
        .delete()
        .eq("store_id", storeId)
        .in("id", selectedIds);

      if (error) {
        console.error("Failed to delete selected products:", error);

        throw error;
      }

      setProducts((prev) =>
        prev.filter((product) => !selectedIds.includes(product.id)),
      );

      onSelectionChange([]);
    };

    const deleteSingleProduct = async (productId) => {
      if (!storeId || !productId) return;

      const { error } = await supabase
        .from("products")
        .delete()
        .eq("store_id", storeId)
        .eq("id", productId);

      if (error) {
        console.error("Failed to delete product:", error);

        throw error;
      }

      setProducts((prev) => prev.filter((product) => product.id !== productId));

      onSelectionChange(selectedIds.filter((id) => id !== productId));
    };

    const exportToExcel = () => {
      if (filteredProducts.length === 0) {
        return;
      }

      const dataToExport = filteredProducts.map((product) => ({
        ID: product.id,

        "Product Name": product.name,

        Category: product.category || "",

        "Price (EGP)": product.price,

        Stock: product.stock,

        Sold: product.sold,

        Status: product.status,
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

      const isFiltered =
        searchQuery.trim() !== "" ||
        selectedCategory !== "All categories" ||
        selectedStatus !== "All statuses";

      const fileName = isFiltered
        ? `products_filtered_${new Date().toISOString().slice(0, 10)}.xlsx`
        : `products_all_${new Date().toISOString().slice(0, 10)}.xlsx`;

      XLSX.writeFile(workbook, fileName);
    };

    useImperativeHandle(ref, () => ({
      exportData: exportToExcel,

      deleteSelectedProducts,

      deleteSingleProduct,

      updateProduct: handleSaveModal,

      refreshProducts: reloadProducts,
    }));

    const getStatusBadge = (status) => {
      switch (status?.toLowerCase()) {
        case "active":
          return "bg-success-soft text-success border-success/30";

        case "draft":
          return "bg-muted text-muted-foreground border-border";

        case "archived":
          return "bg-destructive-soft text-destructive border-destructive/30";

        default:
          return "bg-muted text-muted-foreground border-border";
      }
    };

    const activeProduct = products.find(
      (product) => product.id === activeActionId,
    );

    return (
      <section className="panel min-w-0 overflow-hidden max-w-full">
        <div className="flex flex-col gap-2 border-b border-border p-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <input
              type="text"
              placeholder="Search products or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex w-full rounded-md border border-input px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring h-9 bg-surface pl-8 md:text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            <div
              className="relative w-full sm:w-auto min-w-44"
              ref={categoryRef}
            >
              <button
                type="button"
                onClick={handleToggleCategory}
                className="flex items-center justify-between gap-2 whitespace-nowrap rounded-md border border-input px-3 py-2 text-sm shadow-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring h-9 w-full bg-surface"
              >
                <div className="flex items-center gap-2 truncate">
                  <SlidersHorizontal className="size-3.5 text-muted-foreground shrink-0" />

                  <span className="truncate">{selectedCategory}</span>
                </div>

                <ChevronDown
                  className={`h-4 w-4 opacity-50 transition-transform duration-200 ${
                    isCategoryOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>

            <div className="relative w-full sm:w-auto min-w-40" ref={statusRef}>
              <button
                type="button"
                onClick={handleToggleStatus}
                className="flex items-center justify-between gap-2 whitespace-nowrap rounded-md border border-input px-3 py-2 text-sm shadow-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring h-9 w-full bg-surface"
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
            </div>
          </div>
        </div>

        {error && (
          <div className="border-b border-destructive/20 bg-destructive/5 px-4 py-3 text-xs text-destructive">
            {error}
          </div>
        )}

        {/* Mobile View */}
        <ul className="divide-y divide-border md:hidden">
          {loading ? (
            <li className="flex items-center justify-center gap-2 py-12 text-xs text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading products...
            </li>
          ) : paginatedProducts.length > 0 ? (
            paginatedProducts.map((product) => {
              const isSelected = selectedIds.includes(product.id);

              const isProcessing = processingProductId === product.id;

              return (
                <li key={product.id} className="flex gap-3 p-4">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={isSelected}
                    onClick={() => handleSelectRow(product.id)}
                    className={`mt-1 grid place-content-center h-4 w-4 shrink-0 rounded-sm border cursor-pointer ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-primary shadow"
                    }`}
                  >
                    {isSelected && <Check className="size-3" />}
                  </button>

                  <img
                    src={product.image || "/placeholder-product.png"}
                    alt={product.name}
                    loading="lazy"
                    className="size-14 shrink-0 rounded-md border border-border object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder-product.png";
                    }}
                  />

                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                      <div className="min-w-0">
                        <Link
                          to={`/admin/products/${product.id}`}
                          className="block truncate text-sm font-medium hover:text-brand"
                        >
                          {product.name}
                        </Link>

                        <span className="num block truncate text-xs text-muted-foreground">
                          {product.sku || "No SKU"} ·{" "}
                          {product.category || "Uncategorized"}
                        </span>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${getStatusBadge(
                          product.status,
                        )}`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            product.status === "Active"
                              ? "bg-success"
                              : product.status === "Draft"
                                ? "bg-muted-foreground"
                                : "bg-destructive"
                          }`}
                        />

                        {product.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="num font-medium text-foreground">
                        {Number(product.price || 0).toLocaleString()} EGP
                      </span>

                      <span>
                        Stock{" "}
                        <span
                          className={`num ${
                            product.stock === 0
                              ? "text-destructive font-semibold"
                              : product.stock < 10
                                ? "text-amber-600 dark:text-amber-400 font-semibold"
                                : ""
                          }`}
                        >
                          {product.stock}
                        </span>
                      </span>

                      <span className="num">Sold {product.sold}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleEditClick(product)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer disabled:opacity-50"
                      >
                        <Pencil className="size-3.5" />

                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => onDeleteSingle(product.id)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium shadow-xs transition-colors hover:bg-accent cursor-pointer text-destructive hover:text-destructive disabled:opacity-50"
                      >
                        <Trash2 className="size-3.5" />

                        <span>Delete</span>
                      </button>

                      <button
                        type="button"
                        ref={(el) => (buttonRefs.current[product.id] = el)}
                        onClick={() => handleToggleActions(product.id)}
                        className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
                      >
                        {isProcessing ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <MoreHorizontal className="size-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })
          ) : (
            <li className="py-8 text-center text-muted-foreground text-xs">
              No products found.
            </li>
          )}
        </ul>

        {/* Desktop View */}
        <div className="hidden md:block">
          <div className="min-w-0 max-w-full overflow-hidden">
            <div className="w-full max-w-full overflow-x-auto">
              <table className="w-full min-w-160 border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-muted/70">
                    <th
                      scope="col"
                      className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground w-10"
                    >
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={isCurrentPageSelected}
                        onClick={handleSelectAllCurrentPage}
                        className={`grid place-content-center h-4 w-4 shrink-0 rounded-sm border cursor-pointer transition-colors ${
                          isCurrentPageSelected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-primary shadow"
                        }`}
                        aria-label="Select current page products"
                      >
                        {isCurrentPageSelected && <Check className="size-3" />}
                      </button>
                    </th>

                    <th
                      scope="col"
                      className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      Product
                    </th>

                    <th
                      scope="col"
                      className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden md:table-cell"
                    >
                      Category
                    </th>

                    <th
                      scope="col"
                      className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground text-right"
                    >
                      Price
                    </th>

                    <th
                      scope="col"
                      className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground text-right"
                    >
                      Stock
                    </th>

                    <th
                      scope="col"
                      className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground text-right hidden lg:table-cell"
                    >
                      Sold
                    </th>

                    <th
                      scope="col"
                      className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      Status
                    </th>

                    <th
                      scope="col"
                      className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground text-right"
                    >
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-12 text-center text-muted-foreground text-xs"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="size-4 animate-spin" />
                          Loading products...
                        </div>
                      </td>
                    </tr>
                  ) : paginatedProducts.length > 0 ? (
                    paginatedProducts.map((product) => {
                      const isSelected = selectedIds.includes(product.id);

                      const stock = product.stock ?? 0;

                      let stockColorClass = "";

                      if (stock === 0) {
                        stockColorClass = "text-destructive font-semibold";
                      } else if (stock < 10) {
                        stockColorClass = "text-warning font-semibold";
                      }

                      return (
                        <tr
                          key={product.id}
                          className={`transition-colors ${
                            isSelected ? "bg-accent/40" : ""
                          }`}
                        >
                          <td className="px-4 py-3 align-middle">
                            <button
                              type="button"
                              role="checkbox"
                              aria-checked={isSelected}
                              onClick={() => handleSelectRow(product.id)}
                              className={`grid place-content-center h-4 w-4 shrink-0 rounded-sm border cursor-pointer transition-colors ${
                                isSelected
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "border-primary shadow"
                              }`}
                              aria-label={`Select ${product.name}`}
                            >
                              {isSelected && <Check className="size-3" />}
                            </button>
                          </td>

                          <td className="px-4 py-3 align-middle">
                            <div className="flex items-center gap-3">
                              <Link
                                to={`/admin/products/${product.id}`}
                                className="flex items-center gap-3 group min-w-0"
                              >
                                <img
                                  src={
                                    product.image || "/placeholder-product.png"
                                  }
                                  alt={product.name}
                                  loading="lazy"
                                  className="size-10 shrink-0 rounded-md border border-border object-cover transition-opacity group-hover:opacity-80 cursor-pointer"
                                  onError={(e) => {
                                    e.currentTarget.src =
                                      "/placeholder-product.png";
                                  }}
                                />

                                <div className="min-w-0">
                                  <span className="block truncate text-sm font-medium text-foreground group-hover:text-brand cursor-pointer">
                                    {product.name}
                                  </span>

                                  <span className="num block text-xs text-muted-foreground">
                                    {product.sku || "No SKU"}
                                  </span>
                                </div>
                              </Link>
                            </div>
                          </td>

                          <td className="px-4 py-3 align-middle hidden md:table-cell">
                            {product.category || "Uncategorized"}
                          </td>

                          <td className="px-4 py-3 align-middle text-right">
                            <span className="num font-medium">
                              {Number(product.price || 0).toLocaleString()} EGP
                            </span>
                          </td>

                          <td className="px-4 py-3 align-middle text-right">
                            <span className={`num ${stockColorClass}`}>
                              {stock}
                            </span>
                          </td>

                          <td className="px-4 py-3 align-middle text-right hidden lg:table-cell">
                            <span className="num">{product.sold}</span>
                          </td>

                          <td className="px-4 py-3 align-middle">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${getStatusBadge(
                                product.status,
                              )}`}
                            >
                              <span className="size-1.5 rounded-full bg-current opacity-80" />

                              {product.status}
                            </span>
                          </td>

                          <td className="px-4 py-3 align-middle text-right">
                            <div className="flex items-center justify-end gap-0.5">
                              <button
                                type="button"
                                onClick={() => handleEditClick(product)}
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9"
                                title="Quick Edit"
                              >
                                <Pencil className="size-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => onDeleteSingle(product.id)}
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors hover:bg-accent h-9 w-9 text-destructive hover:text-destructive"
                                title="Delete"
                              >
                                <Trash2 className="size-4" />
                              </button>

                              <button
                                type="button"
                                ref={(el) =>
                                  (buttonRefs.current[product.id] = el)
                                }
                                onClick={() => handleToggleActions(product.id)}
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9"
                              >
                                <MoreHorizontal className="size-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-8 text-center text-muted-foreground text-xs"
                      >
                        No products found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
          <span>
            Showing{" "}
            <span className="font-semibold text-foreground num">
              {filteredProducts.length === 0 ? 0 : startIndex + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-foreground num">
              {Math.min(endIndex, filteredProducts.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-foreground num">
              {filteredProducts.length}
            </span>
          </span>

          <div className="flex gap-1.5">
            <button
              type="button"
              disabled={safeCurrentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="h-8 px-3 rounded-md border border-input bg-background font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Previous
            </button>

            <button
              type="button"
              disabled={safeCurrentPage >= totalPages}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              className="h-8 px-3 rounded-md border border-input bg-background font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>

        {/* Category Dropdown */}
        {isCategoryOpen &&
          createPortal(
            <div
              ref={categoryMenuRef}
              className="fixed z-50 rounded-md border border-border bg-popover text-popover-foreground shadow-md animate-in fade-in-80 zoom-in-95"
              style={{
                top: `${categoryPos.top}px`,
                left: `${categoryPos.left}px`,
                width: `${categoryPos.width}px`,
              }}
            >
              <div className="p-1">
                {[
                  "All categories",
                  ...categories.map((category) => category.name),
                ].map((cat) => (
                  <div
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setIsCategoryOpen(false);
                    }}
                    className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${
                      selectedCategory === cat
                        ? "bg-accent/50 font-semibold"
                        : ""
                    }`}
                  >
                    <span className="truncate">{cat}</span>

                    {selectedCategory === cat && (
                      <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                        <Check className="size-4 text-primary" />
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>,
            document.body,
          )}

        {/* Status Dropdown */}
        {isStatusOpen &&
          createPortal(
            <div
              ref={statusMenuRef}
              className="fixed z-50 rounded-md border border-border bg-popover text-popover-foreground shadow-md animate-in fade-in-80 zoom-in-95"
              style={{
                top: `${statusPos.top}px`,
                left: `${statusPos.left}px`,
                width: `${statusPos.width}px`,
              }}
            >
              <div className="p-1">
                {statuses.map((status) => (
                  <div
                    key={status}
                    onClick={() => {
                      setSelectedStatus(status);
                      setIsStatusOpen(false);
                    }}
                    className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${
                      selectedStatus === status
                        ? "bg-accent/50 font-semibold"
                        : ""
                    }`}
                  >
                    <span className="truncate">{status}</span>

                    {selectedStatus === status && (
                      <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                        <Check className="size-4 text-primary" />
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>,
            document.body,
          )}

        {/* Actions Dropdown */}
        {activeActionId !== null &&
          activeProduct &&
          createPortal(
            <div
              ref={menuRef}
              className="fixed z-50 min-w-44 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80 zoom-in-95 space-y-0.5"
              style={{
                top: `${dropdownPos.top}px`,
                left: `${dropdownPos.left}px`,
                transform: dropdownPos.openUpward
                  ? "translateY(-100%)"
                  : "none",
              }}
            >
              <button
                type="button"
                onClick={() => handleOpenFullEditor(activeProduct.id)}
                className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2.5 py-2 text-xs font-medium outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <ExternalLink className="size-3.5 text-muted-foreground" />

                <span>Open full editor</span>
              </button>

              <button
                type="button"
                disabled={processingProductId === activeProduct.id}
                onClick={() => handleDuplicateProduct(activeProduct)}
                className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2.5 py-2 text-xs font-medium outline-none transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
              >
                {processingProductId === activeProduct.id ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Copy className="size-3.5 text-muted-foreground" />
                )}

                <span>Duplicate</span>
              </button>

              <button
                type="button"
                disabled={processingProductId === activeProduct.id}
                onClick={() => handleArchiveProduct(activeProduct.id)}
                className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2.5 py-2 text-xs font-medium outline-none transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
              >
                <Archive className="size-3.5 text-muted-foreground" />

                <span>Archive</span>
              </button>
            </div>,
            document.body,
          )}

        <ProductModal
          isOpen={isModalOpen}
          onClose={() => {
            if (!savingProduct) {
              setIsModalOpen(false);
              setEditingProduct(null);
            }
          }}
          onSubmit={handleSaveModal}
          initialData={editingProduct}
          categories={categories}
          isSubmitting={savingProduct}
        />
      </section>
    );
  },
);

ProductsTable.displayName = "ProductsTable";

function generateSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default ProductsTable;
