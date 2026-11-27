import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function DemoNote({
  children,
  className,
  tone = "light",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 border px-3.5 py-3 text-[11px] leading-relaxed",
        tone === "light"
          ? "border-gold/35 bg-gold/[0.07] text-charcoal/70"
          : "border-gold/25 bg-white/[0.04] text-ivory/60",
        className
      )}
      role="note"
    >
      <Info size={14} className="mt-0.5 shrink-0 text-gold-dark" />
      <div>{children}</div>
    </div>
  );
}
