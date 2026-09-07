export default function SocialTab({ formData, onChange }) {
  return (
    <div
      data-state="active"
      data-orientation="horizontal"
      role="tabpanel"
      tabIndex={0}
      className="ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-4"
    >
      <section className="panel p-5">
        {/* Header */}
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Social profiles</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Linked in the storefront footer
            </p>
          </div>
        </div>

        {/* Grid Container */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Instagram */}
          <div className="space-y-1.5">
            <label
              htmlFor="s-instagram"
              className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium"
            >
              Instagram
            </label>
            <div id="s-instagram-control">
              <input
                id="s-instagram"
                type="text"
                name="instagram"
                value={formData.instagram}
                onChange={onChange}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />
            </div>
          </div>

          {/* Facebook */}
          <div className="space-y-1.5">
            <label
              htmlFor="s-facebook"
              className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium"
            >
              Facebook
            </label>
            <div id="s-facebook-control">
              <input
                id="s-facebook"
                type="text"
                name="facebook"
                value={formData.facebook}
                onChange={onChange}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />
            </div>
          </div>

          {/* Tiktok */}
          <div className="space-y-1.5">
            <label
              htmlFor="s-tiktok"
              className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium"
            >
              Tiktok
            </label>
            <div id="s-tiktok-control">
              <input
                id="s-tiktok"
                type="text"
                name="tiktok"
                value={formData.tiktok}
                onChange={onChange}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />
            </div>
          </div>

          {/* Youtube */}
          <div className="space-y-1.5">
            <label
              htmlFor="s-youtube"
              className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium"
            >
              Youtube
            </label>
            <div id="s-youtube-control">
              <input
                id="s-youtube"
                type="text"
                name="youtube"
                value={formData.youtube}
                onChange={onChange}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
