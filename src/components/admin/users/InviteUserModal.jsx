import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check, X, Loader2 } from "lucide-react";

const roles = ["Owner", "Admin", "Manager", "Editor", "Support"];

const initialFormData = {
  fullName: "",
  email: "",
  role: "Manager",
};

export default function InviteUserModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}) {
  const [formData, setFormData] = useState(initialFormData);
  const [isRoleOpen, setIsRoleOpen] = useState(false);

  // حالات التحكم في الأنيميشن والـ Render
  const [shouldRender, setShouldRender] = useState(false);
  const [animate, setAnimate] = useState(false);

  // مراجع وإحداثيات القائمة المنبثقة (Portal Dropdown)
  const roleBtnRef = useRef(null);
  const dropdownRef = useRef(null);
  const [coords, setCoords] = useState({
    top: 0,
    left: 0,
    width: 0,
    openUpward: false,
  });

  const updateCoords = () => {
    if (!roleBtnRef.current) return;
    const rect = roleBtnRef.current.getBoundingClientRect();
    const dropdownHeight = 200;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUpward =
      spaceBelow < dropdownHeight && spaceAbove > dropdownHeight;

    setCoords({
      top: openUpward ? rect.top - 4 : rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      openUpward,
    });
  };

  const handleToggleRoleDropdown = (e) => {
    e.stopPropagation();
    if (!isRoleOpen) {
      updateCoords();
      setIsRoleOpen(true);
    } else {
      setIsRoleOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormData);
      setIsRoleOpen(false);
      setShouldRender(true);
      const timer = setTimeout(() => setAnimate(true), 10);
      return () => clearTimeout(timer);
    }

    setAnimate(false);
    setIsRoleOpen(false);
    const timer = setTimeout(() => setShouldRender(false), 200);
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isSubmitting) onClose?.();
    };

    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        roleBtnRef.current &&
        !roleBtnRef.current.contains(event.target)
      ) {
        setIsRoleOpen(false);
      }
    };

    const handleReposition = () => {
      if (isRoleOpen) updateCoords();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [isOpen, isSubmitting, onClose, isRoleOpen]);

  if (!shouldRender) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleRoleChange = (role) => {
    setFormData((previous) => ({
      ...previous,
      role,
    }));
    setIsRoleOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const fullName = formData.fullName.trim();
    const email = formData.email.trim().toLowerCase();

    if (!fullName || !email) return;

    await onSubmit({
      fullName,
      email,
      role: formData.role,
    });
  };

  return (
    <>
      {createPortal(
        <div
          onClick={() => {
            if (!isSubmitting) onClose();
          }}
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ease-out ${
            animate ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card text-card-foreground shadow-2xl p-6 transition-all duration-200 ease-out ${
              animate
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 translate-y-2"
            }`}
          >
            <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Invite user
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  They receive an email to set their own password.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                aria-label="Close"
                className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer disabled:opacity-50"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="fullName"
                    className="text-xs font-medium text-foreground"
                  >
                    Full name
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    autoComplete="name"
                    disabled={isSubmitting}
                    required
                    className="w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-60"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="text-xs font-medium text-foreground"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    autoComplete="email"
                    disabled={isSubmitting}
                    required
                    className="w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-60"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Role
                  </label>
                  <button
                    ref={roleBtnRef}
                    type="button"
                    onClick={handleToggleRoleDropdown}
                    disabled={isSubmitting}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-60"
                  >
                    <span>{formData.role}</span>
                    <ChevronDown
                      className={`size-4 opacity-50 transition-transform ${
                        isRoleOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="rounded-md border border-input px-4 py-2 text-xs font-medium hover:bg-accent transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !formData.fullName.trim() ||
                    !formData.email.trim()
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-xs font-medium hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting && (
                    <Loader2 className="size-3.5 animate-spin" />
                  )}
                  {isSubmitting ? "Sending..." : "Send invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body,
      )}

      {/* قائمة الأدوار المنبثقة عبر الـ Portal لتفادي حدوث Scrollbar */}
      {isRoleOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            onClick={(e) => e.stopPropagation()}
            className="fixed z-50 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80 max-h-60 overflow-y-auto"
            style={{
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              transform: coords.openUpward ? "translateY(-100%)" : "none",
            }}
          >
            {roles.map((role) => {
              const selected = formData.role === role;
              return (
                <div
                  key={role}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRoleChange(role);
                  }}
                  className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-3 pr-8 text-sm hover:bg-accent hover:text-accent-foreground ${
                    selected ? "bg-accent/50 font-semibold" : ""
                  }`}
                >
                  <span>{role}</span>
                  {selected && (
                    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                      <Check className="size-4 text-primary" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>,
          document.body,
        )}
    </>
  );
}
