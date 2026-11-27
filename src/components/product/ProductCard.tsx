import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Eye, ShoppingBag } from "lucide-react";
import type { Product } from "@/types";
import { ProductImage } from "@/components/ui/ProductImage";
import { Rating } from "@/components/ui/Rating";
import { QuickView } from "./QuickView";
import { useStore } from "@/context/StoreContext";
import { useToast } from "@/context/ToastContext";
import { cn, discountPercent, formatINR } from "@/lib/utils";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { toggleWishlist, isWishlisted, addToCart } = useStore();
  const { notify } = useToast();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const wished = isWishlisted(product.id);
  const discount = discountPercent(product.price, product.mrp);
  const soldOut = product.stock <= 0;

  const handleWishlist = () => {
    const added = toggleWishlist(product.id);
    notify(
      added ? `${product.name} saved to your wishlist.` : `${product.name} removed from wishlist.`,
      added ? "success" : "info"
    );
  };

  const handleAdd = () => {
    addToCart(product.id, 1, product.sizes?.[0]);
    notify(`${product.name} added to your bag.`);
  };

  return (
    <>
      <article className="group flex flex-col">
        <div
          className="relative overflow-hidden bg-cream"
          onMouseEnter={() => product.images[1] && setImageIndex(1)}
          onMouseLeave={() => setImageIndex(0)}
        >
          <Link
            to={`/product/${product.slug}`}
            aria-label={`View ${product.name}`}
            className="block"
          >
            <ProductImage
              src={product.images[imageIndex] ?? product.images[0]}
              alt={product.name}
              label={product.name}
              eager={priority}
              className="aspect-[4/5] w-full"
              imgClassName="transition-transform duration-[900ms] ease-silk group-hover:scale-[1.04]"
            />
          </Link>

          <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {soldOut ? (
              <span className="bg-ink px-2.5 py-1 text-[8.5px] uppercase tracking-[0.18em] text-ivory">
                Sold out
              </span>
            ) : (
              <>
                {product.isNew && (
                  <span className="bg-ivory px-2.5 py-1 text-[8.5px] uppercase tracking-[0.18em] text-ink">
                    New
                  </span>
                )}
                {product.isBestSeller && (
                  <span className="bg-ink px-2.5 py-1 text-[8.5px] uppercase tracking-[0.18em] text-ivory">
                    Best seller
                  </span>
                )}
                {discount && (
                  <span className="bg-gold px-2.5 py-1 text-[8.5px] uppercase tracking-[0.18em] text-ink">
                    {discount}% off
                  </span>
                )}
              </>
            )}
          </div>

          <button
            onClick={handleWishlist}
            aria-label={wished ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
            aria-pressed={wished}
            className={cn(
              "absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-ivory/90 backdrop-blur-sm transition-all duration-300 hover:bg-ivory",
              wished ? "text-gold-dark" : "text-charcoal/70 hover:text-ink"
            )}
          >
            <Heart size={15} strokeWidth={1.5} fill={wished ? "currentColor" : "none"} />
          </button>

          <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all duration-400 ease-silk group-hover:translate-y-0 group-hover:opacity-100 max-md:translate-y-0 max-md:opacity-100">
            <button
              onClick={() => setQuickViewOpen(true)}
              className="flex w-full items-center justify-center gap-2 bg-ivory/95 px-4 py-2.5 text-[9.5px] uppercase tracking-[0.2em] text-ink backdrop-blur-sm transition-colors hover:bg-white"
            >
              <Eye size={13} strokeWidth={1.5} /> Quick view
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col pt-4">
          <p className="text-[9px] uppercase tracking-[0.2em] text-stone">
            {product.material}
          </p>
          <h3 className="mt-1.5 font-serif text-[17px] leading-snug text-ink">
            <Link to={`/product/${product.slug}`} className="transition-colors hover:text-gold-dark">
              {product.name}
            </Link>
          </h3>
          <div className="mt-1.5">
            <Rating value={product.rating} count={product.reviewCount} size={11} />
          </div>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-[13.5px] font-medium text-ink">{formatINR(product.price)}</span>
            {product.mrp && product.mrp > product.price && (
              <>
                <span className="text-[11.5px] text-stone line-through">{formatINR(product.mrp)}</span>
                <span className="text-[10.5px] font-medium text-gold-dark">
                  {discount}% off
                </span>
              </>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <button
              onClick={handleAdd}
              disabled={soldOut}
              className="flex flex-1 items-center justify-center gap-2 border border-ink/20 px-3 py-2.5 text-[9.5px] uppercase tracking-[0.16em] text-ink transition-all duration-300 hover:border-ink hover:bg-ink hover:text-ivory disabled:cursor-not-allowed disabled:border-line disabled:text-stone"
            >
              <ShoppingBag size={13} strokeWidth={1.5} />
              {soldOut ? "Sold out" : "Add to bag"}
            </button>
            {!soldOut && product.stock <= 5 && (
              <span className="shrink-0 text-[9.5px] uppercase tracking-[0.12em] text-gold-deep">
                {product.stock} left
              </span>
            )}
          </div>
        </div>
      </article>

      <QuickView
        product={product}
        open={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
      />
    </>
  );
}
