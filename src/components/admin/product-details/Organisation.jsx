import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check, Loader2 } from "lucide-react";

import { useAuth } from "../../../contexts/AuthContext";
import { getCategories } from "../../../services/products";

export default function Organisation({ formData = {}, handleChange }) {
  const { storeId } = useAuth();

  const [openDropdown, setOpenDropdown] = useState(null);

  const [dropdownPos, setDropdownPos] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const [categories, setCategories] = useState([]);

  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const statusRef = useRef(null);
  const categoryRef = useRef(null);
  const collectionRef = useRef(null);
  const menuRef = useRef(null);

  /*
   * =========================================================
   * LOAD CATEGORIES
   * =========================================================
   */

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      if (!storeId) {
        setCategories([]);
        return;
      }

      try {
        setCategoriesLoading(true);

        const data = await getCategories(storeId);

        if (!cancelled) {
          setCategories(data || []);
        }
      } catch (error) {
        console.error("Failed to load categories:", error);

        if (!cancelled) {
          setCategories([]);
        }
      } finally {
        if (!cancelled) {
          setCategoriesLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, [storeId]);

  /*
   * =========================================================
   * DROPDOWN OPTIONS
   * =========================================================
   */

  const statusOptions = ["active", "draft", "archived"];

  /*
   * =========================================================
   * GET REF
   * =========================================================
   */

  const getRef = (name) => {
    switch (name) {
      case "status":
        return statusRef;

      case "category":
        return categoryRef;

      case "collection":
        return collectionRef;

      default:
        return null;
    }
  };

  /*
   * =========================================================
   * GET OPTIONS
   * =========================================================
   */

  const getOptions = (name) => {
    switch (name) {
      case "status":
        return statusOptions;

      case "category":
        return categories;

      case "collection":
        return [];

      default:
        return [];
    }
  };

  /*
   * =========================================================
   * CLICK OUTSIDE / SCROLL
   * =========================================================
   */

  useEffect(() => {
    function handleClickOutside(event) {
      if (!openDropdown) return;

      const currentRef = getRef(openDropdown);

      if (
        currentRef?.current &&
        !currentRef.current.contains(event.target) &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setOpenDropdown(null);
      }
    }

    function handleScrollOrResize() {
      if (openDropdown) {
        setOpenDropdown(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    window.addEventListener("scroll", handleScrollOrResize, true);

    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);

      window.removeEventListener("scroll", handleScrollOrResize, true);

      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [openDropdown]);

  /*
   * =========================================================
   * TOGGLE DROPDOWN
   * =========================================================
   */

  const handleToggle = (name) => {
    if (openDropdown === name) {
      setOpenDropdown(null);
      return;
    }

    /*
     * Collection is not connected to DB yet.
     */
    if (name === "collection") {
      return;
    }

    const currentRef = getRef(name);

    if (!currentRef?.current) {
      return;
    }

    const rect = currentRef.current.getBoundingClientRect();

    const currentOptions = getOptions(name);

    const estimatedMenuHeight = Math.max(currentOptions.length * 36 + 8, 44);

    const spaceBelow = window.innerHeight - rect.bottom;

    const spaceAbove = rect.top;

    let topPosition = rect.bottom + 4;

    if (spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow) {
      topPosition = rect.top - estimatedMenuHeight - 4;
    }

    setDropdownPos({
      top: topPosition,
      left: rect.left,
      width: rect.width,
    });

    setOpenDropdown(name);
  };

  /*
   * =========================================================
   * SELECT
   * =========================================================
   */

  const handleSelect = (name, value) => {
    if (!handleChange) {
      setOpenDropdown(null);
      return;
    }

    /*
     * STATUS
     *
     * Save:
     * "active"
     * "draft"
     * "archived"
     */
    if (name === "status") {
      handleChange({
        target: {
          name: "status",
          value,
        },
      });

      setOpenDropdown(null);
      return;
    }

    /*
     * CATEGORY
     *
     * Save Category UUID into:
     *
     * formData.categoryId
     *
     * DB:
     * products.category_id
     */
    if (name === "category") {
      handleChange({
        target: {
          name: "categoryId",
          value: value.id,
        },
      });

      setOpenDropdown(null);
      return;
    }

    /*
     * COLLECTION
     *
     * Currently UI only.
     * There is no collection_id in products.
     */
    if (name === "collection") {
      handleChange({
        target: {
          name: "collectionId",
          value,
        },
      });

      setOpenDropdown(null);
    }
  };

  /*
   * =========================================================
   * CURRENT DISPLAY VALUE
   * =========================================================
   */

  const getCurrentValue = (name, defaultValue) => {
    /*
     * Status
     */
    if (name === "status") {
      return formData.status || defaultValue;
    }

    /*
     * Category
     */
    if (name === "category") {
      if (!formData.categoryId) {
        return categories.length > 0 ? categories[0].name : "No categories";
      }

      const selectedCategory = categories.find(
        (category) => category.id === formData.categoryId,
      );

      return selectedCategory?.name || "Select category";
    }

    /*
     * Collection
     */
    if (name === "collection") {
      return formData.collectionId || defaultValue;
    }

    return defaultValue;
  };

  /*
   * =========================================================
   * IS SELECTED
   * =========================================================
   */

  const isSelected = (name, option) => {
    /*
     * Status
     */
    if (name === "status") {
      return formData.status === option;
    }

    /*
     * Category
     */
    if (name === "category") {
      return formData.categoryId === option.id;
    }

    /*
     * Collection
     */
    if (name === "collection") {
      return formData.collectionId === option;
    }

    return false;
  };

  /*
   * =========================================================
   * RENDER DROPDOWN
   * =========================================================
   */

  const renderDropdown = (name, label, defaultValue) => {
    const currentValue = getCurrentValue(name, defaultValue);

    const isOpen = openDropdown === name;

    const ref = getRef(name);

    const isCategory = name === "category";

    // const options = getOptions(name);

    const disabled =
      name === "collection" ||
      (isCategory && !categoriesLoading && categories.length === 0);

    return (
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">{label}</label>

        <div className="relative w-full" ref={ref}>
          <button
            type="button"
            onClick={() => handleToggle(name)}
            disabled={disabled}
            className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-surface px-3 py-2 text-sm shadow-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="truncate">
              {isCategory && categoriesLoading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-3.5 animate-spin" />
                  Loading...
                </span>
              ) : (
                currentValue
              )}
            </span>

            <ChevronDown
              className={`h-4 w-4 opacity-50 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>
    );
  };

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <section className="panel p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Organisation
          </h2>
        </div>
      </div>

      <div className="grid gap-4">
        {renderDropdown("status", "Status", "active")}

        {renderDropdown("category", "Category", "Select category")}

        {renderDropdown("collection", "Collection", "Best Sellers")}
      </div>

      {openDropdown &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-50 rounded-md border border-border bg-popover text-popover-foreground shadow-md animate-in fade-in-80 zoom-in-95"
            style={{
              top: `${dropdownPos.top}px`,
              left: `${dropdownPos.left}px`,
              width: `${dropdownPos.width}px`,
            }}
          >
            <div className="p-1">
              {getOptions(openDropdown).map((opt) => {
                const optionKey = openDropdown === "category" ? opt.id : opt;

                const optionLabel =
                  openDropdown === "category" ? opt.name : opt;

                const selected = isSelected(openDropdown, opt);

                return (
                  <div
                    key={optionKey}
                    onClick={() => handleSelect(openDropdown, opt)}
                    className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${
                      selected ? "bg-accent/50 font-semibold" : ""
                    }`}
                  >
                    <span className="truncate">{optionLabel}</span>

                    {selected && (
                      <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                        <Check className="size-4 text-primary" />
                      </span>
                    )}
                  </div>
                );
              })}

              {getOptions(openDropdown).length === 0 && (
                <div className="px-2 py-2 text-xs text-muted-foreground">
                  No options available
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}
