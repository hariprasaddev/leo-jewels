import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Heart,
  ShoppingBag,
  Truck,
  RotateCcw,
  ShieldCheck,
  ZoomIn,
  ChevronRight,
  Star,
  Check,
  Info,
} from "lucide-react";
import { getReviewsForProduct } from "@/data/products";
import { useCatalogue } from "@/context/CatalogueContext";
import { ProductImage } from "@/components/ui/ProductImage";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Rating } from "@/components/ui/Rating";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Modal } from "@/components/ui/Modal";
import { ProductCard } from "@/components/product/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useStore } from "@/context/StoreContext";
import { useToast } from "@/context/ToastContext";
import { cn, discountPercent, formatDate, formatINR } from "@/lib/utils";
import { NotFound } from "./NotFound";

export function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { getCategory, publishedProducts } = useCatalogue();
  const product = slug
    ? publishedProducts.find((entry) => entry.slug === slug)
    : undefined;
  const category = product ? getCategory(product.category) : undefined;
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const { notify } = useToast();

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState<string | undefined>(product?.sizes?.[0]);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [pincode, setPincode] = useState("");
  const [pinResult, setPinResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    setActiveImage(0);
    setQuantity(1);
    setSize(product?.sizes?.[0]);
    setPinResult(null);
    setPincode("");
    setShowAllReviews(false);
  }, [product]);

  const productReviews = useMemo(
    () => (product ? getReviewsForProduct(product.id) : []),
    [product]
  );
  const related = useMemo(() => {
    if (!product) return [];
    const sameCategory = publishedProducts.filter(
      (p) => p.id !== product.id && p.category === product.category
    );
    const sharedCollection = publishedProducts.filter(
      (p) =>
        p.id !== product.id &&
        p.collections.some((c) => product.collections.includes(c))
    );
    return [...sameCategory, ...sharedCollection, ...publishedProducts]
      .filter((p) => p.id !== product.id)
      .filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i)
      .slice(0, 4);
  }, [product, publishedProducts]);

  if (!product) return <NotFound />;

  const discount = discountPercent(product.price, product.mrp);
  const wished = isWishlisted(product.id);
  const soldOut = product.stock <= 0;

  const handleAdd = (thenCheckout = false) => {
    addToCart(product.id, quantity, size);
    if (thenCheckout) {
      navigate("/checkout");
      return;
    }
    notify(`${product.name} added to your bag.`);
  };

  const checkPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[1-9]\d{5}$/.test(pincode.trim())) {
      setPinResult({ ok: false, message: "Enter a valid 6-digit Indian PIN code." });
      return;
    }
    const from = new Date();
    from.setDate(from.getDate() + 4);
    const to = new Date();
    to.setDate(to.getDate() + 7);
    setPinResult({
      ok: true,
      message: `Serviceable estimate for ${pincode}: ${formatDate(from.toISOString())} – ${formatDate(
        to.toISOString()
      )}. Estimate only — no courier booking is connected in this demo.`,
    });
  };

  const ratingBuckets = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: productReviews.filter((r) => Math.round(r.rating) === star).length,
  }));
  const visibleReviews = showAllReviews ? productReviews : productReviews.slice(0, 3);

  return (
    <div>
      <div className="container-lux py-6">
        <Breadcrumbs
          items={[
            { label: "Home", to: "/" },
            {
              label: category?.name ?? "Jewellery",
              to: `/category/${product.category}`,
            },
            { label: product.name },
          ]}
        />
      </div>

      <div className="container-lux grid gap-8 pb-14 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        {/* Gallery */}
        <div className="lg:sticky lg:top-[104px] lg:self-start">
          <div className="group relative bg-cream">
            <ProductImage
              src={product.images[activeImage]}
              alt={`${product.name} — view ${activeImage + 1}`}
              label={product.name}
              eager
              className="aspect-[4/5] w-full"
            />
            <button
              onClick={() => setZoomOpen(true)}
              aria-label="Zoom image"
              className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center bg-ivory/90 text-charcoal backdrop-blur-sm transition-colors hover:bg-ink hover:text-ivory"
            >
              <ZoomIn size={17} />
            </button>
            {discount && (
              <span className="absolute left-4 top-4 bg-gold px-3 py-1.5 text-[9px] uppercase tracking-[0.18em] text-ink">
                {discount}% off
              </span>
            )}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {product.images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                onClick={() => setActiveImage(index)}
                aria-label={`View image ${index + 1} of ${product.name}`}
                aria-pressed={activeImage === index}
                className={cn(
                  "border-2 transition-colors",
                  activeImage === index
                    ? "border-gold"
                    : "border-transparent opacity-70 hover:opacity-100"
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

        {/* Info */}
        <div>
          <p className="eyebrow">{category?.name ?? "Jewellery"}</p>
          <h1 className="mt-2.5 font-serif text-3xl leading-tight text-ink sm:text-[40px]">
            {product.name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <a href="#reviews" className="flex items-center gap-2">
              <Rating value={product.rating} size={14} />
              <span className="text-[11.5px] text-charcoal/65">
                {product.rating.toFixed(1)} · {product.reviewCount} reviews
              </span>
            </a>
            <span className="text-[10px] uppercase tracking-[0.14em] text-stone">
              SKU {product.sku}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <span className="font-serif text-3xl text-ink">{formatINR(product.price)}</span>
            {product.mrp && product.mrp > product.price && (
              <>
                <span className="text-base text-stone line-through">{formatINR(product.mrp)}</span>
                <span className="bg-cream px-2 py-1 text-[10.5px] font-medium text-gold-deep">
                  Save {formatINR(product.mrp - product.price)}
                </span>
              </>
            )}
          </div>
          <p className="mt-1 text-[10.5px] text-stone">Inclusive of all taxes. Shipping calculated at checkout.</p>

          <p className="mt-5 text-[13.5px] leading-[1.8] text-charcoal/70">{product.description}</p>

          <ul className="mt-4 space-y-2">
            {product.details.map((detail) => (
              <li key={detail} className="flex items-start gap-2.5 text-[12.5px] text-charcoal/65">
                <Check size={14} className="mt-0.5 shrink-0 text-gold-dark" />
                {detail}
              </li>
            ))}
          </ul>

          {product.sizes && (
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <p className="field-label mb-0">Select size</p>
                <span className="text-[10.5px] text-stone">Size guide available on request</span>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {product.sizes.map((option) => (
                  <button
                    key={option}
                    onClick={() => setSize(option)}
                    aria-pressed={size === option}
                    className={cn(
                      "min-w-12 border px-4 py-2.5 text-xs transition-colors",
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

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span
              className={cn(
                "flex items-center gap-1.5 text-[11px]",
                soldOut ? "text-red-500" : product.stock <= 5 ? "text-gold-deep" : "text-charcoal/65"
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  soldOut ? "bg-red-400" : product.stock <= 5 ? "bg-gold" : "bg-emerald-500"
                )}
              />
              {soldOut
                ? "Currently sold out"
                : product.stock <= 5
                ? `Only ${product.stock} left in stock`
                : `In stock · ${product.stock} available`}
            </span>
          </div>

          <div className="mt-4 flex items-stretch gap-3">
            <QuantityStepper
              value={quantity}
              onChange={setQuantity}
              max={Math.min(product.stock, 10)}
            />
            <button
              onClick={() => handleAdd()}
              disabled={soldOut}
              className="btn-primary flex-1"
            >
              <ShoppingBag size={15} /> Add to bag
            </button>
            <button
              onClick={() => {
                const added = toggleWishlist(product.id);
                notify(added ? "Saved to wishlist." : "Removed from wishlist.", added ? "success" : "info");
              }}
              aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
              aria-pressed={wished}
              className={cn(
                "flex w-[46px] shrink-0 items-center justify-center border transition-colors",
                wished ? "border-gold bg-gold/10 text-gold-dark" : "border-ink/25 text-charcoal hover:border-ink"
              )}
            >
              <Heart size={17} fill={wished ? "currentColor" : "none"} />
            </button>
          </div>
          <button
            onClick={() => handleAdd(true)}
            disabled={soldOut}
            className="btn-outline mt-3 w-full"
          >
            Buy it now
          </button>

          {/* Pincode / delivery */}
          <div className="mt-7 border border-line bg-white p-4">
            <div className="flex items-center gap-2">
              <Truck size={15} className="text-gold-dark" />
              <p className="text-[11px] uppercase tracking-[0.14em] text-ink">Delivery</p>
            </div>
            <form onSubmit={checkPincode} className="mt-3 flex gap-2">
              <input
                value={pincode}
                onChange={(e) => {
                  setPincode(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setPinResult(null);
                }}
                inputMode="numeric"
                placeholder="Enter PIN code"
                aria-label="Delivery PIN code"
                className="h-10 flex-1 border border-line bg-white px-3 text-[12.5px] outline-none focus:border-gold"
              />
              <button type="submit" className="border border-ink px-4 text-[10px] uppercase tracking-[0.16em] text-ink transition-colors hover:bg-ink hover:text-ivory">
                Check
              </button>
            </form>
            {pinResult && (
              <p
                className={cn(
                  "mt-2.5 text-[11px] leading-relaxed",
                  pinResult.ok ? "text-charcoal/65" : "text-red-500"
                )}
              >
                {pinResult.message}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-3 text-[10.5px] text-charcoal/55">
              <span className="flex items-center gap-1.5">
                <RotateCcw size={12} className="text-gold-dark" /> 7-day returns
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-gold-dark" /> Secure checkout
              </span>
            </div>
          </div>

          {/* Accordions */}
          <div className="mt-7 divide-y divide-line border-y border-line">
            <details open className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-[11px] uppercase tracking-[0.16em] text-ink">
                Product specifications
                <ChevronRight size={15} className="text-stone transition-transform group-open:rotate-90" />
              </summary>
              <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-[12px]">
                <div>
                  <dt className="text-stone">SKU</dt>
                  <dd className="mt-0.5 text-charcoal">{product.sku}</dd>
                </div>
                <div>
                  <dt className="text-stone">Category</dt>
                  <dd className="mt-0.5 text-charcoal">
                    {category?.name ?? product.category}
                  </dd>
                </div>
                <div>
                  <dt className="text-stone">Material</dt>
                  <dd className="mt-0.5 text-charcoal">{product.material}</dd>
                </div>
                <div>
                  <dt className="text-stone">Approx. weight</dt>
                  <dd className="mt-0.5 text-charcoal">
                    {product.weightGrams ? `${product.weightGrams} g` : "Not specified"}
                  </dd>
                </div>
                <div>
                  <dt className="text-stone">Sizes available</dt>
                  <dd className="mt-0.5 text-charcoal">
                    {product.sizes ? product.sizes.join(", ") : "One size"}
                  </dd>
                </div>
                <div>
                  <dt className="text-stone">Availability</dt>
                  <dd className="mt-0.5 text-charcoal">
                    {soldOut ? "Sold out" : `${product.stock} in stock`}
                  </dd>
                </div>
              </dl>
              <p className="mt-4 flex items-start gap-2 bg-cream p-3 text-[10.5px] leading-relaxed text-charcoal/55">
                <Info size={13} className="mt-0.5 shrink-0 text-gold-dark" />
                Gold purity, hallmark details and any certificates are confirmed by the
                brand at dispatch. They are not invented in this demonstration catalogue.
              </p>
            </details>

            <details className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-[11px] uppercase tracking-[0.16em] text-ink">
                Material & care
                <ChevronRight size={15} className="text-stone transition-transform group-open:rotate-90" />
              </summary>
              <div className="mt-3 space-y-2 text-[12px] leading-relaxed text-charcoal/65">
                <p>
                  Store your jewellery in a dry, soft-lined pouch away from direct
                  sunlight. Avoid contact with perfume, chlorine and harsh cleaning
                  products.
                </p>
                <p>
                  Wipe gently with a soft dry cloth after wear. For plated and imitation
                  pieces, keep them away from water to preserve the finish.
                </p>
              </div>
            </details>

            <details className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-[11px] uppercase tracking-[0.16em] text-ink">
                Shipping & returns
                <ChevronRight size={15} className="text-stone transition-transform group-open:rotate-90" />
              </summary>
              <div className="mt-3 space-y-2 text-[12px] leading-relaxed text-charcoal/65">
                <p>
                  Complimentary shipping on orders above ₹4,999. Below that, a flat ₹99
                  shipping fee applies. Orders are typically dispatched within 2–4
                  business days.
                </p>
                <p>
                  Unworn pieces in original packaging can be returned within 7 days of
                  delivery. See our{" "}
                  <Link to="/return-policy" className="text-gold-dark underline underline-offset-2">
                    Return Policy
                  </Link>{" "}
                  for exclusions.
                </p>
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section id="reviews" className="border-y border-line bg-white">
        <div className="container-lux py-14 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-[300px_1fr] lg:gap-16">
            <div>
              <p className="eyebrow">Customer Reviews</p>
              <h2 className="mt-3 font-serif text-3xl text-ink">Worn & Loved</h2>
              <div className="mt-5 flex items-end gap-3">
                <span className="font-serif text-5xl leading-none text-ink">
                  {product.rating.toFixed(1)}
                </span>
                <div className="pb-1">
                  <Rating value={product.rating} size={14} />
                  <p className="mt-1 text-[11px] text-stone">{product.reviewCount} reviews</p>
                </div>
              </div>
              <div className="mt-5 space-y-2">
                {ratingBuckets.map(({ star, count }) => (
                  <div key={star} className="flex items-center gap-2.5">
                    <span className="w-8 text-[10.5px] text-stone">{star} star</span>
                    <div className="h-1 flex-1 bg-cream">
                      <div
                        className="h-full bg-gold"
                        style={{
                          width: `${
                            productReviews.length
                              ? (count / productReviews.length) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <span className="w-4 text-right text-[10.5px] text-stone">{count}</span>
                  </div>
                ))}
              </div>
              <p className="mt-5 flex items-start gap-2 text-[10px] leading-relaxed text-stone">
                <Info size={12} className="mt-0.5 shrink-0" />
                Reviews shown are sample content from this demonstration build, not
                verified purchases.
              </p>
            </div>

            <div>
              {productReviews.length === 0 ? (
                <EmptyState
                  title="No reviews for this piece yet"
                  description="Be the first to share your thoughts. Reviews are published after purchase verification."
                  icon={<Star size={22} className="text-gold-dark" />}
                  className="py-10"
                />
              ) : (
                <div className="divide-y divide-line">
                  {visibleReviews.map((review) => (
                    <article key={review.id} className="py-5 first:pt-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cream text-[11px] text-charcoal">
                            {review.author.charAt(0)}
                          </span>
                          <div>
                            <p className="text-[12px] font-medium text-ink">{review.author}</p>
                            {review.verified && (
                              <p className="flex items-center gap-1 text-[9.5px] text-emerald-700">
                                <Check size={10} /> Verified purchase
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Rating value={review.rating} size={11} />
                          <span className="text-[10px] text-stone">{formatDate(review.date)}</span>
                        </div>
                      </div>
                      <h3 className="mt-3 font-serif text-[16px] text-ink">{review.title}</h3>
                      <p className="mt-1.5 text-[12.5px] leading-relaxed text-charcoal/65">
                        {review.body}
                      </p>
                    </article>
                  ))}
                  {productReviews.length > 3 && (
                    <button
                      onClick={() => setShowAllReviews((v) => !v)}
                      className="mt-4 text-[10px] uppercase tracking-[0.18em] text-gold-dark underline underline-offset-4"
                    >
                      {showAllReviews ? "Show fewer reviews" : `Read all ${productReviews.length} reviews`}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Related */}
      <section className="container-lux py-14 lg:py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">You May Also Like</p>
            <h2 className="mt-3 font-serif text-3xl text-ink">Complete the Look</h2>
          </div>
          <Link
            to={`/category/${product.category}`}
            className="hidden text-[10px] uppercase tracking-[0.18em] text-charcoal hover:text-gold-dark sm:block"
          >
            View category →
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 lg:grid-cols-4">
          {related.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>

      <Modal open={zoomOpen} onClose={() => setZoomOpen(false)} panelClassName="sm:max-w-3xl bg-cream">
        <ProductImage
          src={product.images[activeImage]}
          alt={`${product.name} enlarged`}
          label={product.name}
          eager
          className="max-h-[85vh] w-full"
          imgClassName="object-contain"
        />
      </Modal>

    </div>
  );
}
