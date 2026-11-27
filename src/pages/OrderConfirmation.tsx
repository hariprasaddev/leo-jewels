import { useParams, Link } from "react-router-dom";
import { Check, Package, Truck, ArrowRight, Mail } from "lucide-react";
import type { Order } from "@/types";
import { readStorage, STORAGE_KEYS } from "@/lib/storage";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { DemoNote } from "@/components/ui/DemoNote";
import { ProductImage } from "@/components/ui/ProductImage";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, formatINR } from "@/lib/utils";

export function OrderConfirmation() {
  const { orderId } = useParams<{ orderId: string }>();
  const orders = readStorage<Order[]>(STORAGE_KEYS.orders, []);
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <div className="container-lux py-10">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Order Confirmation" }]} />
        <EmptyState
          title="We couldn't find this order"
          description="Orders created in this browser can be viewed from your account. If you were looking for tracking, enter your order ID and contact details."
          icon={<Package size={24} className="text-gold-dark" />}
          action={
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/order-tracking" className="btn-primary">Track an order</Link>
              <Link to="/account?tab=orders" className="btn-outline">My orders</Link>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-lux py-8 lg:py-12">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Order Confirmed" }]} />

      <div className="mx-auto mt-8 max-w-3xl">
        <div className="text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold/15">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold text-ink">
              <Check size={22} strokeWidth={2.5} />
            </span>
          </span>
          <p className="eyebrow mt-6">Thank You</p>
          <h1 className="mt-2 font-serif text-4xl text-ink">Your order is confirmed</h1>
          <p className="mt-3 text-[13px] leading-relaxed text-charcoal/60">
            We've noted your order. A confirmation is shown below — please keep your order
            ID handy for tracking.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-y border-line py-4">
          <div>
            <p className="text-[9px] uppercase tracking-[0.18em] text-stone">Order number</p>
            <p className="mt-0.5 font-medium text-ink">{order.id}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-[0.18em] text-stone">Placed on</p>
            <p className="mt-0.5 text-[12.5px] text-ink">{formatDate(order.createdAt)}</p>
          </div>
          <span className="border border-gold/40 bg-gold/10 px-3 py-1.5 text-[9px] uppercase tracking-[0.16em] text-gold-deep">
            {order.status}
          </span>
        </div>

        <div className="mt-6 border border-line bg-white">
          <div className="border-b border-line px-5 py-3.5">
            <p className="text-[10px] uppercase tracking-[0.16em] text-ink">Your pieces</p>
          </div>
          <div className="divide-y divide-line/70 px-5">
            {order.items.map((item) => (
              <div key={`${item.productId}-${item.size}`} className="flex items-center gap-4 py-4">
                <ProductImage src={item.image} alt={item.name} label={item.name} className="h-20 w-16 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-[15px] text-ink">{item.name}</p>
                  <p className="mt-0.5 text-[10.5px] text-stone">
                    {item.sku}{item.size ? ` · Size ${item.size}` : ""} · Qty {item.quantity}
                  </p>
                </div>
                <p className="text-[12.5px] text-ink">{formatINR(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-4 border-t border-line px-5 py-5 sm:grid-cols-2">
            <div>
              <p className="text-[9px] uppercase tracking-[0.18em] text-stone">Delivering to</p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-charcoal/70">
                {order.customer.fullName}
                <br />
                {order.customer.address}
                <br />
                +91 {order.customer.mobile}
              </p>
            </div>
            <div className="sm:text-right">
              <div className="space-y-1.5 text-[12px] text-charcoal/60">
                <p className="flex justify-between gap-8 sm:justify-end">
                  <span>Subtotal</span><span className="text-charcoal">{formatINR(order.subtotal)}</span>
                </p>
                {order.discount > 0 && (
                  <p className="flex justify-between gap-8 text-emerald-700 sm:justify-end">
                    <span>Coupon</span><span>− {formatINR(order.discount)}</span>
                  </p>
                )}
                <p className="flex justify-between gap-8 sm:justify-end">
                  <span>Shipping</span><span className="text-charcoal">{order.shipping === 0 ? "Complimentary" : formatINR(order.shipping)}</span>
                </p>
                <p className="flex justify-between gap-8 sm:justify-end">
                  <span>GST</span><span className="text-charcoal">{formatINR(order.tax)}</span>
                </p>
                <p className="flex justify-between gap-8 border-t border-line pt-2 text-ink sm:justify-end">
                  <span className="text-[10px] uppercase tracking-[0.14em]">Total paid</span>
                  <span className="font-serif text-lg">{formatINR(order.total)}</span>
                </p>
                <p className="text-[10px]">{order.paymentMethod} · {order.paymentStatus}</p>
              </div>
            </div>
          </div>
        </div>

        <DemoNote className="mt-5">
          <strong className="font-medium">Demo order.</strong> This order was created in your
          browser for demonstration. It has not been sent to a warehouse, no courier has been
          booked, and no payment has been captured.
        </DemoNote>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { icon: Mail, title: "Confirmation", copy: "In production, an email and SMS would be sent from the backend." },
            { icon: Package, title: "Packing", copy: "Orders are typically dispatched within 2–4 business days." },
            { icon: Truck, title: "Delivery", copy: "Track progress with your order ID and registered contact." },
          ].map(({ icon: Icon, title, copy }) => (
            <div key={title} className="border border-line bg-white p-4">
              <Icon size={17} className="text-gold-dark" strokeWidth={1.5} />
              <p className="mt-2.5 text-[11px] uppercase tracking-[0.14em] text-ink">{title}</p>
              <p className="mt-1 text-[10.5px] leading-relaxed text-charcoal/55">{copy}</p>
            </div>
          ))}
        </div>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to={`/track-order?orderId=${encodeURIComponent(order.id)}&contact=${encodeURIComponent(order.customer.email)}`}
            className="btn-primary"
          >
            Track your order <ArrowRight size={14} />
          </Link>
          <Link to="/collections/best-sellers" className="btn-outline">Continue shopping</Link>
        </div>
      </div>
    </div>
  );
}
