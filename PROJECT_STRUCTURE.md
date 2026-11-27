# LEO JEWELS — Project & Image Structure

Actual paths in this repository. The existing home-page images were **not moved, renamed or
deleted**: they remain flat in `public/images/` and every home reference still points there.

## Image folders

```
public/images/
├── necklace-aurelia.jpg              ← existing home images (unchanged)
├── necklace-solene.jpg
├── necklace-bust.jpg
├── chain-gold.jpg
├── ring-diamond.jpg
├── ring-gold.jpg
├── rings-stack.jpg
├── bangle-noor.jpg
├── earrings-pearl.jpg
├── earrings-gold.jpg
├── earrings-drop.jpg
├── bridal-shagun.jpg
├── bridal-white.jpg
├── flatlay.jpg
├── ring-silver.jpg
├── necklace-silver.jpg
├── gold-set.jpg
├── model-portrait.jpg
├── rings-hand.jpg
├── necklace-lux.jpg
│
├── new-arrivals/
│   ├── banner/new-arrivals-banner.jpg
│   └── products/…                    ← seed new-arrival shots
├── bridal/
│   ├── banner/bridal-banner.jpg
│   ├── collections/bridal-collection.jpg
│   └── products/bridal-set.jpg
├── collections/
│   ├── necklace-sets/    category.jpg + product shots
│   ├── earrings/         category.jpg + product shots
│   ├── bangles/          category.jpg + product shots
│   ├── bracelets/        category.jpg + product shots
│   ├── rings/            category.jpg + product shots
│   ├── pendant-sets/     category.jpg + product shots
│   ├── bridal-jewellery/ category.jpg + product shots
│   └── daily-wear/       category.jpg + product shots
├── about/
│   ├── brand-story/brand-story.jpg
│   ├── craftsmanship/craftsmanship.jpg
│   └── lifestyle/lifestyle.jpg
├── contact/
│   └── contact-banner/contact-banner.jpg
└── banners/
    ├── promotional/ best-sellers.jpg, trending.jpg, exclusive.jpg
    └── seasonal/    festive.jpg, bridal.jpg
```

### Where each section reads images

| Section | Source |
| --- | --- |
| Home page | `public/images/*.jpg` via `HOME_IMAGES`, `HERO_IMAGE`, `STORY_IMAGE`, `STORY_IMAGE_2` in `src/data/siteImages.ts` (paths unchanged) |
| Home banners | `src/data/site.ts` → `banners` (editable in Admin → Storefront Content) |
| New Arrivals | `src/data/siteImages.ts` default + `sectionImages.newArrivalsBanner` (admin override) |
| Bridal | `collections` data in `src/data/products.ts`; banner defaults to `public/images/bridal/banner/` and is overridable via `sectionImages.bridalBanner` in Admin → Storefront Content |
| Collections / categories | `CATEGORY_IMAGES` in `src/data/siteImages.ts`; category images are editable in Admin → Categories |
| Product photos | `public/images/collections/<category>/` for seed data; admin uploads are IndexedDB blobs referenced as `idb:<uuid>` |
| About Us | `SECTION_IMAGES.about` defaults overridden by `sectionImages.about*` (Admin → Storefront Content) |
| Contact | `SECTION_IMAGES.contact.banner`, overridable as `sectionImages.contactBanner` |
| Promotional/seasonal banners | `public/images/banners/…`, used as collection defaults and available to the banner editor |

`src/data/siteImages.ts` is the single mapping file. Components do not hardcode section paths.

## Where product data is managed

| Concern | Path |
| --- | --- |
| Seed catalogue (24 products, categories, collections, reviews, coupons) | `src/data/products.ts` |
| Seed banners, section images, store settings | `src/data/site.ts` |
| Seed legal pages | `src/data/policies.ts` |
| Runtime catalogue store (products, taxonomy, banners, section images, settings, policies) | `src/context/CatalogueContext.tsx` |
| Persistence keys / wrappers | `src/lib/storage.ts` |
| Browser image storage | `src/lib/imageStore.ts` (IndexedDB) |
| Admin product editor | `src/pages/admin/Products.tsx` |
| Admin category/collection editor | `src/pages/admin/CategoriesAdmin.tsx` |
| Admin banners + section images + settings | `src/pages/admin/Content.tsx` |
| Admin media library | `src/pages/admin/Media.tsx` |

