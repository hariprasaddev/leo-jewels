import type { Address, CartItem, Customer, Order, OrderItem, Product } from "@/types";
import { generateId } from "@/lib/utils";
import { readStorage, STORAGE_KEYS, writeStorage } from "@/lib/storage";
import { apiRequest, isApiConfigured } from "./apiClient";
import { products } from "@/data/products";
import { authService } from "./authService";

export interface CheckoutPayload {
  customer: Customer;
  address: Address;
  items: CartItem[];
  paymentMethod: string;
  couponCode?: string;
  totals: {
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    total: number;
  };
}

function localOrders(): Order[] {
  return readStorage<Order[]>(STORAGE_KEYS.orders, []);
}

function addressLine(address: Address): string {
  return [address.line1, address.line2, address.city, address.state, address.pincode]
    .filter(Boolean)
    .join(", ");
}

function toOrderItems(items: CartItem[], catalogue: Product[]): OrderItem[] {
  return items.flatMap((item) => {
    const product = catalogue.find((p: Product) => p.id === item.productId);
    if (!product) return [];
    return [
      {
        productId: product.id,
        name: product.name,
        sku: product.sku,
        image: product.images[0],
        price: product.price,
        quantity: item.quantity,
        size: item.size,
      },
    ];
  });
}

export const orderService = {
  async placeOrder(
    payload: CheckoutPayload,
    catalogue: Product[] = products
  ): Promise<Order> {
    if (isApiConfigured()) {
      return apiRequest<Order>("/orders", {
        method: "POST",
        body: payload,
      });
    }

    // Demo orders only. No payment is captured and no fulfilment occurs.
    const order: Order = {
      id: generateId("LJ"),
      items: toOrderItems(payload.items, catalogue),
      ...payload.totals,
      status: "Confirmed",
      paymentMethod: payload.paymentMethod,
      paymentStatus:
        payload.paymentMethod === "Cash on Delivery" ? "Not required" : "Pending",
      createdAt: new Date().toISOString(),
      customer: {
        fullName: payload.customer.fullName,
        email: payload.customer.email,
        mobile: payload.customer.mobile,
        address: addressLine(payload.address),
      },
      statusHistory: [
        { status: "Confirmed", at: new Date().toISOString(), note: "Order placed" },
      ],
      isDemo: true,
    };
    writeStorage(STORAGE_KEYS.orders, [order, ...localOrders()]);
    return order;
  },

  myOrders(): Order[] {
    const session = authService.restore();
    if (!session) return [];
    return localOrders().filter(
      (o) => o.customer.email.toLowerCase() === session.user.email.toLowerCase()
    );
  },

  allOrders(): Order[] {
    return localOrders();
  },

  async track(orderId: string, contact: string): Promise<Order | undefined> {
    if (isApiConfigured()) {
      return apiRequest<Order>(
        `/orders/track?orderId=${encodeURIComponent(orderId)}&contact=${encodeURIComponent(contact)}`
      );
    }
    const id = orderId.trim().toLowerCase();
    const key = contact.trim().toLowerCase();
    return localOrders().find(
      (o) =>
        o.id.toLowerCase() === id &&
        (o.customer.email.toLowerCase() === key ||
          o.customer.mobile === key ||
          o.customer.mobile.toLowerCase() === key)
    );
  },

  /**
   * Update a real (local or API) order. Only fields supplied by the
   * administrator are written — courier tracking is never fabricated.
   */
  async updateOrder(
    id: string,
    patch: Partial<
      Pick<
        Order,
        | "status"
        | "trackingNumber"
        | "courierName"
        | "trackingUrl"
        | "estimatedDelivery"
        | "paymentStatus"
      >
    >
  ): Promise<Order | undefined> {
    if (isApiConfigured()) {
      return apiRequest<Order>(`/admin/orders/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: patch,
      });
    }

    const orders = localOrders();
    const existing = orders.find((order) => order.id === id);
    if (!existing) return undefined;

    const now = new Date().toISOString();
    const statusChanged = patch.status && patch.status !== existing.status;
    const updated: Order = {
      ...existing,
      ...patch,
      statusHistory: statusChanged
        ? [...(existing.statusHistory ?? []), { status: patch.status!, at: now }]
        : existing.statusHistory,
    };
    writeStorage(STORAGE_KEYS.orders, orders.map((order) => (order.id === id ? updated : order)));
    return updated;
  },

  async requestReturn(orderId: string, reason?: string): Promise<Order | undefined> {
    if (isApiConfigured()) {
      return apiRequest<Order>(`/orders/${encodeURIComponent(orderId)}/return`, {
        method: "POST",
        body: { reason },
      });
    }
    const orders = localOrders();
    const existing = orders.find((order) => order.id === orderId);
    if (!existing) return undefined;
    if (existing.status !== "Delivered") {
      throw new Error("A return can only be requested after an order is delivered.");
    }
    const now = new Date().toISOString();
    const updated: Order = {
      ...existing,
      status: "Return Requested",
      statusHistory: [
        ...(existing.statusHistory ?? []),
        { status: "Return Requested", at: now, note: reason },
      ],
    };
    writeStorage(STORAGE_KEYS.orders, orders.map((order) => (order.id === orderId ? updated : order)));
    return updated;
  },
};
