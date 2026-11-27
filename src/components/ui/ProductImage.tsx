import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useResolvedImage } from "@/hooks/useResolvedImage";
import { LionEmblem } from "./Logo";

export function ProductImage({
  src,
  alt,
  className,
  imgClassName,
  eager = false,
  label,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  eager?: boolean;
  label?: string;
}) {
  const resolved = useResolvedImage(src);
  const [state, setState] = useState<"loading" | "ready" | "error">(
    resolved ? "loading" : "error"
  );

  useEffect(() => {
    setState(resolved ? "loading" : "error");
  }, [resolved]);

  return (
    <div className={cn("relative overflow-hidden bg-cream", className)}>
      {state !== "error" && (
        <img
          src={resolved}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setState("ready")}
          onError={() => setState("error")}
          className={cn(
            "h-full w-full object-cover transition-[opacity,transform] duration-700 ease-silk",
            state === "ready" ? "opacity-100" : "opacity-0",
            imgClassName
          )}
        />
      )}
      {state === "loading" && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-cream via-ivory to-cream" />
      )}
      {state === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-cream p-6 text-center">
          <LionEmblem className="h-12 w-12 text-gold/60" />
          <span className="font-serif text-sm text-charcoal/50">{label ?? alt}</span>
          <span className="text-[8.5px] uppercase tracking-[0.25em] text-stone/60">
            Image unavailable
          </span>
        </div>
      )}
    </div>
  );
}
