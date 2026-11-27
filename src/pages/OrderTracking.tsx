import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  Package,
  Check,
  Truck,
  Home,
  HelpCircle,
  ClipboardList,
  Boxes,
  MapPin,
  CreditCard,
  ExternalLink,
  CalendarDays,
} from "lucide-react";
import type { Order, OrderStatus } from "@/types";
import { orderService } from "@/services/orderService";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { DemoNote } from "@/components/ui/DemoNote";
import { ProductImage } from "@/components/ui/ProductImage";
import { formatDate, formatINR, cn } from "@/lib/utils";

const TIMELINE: { status: OrderStatus; label: string; icon: typeof Package }[] = [
  { status: "Pending", label: "Order Placed", icon: ClipboardList },
  { status: "Confirmed", label: "Order Confirmed", icon: Check },
  { status: "Processing", label: "Processing", icon: Boxes },
  { status: "Packed", label: "Packed", icon: Package },
  { status: "Shipped", label: "Shipped", icon: Truck },
  { status: "Out for Delivery", label: "Out for Delivery", icon: MapPin },
  { status: "Delivered", label: "Delivered", icon: Home },
];

const ORDER_RANK: Record<OrderStatus, number> = {
  Pending: 0,
  Confirmed: 1,
  Processing: 2,
  Packed: 3,
  Shipped: 4,
  "Out for Delivery": 5,
  Delivered: 6,
  "Return Requested": 7,
  Returned: 8,
  Refunded: 9,
  Cancelled: -1,
};

const EXCEPTION_COPY: Partial<Record<OrderStatus, string>> = {
  Cancelled: "This order was cancelled. Contact customer care if you need assistance.",
  "Return Requested": "A return has been requested for this order. Our team will contact you.",
  Returned: "This order has been marked as returned.",
  Refunded: "This order has been refunded.",
};

