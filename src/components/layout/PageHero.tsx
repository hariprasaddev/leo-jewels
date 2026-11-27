import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";
import { ProductImage } from "@/components/ui/ProductImage";

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  crumbs,
  align = "center",
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  image?: string;
  crumbs: Crumb[];
  align?: "center" | "left";
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-cream">
      {image && (
        <div className="absolute inset-0">
          <ProductImage src={image} alt="" label={title} eager className="h-full w-full" imgClassName="opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-ivory/70 via-cream/60 to-cream" />
        </div>
      )}
      <div className="container-lux relative py-12 lg:py-16">
        <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
          <div className={align === "center" ? "flex justify-center" : ""}>
            <Breadcrumbs items={crumbs} />
          </div>
          <p className="eyebrow mt-5">{eyebrow}</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-ink sm:text-5xl">{title}</h1>
          {description && (
            <p className="mt-4 text-[13.5px] leading-relaxed text-charcoal/60">{description}</p>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}
