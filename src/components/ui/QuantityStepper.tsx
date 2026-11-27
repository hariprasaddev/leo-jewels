import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuantityStepper({
  value,
  onChange,
  max = 10,
  min = 1,
  className,
  size = "md",
}: {
  value: number;
  onChange: (next: number) => void;
  max?: number;
  min?: number;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center border border-line bg-white",
        size === "sm" ? "h-9" : "h-11",
        className
      )}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className={cn(
          "flex items-center justify-center text-charcoal transition-colors hover:text-gold-dark disabled:opacity-30",
          size === "sm" ? "h-full w-8" : "h-full w-10"
        )}
      >
        <Minus size={13} />
      </button>
      <span
        aria-live="polite"
        className={cn(
          "text-center text-xs tabular-nums text-ink",
          size === "sm" ? "w-8" : "w-10"
        )}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
        className={cn(
          "flex items-center justify-center text-charcoal transition-colors hover:text-gold-dark disabled:opacity-30",
          size === "sm" ? "h-full w-8" : "h-full w-10"
        )}
      >
        <Plus size={13} />
      </button>
    </div>
  );
}