export function OrderTracking() {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get("orderId") ?? "");
  const [contact, setContact] = useState(searchParams.get("contact") ?? "");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim() || !contact.trim()) {
      setError("Enter your order number and the email or mobile used at checkout.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const found = await orderService.track(orderId, contact);
      setOrder(found ?? null);
      setSearched(true);
      if (!found) setError("No order found with these details. Check and try again.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to look up this order.");
    } finally {
      setLoading(false);
    }
  };

  const currentRank = order ? ORDER_RANK[order.status] : 0;
  const historyByStatus = useMemo(() => {
    const map = new Map<OrderStatus, string>();
    order?.statusHistory?.forEach((event) => {
      if (!map.has(event.status)) map.set(event.status, event.at);
    });
    return map;
  }, [order]);
  const hasTrackingDetails = Boolean(
    order?.trackingNumber || order?.courierName || order?.trackingUrl
  );

  return (
    <div className="container-lux py-8 lg:py-12">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Track Your Order" }]} />
      <div className={cn("mx-auto mt-6", order ? "max-w-3xl" : "max-w-2xl")}>
        <p className="eyebrow">Order Tracking</p>
        <h1 className="mt-2 font-serif text-3xl text-ink sm:text-4xl">Track Your Order</h1>
        <p className="mt-3 text-[13px] leading-relaxed text-charcoal/60">
          Stay updated on your LEO JEWELS purchase from confirmation to delivery. Enter your
          order number and registered contact details.
        </p>

        <form onSubmit={submit} noValidate className="mt-7 grid gap-4 border border-line bg-white p-5 sm:grid-cols-2">
          <div>
            <label htmlFor="track-order" className="field-label">Order number</label>
            <input
              id="track-order"
              value={orderId}
              onChange={(e) => {
                setOrderId(e.target.value);
                setError("");
              }}
              placeholder="e.g. LJ-XXXXXXXX"
              className="field"
            />
          </div>
          <div>
            <label htmlFor="track-contact" className="field-label">Registered email or mobile</label>
            <input
              id="track-contact"
              value={contact}
              onChange={(e) => {
                setContact(e.target.value);
                setError("");
              }}
              placeholder="you@example.com"
              className="field"
            />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto">
              {loading ? "Looking up…" : "Track Order"} <Search size={14} />
            </button>
          </div>
        </form>

        {error && (
          <div role="alert" className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-[11.5px] text-red-700">
            {error}
          </div>
        )}

        {order && (
          <div className="mt-7 space-y-4">
            <div className="border border-line bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.18em] text-stone">Order number</p>
                  <p className="mt-0.5 font-medium text-ink">{order.id}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.18em] text-stone">Order date</p>
                  <p className="mt-0.5 text-[12px] text-ink">{formatDate(order.createdAt)}</p>
                </div>
                <span className="border border-gold/40 bg-gold/10 px-3 py-1.5 text-[9px] uppercase tracking-[0.16em] text-gold-deep">
                  {order.status}
                </span>
              </div>

              <div className="grid gap-5 px-5 py-5 sm:grid-cols-2">
                <div>
                  <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-stone">
                    <MapPin size={12} /> Delivery address
                  </p>
                  <p className="mt-2 text-[12px] leading-relaxed text-charcoal/70">
                    {order.customer.fullName}
                    <br />
                    {order.customer.address}
                    <br />
                    +91 {order.customer.mobile}
                  </p>
                </div>
                <div>
                  <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-stone">
                    <CreditCard size={12} /> Payment
                  </p>
                  <p className="mt-2 text-[12px] text-charcoal/70">
                    {order.paymentMethod}
                    <br />
                    <span className="text-ink">{order.paymentStatus}</span>
                  </p>
                  <p className="mt-2 text-[10.5px] text-stone">
                    Order total <span className="text-ink">{formatINR(order.total)}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-line bg-white">
              <div className="border-b border-line px-5 py-4">
                <h2 className="font-serif text-xl text-ink">Order status</h2>
                <p className="mt-1 text-[11px] text-stone">
                  Updates shown below are maintained by the LEO JEWELS team. No courier
                  estimate is invented when a logistics provider is not connected.
                </p>
              </div>

              {EXCEPTION_COPY[order.status] && (
                <p className="border-b border-line bg-cream/60 px-5 py-3 text-[12px] text-charcoal/70">
                  {EXCEPTION_COPY[order.status]}
                </p>
              )}

              <ol className="px-5 py-5">
                {TIMELINE.map((step, index) => {
                  const reached = currentRank >= ORDER_RANK[step.status];
                  const Icon = step.icon;
                  const timestamp =
                    step.status === "Pending"
                      ? order.createdAt
                      : historyByStatus.get(step.status);
                  return (
                    <li key={step.status} className="relative flex gap-4 pb-6 last:pb-0">
                      {index < TIMELINE.length - 1 && (
                        <span
                          aria-hidden="true"
                          className={cn(
                            "absolute left-[15px] top-8 h-[calc(100%-1rem)] w-px",
                            currentRank > ORDER_RANK[step.status] ? "bg-gold" : "bg-line"
                          )}
                        />
                      )}
                      <span
                        className={cn(
                          "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                          reached
                            ? "border-gold bg-gold text-ink"
                            : "border-line bg-white text-stone"
                        )}
                      >
                        <Icon size={14} />
                      </span>
                      <div className="min-w-0 pt-1">
                        <p
                          className={cn(
                            "text-[11px] uppercase tracking-[0.14em]",
                            reached ? "text-ink" : "text-stone"
                          )}
                        >
                          {step.label}
                        </p>
                        <p className="mt-1 text-[10.5px] text-stone">
                          {reached
                            ? timestamp
                              ? `Updated ${formatDate(timestamp)}`
                              : "Completed"
                            : "Pending"}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            {hasTrackingDetails && (
              <div className="border border-line bg-white p-5">
                <h2 className="flex items-center gap-2 font-serif text-lg text-ink">
                  <Truck size={16} className="text-gold-dark" /> Shipping details
                </h2>
                <dl className="mt-3 grid gap-3 text-[12px] sm:grid-cols-2">
                  {order.courierName && <Info label="Courier" value={order.courierName} />}
                  {order.trackingNumber && <Info label="Tracking number" value={order.trackingNumber} />}
                  {order.estimatedDelivery && (
                    <Info label="Estimated delivery" value={formatDate(order.estimatedDelivery)} />
                  )}
                  {order.trackingUrl && (
                    <div>
                      <dt className="text-[9px] uppercase tracking-[0.14em] text-stone">Tracking link</dt>
                      <dd className="mt-1">
                        <a
                          href={order.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-gold-dark underline underline-offset-2 hover:text-ink"
                        >
                          View with courier <ExternalLink size={12} />
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            <div className="border border-line bg-white">
              <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
                <p className="text-[10px] uppercase tracking-[0.16em] text-ink">
                  {order.items.length} {order.items.length === 1 ? "piece" : "pieces"}
                </p>
                <p className="flex items-center gap-1.5 text-[10px] text-stone">
                  <CalendarDays size={12} /> {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="divide-y divide-line/70 px-5">
                {order.items.map((item) => (
                  <div key={`${item.productId}-${item.size}`} className="flex items-center gap-3 py-3.5">
                    <ProductImage src={item.image} alt={item.name} label={item.name} className="h-16 w-14 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] text-ink">{item.name}</p>
                      <p className="text-[10.5px] text-stone">
                        {item.sku}{item.size ? ` · Size ${item.size}` : ""} · Qty {item.quantity}
                      </p>
                    </div>
                    <p className="text-[11.5px] text-charcoal">{formatINR(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-line px-5 py-3.5">
                <span className="text-[10px] uppercase tracking-[0.14em] text-stone">Order total</span>
                <span className="font-serif text-lg text-ink">{formatINR(order.total)}</span>
              </div>
            </div>
          </div>
        )}

        {!searched && (
          <div className="mt-6">
            <DemoNote>
              Orders placed in this browser can be tracked above. Real courier tracking
              requires the backend API and a logistics integration; until then, the status
              shown is the one the administrator has actually set.
            </DemoNote>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-line pt-6 text-[11px] text-charcoal/60">
          <Link to="/account?tab=orders" className="flex items-center gap-2 hover:text-gold-dark">
            <Package size={14} /> View my orders
          </Link>
          <Link to="/contact" className="flex items-center gap-2 hover:text-gold-dark">
            <HelpCircle size={14} /> Need help?
          </Link>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[9px] uppercase tracking-[0.14em] text-stone">{label}</dt>
      <dd className="mt-1 text-charcoal">{value}</dd>
    </div>
  );
}
