import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onClose,
  children,
  title,
  className,
  panelClassName,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  className?: string;
  panelClassName?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className={cn("fixed inset-0 z-[90] flex items-end justify-center sm:items-center", className)}
      role="dialog"
      aria-modal="true"
      aria-label={title ?? "Dialog"}
    >
      <button
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-ink/55 backdrop-blur-[2px] animate-fade-in"
        tabIndex={-1}
      />
      <div
        className={cn(
          "relative z-10 max-h-[92vh] w-full animate-fade-up overflow-y-auto bg-ivory shadow-soft sm:max-h-[88vh] sm:max-w-4xl",
          panelClassName
        )}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <h2 className="font-serif text-xl text-ink">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="flex h-9 w-9 items-center justify-center border border-line text-charcoal transition-colors hover:border-ink hover:bg-ink hover:text-ivory"
            >
              <X size={16} />
            </button>
          </div>
        )}
        {!title && (
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center bg-ivory/90 text-charcoal transition-colors hover:bg-ink hover:text-ivory"
          >
            <X size={16} />
          </button>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
}
