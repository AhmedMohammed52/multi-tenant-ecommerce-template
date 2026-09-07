export default function Pricing({ formData, handleChange }) {
  return (
    <section className="panel p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Pricing</h2>
        </div>
      </div>

      <div className="grid gap-4">
        {/* Price */}
        <div className="space-y-1.5">
          <label
            htmlFor="p-price"
            className="text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Price
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </label>

          <div id="p-price-control">
            <input
              id="p-price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price ?? ""}
              onChange={handleChange}
              className="num flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            />
          </div>
        </div>

        {/* Compare at price */}
        <div className="space-y-1.5">
          <label
            htmlFor="p-compare"
            className="text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Compare at price
          </label>

          <div id="p-compare-control">
            <input
              id="p-compare"
              name="comparePrice"
              type="number"
              min="0"
              step="0.01"
              value={formData.comparePrice ?? ""}
              onChange={handleChange}
              className="num flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            />
          </div>
        </div>

        {/* Cost per item */}
        <div className="space-y-1.5">
          <label
            htmlFor="p-cost"
            className="text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Cost per item
          </label>

          <div id="p-cost-control">
            <input
              id="p-cost"
              name="costPerItem"
              type="number"
              min="0"
              step="0.01"
              value={formData.costPerItem ?? ""}
              onChange={handleChange}
              className="num flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Used to calculate margin
          </p>
        </div>
      </div>
    </section>
  );
}
