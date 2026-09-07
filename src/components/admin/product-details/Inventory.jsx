export default function Inventory({
  formData,
  handleChange,
  handleSwitchChange,
}) {
  const isTracked = formData.trackQuantity ?? true;

  return (
    <section className="panel p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Inventory</h2>
        </div>
      </div>

      <div className="grid gap-4">
        {/* Track Quantity Switch */}
        <div className="flex items-center justify-between rounded-md border border-border p-3">
          <span className="text-sm">Track quantity</span>

          <button
            type="button"
            role="switch"
            aria-checked={isTracked}
            data-state={isTracked ? "checked" : "unchecked"}
            onClick={() =>
              handleSwitchChange
                ? handleSwitchChange("trackQuantity", !isTracked)
                : handleChange({
                    target: {
                      name: "trackQuantity",
                      value: !isTracked,
                    },
                  })
            }
            className="peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
          >
            <span
              data-state={isTracked ? "checked" : "unchecked"}
              className="pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
            />
          </button>
        </div>

        {/* Quantity */}
        <div className="space-y-1.5">
          <label
            htmlFor="p-stock"
            className="text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Quantity
          </label>

          <div id="p-stock-control">
            <input
              id="p-stock"
              name="stock"
              type="number"
              min="0"
              step="1"
              value={formData.stock ?? 0}
              onChange={handleChange}
              className="num flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            />
          </div>
        </div>

        {/* Low Stock Threshold */}
        <div className="space-y-1.5">
          <label
            htmlFor="p-low"
            className="text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Low stock threshold
          </label>

          <div id="p-low-control">
            <input
              id="p-low"
              name="lowStockThreshold"
              type="number"
              min="0"
              step="1"
              value={formData.lowStockThreshold ?? 10}
              onChange={handleChange}
              className="num flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
