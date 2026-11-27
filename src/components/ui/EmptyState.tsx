import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LionEmblem } from "./Logo";

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-20 text-center", className)}>
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-line bg-cream">
        {icon ?? <LionEmblem className="h-8 w-8 text-gold-dark" />}
      </div>
      <h3 className="font-serif text-2xl text-ink">{title}</h3>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-charcoal/60">{description}</p>
      {action && <div className="mt-7">{action}</div>}
    </div>
  );
}
