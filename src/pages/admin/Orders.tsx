import { useMemo, useState } from "react";
import { Eye, Save, Search, Truck } from "lucide-react";
import type { Order, OrderStatus } from "@/types";
import { AdminPageHeader, AdminTable, StatusPill } from "@/components/admin/AdminUI";
import { DemoNote } from "@/components/ui/DemoNote";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ProductImage } from "@/components/ui/ProductImage";
import { SAMPLE_ORDERS } from "@/data/admin";
import { orderService } from "@/services/orderService";
import { useToast } from "@/context/ToastContext";
import { formatDate, formatINR } from "@/lib/utils";

const STATUSES: OrderStatus[] = [
  "Pending",
  "Confirmed",
  "Processing",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
  "Return Requested",
  "Returned",
  "Refunded",
];

const emptyShipping = {
  trackNumber: "",
  courierName: "",
  trackingUrl: "",
  estimatedDelivery: "",
};

export function AdminOrders() {
  const localOrders = orderService.allOrders();
  const localIds = new Set(localOrders.map((order) => order.id));
  const [orders, setOrders] = useState<Order[]>([...localOrders, ...SAMPLE_ORDERS]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [shipping, setShipping] = useState(emptyShipping);
  const [saving, setSaving] = useState(false);
  const { notify } = useToast();

  const filtered = useMemo(
    () =>
      orders.filter((order) => {
        if (statusFilter !== "all" && order.status !== statusFilter) return false;
        if (
          query &&
          !`${order.id} ${order.customer.fullName} ${order.customer.email} ${order.customer.mobile}`
            .toLowerCase()
            .includes(query.toLowerCase())
        )
          return false;
        return true;
      }),
    [orders, query, statusFilter]
  );

  const sourceOf = (order: Order) =>
    localIds.has(order.id) ? "This browser" : "Sample — read only";
  const isEditable = (order: Order) => localIds.has(order.id);

  const openOrder = (order: Order) => {
    setActiveOrder(order);
    setShipping({
      trackNumber: order.trackingNumber ?? "",
      courierName: order.courierName ?? "",
      trackingUrl: order.trackingUrl ?? "",
      estimatedDelivery: order.estimatedDelivery?.slice(0, 10) ?? "",
    });
  };

  const persist = async (
    order: Order,
    patch: Parameters<typeof orderService.updateOrder>[1]
  ) => {
    if (!isEditable(order)) {
      notify("Sample orders are illustrative and cannot be saved.", "error");
      return;
    }
    setSaving(true);
    try {
      const updated = await orderService.updateOrder(order.id, patch);
      if (!updated) {
        notify("This order could not be found in local storage.", "error");
        return;
      }
      setOrders((current) =>
        current.map((entry) => (entry.id === updated.id ? updated : entry))
      );
      if (activeOrder?.id === updated.id) setActiveOrder(updated);
      notify(`Order ${updated.id} updated.`);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Unable to update the order.", "error");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = (order: Order, status: OrderStatus) => {
    void persist(order, { status });
  };

  const saveShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) return;
    await persist(activeOrder, {
      trackingNumber: shipping.trackNumber.trim() || undefined,
      courierName: shipping.courierName.trim() || undefined,
      trackingUrl: shipping.trackingUrl.trim() || undefined,
      estimatedDelivery: shipping.estimatedDelivery || undefined,
    });
  };

  return (
    <div>
      <AdminPageHeader
        title="Orders & tracking"
        description="Update fulfilment status and add real shipping details supplied by your courier. Customers see the same information on the tracking page."
      />

      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search order, customer or mobile…"
            aria-label="Search orders"
            className="h-10 w-full border border-line bg-white pl-9 pr-3 text-[12px] outline-none focus:border-gold"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter orders by status"
          className="h-10 border border-line bg-white px-3 text-[11.5px] text-charcoal outline-none focus:border-gold"
        >
          <option value="all">All statuses</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <span className="ml-auto text-[10.5px] text-stone">{filtered.length} orders</span>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: "All orders", value: orders.length },
          { label: "In progress", value: orders.filter((o) => ["Confirmed", "Processing", "Packed", "Shipped", "Out for Delivery"].includes(o.status)).length },
          { label: "Return requests", value: orders.filter((o) => o.status === "Return Requested").length },
          { label: "Delivered", value: orders.filter((o) => o.status === "Delivered").length },
        ].map((stat) => (
          <div key={stat.label} className="border border-line bg-white px-3.5 py-3">
            <p className="text-[8.5px] uppercase tracking-[0.14em] text-stone">{stat.label}</p>
            <p className="mt-1.5 font-serif text-xl text-ink">{stat.value}</p>
          </div>
        ))}
      </div>

      <AdminTable head={["Order", "Customer", "Date", "Payment", "Total", "Status", ""]}>
        {filtered.map((order) => (
          <tr key={order.id} className="text-[11.5px]">
            <td className="px-4 py-3">
              <p className="font-medium text-ink">{order.id}</p>
              <p className="text-[9px] uppercase tracking-[0.1em] text-stone">{sourceOf(order)}</p>
            </td>
            <td className="px-4 py-3">
              <p className="text-charcoal">{order.customer.fullName}</p>
              <p className="text-[9.5px] text-stone">{order.customer.email}</p>
              <p className="text-[9.5px] text-stone">{order.customer.mobile}</p>
            </td>
            <td className="px-4 py-3 text-charcoal/60">{formatDate(order.createdAt)}</td>
            <td className="px-4 py-3">
              <p className="text-charcoal/70">{order.paymentMethod}</p>
              <p className="text-[9.5px] text-stone">{order.paymentStatus}</p>
            </td>
            <td className="px-4 py-3 text-ink">{formatINR(order.total)}</td>
            <td className="px-4 py-3">
              {isEditable(order) ? (
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order, e.target.value as OrderStatus)}
                  aria-label={`Update status for order ${order.id}`}
                  className="border border-line bg-white px-2 py-1 text-[10px] text-charcoal outline-none focus:border-gold"
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              ) : (
                <StatusPill status={order.status} />
              )}
              {order.trackingNumber && (
                <p className="mt-1 flex items-center gap-1 text-[8.5px] uppercase tracking-[0.1em] text-gold-dark">
                  <Truck size={10} /> {order.courierName || "Tracking added"}
                </p>
              )}
            </td>
            <td className="px-4 py-3">
              <button
                onClick={() => openOrder(order)}
                aria-label={`View order ${order.id}`}
                className="flex items-center gap-1.5 text-[9.5px] uppercase tracking-[0.1em] text-gold-dark hover:text-ink"
              >
                <Eye size={13} /> View
              </button>
            </td>
          </tr>
        ))}
        {filtered.length === 0 && (
          <tr>
            <td colSpan={7} className="px-4 py-10 text-center text-[12px] text-stone">
              No orders match these filters.
            </td>
          </tr>
        )}
      </AdminTable>

      <DemoNote className="mt-4">
        Orders placed in this browser are real records for this demo and updates persist.
        Sample orders are illustrative and read-only. No courier shipment is booked
        automatically — tracking fields are entered by your team.
      </DemoNote>

      <Modal
        open={Boolean(activeOrder)}
        onClose={() => setActiveOrder(null)}
        title="Order details"
        panelClassName="sm:max-w-2xl"
      >
        {activeOrder && (
          <div className="space-y-5 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
              <div>
                <p className="text-[9px] uppercase tracking-[0.16em] text-stone">Order</p>
                <p className="mt-0.5 text-[14px] font-medium text-ink">{activeOrder.id}</p>
                <p className="mt-0.5 text-[10.5px] text-stone">
                  {formatDate(activeOrder.createdAt)} · {sourceOf(activeOrder)}
                </p>
              </div>
              <StatusPill status={activeOrder.status} />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-[9px] uppercase tracking-[0.16em] text-stone">Customer</p>
                <p className="mt-1.5 text-[12px] text-ink">{activeOrder.customer.fullName}</p>
                <p className="text-[11px] text-charcoal/60">{activeOrder.customer.email}</p>
                <p className="text-[11px] text-charcoal/60">{activeOrder.customer.mobile}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.16em] text-stone">Delivery</p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-charcoal/65">
                  {activeOrder.customer.address}
                </p>
              </div>
            </div>

            <div className="divide-y divide-line/70 border-y border-line">
              {activeOrder.items.map((item) => (
                <div key={`${item.productId}-${item.size}`} className="flex items-center gap-3 py-3">
                  <ProductImage src={item.image} alt={item.name} label={item.name} className="h-14 w-12 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] text-ink">{item.name}</p>
                    <p className="text-[10px] text-stone">
                      {item.sku}{item.size ? ` · ${item.size}` : ""} · Qty {item.quantity}
                    </p>
                  </div>
                  <p className="text-[11.5px] text-charcoal">{formatINR(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="ml-auto max-w-xs space-y-1.5 text-[11.5px]">
              <div className="flex justify-between"><span className="text-stone">Subtotal</span><span>{formatINR(activeOrder.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-stone">Discount</span><span>− {formatINR(activeOrder.discount)}</span></div>
              <div className="flex justify-between"><span className="text-stone">Shipping</span><span>{activeOrder.shipping === 0 ? "Free" : formatINR(activeOrder.shipping)}</span></div>
              <div className="flex justify-between"><span className="text-stone">GST</span><span>{formatINR(activeOrder.tax)}</span></div>
              <div className="flex justify-between border-t border-line pt-1.5 text-[13px] text-ink"><span>Total</span><span>{formatINR(activeOrder.total)}</span></div>
            </div>

            {isEditable(activeOrder) ? (
              <>
                <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
                  <label htmlFor="order-status" className="text-[9.5px] uppercase tracking-[0.14em] text-stone">
                    Order status
                  </label>
                  <select
                    id="order-status"
                    value={activeOrder.status}
                    onChange={(e) => updateStatus(activeOrder, e.target.value as OrderStatus)}
                    className="h-9 border border-line bg-white px-2.5 text-[11px] outline-none focus:border-gold"
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <span className="text-[10px] text-stone">Saved to this browser.</span>
                </div>

                <form onSubmit={saveShipping} className="space-y-3 border-t border-line pt-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-ink">Shipping information</p>
                    <p className="mt-1 text-[10px] leading-relaxed text-stone">
                      Enter only details actually provided by your courier. Leave blank if unknown.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor="courier-name" className="field-label">Courier name</label>
                      <input
                        id="courier-name"
                        value={shipping.courierName}
                        onChange={(e) => setShipping({ ...shipping, courierName: e.target.value })}
                        className="field h-10 text-[12px]"
                      />
                    </div>
                    <div>
                      <label htmlFor="tracking-number" className="field-label">Tracking number</label>
                      <input
                        id="tracking-number"
                        value={shipping.trackNumber}
                        onChange={(e) => setShipping({ ...shipping, trackNumber: e.target.value })}
                        className="field h-10 text-[12px]"
                      />
                    </div>
                    <div>
                      <label htmlFor="tracking-url" className="field-label">Tracking URL</label>
                      <input
                        id="tracking-url"
                        value={shipping.trackingUrl}
                        onChange={(e) => setShipping({ ...shipping, trackingUrl: e.target.value })}
                        placeholder="https://…"
                        className="field h-10 text-[12px]"
                      />
                    </div>
                    <div>
                      <label htmlFor="estimated-delivery" className="field-label">Estimated delivery</label>
                      <input
                        id="estimated-delivery"
                        type="date"
                        value={shipping.estimatedDelivery}
                        onChange={(e) => setShipping({ ...shipping, estimatedDelivery: e.target.value })}
                        className="field h-10 text-[12px]"
                      />
                    </div>
                  </div>
                  <Button type="submit" size="sm" disabled={saving}>
                    <Save size={13} /> {saving ? "Saving…" : "Save shipping details"}
                  </Button>
                </form>
              </>
            ) : (
              <p className="border-t border-line pt-4 text-[11px] text-stone">
                This is labelled sample data. It is read-only and cannot be sent to a customer.
              </p>
            )}

            {activeOrder.statusHistory && activeOrder.statusHistory.length > 0 && (
              <div className="border-t border-line pt-4">
                <p className="text-[9px] uppercase tracking-[0.16em] text-stone">Status history</p>
                <ul className="mt-2 space-y-1.5">
                  {activeOrder.statusHistory.map((event, index) => (
                    <li key={`${event.status}-${index}`} className="flex justify-between gap-4 text-[11px]">
                      <span className="text-charcoal">{event.status}</span>
                      <span className="text-stone">{formatDate(event.at)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
