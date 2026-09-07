const defaultProducts = [
  {
    id: 1,
    name: "Premium Leather Sneakers",
    sold: "324 sold",
    revenue: "18,420 EGP",
    image: "/placeholder.png",
  },
  {
    id: 2,
    name: "Classic Oversized Hoodie",
    sold: "268 sold",
    revenue: "12,360 EGP",
    image: "/placeholder.png",
  },
  {
    id: 3,
    name: "Structured Leather Tote",
    sold: "141 sold",
    revenue: "9,840 EGP",
    image: "/placeholder.png",
  },
  {
    id: 4,
    name: "Merino Wool Overshirt",
    sold: "98 sold",
    revenue: "7,420 EGP",
    image: "/placeholder.png",
  },
  {
    id: 5,
    name: "Minimal Everyday Belt",
    sold: "210 sold",
    revenue: "5,210 EGP",
    image: "/placeholder.png",
  },
];

export default function TopProducts({ products = defaultProducts }) {
  return (
    <section className="panel p-5">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-foreground">
          Top products
        </h3>
        <p className="text-xs text-muted-foreground">By revenue this period</p>
      </div>

      <div className="space-y-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Product Thumbnail */}
              <img
                src={product.image}
                alt={product.name}
                className="size-11 rounded-lg border border-border object-cover bg-muted shrink-0"
              />
              {/* Product Info */}
              <div className="truncate">
                <p className="truncate text-sm font-medium text-foreground">
                  {product.name}
                </p>
                <p className="text-xs text-muted-foreground">{product.sold}</p>
              </div>
            </div>

            {/* Product Revenue */}
            <span className="num text-sm font-semibold text-foreground whitespace-nowrap">
              {product.revenue}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
