import { Link } from "react-router-dom";
import { ArrowRight, Home, Search } from "lucide-react";
import { LionEmblem } from "@/components/ui/Logo";

export function NotFound() {
  return (
    <div className="container-lux flex flex-col items-center py-20 text-center lg:py-28">
      <LionEmblem className="h-20 w-20 text-gold" />
      <p className="eyebrow mt-7">Page Not Found</p>
      <p className="mt-4 font-serif text-[70px] leading-none text-ink/15 sm:text-[100px]">404</p>
      <h1 className="-mt-6 font-serif text-3xl text-ink sm:text-4xl">
        This page has slipped away
      </h1>
      <p className="mt-4 max-w-md text-[13px] leading-relaxed text-charcoal/60">
        The link may be outdated, or the page may have moved. Let us guide you back to
        something beautiful.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link to="/" className="btn-primary">
          <Home size={14} /> Return home
        </Link>
        <Link to="/search" className="btn-outline">
          <Search size={14} /> Search jewellery
        </Link>
      </div>
      <div className="mt-12 border-t border-line pt-8">
        <p className="text-[10px] uppercase tracking-[0.18em] text-stone">Popular collections</p>
        <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2">
          {[
            { label: "Necklaces", to: "/category/necklace-sets" },
            { label: "Earrings", to: "/category/earrings" },
            { label: "Rings", to: "/category/rings" },
            { label: "Bridal", to: "/collections/bridal" },
            { label: "New Arrivals", to: "/new-arrivals" },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="group flex items-center gap-1.5 text-[11.5px] text-charcoal/65 hover:text-gold-dark"
            >
              {link.label}
              <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
