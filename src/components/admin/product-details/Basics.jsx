export default function Basics({ formData, handleChange }) {
  return (
    <section className="panel p-5">
      {/* باقي الكود زي ما هو بدون تغيير */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Basics</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Name, description and slug
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {/* Product Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="p-name"
            className="text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Product name
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </label>
          <div id="p-name-control">
            <input
              id="p-name"
              name="name"
              type="text"
              value={formData.name || ""}
              onChange={handleChange}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            />
          </div>
        </div>

        {/* Short Description */}
        <div className="space-y-1.5">
          <label
            htmlFor="p-short"
            className="text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Short description
          </label>
          <div id="p-short-control">
            <input
              id="p-short"
              name="shortDescription"
              type="text"
              value={formData.shortDescription || ""}
              onChange={handleChange}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label
            htmlFor="p-desc"
            className="text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Description
          </label>
          <div id="p-desc-control">
            <textarea
              id="p-desc"
              name="description"
              rows={6}
              value={formData.description || ""}
              onChange={handleChange}
              className="flex min-h-15 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            />
          </div>
        </div>

        {/* URL Slug */}
        <div className="space-y-1.5">
          <label
            htmlFor="p-slug"
            className="text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            URL slug
          </label>
          <div id="p-slug-control">
            <input
              id="p-slug"
              name="slug"
              type="text"
              value={formData.slug || ""}
              onChange={handleChange}
              className="num flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Used in the storefront address
          </p>
        </div>
      </div>
    </section>
  );
}
