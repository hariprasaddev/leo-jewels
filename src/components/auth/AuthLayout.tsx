import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ProductImage } from "@/components/ui/ProductImage";

export function AuthLayout({
  eyebrow,
  title,
  subtitle,
  image,
  imageAlt,
  children,
  footer,
  quote = "Jewellery should feel personal — a small, beautiful thing that becomes part of your story.",
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  children: ReactNode;
  footer?: ReactNode;
  quote?: string;
}) {
  return (
    <div className="grid min-h-[calc(100vh-118px)] lg:grid-cols-[1fr_1.05fr]">
      <div className="relative hidden overflow-hidden bg-ink lg:block">
        <div className="absolute inset-0">
          <ProductImage
            src={image}
            alt={imageAlt}
            label="LEO JEWELS"
            eager
            className="h-full w-full"
            imgClassName="opacity-80"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-ink/10" />
        <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
          <Logo variant="dark" size="md" to="/" />
          <div className="max-w-sm">
            <p className="font-serif text-3xl leading-snug text-ivory xl:text-4xl">
              “{quote}”
            </p>
            <p className="mt-5 text-[9.5px] uppercase tracking-[0.25em] text-gold">
              The LEO JEWELS philosophy
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col bg-ivory">
        <div className="flex items-center justify-between border-b border-line px-5 py-4 lg:hidden">
          <Logo size="sm" withTagline={false} />
          <Link to="/" className="flex items-center gap-1.5 text-[9.5px] uppercase tracking-[0.16em] text-stone">
            <ArrowLeft size={12} /> Store
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-5 py-12 sm:px-10">
          <div className="w-full max-w-md">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="mt-3 font-serif text-4xl leading-tight text-ink">{title}</h1>
            <p className="mt-3 text-[13px] leading-relaxed text-charcoal/60">{subtitle}</p>
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-8">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
