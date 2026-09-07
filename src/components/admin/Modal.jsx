import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  maxWidth = "max-w-md",
  children,
}) {
  const [shouldRender, setShouldRender] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);

      const timer = setTimeout(() => {
        setAnimate(true);
      }, 10);

      return () => clearTimeout(timer);
    }

    setAnimate(false);

    const timer = setTimeout(() => {
      setShouldRender(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!shouldRender) return null;

  return createPortal(
    <div
      onClick={onClose}
      className={`
        fixed inset-0 z-50
        flex items-center justify-center
        p-3 sm:p-4
        bg-black/50
        backdrop-blur-sm
        transition-opacity duration-200 ease-out
        ${animate ? "opacity-100" : "opacity-0"}
      `}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
          relative
          w-full
          ${maxWidth}
          max-h-[calc(100dvh-1.5rem)]
          sm:max-h-[90vh]
          overflow-y-auto
          overflow-x-hidden
          rounded-xl
          border border-border
          bg-card
          text-card-foreground
          shadow-2xl
          p-4 sm:p-6
          transition-all duration-200 ease-out

          ${
            animate
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 translate-y-2"
          }
        `}
      >
        {(title || description) && (
          <div className="flex items-start justify-between border-b border-border pb-3 mb-4 sm:pb-4 sm:mb-5">
            <div className="min-w-0 pr-3">
              {title && (
                <h2 className="text-base sm:text-lg font-semibold text-foreground truncate">
                  {title}
                </h2>
              )}

              {description && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {description}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="
                shrink-0
                rounded-md
                p-1.5
                text-muted-foreground
                hover:bg-accent
                hover:text-accent-foreground
                transition-colors
                cursor-pointer
              "
            >
              <X className="size-5" />
            </button>
          </div>
        )}

        {children}
      </div>
    </div>,
    document.body,
  );
}
