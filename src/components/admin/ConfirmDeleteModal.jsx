import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "./Button";

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description = "This item will be permanently deleted. This action cannot be undone.",
}) {
  const [shouldRender, setShouldRender] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      document.body.style.overflow = "hidden";

      const timer = setTimeout(() => {
        setAnimate(true);
      }, 10);

      return () => clearTimeout(timer);
    }

    setAnimate(false);

    const timer = setTimeout(() => {
      setShouldRender(false);
      document.body.style.overflow = "unset";
    }, 200);

    return () => clearTimeout(timer);
  }, [isOpen]);

  // Reset loading state whenever modal opens/closes.
  useEffect(() => {
    if (!isOpen) {
      setIsDeleting(false);
    }
  }, [isOpen]);

  // ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isDeleting) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isDeleting, onClose]);

  if (!shouldRender) return null;

  const handleConfirm = async () => {
    if (!onConfirm || isDeleting) return;

    try {
      setIsDeleting(true);

      await onConfirm();

      onClose();
    } catch (error) {
      console.error("Delete failed:", error);

      // Keep modal open so the user can retry.
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
      onClick={() => {
        if (!isDeleting) {
          onClose();
        }
      }}
      className={`fixed inset-0 z-9999 flex h-screen w-screen items-center justify-center bg-black/60 p-4 backdrop-blur-xs transition-opacity duration-200 ease-out ${
        animate ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className={`relative w-full max-w-md rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-2xl transition-all duration-200 ease-out ${
          animate
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-2 scale-95 opacity-0"
        }`}
      >
        <div className="space-y-2">
          <h2
            id="confirm-delete-title"
            className="text-lg font-semibold text-foreground"
          >
            {title || "Delete Item?"}
          </h2>

          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="size-4 animate-spin" />}

            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
