import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  Landmark,
  Banknote,
  Smartphone,
  ShieldCheck,
  Lock,
  Info,
  ShoppingBag,
  Pencil,
} from "lucide-react";
import type { Address, Customer } from "@/types";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";
import { useCatalogue } from "@/context/CatalogueContext";
import { useToast } from "@/context/ToastContext";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { DemoNote } from "@/components/ui/DemoNote";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductImage } from "@/components/ui/ProductImage";
import { orderService } from "@/services/orderService";
import { paymentService } from "@/services/paymentService";
import { isApiConfigured } from "@/services/apiClient";
import { cn, formatINR, isValidEmail, isValidIndianMobile } from "@/lib/utils";
import { readStorage, STORAGE_KEYS } from "@/lib/storage";

const STEPS = [
  { id: 1, label: "Information" },
  { id: 2, label: "Delivery" },
  { id: 3, label: "Review" },
  { id: 4, label: "Payment" },
];

const PAYMENT_METHODS = [
  {
    id: "upi",
    label: "UPI",
    detail: "Google Pay, PhonePe, Paytm and other UPI apps",
    icon: Smartphone,
    online: true,
  },
  {
    id: "card",
    label: "Credit / Debit Card",
    detail: "Visa, Mastercard, RuPay and Amex",
    icon: CreditCard,
    online: true,
  },
  {
    id: "netbanking",
    label: "Net Banking",
    detail: "All major Indian banks",
    icon: Landmark,
    online: true,
  },
  {
    id: "cod",
    label: "Cash on Delivery",
    detail: "Pay when your order arrives",
    icon: Banknote,
    online: false,
  },
] as const;

type PaymentId = (typeof PAYMENT_METHODS)[number]["id"];

