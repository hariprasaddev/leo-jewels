/**
 * REST client for the LEO JEWELS Java Spring Boot API.
 *
 * Endpoints expected on the backend (all JSON):
 *   POST /auth/register          { fullName, email, mobile, password }
 *   POST /auth/login             { identifier, password }
 *   POST /auth/forgot-password   { identifier }
 *   GET  /products               ?collection=&category=&q=&sort=&page=&size=
 *   GET  /products/:slug
 *   GET  /reviews?productId=
 *   POST /orders                 (JWT protected)
 *   GET  /orders/:id
 *   GET  /orders/track?orderId=&contact=
 *   PATCH /admin/orders/:id      (ADMIN role; status + shipping)
 *   POST /orders/:id/return
 *   POST /payments/razorpay/order
 *   POST /payments/razorpay/verify
 *   POST /consultations
 *   PATCH /consultations/:id     (ADMIN role)
 *   POST /newsletter
 *   POST /contact-enquiries
 *   POST /auth/change-password
 *
 * Nothing here is a real backend. Without VITE_API_BASE_URL the app runs in
 * clearly-labelled demo mode using in-browser sample data.
 */

export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "";
export const RAZORPAY_KEY_ID: string = import.meta.env.VITE_RAZORPAY_KEY_ID ?? "";

export const isApiConfigured = (): boolean => API_BASE_URL.trim().length > 0;
export const isRazorpayConfigured = (): boolean =>
  isApiConfigured() && RAZORPAY_KEY_ID.trim().length > 0;

const TOKEN_KEY = "leojewels.auth.token";

export function getAuthToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null): void {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* no-op */
  }
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  timeoutMs?: number;
}

export async function apiRequest<T>(
  path: string,
  { body, timeoutMs = 15000, headers, ...init }: RequestOptions = {}
): Promise<T> {
  if (!isApiConfigured()) {
    throw new ApiError(
      "The API is not configured. Set VITE_API_BASE_URL to connect the storefront to the backend.",
      0
    );
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  const token = getAuthToken();

  try {
    const response = await fetch(`${API_BASE_URL.replace(/\/$/, "")}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers ?? {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (!response.ok) {
      let message = `Request failed with status ${response.status}.`;
      try {
        const data = (await response.json()) as { message?: string; error?: string };
        message = data.message ?? data.error ?? message;
      } catch {
        /* non-JSON error body */
      }
      throw new ApiError(message, response.status);
    }

    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("The request timed out. Please try again.", 0);
    }
    throw new ApiError(
      "Could not reach the server. Check your connection or try again shortly.",
      0
    );
  } finally {
    window.clearTimeout(timeout);
  }
}
