import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, ArrowRight, Truck } from "lucide-react";
import type { Product } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { ProductImage } from "@/components/ui/ProductImage";
import { Rating } from "@/components/ui/Rating";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { useStore } from "@/context/StoreContext";
import { useToast } from "@/context/ToastContext";
import { cn, discountPercent, formatINR } from "@/lib/utils";

export function QuickView({
  product,
  open,
  onClose,
}: {
  product: Product;
  open: boolean;
  onClose: () => void;
}) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const { notify } = useToast();
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState(product.sizes?.[0]);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (open) {
      setActiveImage(0);
      setSize(product.sizes?.[0]);
      setQuantity(1);
    }
  }, [open, product]);

  const discount = discountPercent(product.price, product.mrp);
  const wished = isWishlisted(product.id);

  const add = () => {
    addToCart(product.id, quantity, size);
    notify(`${product.name} added to your bag.`);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} panelClassName="sm:max-w-3xl">
      <div className="grid sm:grid-cols-2">
        <div className="bg-cream p-4 sm:p-5">
          <ProductImage
            src={product.images[activeImage]}
            alt={product.name}
            label={product.name}
            className="aspect-[4/5] w-full"
            eager
          />
          <div className="mt-3 grid grid-cols-3 gap-2">
            {product.images.map((image, index) => (
              <button
                key={image}
                onClick={() => setActiveImage(index)}
                aria-label={`View image ${index + 1} of ${product.name}`}
                aria-pressed={activeImage === index}
                className={cn(
                  "border transition-colors",
                  activeImage === index ? "border-ink" : "border-transparent hover:border-line"
                )}
              >
                <ProductImage
                  src={image}
                  alt=""
                  label={product.name}
                  className="aspect-square w-full"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col p-5 sm:p-7">
          <p className="eyebrow">{product.material}</p>
          <h2 className="mt-2 font-serif text-2xl leading-tight text-ink sm:text-3xl">
            {product.name}
          </h2>
          <div className="mt-2">
            <Rating value={product.rating} count={product.reviewCount} showValue />
          </div>
          <div className="mt-4 flex flex-wrap items-baseline gap-2">
            <span className="text-xl text-ink">{formatINR(product.price)}</span>
            {product.mrp && product.mrp > product.price && (
              <>
                <span className="text-sm text-stone line-through">{formatINR(product.mrp)}</span>
                <span className="text-xs font-medium text-gold-dark">{discount}% off</span>
              </>
            )}
          </div>
          <p className="mt-4 line-clamp-3 text-[13px] leading-relaxed text-charcoal/65">
            {product.description}
          </p>

          {product.sizes && (
            <div className="mt-5">
              <p className="field-label">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((option) => (
                  <button
                    key={option}
                    onClick={() => setSize(option)}
                    className={cn(
                      "min-w-11 border px-3 py-2 text-xs transition-colors",
                      size === option
                        ? "border-ink bg-ink text-ivory"
                        : "border-line bg-white text-charcoal hover:border-gold"
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 flex items-end gap-4">
            <div>
              <p className="field-label">Quantity</p>
              <QuantityStepper
                value={quantity}
                onChange={setQuantity}
                max={Math.min(product.stock, 10)}
              />
            </div>
            <p className={cn("pb-3 text-[11px]", product.stock > 0 ? "text-charcoal/60" : "text-red-500")}>
              {product.stock > 0 ? `In stock · ${product.stock} available` : "Currently sold out"}
            </p>
          </div>

          <div className="mt-5 flex gap-2">
            <button onClick={add} disabled={product.stock <= 0} className="btn-primary flex-1">
              <ShoppingBag size={15} /> Add to bag
            </button>
            <button
              onClick={() => {
                const added = toggleWishlist(product.id);
                notify(added ? "Saved to wishlist." : "Removed from wishlist.", added ? "success" : "info");
              }}
              aria-label="Toggle wishlist"
              aria-pressed={wished}
              className={cn(
                "flex h-[46px] w-[46px] items-center justify-center border transition-colors",
                wished ? "border-gold bg-gold/10 text-gold-dark" : "border-line text-charcoal hover:border-ink"
              )}
            >
              <Heart size={17} fill={wished ? "currentColor" : "none"} />
            </button>
          </div>

          <p className="mt-4 flex items-center gap-2 text-[11px] text-stone">
            <Truck size={13} /> Free shipping over ₹4,999 · Easy returns within 7 days
          </p>

          <Link
            to={`/product/${product.slug}`}
            onClick={onClose}
            className="mt-4 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-gold-dark hover:text-ink"
          >
            View full details <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </Modal>
  );
}
