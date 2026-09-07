export default function ContactTab({ formData, onChange }) {
  return (
    <div
      data-state="active"
      data-orientation="horizontal"
      role="tabpanel"
      tabIndex={0}
      className="mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <section className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-xs">
        {/* Header Section */}
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Contact details
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Shown on the storefront and invoices
            </p>
          </div>
        </div>

        {/* Grid Container */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Support Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="s-email"
              className="text-sm font-medium text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Support email
            </label>
            <div id="s-email-control">
              <input
                id="s-email"
                type="email"
                name="supportEmail"
                value={formData.supportEmail}
                onChange={onChange}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base text-foreground shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label
              htmlFor="s-phone"
              className="text-sm font-medium text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Phone
            </label>
            <div id="s-phone-control">
              <input
                id="s-phone"
                type="text"
                name="phone"
                value={formData.phone}
                onChange={onChange}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base text-foreground shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm num"
              />
            </div>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label
              htmlFor="s-addr"
              className="text-sm font-medium text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Address
            </label>
            <div id="s-addr-control">
              <textarea
                id="s-addr"
                rows={3}
                name="address"
                value={formData.address}
                onChange={onChange}
                className="flex min-h-15 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
