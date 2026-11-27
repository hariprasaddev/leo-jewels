import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Trash2,
  Bookmark,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Tag,
  X,
  ArrowLeft,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { useToast } from "@/context/ToastContext";
import { ProductImage } from "@/components/ui/ProductImage";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { EmptyState } from "@/components/ui/EmptyState";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { useCatalogue } from "@/context/CatalogueContext";
import { formatINR } from "@/lib/utils";

export function Cart() {
  const {
    cartLines,
    totals,
    updateQuantity,
    removeFromCart,
    saveForLater,
    savedForLater,
    moveToCart,
    removeSaved,
    applyCoupon,
    removeCoupon,
    coupon,
    freeShippingThreshold,
  } = useStore();
  const { notify } = useToast();
  const { getProductById } = useCatalogue();
  const [code, setCode] = useState("");
  const [couponError, setCouponError] = useState("");

  const savedProducts = savedForLater.flatMap((id) => {
    const product = getProductById(id);
    return product ? [product] : [];
  });

  const remainingForFreeShipping = freeShippingThreshold - totals.subtotal;

  if (cartLines.length === 0) {
    return (
      <div className="container-lux py-8">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Shopping Bag" }]} />
        <EmptyState
          title="Your bag is beautifully empty"
          description="Discover gold, silver and bridal pieces chosen for everyday elegance and unforgettable occasions."
          icon={<ShoppingBag size={24} className="text-gold-dark" />}
          action={
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/category/necklace-sets" className="btn-primary">Shop necklaces</Link>
              <Link to="/new-arrivals" className="btn-outline">View new arrivals</Link>
            </div>
          }
        />
        {savedProducts.length > 0 && (
          <div className="mx-auto max-w-4xl border-t border-line pt-10">
            <h2 className="font-serif text-2xl text-ink">Saved for later</h2>
            <div className="mt-5 space-y-3">
              {savedProducts.map((product) => (
                <SavedItem
                  key={product.id}
                  productId={product.id}
                  onMove={() => moveToCart(product.id)}
                  onRemove={() => removeSaved(product.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container-lux py-8 lg:py-12">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Shopping Bag" }]} />
      <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-6">
        <div>
          <p className="eyebrow">Your Selection</p>
          <h1 className="mt-2 font-serif text-3xl text-ink sm:text-4xl">Shopping Bag</h1>
        </div>
        <Link to="/collections/best-sellers" className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-charcoal hover:text-gold-dark">
          <ArrowLeft size={13} /> Continue shopping
        </Link>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-14">
        <div>
          {/* Free shipping progress */}
          <div className="border border-line bg-cream/60 px-4 py-3.5">
            <div className="flex items-center gap-2 text-[11.5px] text-charcoal/70">
              <Truck size={15} className="text-gold-dark" />
              {remainingForFreeShipping > 0 ? (
                <span>
                  Add <strong className="font-medium text-ink">{formatINR(remainingForFreeShipping)}</strong> more for complimentary shipping.
                </span>
              ) : (
                <span>You've unlocked <strong className="font-medium text-ink">complimentary shipping</strong>.</span>
              )}
            </div>
            <div className="mt-2.5 h-1 w-full bg-line">
              <div
                className="h-full bg-gold transition-all duration-500"
                style={{
                  width: `${Math.min(100, (totals.subtotal / freeShippingThreshold) * 100)}%`,
                }}
              />
            </div>
          </div>

          <div className="mt-2 divide-y divide-line">
            {cartLines.map(({ product, quantity, size }) => (
              <div key={`${product.id}-${size ?? "one"}`} className="flex gap-4 py-5 sm:gap-5">
                <Link to={`/product/${product.slug}`} className="shrink-0">
                  <ProductImage
                    src={product.images[0]}
                    alt={product.name}
                    label={product.name}
                    className="h-28 w-24 sm:h-32 sm:w-28"
                  />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.18em] text-stone">{product.material}</p>
                      <h2 className="mt-1 font-serif text-[17px] leading-snug text-ink">
                        <Link to={`/product/${product.slug}`} className="hover:text-gold-dark">
                          {product.name}
                        </Link>
                      </h2>
                      {size && <p className="mt-1 text-[11px] text-stone">Size: {size}</p>}
                      <p className="mt-1 text-[10.5px] text-stone">SKU {product.sku}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(product.id, size)}
                      aria-label={`Remove ${product.name} from bag`}
                      className="shrink-0 p-1 text-stone transition-colors hover:text-red-500"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
                    <div className="flex flex-wrap items-center gap-4">
                      <QuantityStepper
                        value={quantity}
                        onChange={(next) => updateQuantity(product.id, size, next)}
                        max={Math.min(product.stock, 10)}
                        size="sm"
                      />
                      <button
                        onClick={() => {
                          saveForLater(product.id, size);
                          notify(`${product.name} saved for later.`, "info");
                        }}
                        className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-charcoal/60 hover:text-ink"
                      >
                        <Bookmark size={12} /> Save for later
                      </button>
                      <button
                        onClick={() => {
                          removeFromCart(product.id, size);
                          notify(`${product.name} removed from bag.`, "info");
                        }}
                        className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-charcoal/60 hover:text-red-500 sm:hidden"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-[14px] text-ink">{formatINR(product.price * quantity)}</p>
                      {product.mrp && product.mrp > product.price && (
                        <p className="text-[10.5px] text-stone line-through">
                          {formatINR(product.mrp * quantity)}
                        </p>
                      )}
                    </div>
                  </div>
                  {product.stock <= 5 && (
                    <p className="mt-2 text-[10px] uppercase tracking-[0.1em] text-gold-deep">
                      Only {product.stock} left
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {savedProducts.length > 0 && (
            <div className="mt-10 border-t border-line pt-7">
              <h2 className="font-serif text-xl text-ink">Saved for later</h2>
              <div className="mt-4 space-y-3">
                {savedProducts.map((product) => (
                  <SavedItem
                    key={product.id}
                    productId={product.id}
                    onMove={() => {
                      moveToCart(product.id);
                      notify(`${product.name} moved to your bag.`);
                    }}
                    onRemove={() => removeSaved(product.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <aside>
          <div className="sticky top-[104px] border border-line bg-white">
            <div className="border-b border-line px-5 py-4">
              <h2 className="font-serif text-xl text-ink">Order Summary</h2>
            </div>
            <div className="space-y-3 px-5 py-5 text-[12.5px]">
              <SummaryRow label={`Subtotal (${cartLines.length} ${cartLines.length === 1 ? "item" : "items"})`} value={formatINR(totals.subtotal)} />
              {totals.productSavings > 0 && (
                <SummaryRow label="Product discount" value={`− ${formatINR(totals.productSavings)}`} accent />
              )}
              {totals.couponDiscount > 0 && (
                <SummaryRow label={`Coupon (${coupon?.code})`} value={`− ${formatINR(totals.couponDiscount)}`} accent />
              )}
              <SummaryRow
                label="Shipping"
                value={totals.shipping === 0 ? "Complimentary" : formatINR(totals.shipping)}
              />
              <SummaryRow label="Estimated GST (3%)" value={formatINR(totals.tax)} />
              <div className="flex items-center justify-between border-t border-line pt-3.5">
                <span className="text-[11px] uppercase tracking-[0.16em] text-ink">Total</span>
                <span className="font-serif text-2xl text-ink">{formatINR(totals.total)}</span>
              </div>
              <p className="text-[10px] text-stone">Inclusive of applicable taxes.</p>

              {/* Coupon */}
              <div className="border-t border-line pt-4">
                <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-ink">
                  <Tag size={12} className="text-gold-dark" /> Coupon
                </p>
                {coupon ? (
                  <div className="mt-2.5 flex items-center justify-between border border-gold/40 bg-gold/[0.07] px-3 py-2">
                    <div>
                      <p className="text-[11px] font-medium text-gold-deep">{coupon.code}</p>
                      <p className="text-[10px] text-charcoal/55">{coupon.description}</p>
                    </div>
                    <button
                      onClick={() => {
                        removeCoupon();
                        notify("Coupon removed.", "info");
                      }}
                      aria-label="Remove coupon"
                      className="text-stone hover:text-ink"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const result = applyCoupon(code);
                        if (result.ok) {
                          notify(result.message);
                          setCouponError("");
                          setCode("");
                        } else {
                          setCouponError(result.message);
                        }
                      }}
                      className="mt-2.5 flex"
                    >
                      <input
                        value={code}
                        onChange={(e) => {
                          setCode(e.target.value.toUpperCase());
                          setCouponError("");
                        }}
                        placeholder="Enter code"
                        aria-label="Coupon code"
                        className="h-10 min-w-0 flex-1 border border-line bg-white px-3 text-[11.5px] uppercase outline-none focus:border-gold"
                      />
                      <button type="submit" className="border border-l-0 border-ink bg-ink px-4 text-[9.5px] uppercase tracking-[0.14em] text-ivory hover:bg-gold-dark hover:text-ink">
                        Apply
                      </button>
                    </form>
                    {couponError && <p className="mt-1.5 text-[10.5px] text-red-500">{couponError}</p>}
                    <p className="mt-2 text-[10px] text-stone">Try LEO10 on orders above ₹4,999.</p>
                  </>
                )}
              </div>

              <Link to="/checkout" className="btn-primary mt-3 w-full">
                Proceed to Checkout <ArrowRight size={14} />
              </Link>
              <p className="flex items-center justify-center gap-1.5 pt-1 text-[10px] text-stone">
                <ShieldCheck size={12} className="text-gold-dark" /> Secure checkout · Encrypted connection
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-charcoal/60">{label}</span>
      <span className={accent ? "text-emerald-700" : "text-charcoal"}>{value}</span>
    </div>
  );
}

function SavedItem({
  productId,
  onMove,
  onRemove,
}: {
  productId: string;
  onMove: () => void;
  onRemove: () => void;
}) {
  const { getProductById } = useCatalogue();
  const product = getProductById(productId);
  if (!product) return null;

  return (
    <div className="flex items-center gap-3 border border-line bg-white p-3">
      <ProductImage src={product.images[0]} alt={product.name} label={product.name} className="h-16 w-14 shrink-0" />
      <div className="min-w-0 flex-1">
        <Link to={`/product/${product.slug}`} className="text-[12.5px] text-ink hover:text-gold-dark">
          {product.name}
        </Link>
        <p className="mt-0.5 text-[11px] text-stone">{formatINR(product.price)}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <button onClick={onMove} className="text-[9.5px] uppercase tracking-[0.12em] text-gold-dark hover:text-ink">
          Move to bag
        </button>
        <button onClick={onRemove} aria-label={`Remove ${product.name}`} className="text-stone hover:text-red-500">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
