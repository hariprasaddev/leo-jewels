import { apiRequest, isRazorpayConfigured, RAZORPAY_KEY_ID } from "./apiClient";
import type { Order } from "@/types";

interface RazorpayOrderResponse {
  razorpayOrderId: string;
  amount: number;
  currency: string;
}

export class PaymentNotConfiguredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentNotConfiguredError";
  }
}

/**
 * Razorpay wiring is intentionally incomplete until a backend exists.
 * A real flow requires:
 *   1. POST /payments/razorpay/order  → server creates the Razorpay order
 *   2. Razorpay Checkout on the client with the public key
 *   3. POST /payments/razorpay/verify → server verifies the HMAC signature
 * Never mark an order paid from the client alone.
 */
export const paymentService = {
  isConfigured: isRazorpayConfigured,

  async createRazorpayOrder(orderId: string): Promise<RazorpayOrderResponse> {
    if (!isRazorpayConfigured()) {
      throw new PaymentNotConfiguredError(
        "Razorpay is not configured. Add VITE_API_BASE_URL and VITE_RAZORPAY_KEY_ID, then create the order and verify payment on the Spring Boot backend. No payment has been taken."
      );
    }
    return apiRequest<RazorpayOrderResponse>("/payments/razorpay/order", {
      method: "POST",
      body: { orderId, keyId: RAZORPAY_KEY_ID },
    });
  },

  async openCheckout(order: Order): Promise<never> {
    if (!isRazorpayConfigured()) {
      throw new PaymentNotConfiguredError(
        "Card, UPI and net banking are not connected. This build cannot take online payments. Please choose Cash on Delivery or connect the payment backend."
      );
    }
    await this.createRazorpayOrder(order.id);
    throw new PaymentNotConfiguredError(
      "Razorpay order created, but this frontend build has no Razorpay Checkout script or server verification. Complete the backend integration before accepting live payments."
    );
  },
};
