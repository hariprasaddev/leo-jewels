import type { RefObject } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Video } from "lucide-react";
import { ProductImage } from "@/components/ui/ProductImage";
import { SHOP_CATEGORIES, SHOP_MENU_LINKS } from "@/data/siteImages";

/**
 * Desktop "Shop" mega-menu.
 *
 * Category links, imagery and routes all come from the centralized
 * `SHOP_CATEGORIES` map, so a tile can never render a missing image or navigate
 * to the wrong collection. The whole card, its image and its title are one
 * React Router <Link> — there are no overlays or pseudo-elements swallowing the
 * click.
 */
export function ShopMegaMenu({
  open,
  onClose,
  panelRef,
}: {
  open: boolean;
  onClose: () => void;
  panelRef: RefObject<HTMLDivElement>;
}) {
  if (!open) return null;

  return (
    <div
      ref={panelRef}
      id="shop-mega-menu"
      role="region"
      aria-label="Shop by category"
      className="pointer-events-none absolute inset-x-0 top-full z-[55] px-4 pt-2 sm:px-6"
    >
      <div className="pointer-events-auto mx-auto w-full max-w-[1120px] animate-fade-in border border-champagne/35 bg-ivory shadow-[0_30px_70px_-30px_rgba(0,0,0,0.55)]">
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5 sm:px-6">
          <p className="text-[9px] uppercase tracking-[0.24em] text-stone">
            Shop by category
          </p>
          <Link
            to="/shop"
            onClick={onClose}
            className="group inline-flex items-center gap-1.5 text-[9.5px] uppercase tracking-[0.18em] text-gold-dark transition-colors duration-300 hover:text-espresso"
          >
            All jewellery
            <ArrowRight
              size={12}
              strokeWidth={1.6}
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-x-5 gap-y-5 px-5 pb-5 pt-4 sm:px-6">
          {SHOP_CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              to={category.to}
              onClick={onClose}
              aria-label={`Shop ${category.name}`}
              className="group/card block outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-4 focus-visible:ring-offset-ivory"
            >
              <span className="relative block overflow-hidden bg-cream">
                <ProductImage
                  src={category.image}
                  alt={`${category.name} jewellery from LEO JEWELS`}
                  label={category.name}
                  eager
                  className="aspect-[16/10] w-full"
                  imgClassName="object-center transition-transform duration-700 ease-silk group-hover/card:scale-[1.06]"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-espresso/0 transition-colors duration-500 group-hover/card:bg-espresso/10"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-champagne transition-transform duration-500 ease-silk group-hover/card:scale-x-100"
                />
              </span>
              <span className="mt-2 flex items-center justify-between gap-2">
                <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-espresso transition-colors duration-300 group-hover/card:text-gold-dark">
                  {category.name}
                </span>
                <ArrowUpRight
                  size={12}
                  strokeWidth={1.6}
                  aria-hidden="true"
                  className="shrink-0 text-stone/60 transition-all duration-300 group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5 group-hover/card:text-gold-dark"
                />
              </span>
            </Link>
          ))}
        </div>

        <div className="grid gap-6 border-t border-line bg-cream/60 px-5 py-5 sm:px-6 lg:grid-cols-[1.5fr_1fr] lg:gap-8">
          <div>
            <p className="text-[9px] uppercase tracking-[0.24em] text-stone">
              Explore the edit
            </p>
            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2">
              {SHOP_MENU_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className="group inline-flex items-center gap-1.5 py-0.5 text-[11.5px] text-charcoal/70 transition-colors duration-300 hover:text-gold-dark"
                >
                  <span className="h-px w-0 bg-champagne transition-all duration-300 group-hover:w-3" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="relative border border-brown-sep/60 bg-espresso px-5 py-4 text-warm-ivory">
            <p className="flex items-center gap-2 text-[8.5px] uppercase tracking-[0.22em] text-champagne">
              <Video size={12} strokeWidth={1.6} aria-hidden="true" />
              Not sure what to choose?
            </p>
            <p className="mt-2 max-w-[26ch] font-serif text-[15px] leading-snug text-warm-ivory/90">
              Book a personal video consultation with a jewellery specialist.
            </p>
            <Link
              to="/book-consultation"
              onClick={onClose}
              className="group mt-3 inline-flex items-center gap-2 text-[9.5px] uppercase tracking-[0.18em] text-champagne transition-colors duration-300 hover:text-warm-ivory"
            >
              Book now
              <ArrowRight
                size={12}
                strokeWidth={1.6}
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
