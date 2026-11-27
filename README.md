<<<<<<< HEAD
# LEO JEWELS — Premium Jewellery Storefront

A complete, responsive React + TypeScript + Tailwind storefront for a fictional Indian
jewellery house. Includes product discovery, product detail, wishlist, bag, multi-step
checkout, customer account and a protected admin console.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build
npm run preview
```

## What is real vs. demonstration

**Real, fully functional in the browser**

- Navigation, search, collection filters (category, material, price, availability), sorting and load-more
- Product detail gallery, variants, stock display, review sections, related products
- Wishlist, bag, saved-for-later, coupon codes (`LEO10`, `FESTIVE15`, `WELCOME500`), GST/shipping totals, localStorage persistence
- Global Shop mega-menu, shared header/footer and a floating WhatsApp support link (shown once a real business number is configured)
- Live video consultation request flow at `/book-consultation` with slot conflict prevention, plus admin approval/rescheduling/meeting links
- Order tracking at `/track-order` with the full status timeline and admin-maintained shipping details
- Route-protected customer account with profile editing, saved addresses, local order history, tracking, consultations, return requests and password settings
- Multi-step checkout with per-step validation
- Admin portal with product/inventory, order/tracking, consultation, customer, category/collection, review and coupon screens
- Admin catalogue editing that publishes to the storefront immediately: products, categories,
  collections, homepage banners, store settings and all six policy pages. Edits persist in
  this browser's localStorage; clearing the site's stored data restores the seed content.
- Image management from the admin console: multiple images per product, primary image,
  reorder/replace/remove, category images, collection and banner images, a media library,
  JPG/PNG/WebP validation and an 8 MB limit per file. Uploaded files are stored as blobs in
  IndexedDB and referenced by `idb:` ids — never embedded in product JSON.
- Image reference protection: an image used by any product, category, collection or banner
  cannot be deleted from the media library.

**Demonstration only — clearly labelled in the UI**

- The starting catalogue, reviews and admin analytics are sample data. No purity, hallmark or
  certification claims are invented for sample products; the product page states that these
  are confirmed by the brand at dispatch.
- Admin catalogue edits, settings, policies and uploaded images live only in the current
  browser's localStorage/IndexedDB. They are not shared between devices and are not written to
  a database. The Spring Boot API below remains the production source of truth.
- Business contact details, registered address and GSTIN are intentionally blank until the
  owner fills them in under Admin → Storefront Content. The storefront shows a clear "not
  configured" state instead of inventing them.
- Customer authentication runs in **demo mode** when no API is configured: accounts live in
  `localStorage`, are not secure, and must not use a real password.
- Admin access is a browser-local administrator account. No default credentials exist:
  the first visit to `/admin/login` creates the owner account, with PBKDF2-hashed passwords
  stored in `localStorage`. It is still not real security; production must use Spring Security
  and server-verified roles. See `ADMIN_SETUP.md` and `PROJECT_STRUCTURE.md`.
- No live payments. UPI/card/net banking are presented but blocked with an explicit
  "not configured" message. Cash on Delivery creates a locally stored demo order, not a
  real shipment or payment. No successful online payment is ever simulated.
- Newsletter subscriptions and contact enquiries are stored in this browser only; no email is sent. Production needs the backend plus an email provider.

## Backend contract (Java Spring Boot + JWT + MySQL + Razorpay)

Copy `.env.example` to `.env.local`, set `VITE_API_BASE_URL` and `VITE_RAZORPAY_KEY_ID`, and
provide these REST endpoints. Requests are JSON with `Authorization: Bearer <jwt>`.

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/auth/register` | `{ fullName, email, mobile, password }` → `{ user, token }` |
| POST | `/auth/login` | `{ identifier, password }` → `{ user, token }` |
| POST | `/auth/forgot-password` | `{ identifier }` → `{ message }` |
| POST | `/auth/change-password` | `{ currentPassword, newPassword }` |
| GET | `/products` | Product list |
| GET | `/products/:slug` | Single product |
| GET | `/reviews?productId=` | Product reviews |
| POST | `/orders` | Create order (JWT) |
| GET | `/orders/track?orderId=&contact=` | Order tracking |
| PATCH | `/admin/orders/:id` | Admin status + shipping updates |
| POST | `/orders/:id/return` | Customer return request |
| POST | `/consultations` | Book a consultation |
| PATCH | `/consultations/:id` | Approve/reschedule/cancel (admin) |
| POST | `/newsletter` | Newsletter subscription |
| POST | `/contact-enquiries` | Contact form submission |
| POST | `/payments/razorpay/order` | Server-created Razorpay order |
| POST | `/payments/razorpay/verify` | Server-side signature verification |

Payment must only be marked paid after the backend verifies the Razorpay signature.
The frontend client is in `src/services/`; configuration lives only in environment variables.
Full security requirements and data-migration notes: `BACKEND_INTEGRATION.md`.

## Structure

```
src/
  components/    layout, product, auth, admin, marketing, ui
  context/       catalogue (products/categories/banners/policies/settings), store, auth, toasts
  data/          seed catalogue, reviews, coupons, policies, banners, admin fixtures
  hooks/         product filtering, resolved image references
  lib/           formatting, storage, IndexedDB image store, utilities
  pages/         storefront + auth + admin routes
  services/      API client, auth, products, orders, payments
  types/         shared domain types
```

Seed product photography is bundled locally in `public/images/`, so the storefront never
hotlinks product images. Admin-uploaded images are stored in IndexedDB. A branded placeholder
is shown when an image is missing or unavailable. Replace the seed photography with licensed
brand photography before production.
=======
# leo-jewels
>>>>>>> 7601561c83e2107ba62bb5b1cebdf8faa8ed96c4
