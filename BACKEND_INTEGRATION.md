# LEO JEWELS — Backend Integration Guide

The storefront currently runs in **clearly-labelled demo mode**. Customer accounts,
admin accounts, orders, consultations, newsletter signups and contact enquiries are
stored in the browser (localStorage / IndexedDB) when `VITE_API_BASE_URL` is not set.
That is not production-secure and must not be presented as a real e-commerce backend.

The preferred production stack is **Java Spring Boot + MySQL + Spring Security**.

## 1. Environment

Copy `.env.example` to `.env` and set:

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Spring Boot API origin, e.g. `https://api.leojewels.example` |
| `VITE_RAZORPAY_KEY_ID` | Public Razorpay key (checkout only; never a secret) |

Restart the dev server after changing environment variables.

Never put database passwords, JWT signing keys, Razorpay secret keys or admin
credentials in `VITE_*` variables — Vite inlines them into the public bundle.

## 2. Service modules and endpoints

All HTTP calls go through `src/services/apiClient.ts`, which attaches the JWT from
`leojewels.auth.token` and centralises errors. Each service falls back to local demo
storage when no API base URL is configured.

| Feature | Frontend service | Endpoints |
| --- | --- | --- |
| Customer auth | `services/authService.ts` | `POST /auth/register`, `/auth/login`, `/auth/forgot-password`, `/auth/change-password` |
| Products / inventory | `services/productService.ts` + catalogue context | `GET /products`, `/products/:slug` |
| Orders | `services/orderService.ts` | `POST /orders`, `GET /orders/track`, `PATCH /admin/orders/:id`, `POST /orders/:id/return` |
| Payments | `services/paymentService.ts` | `POST /payments/razorpay/order`, `/payments/razorpay/verify` |
| Consultations | `services/consultationService.ts` | `POST /consultations`, `PATCH /consultations/:id` |
| Newsletter | `services/newsletterService.ts` | `POST /newsletter` |
| Contact enquiries | `services/contactService.ts` | `POST /contact-enquiries` |
| Admin accounts | `lib/adminAuth.ts` (local only today) | Add `/admin/auth/*` and disable local bootstrap in production |

## 3. Required server-side authorization

Enforce these rules in Spring Security, not in React:

- `GET /products/**` and `POST /consultations`, `/newsletter`, `/contact-enquiries` are public.
- `POST /orders` requires an authenticated customer; the server recalculates prices,
  stock, tax, shipping and totals — never trust client totals.
- `GET /orders/**` returns only the authenticated customer's orders (or a guest lookup
  with exact order number + registered email/mobile, rate-limited).
- `PATCH /admin/orders/:id`, catalogue writes, consultation approvals and media writes
  require `ROLE_ADMIN` or `ROLE_OWNER`.
- Customer and admin tokens are separate; an admin token must never be accepted as a
  customer session or vice versa.
- Passwords are hashed with BCrypt/Argon2 on the server. The browser should only ever
  hold an opaque JWT, not a password hash.

## 4. Consultation double-booking

`POST /consultations` must enforce a unique active slot in the database, e.g. a unique
index on `(appointment_date, appointment_time)` for statuses that hold a slot
(`PENDING`, `APPROVED`, `RESCHEDULED`), or a transactional check returning HTTP 409.
The current client-side check is a UX convenience only.

Meeting links are supplied by an administrator (Google Meet / Zoom) and stored with the
booking. Do not generate fake meeting links or claim a video call is ready without one.

## 5. Order tracking

The customer tracking page reads the real order record. Shipping fields
(`trackingNumber`, `courierName`, `trackingUrl`, `estimatedDelivery`) are optional and
are only rendered when an administrator or a courier integration has supplied them.
Never synthesise tracking numbers, courier names or delivery dates.

Suggested courier integration: a server-side scheduled job or webhook updates order
status and shipping fields; the storefront simply reads them.

## 6. Data that must move server-side

| Data | Current demo location | Production target |
| --- | --- | --- |
| Customer accounts | `leojewels.demoAccounts.v1` (localStorage) | `customers` table + Spring Security |
| Admin accounts | `leojewels.admin.accounts.v1` (localStorage, PBKDF2) | `admin_users` table + roles |
| Orders | `leojewels.orders.v1` | `orders`, `order_items`, `order_status_history` |
| Consultations | `leojewels.consultations.v1` | `consultations` |
| Newsletter | `leojewels.newsletter.v1` | `newsletter_subscribers` + double opt-in |
| Enquiries | `leojewels.enquiries.v1` | `contact_enquiries` |
| Catalogue / banners | `leojewels.catalogue.v1`, `.banners.v1`, `.settings.v1` | content tables / CMS |
| Uploaded images | IndexedDB (`idb:` refs) | S3-compatible object storage or media service |

## 7. Demo restrictions to remove before launch

- Browser-local admin credential bootstrap and session.
- Browser-local customer passwords.
- Client-only stock and price calculations.
- Demo orders that are not transmitted anywhere.
- Local-only consultation approvals and newsletter signups.
- No live payment capture (Razorpay integration is intentionally incomplete).

Search the codebase for `DemoNote` and "Demo build" to find every user-facing disclosure.
