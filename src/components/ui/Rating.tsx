import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Rating({
  value,
  count,
  size = 13,
  className,
  showValue = false,
}: {
  value: number;
  count?: number;
  size?: number;
  className?: string;
  showValue?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5" aria-label={`Rated ${value} out of 5`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            strokeWidth={1.4}
            className={cn(
              star <= Math.round(value)
                ? "fill-gold text-gold"
                : "fill-transparent text-line"
            )}
          />
        ))}
      </div>
      {showValue && <span className="text-[11px] text-charcoal/70">{value.toFixed(1)}</span>}
      {typeof count === "number" && (
        <span className="text-[11px] text-stone">({count})</span>
      )}
    </div>
  );
}