Catalogue changes are written to `localStorage` (`leojewels.catalogue.v1`,
`leojewels.taxonomy.v1`, `leojewels.banners.v1`, `leojewels.sectionImages.v1`,
`leojewels.settings.v1`, `leojewels.policies.v1`) and appear on the storefront immediately.

Uploaded images are stored as blobs in IndexedDB and referenced by id. They are **not** written
into `public/images/` at runtime; files placed there manually are static assets served by Vite.

## Where admin authentication is configured

| Concern | Path |
| --- | --- |
| Local admin accounts, PBKDF2 hashing, roles, session | `src/lib/adminAuth.ts` |
| First-run setup and sign-in UI | `src/pages/admin/AdminLogin.tsx` |
| Route guard | `src/components/admin/AdminGuard.tsx` |
| Account management (email, password, add admin) | `src/pages/admin/Account.tsx` |
| Admin routes | `src/App.tsx` |
| Admin navigation / sign-out | `src/components/layout/AdminLayout.tsx` |

No admin password is hardcoded. The first owner account is created at `/admin/login` when the
browser has no admin account. Full details and production gaps: `ADMIN_SETUP.md`.

## Where database / API configuration lives

There is **no database or backend in this repository**. The frontend supports a documented
Spring Boot API:

- Environment template: `.env.example`
- Runtime config and REST client: `src/services/apiClient.ts`
  (`VITE_API_BASE_URL`, `VITE_RAZORPAY_KEY_ID`)
- Service contracts: `src/services/authService.ts`, `productService.ts`, `orderService.ts`,
  `paymentService.ts`, `consultationService.ts`, `newsletterService.ts`,
  `contactService.ts`
- Backend endpoint contract and Spring Security requirements: `BACKEND_INTEGRATION.md`

Without `VITE_API_BASE_URL`, the app runs in demo mode using browser storage. "Database
configuration" therefore means the API URL in `.env.local`, not a local SQL connection.

## Other key paths

```
src/
├── App.tsx                     routes (storefront, /admin/*, /admin/account)
├── main.tsx                    providers: Catalogue → Store → Auth → Toast
├── components/
│   ├── admin/                  AdminGuard, ImageManager, AdminUI
│   ├── layout/                 Navbar, Footer, AdminLayout, PageHero
│   ├── product/                product cards, ListingView, filters
│   └── ui/                     ProductImage, Modal, Button, Logo, DemoNote
├── context/                    Catalogue, Store (cart/wishlist), Auth, Toast
├── data/                       products, site, policies, siteImages, admin samples
├── hooks/                      useResolvedImage
├── lib/                        adminAuth, imageStore, storage, utils
├── pages/                      storefront pages (incl. Shop, BookConsultation, OrderTracking)
├── pages/admin/                dashboard, products, orders, consultations, content, media, account…
└── services/                   API client + auth, product, order, payment, consultation,
                                newsletter and contact service contracts
```

## Customer-facing routes added or extended

| Route | Purpose |
| --- | --- |
| `/shop` | All published jewellery, reusing the listing/filter component |
| `/new-arrivals` | Published products marked as new arrivals only |
| `/book-consultation` | Live video consultation request form |
| `/track-order` (and `/order-tracking`) | Order status timeline and real shipping details |
| `/account?tab=…` | Profile, orders, tracking, wishlist, addresses, consultations, returns, settings |
| `/admin/consultations` | Appointment approval, rescheduling, meeting links and availability |

## Configuration added for global features

| Setting | Where to edit | Storage |
| --- | --- | --- |
| Announcement messages (3 rotating) | Admin → Storefront Content → Store settings | `leojewels.settings.v1` |
| WhatsApp business number / support message | Admin → Storefront Content → Store settings | `leojewels.settings.v1` |
| Social links, payment methods | Admin → Storefront Content → Store settings | `leojewels.settings.v1` |
| Consultation slots / blocked dates | Admin → Consultation Bookings → Availability settings | `leojewels.consultationAvailability.v1` |
| Consultation meeting links | Admin → Consultation Bookings → Manage | `leojewels.consultations.v1` |
| Order status / courier / tracking / ETA | Admin → Orders & Tracking | `leojewels.orders.v1` |

The floating WhatsApp button renders on every customer-facing page **only after a real
business number is saved**. No placeholder number is invented.

Build commands: `npm run dev`, `npx tsc -b --pretty false`, `npm run build`.
