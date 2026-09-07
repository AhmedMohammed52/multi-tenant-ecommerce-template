import { useRef, useState, useEffect } from "react";

import { Upload, Star, GripVertical, Trash2, ImagePlus } from "lucide-react";

export default function Media({ images = [], setImages }) {
  const fileInputRef = useRef(null);

  const [draggedIndex, setDraggedIndex] = useState(null);

  useEffect(() => {
    return () => {
      images.forEach((image) => {
        if (image?.file && image?.preview?.startsWith("blob:")) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, []);

  const getImageSource = (image) => {
    if (!image) {
      return "";
    }

    if (typeof image === "string") {
      return image;
    }

    return image.preview || image.image_url || "";
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) {
      return;
    }

    /*
     * Validate Files
     */

    const validFiles = files.filter((file) => {
      const validType = ["image/png", "image/jpeg", "image/webp"].includes(
        file.type,
      );

      const validSize = file.size <= 5 * 1024 * 1024;

      return validType && validSize;
    });

    if (validFiles.length !== files.length) {
      alert("Only PNG, JPG or WEBP images up to 5 MB are allowed.");
    }

    /*
     * Create Preview Objects
     */

    const newImages = validFiles.map((file) => ({
      id: null,

      file,

      preview: URL.createObjectURL(file),

      image_url: null,

      sort_order: 0,
    }));

    setImages((prev) => [...prev, ...newImages]);

    /*
     * Reset input
     */

    e.target.value = "";
  };

  /*
   * =========================================================
   * REMOVE IMAGE
   * =========================================================
   */

  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => {
      const image = prev[indexToRemove];

      /*
       * Revoke temporary preview
       */

      if (image?.file && image?.preview?.startsWith("blob:")) {
        URL.revokeObjectURL(image.preview);
      }

      return prev.filter((_, index) => index !== indexToRemove);
    });
  };

  /*
   * =========================================================
   * DRAG START
   * =========================================================
   */

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  /*
   * =========================================================
   * DROP / REORDER
   * =========================================================
   */

  const handleDrop = (index) => {
    if (draggedIndex === null || draggedIndex === index) {
      return;
    }

    const updatedImages = [...images];

    const [draggedItem] = updatedImages.splice(draggedIndex, 1);

    updatedImages.splice(index, 0, draggedItem);

    /*
     * Update sort order
     */

    const reorderedImages = updatedImages.map((image, imageIndex) => ({
      ...image,
      sort_order: imageIndex,
    }));

    setImages(reorderedImages);

    setDraggedIndex(null);
  };

  /*
   * =========================================================
   * DRAG OVER
   * =========================================================
   */

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <section className="panel p-5">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Media</h2>

          <p className="mt-0.5 text-xs text-muted-foreground">
            Drag to reorder — first image is the cover
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Top Action Bar */}

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Media</span>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex h-8 items-center justify-center gap-2 rounded-md border border-input bg-background px-3 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
          >
            <Upload className="size-4" />
            Upload
          </button>
        </div>

        {/* Hidden File Input */}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Images Grid Container */}

        <div className="rounded-lg border border-dashed border-border-strong bg-surface-muted/50 p-4 transition-colors">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((image, index) => {
              const isCover = index === 0;

              const imageSrc = getImageSource(image);

              return (
                <li
                  key={image?.id || image?.preview || index}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(index)}
                  className="group relative overflow-hidden rounded-md border border-border bg-surface select-none cursor-grab active:cursor-grabbing"
                >
                  <img
                    src={imageSrc}
                    alt={`Product image ${index + 1}`}
                    loading="lazy"
                    className="aspect-square w-full object-cover"
                  />

                  {/* Cover Badge */}

                  {isCover && (
                    <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded bg-brand px-1.5 py-0.5 text-[10px] font-medium text-brand-foreground shadow-sm">
                      <Star className="size-2.5 fill-current" />
                      Cover
                    </span>
                  )}

                  {/* Hover Overlay */}

                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-linear-to-t from-black/60 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                    <span
                      className="cursor-grab rounded p-1 text-white/90 hover:text-white"
                      aria-hidden="true"
                    >
                      <GripVertical className="size-3.5" />
                    </span>

                    <button
                      type="button"
                      aria-label={`Remove image ${index + 1}`}
                      onClick={() => handleRemoveImage(index)}
                      className="rounded p-1 text-white/90 hover:text-white transition-colors"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}

            {/* Add Card */}

            <li>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border-strong text-muted-foreground transition-colors hover:border-brand hover:text-brand"
              >
                <ImagePlus className="size-5" />

                <span className="text-xs">Add</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Footer */}

        <p className="text-xs text-muted-foreground">
          PNG, JPG or WEBP up to 5 MB. First image is the cover.
        </p>
      </div>
    </section>
  );
}
