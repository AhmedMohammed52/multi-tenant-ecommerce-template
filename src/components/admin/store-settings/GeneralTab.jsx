import {
  Upload,
  Trash2,
  Star,
  Globe,
  ImageIcon,
  Loader2,
  RefreshCw,
} from "lucide-react";

export default function GeneralTab({
  formData,
  onChange,

  onUploadLogo,
  onRemoveLogo,

  onUploadFavicon,
  onRemoveFavicon,

  isUploadingLogo,
  isUploadingFavicon,
}) {
  return (
    <div className="mt-4 grid gap-4 xl:grid-cols-3">
      {/* Store Identity */}
      <section className="panel p-5 xl:col-span-2">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Store identity</h2>

            <p className="mt-0.5 text-xs text-muted-foreground">
              Basic information displayed across your storefront.
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          {/* Store Name */}
          <div className="space-y-1.5">
            <label htmlFor="store-name" className="text-sm font-medium">
              Store name
              <span className="text-destructive">*</span>
            </label>

            <input
              id="store-name"
              type="text"
              name="storeName"
              value={formData.storeName}
              onChange={onChange}
              required
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            />
          </div>

          {/* Tagline */}
          <div className="space-y-1.5">
            <label htmlFor="store-tagline" className="text-sm font-medium">
              Tagline
            </label>

            <input
              id="store-tagline"
              type="text"
              name="tagline"
              value={formData.tagline}
              onChange={onChange}
              maxLength={160}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="store-description" className="text-sm font-medium">
              Description
            </label>

            <textarea
              id="store-description"
              rows={5}
              name="description"
              value={formData.description}
              onChange={onChange}
              maxLength={1000}
              className="flex min-h-15 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
            />

            <p className="text-xs text-muted-foreground">
              Used for SEO and social sharing.
            </p>
          </div>
        </div>
      </section>

      {/* Brand Assets */}
      <section className="panel flex flex-col justify-between p-5">
        <div>
          <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-sm font-semibold">Logo &amp; favicon</h2>

              <p className="mt-0.5 text-xs text-muted-foreground">
                Manage your storefront brand assets.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Logo */}
            <AssetCard
              title="Logo"
              icon={<ImageIcon className="size-3" />}
              image={formData.logoUrl}
              alt="Store logo"
              badge="Main"
              isLoading={isUploadingLogo}
              onUpload={onUploadLogo}
              onRemove={onRemoveLogo}
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
            />

            {/* Favicon */}
            <AssetCard
              title="Favicon"
              icon={<Globe className="size-3" />}
              image={formData.faviconUrl}
              alt="Store favicon"
              isLoading={isUploadingFavicon}
              onUpload={onUploadFavicon}
              onRemove={onRemoveFavicon}
              accept="image/png,image/webp,image/svg+xml"
              imageClassName="size-10 object-contain"
            />
          </div>
        </div>

        <div className="mt-4 border-t border-border pt-3">
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Logo: PNG, JPG/JPEG, WebP or SVG — maximum 2MB.
            <br />
            Favicon: PNG, WebP or SVG — maximum 512KB.
            <br />
            Maximum dimensions: 2048×2048px.
            <br />
            Favicon must be square and at least 64×64px.
          </p>
        </div>
      </section>
    </div>
  );
}

function AssetCard({
  title,
  icon,
  image,
  alt,
  badge,
  isLoading,
  onUpload,
  onRemove,
  accept,
  imageClassName = "h-full w-full object-contain p-2",
}) {
  return (
    <div className="flex min-w-0 flex-col rounded-lg border border-dashed border-border bg-muted/20 p-2.5">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1 text-xs font-medium">
          {icon}
          <span className="truncate">{title}</span>
        </span>

        <label
          className={`shrink-0 rounded p-1 text-muted-foreground transition-colors ${
            isLoading
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer hover:bg-accent hover:text-foreground"
          }`}
          title={
            isLoading
              ? `Uploading ${title}`
              : image
                ? `Replace ${title}`
                : `Upload ${title}`
          }
        >
          {isLoading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : image ? (
            <RefreshCw className="size-3.5" />
          ) : (
            <Upload className="size-3.5" />
          )}

          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={onUpload}
            disabled={isLoading}
          />
        </label>
      </div>

      {/* Preview */}
      <div className="group relative aspect-square w-full overflow-hidden rounded-md border border-border bg-background">
        {image ? (
          <>
            <img src={image} alt={alt} className={imageClassName} />

            {badge && (
              <span className="absolute left-1 top-1 flex items-center gap-0.5 rounded bg-primary px-1 py-0.5 text-[9px] font-medium text-primary-foreground">
                <Star className="size-2" />
                {badge}
              </span>
            )}

            {!isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                <button
                  type="button"
                  onClick={onRemove}
                  aria-label={`Remove ${title}`}
                  title={`Remove ${title}`}
                  className="rounded bg-destructive p-1.5 text-white transition-colors hover:bg-destructive/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            )}

            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                <Loader2 className="size-5 animate-spin text-foreground" />
              </div>
            )}
          </>
        ) : (
          <label
            className={`flex h-full flex-col items-center justify-center gap-1.5 text-muted-foreground transition-colors ${
              isLoading
                ? "cursor-not-allowed"
                : "cursor-pointer hover:text-foreground"
            }`}
          >
            {isLoading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Upload className="size-5" />
            )}

            <span className="text-[10px] font-medium">
              {isLoading ? "Uploading..." : "Upload"}
            </span>

            <input
              type="file"
              accept={accept}
              className="hidden"
              onChange={onUpload}
              disabled={isLoading}
            />
          </label>
        )}
      </div>
    </div>
  );
}