export function Checkout() {
  const { cartLines, totals, coupon, clearCart } = useStore();
  const { user } = useAuth();
  const { notify } = useToast();
  const { publishedProducts } = useCatalogue();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [customer, setCustomer] = useState({
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
    mobile: user?.mobile ?? "",
  });
  const [address, setAddress] = useState<Omit<Address, "id">>({
    label: "Home",
    fullName: user?.fullName ?? "",
    mobile: user?.mobile ?? "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [payment, setPayment] = useState<PaymentId>("upi");
  const [placing, setPlacing] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    document.title = "Checkout — LEO JEWELS";
  }, []);

  useEffect(() => {
    const saved = readStorage<Address[]>(STORAGE_KEYS.addresses, []);
    const preferred = saved.find((a) => a.isDefault) ?? saved[0];
    if (preferred) {
      setAddress({
        label: preferred.label,
        fullName: preferred.fullName,
        mobile: preferred.mobile,
        line1: preferred.line1,
        line2: preferred.line2 ?? "",
        city: preferred.city,
        state: preferred.state,
        pincode: preferred.pincode,
      });
    }
  }, []);

  const lineCount = useMemo(
    () => cartLines.reduce((sum, line) => sum + line.quantity, 0),
    [cartLines]
  );

  if (cartLines.length === 0) {
    return (
      <div className="container-lux py-8">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Checkout" }]} />
        <EmptyState
          title="There's nothing to check out"
          description="Add a piece to your bag and we'll guide you through a secure checkout."
          icon={<ShoppingBag size={24} className="text-gold-dark" />}
          action={<Link to="/collections/best-sellers" className="btn-primary">Explore collections</Link>}
        />
      </div>
    );
  }

  const validateStep = (): boolean => {
    const next: Record<string, string> = {};
    if (step === 1) {
      if (customer.fullName.trim().length < 2) next.fullName = "Enter your full name.";
      if (!isValidEmail(customer.email)) next.email = "Enter a valid email address.";
      if (!isValidIndianMobile(customer.mobile)) next.mobile = "Enter a valid 10-digit mobile number.";
    }
    if (step === 2) {
      if (address.fullName.trim().length < 2) next.addressName = "Enter the recipient's name.";
      if (!isValidIndianMobile(address.mobile)) next.addressMobile = "Enter a valid mobile number.";
      if (address.line1.trim().length < 5) next.line1 = "Enter the street address.";
      if (!address.city.trim()) next.city = "Enter the city.";
      if (!address.state.trim()) next.state = "Enter the state.";
      if (!/^[1-9]\d{5}$/.test(address.pincode.trim())) next.pincode = "Enter a valid 6-digit PIN code.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(4, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const placeOrder = async () => {
    setPaymentError("");
    if (PAYMENT_METHODS.find((m) => m.id === payment)?.online) {
      setPlacing(true);
      try {
        await paymentService.createRazorpayOrder("pre-checkout");
        setPaymentError(
          "A Razorpay order was created on the server, but Razorpay Checkout and server-side signature verification are not implemented in this frontend build. No payment has been taken."
        );
      } catch (error) {
        setPaymentError(
          error instanceof Error
            ? error.message
            : "Online payments are not configured for this storefront."
        );
      } finally {
        setPlacing(false);
      }
      return;
    }

    setPlacing(true);
    try {
      const orderCustomer: Customer = {
        id: user?.id ?? "guest",
        fullName: customer.fullName.trim(),
        email: customer.email.trim(),
        mobile: customer.mobile.trim(),
        createdAt: user?.createdAt ?? new Date().toISOString(),
      };
      const order = await orderService.placeOrder({
        customer: orderCustomer,
        address: { ...address, id: "checkout" },
        items: cartLines.map((line) => ({
          productId: line.product.id,
          quantity: line.quantity,
          size: line.size,
        })),
        paymentMethod: selectedMethod?.label ?? "Cash on Delivery",
        couponCode: coupon?.code,
        totals: {
          subtotal: totals.subtotal,
          discount: totals.couponDiscount,
          shipping: totals.shipping,
          tax: totals.tax,
          total: totals.total,
        },
      }, publishedProducts);
      clearCart();
      notify("Order placed. Thank you for shopping with LEO JEWELS.");
      navigate(`/order-confirmation/${order.id}`, { replace: true });
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "Unable to place the order.");
    } finally {
      setPlacing(false);
    }
  };

  const selectedMethod = PAYMENT_METHODS.find((m) => m.id === payment);

  return (
    <div className="container-lux py-8 lg:py-12">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Bag", to: "/cart" }, { label: "Checkout" }]} />
      <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Secure Checkout</p>
          <h1 className="mt-2 font-serif text-3xl text-ink sm:text-4xl">Complete your order</h1>
        </div>
        <Link to="/cart" className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-charcoal hover:text-gold-dark">
          <ArrowLeft size={13} /> Back to bag
        </Link>
      </div>

      {/* Stepper */}
      <ol className="mt-8 flex items-center gap-2 border-y border-line py-5 sm:gap-0">
        {STEPS.map((s, index) => {
          const done = step > s.id;
          const active = step === s.id;
          return (
            <li key={s.id} className="flex flex-1 items-center gap-2 last:flex-none">
              <button
                onClick={() => s.id < step && setStep(s.id)}
                disabled={s.id > step}
                className="flex items-center gap-2 text-left"
                aria-current={active ? "step" : undefined}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] transition-colors",
                    done && "border-gold bg-gold text-ink",
                    active && "border-ink bg-ink text-ivory",
                    !done && !active && "border-line text-stone"
                  )}
                >
                  {done ? <Check size={12} /> : s.id}
                </span>
                <span
                  className={cn(
                    "hidden text-[9.5px] uppercase tracking-[0.14em] sm:block",
                    active ? "text-ink" : done ? "text-charcoal" : "text-stone"
                  )}
                >
                  {s.label}
                </span>
              </button>
              {index < STEPS.length - 1 && <span className="ml-1 h-px flex-1 bg-line" />}
            </li>
          );
        })}
      </ol>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-14">
        <div>
          {step === 1 && (
            <section>
              <h2 className="font-serif text-2xl text-ink">Customer information</h2>
              <p className="mt-1.5 text-[12px] text-charcoal/55">
                We'll use these details for order updates. No marketing without consent.
              </p>
              <div className="mt-6 space-y-4">
                <Field
                  id="co-name"
                  label="Full name"
                  value={customer.fullName}
                  onChange={(v) => {
                    setCustomer((c) => ({ ...c, fullName: v }));
                    setErrors((e) => ({ ...e, fullName: "" }));
                  }}
                  error={errors.fullName}
                  autoComplete="name"
                />
                <Field
                  id="co-email"
                  label="Email address"
                  type="email"
                  value={customer.email}
                  onChange={(v) => {
                    setCustomer((c) => ({ ...c, email: v }));
                    setErrors((e) => ({ ...e, email: "" }));
                  }}
                  error={errors.email}
                  autoComplete="email"
                />
                <Field
                  id="co-mobile"
                  label="Mobile number"
                  value={customer.mobile}
                  onChange={(v) => {
                    setCustomer((c) => ({ ...c, mobile: v.replace(/\D/g, "").slice(0, 10) }));
                    setErrors((e) => ({ ...e, mobile: "" }));
                  }}
                  error={errors.mobile}
                  autoComplete="tel"
                  inputMode="numeric"
                />
              </div>
              {!user && (
                <p className="mt-4 text-[11.5px] text-charcoal/60">
                  Have an account?{" "}
                  <Link to="/login" state={{ from: "/checkout" }} className="text-gold-dark underline underline-offset-2">
                    Sign in
                  </Link>{" "}
                  for saved addresses and order history.
                </p>
              )}
            </section>
          )}

          {step === 2 && (
            <section>
              <h2 className="font-serif text-2xl text-ink">Delivery address</h2>
              <p className="mt-1.5 text-[12px] text-charcoal/55">
                Where should we send your order?
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field
                  id="co-addr-name"
                  label="Recipient name"
                  value={address.fullName}
                  onChange={(v) => setAddress((a) => ({ ...a, fullName: v }))}
                  error={errors.addressName}
                  autoComplete="name"
                />
                <Field
                  id="co-addr-mobile"
                  label="Recipient mobile"
                  value={address.mobile}
                  onChange={(v) => setAddress((a) => ({ ...a, mobile: v.replace(/\D/g, "").slice(0, 10) }))}
                  error={errors.addressMobile}
                  inputMode="numeric"
                  autoComplete="tel"
                />
                <div className="sm:col-span-2">
                  <Field
                    id="co-line1"
                    label="Address line 1"
                    value={address.line1}
                    onChange={(v) => setAddress((a) => ({ ...a, line1: v }))}
                    error={errors.line1}
                    placeholder="House / flat, building, street"
                    autoComplete="address-line1"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Field
                    id="co-line2"
                    label="Address line 2 (optional)"
                    value={address.line2 ?? ""}
                    onChange={(v) => setAddress((a) => ({ ...a, line2: v }))}
                    placeholder="Area, landmark"
                    autoComplete="address-line2"
                  />
                </div>
                <Field
                  id="co-city"
                  label="City"
                  value={address.city}
                  onChange={(v) => setAddress((a) => ({ ...a, city: v }))}
                  error={errors.city}
                  autoComplete="address-level2"
                />
                <Field
                  id="co-state"
                  label="State"
                  value={address.state}
                  onChange={(v) => setAddress((a) => ({ ...a, state: v }))}
                  error={errors.state}
                  autoComplete="address-level1"
                />
                <Field
                  id="co-pincode"
                  label="PIN code"
                  value={address.pincode}
                  onChange={(v) => setAddress((a) => ({ ...a, pincode: v.replace(/\D/g, "").slice(0, 6) }))}
                  error={errors.pincode}
                  inputMode="numeric"
                  autoComplete="postal-code"
                />
                <div className="sm:col-span-2">
                  <p className="flex items-center gap-2 bg-cream px-3.5 py-3 text-[11px] text-charcoal/60">
                    <Info size={13} className="shrink-0 text-gold-dark" />
                    Delivery estimates and shipping charges are shown in the order summary.
                  </p>
                </div>
              </div>
            </section>
          )}

          {step === 3 && (
            <section>
              <h2 className="font-serif text-2xl text-ink">Review your order</h2>
              <p className="mt-1.5 text-[12px] text-charcoal/55">
                Check your details and pieces before continuing to payment.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <ReviewCard
                  title="Contact"
                  onEdit={() => setStep(1)}
                  lines={[customer.fullName, customer.email, `+91 ${customer.mobile}`]}
                />
                <ReviewCard
                  title="Delivery address"
                  onEdit={() => setStep(2)}
                  lines={[
                    address.fullName,
                    [address.line1, address.line2, address.city, address.state, address.pincode]
                      .filter(Boolean)
                      .join(", "),
                    address.mobile,
                  ]}
                />
              </div>

              <div className="mt-6 border border-line bg-white">
                <div className="border-b border-line px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-ink">
                    {lineCount} {lineCount === 1 ? "piece" : "pieces"}
                  </p>
                </div>
                <div className="divide-y divide-line/70">
                  {cartLines.map(({ product, quantity, size }) => (
                    <div key={`${product.id}-${size}`} className="flex items-center gap-3 px-4 py-3.5">
                      <ProductImage src={product.images[0]} alt={product.name} label={product.name} className="h-16 w-14 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12.5px] text-ink">{product.name}</p>
                        <p className="text-[10.5px] text-stone">
                          {size ? `Size ${size} · ` : ""}Qty {quantity}
                        </p>
                      </div>
                      <p className="text-[12px] text-ink">{formatINR(product.price * quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {step === 4 && (
            <section>
              <h2 className="font-serif text-2xl text-ink">Payment method</h2>
              <p className="mt-1.5 text-[12px] text-charcoal/55">
                Choose how you'd like to pay. All online payments require server-side verification.
              </p>

              <div className="mt-5 space-y-2.5">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  const selected = payment === method.id;
                  return (
                    <label
                      key={method.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-3.5 border p-4 transition-colors",
                        selected ? "border-gold bg-gold/[0.06]" : "border-line bg-white hover:border-charcoal/30"
                      )}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={selected}
                        onChange={() => {
                          setPayment(method.id);
                          setPaymentError("");
                        }}
                        className="h-3.5 w-3.5 accent-[#C6A15B]"
                      />
                      <Icon size={18} className="shrink-0 text-gold-dark" strokeWidth={1.5} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[12.5px] font-medium text-ink">{method.label}</span>
                        <span className="block text-[11px] text-stone">{method.detail}</span>
                      </span>
                      {method.online && (
                        <span className="shrink-0 border border-line px-2 py-0.5 text-[8.5px] uppercase tracking-[0.12em] text-stone">
                          {isApiConfigured() ? "Razorpay" : "Not connected"}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>

              {selectedMethod?.online ? (
                <DemoNote className="mt-4">
                  <strong className="font-medium">Online payments are not live.</strong>{" "}
                  Razorpay checkout requires a Spring Boot endpoint to create the order and
                  verify the payment signature. This build will not simulate a successful
                  payment or mark an order paid. Select Cash on Delivery to place a demo
                  order, or configure the backend and{" "}
                  <code className="text-[10px]">VITE_RAZORPAY_KEY_ID</code>.
                </DemoNote>
              ) : (
                <DemoNote className="mt-4">
                  <strong className="font-medium">Demo order.</strong> Cash on Delivery will
                  create a locally stored demonstration order. Nothing is dispatched and no
                  money is collected.
                </DemoNote>
              )}

              {paymentError && (
                <div role="alert" className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-[11.5px] leading-relaxed text-red-700">
                  {paymentError}
                </div>
              )}

              <div className="mt-5 flex items-start gap-2 text-[10.5px] leading-relaxed text-stone">
                <Lock size={13} className="mt-0.5 shrink-0 text-gold-dark" />
                Payment details are never stored by LEO JEWELS. When connected, card data is
                handled entirely by the payment provider.
              </div>
            </section>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
            {step > 1 ? (
              <button onClick={() => setStep((s) => s - 1)} className="btn-ghost">
                <ArrowLeft size={14} /> Back
              </button>
            ) : (
              <Link to="/cart" className="btn-ghost">
                <ArrowLeft size={14} /> Back to bag
              </Link>
            )}
            {step < 4 ? (
              <button onClick={nextStep} className="btn-primary min-w-[180px]">
                Continue <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={placeOrder}
                disabled={placing}
                className={cn("btn-primary min-w-[220px]", !selectedMethod?.online && "bg-ink")}
              >
                {placing
                  ? "Processing…"
                  : selectedMethod?.online
                  ? "Pay & place order"
                  : `Place order · ${formatINR(totals.total)}`}
              </button>
            )}
          </div>
        </div>

        {/* Summary */}
        <aside>
          <div className="sticky top-[104px] border border-line bg-white">
            <div className="border-b border-line px-5 py-4">
              <h2 className="font-serif text-lg text-ink">Order Summary</h2>
            </div>
            <div className="max-h-[260px] overflow-y-auto border-b border-line px-5">
              {cartLines.map(({ product, quantity, size }) => (
                <div key={`${product.id}-${size}`} className="flex items-center gap-3 border-b border-line/60 py-3 last:border-0">
                  <ProductImage src={product.images[0]} alt={product.name} label={product.name} className="h-14 w-12 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11.5px] text-ink">{product.name}</p>
                    <p className="text-[10px] text-stone">Qty {quantity}{size ? ` · ${size}` : ""}</p>
                  </div>
                  <p className="text-[11.5px] text-charcoal">{formatINR(product.price * quantity)}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2.5 px-5 py-4 text-[12px]">
              <div className="flex justify-between">
                <span className="text-charcoal/60">Subtotal</span>
                <span>{formatINR(totals.subtotal)}</span>
              </div>
              {totals.productSavings > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Product discount</span>
                  <span>− {formatINR(totals.productSavings)}</span>
                </div>
              )}
              {totals.couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Coupon {coupon?.code}</span>
                  <span>− {formatINR(totals.couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-charcoal/60">Shipping</span>
                <span>{totals.shipping === 0 ? "Complimentary" : formatINR(totals.shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/60">Estimated GST</span>
                <span>{formatINR(totals.tax)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-line pt-3">
                <span className="text-[10px] uppercase tracking-[0.16em] text-ink">Total</span>
                <span className="font-serif text-2xl text-ink">{formatINR(totals.total)}</span>
              </div>
              <p className="flex items-center gap-1.5 pt-1 text-[9.5px] text-stone">
                <ShieldCheck size={12} className="text-gold-dark" /> Encrypted checkout
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  autoComplete,
  inputMode,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: "numeric" | "text" | "email" | "tel";
}) {
  return (
    <div>
      <label htmlFor={id} className="field-label">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={Boolean(error)}
        className={cn("field", error && "field-error")}
      />
      {error && <p className="mt-1.5 text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

function ReviewCard({
  title,
  lines,
  onEdit,
}: {
  title: string;
  lines: string[];
  onEdit: () => void;
}) {
  return (
    <div className="border border-line bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-[9.5px] uppercase tracking-[0.16em] text-stone">{title}</p>
        <button onClick={onEdit} className="flex items-center gap-1 text-[9.5px] uppercase tracking-[0.12em] text-gold-dark hover:text-ink">
          <Pencil size={10} /> Edit
        </button>
      </div>
      <div className="mt-2 space-y-0.5">
        {lines.filter(Boolean).map((line) => (
          <p key={line} className="text-[11.5px] leading-relaxed text-charcoal/70">{line}</p>
        ))}
      </div>
    </div>
  );
}
