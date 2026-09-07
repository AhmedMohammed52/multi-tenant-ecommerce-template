import { Trash2, Upload } from "lucide-react";
import { useRef } from "react";

export default function ProfileTab({
  profile,
  onChange,
  initials,
  onAvatarChange,
  onAvatarRemove,
}) {
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onAvatarChange(file);
    }
  };

  const handleRemove = () => {
    onAvatarRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  return (
    <div className="mt-4 grid gap-4 xl:grid-cols-3">
      {/* Profile Form */}
      <section className="panel p-5 border rounded-lg bg-card text-card-foreground shadow-sm xl:col-span-2">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Your profile</h2>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label
              className="text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="u-name"
            >
              Full name
            </label>

            <input
              id="u-name"
              type="text"
              value={profile.name}
              onChange={(e) => onChange("name", e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-1.5">
            <label
              className="text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="u-email"
            >
              Email
            </label>

            <input
              id="u-email"
              type="email"
              value={profile.email}
              onChange={(e) => onChange("email", e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Role
            </label>

            <input
              disabled
              value={profile.role}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            />

            <p className="text-xs text-muted-foreground">
              Managed by the store owner
            </p>
          </div>

          <div className="space-y-1.5">
            <label
              className="text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="u-phone"
            >
              Phone
            </label>

            <input
              id="u-phone"
              type="text"
              value={profile.phone}
              onChange={(e) => onChange("phone", e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>
      </section>

      {/* Avatar Section */}
      <section className="panel p-5 border rounded-lg bg-card text-card-foreground shadow-sm">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Avatar</h2>

            <p className="mt-0.5 text-xs text-muted-foreground">
              Shown in the topbar and activity logs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.name || "Avatar"}
              className="size-16 rounded-full object-cover border"
            />
          ) : (
            <span className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-semibold uppercase">
              {initials}
            </span>
          )}

          <div className="space-y-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center justify-center gap-2 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <Upload className="size-3.5" />
                {profile.avatarUrl ? "Change avatar" : "Upload avatar"}
              </button>

              {profile.avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="inline-flex items-center justify-center p-2 text-destructive border border-input bg-background shadow-sm hover:bg-destructive/10 h-8 rounded-md text-xs font-medium cursor-pointer transition-colors"
                  title="Remove avatar"
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              PNG, JPG or WEBP up to 2 MB.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
