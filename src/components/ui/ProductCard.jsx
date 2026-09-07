import { Link } from "react-router-dom";
import { Star } from "lucide-react";

export default function ProductCard({ product, onQuickView, onAddToCart }) {
  const {
    id,
    slug = "",
    title = product?.name || "عنوان المنتج",
    vendor = product?.brand || product?.vendor || "",
    price = 0,
    compareAtPrice = product?.compare_at_price ||
      product?.compareAtPrice ||
      null,
    rating = product?.rating || 4.9,
    images = [],
    featured_image = product?.image_url || product?.featured_image,
  } = product || {};

  const imageUrl =
    featured_image ||
    (images && images[0]) ||
    "https://via.placeholder.com/600x700?text=No+Image";

  const productLink = `/products/${slug || id}`;

  return (
    <div className="w-60 shrink-0 snap-start snap-always md:w-80 lg:snap-normal">
      <div className="flex h-full flex-col">
        {/* الجزء العلوي: الصورة + الشارات + أزرار التفاعل */}
        <div className="group relative">
          <div className="relative aspect-6/7 overflow-hidden rounded-lg bg-muted">
            <Link to={productLink} className="block h-full w-full">
              <img
                src={imageUrl}
                alt={title}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* تقييم المنتج badge */}
              {rating && (
                <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-sm border border-border bg-background/90 px-1.5 py-0.5 text-xs font-bold backdrop-blur-sm md:right-4 md:top-4">
                  <Star className="size-3.5 fill-primary text-primary" />
                  <span className="leading-none">{rating}</span>
                </span>
              )}
            </Link>

            {/* أزرار التفاعل المباشر عند التمرير (Hover Overlay) - شاشات الحاسوب */}
            <div className="absolute -bottom-1 left-0 flex w-full translate-y-full flex-wrap justify-between gap-2 px-4 pb-4 transition-transform duration-200 ease-in-out md:group-hover:translate-y-0">
              {onQuickView && (
                <button
                  type="button"
                  onClick={() => onQuickView(product)}
                  className="ml-auto mt-1 hidden h-10 items-center justify-center rounded-full border border-input bg-background px-4 py-2 text-sm font-bold transition-colors hover:bg-accent hover:text-accent-foreground md:flex"
                >
                  Quick View
                </button>
              )}

              <div className="ml-auto mt-1 hidden grow justify-end pl-2 md:flex">
                <button
                  type="button"
                  onClick={() => onAddToCart && onAddToCart(product)}
                  className="inline-flex h-10 w-full items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* الجزء السفلي: تفاصيل المنتج */}
        <div className="mt-3 flex h-full flex-col justify-between gap-2">
          <h3>
            <Link to={productLink} className="group/title block">
              {vendor && (
                <span className="block text-xs font-bold text-muted-foreground">
                  {vendor}
                </span>
              )}
              <span className="line-clamp-2 text-sm font-semibold text-foreground group-hover/title:underline">
                {title}
              </span>
            </Link>
          </h3>

          <div className="flex w-full flex-col justify-between">
            {/* عرض السعر مع السعر القديم إن وجد */}
            <div className="flex items-baseline gap-2 font-bold">
              <span className="text-foreground">
                ${Number(price).toFixed(2)}
              </span>
              {compareAtPrice && (
                <span className="text-xs text-muted-foreground line-through">
                  ${Number(compareAtPrice).toFixed(2)}
                </span>
              )}
            </div>

            {/* زر الإضافة للسلة للشاشات الصغيرة (Mobile) */}
            <div className="mt-2 w-full md:hidden">
              <button
                type="button"
                onClick={() => onAddToCart && onAddToCart(product)}
                className="inline-flex h-8 w-full items-center justify-center rounded-full bg-primary px-3 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
