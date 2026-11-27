/**
 * Shared domain types for the LEO JEWELS storefront.
 *
 * Category and collection slugs are plain strings because the administrator can
 * create new ones at runtime. The seeded taxonomy is defined in `data/products.ts`.
 */

export type CategorySlug = string;
export type CollectionSlug = string;

export interface Category {
  slug: string;
  name: string;
  image: string;
  blurb: string;
  featured?: boolean;
}

export interface Collection {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  intro: string;
  banner: string;
}

export interface Product {
  id: string;
  sku: string;
  slug: string;
  name: string;
  description: string;
  details: string[];
  category: CategorySlug;
  collections: CollectionSlug[];
  price: number;
  mrp?: number;
  /** Image references. The first entry is the primary product image. */
  images: string[];
  imageAlts?: string[];
  material: string;
  colour?: string;
  plating?: string;
  stone?: string;
  dimensions?: string;
  weightGrams?: number;
  sizes?: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  isFeatured?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  isTrending?: boolean;
  /** Unpublished products stay in the admin catalogue but not on the storefront. */
  published?: boolean;
  createdAt: string;
  tags: string[];
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
}

export interface CartItem {
  productId: string;
  quantity: number;
  size?: string;
}

export interface WishlistEntry {
  productId: string;
  addedAt: string;
}

export interface Address {
  id: string;
  label: string;
  fullName: string;
  mobile: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface Customer {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  sku: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
}

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Processing"
  | "Packed"
  | "Shipped"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled"
  | "Return Requested"
  | "Returned"
  | "Refunded";

export interface OrderStatusEvent {
  status: OrderStatus;
  at: string;
  note?: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: "Pending" | "Paid" | "Refunded" | "Not required";
  createdAt: string;
  customer: {
    fullName: string;
    email: string;
    mobile: string;
    address: string;
  };
  /**
   * Fulfilment details are supplied by the administrator (or a courier API when
   * one is connected). They are never generated automatically.
   */
  trackingNumber?: string;
  courierName?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  statusHistory?: OrderStatusEvent[];
  isDemo: boolean;
}

export type ConsultationType =
  | "Bridal Jewellery Consultation"
  | "Product Selection Assistance"
  | "Custom Jewellery Enquiry"
  | "General Jewellery Consultation";

export type ConsultationStatus =
  | "Pending"
  | "Approved"
  | "Rescheduled"
  | "Completed"
  | "Cancelled"
  | "Rejected";

export interface ConsultationBooking {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  date: string;
  time: string;
  type: ConsultationType;
  category: string;
  productReference?: string;
  notes?: string;
  status: ConsultationStatus;
  meetingLink?: string;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConsultationAvailability {
  /** Dates (YYYY-MM-DD) the administrator has blocked. */
  blockedDates: string[];
  /** Time slots offered in 24-hour HH:mm form. */
  slots: string[];
}

export interface NewsletterSubscription {
  id: string;
  email: string;
  createdAt: string;
}

export interface Coupon {
  code: string;
  type: "percent" | "fixed";
  value: number;
  minOrder: number;
  description: string;
}

/** Homepage / campaign imagery managed from the admin console. */
export interface Banner {
  id: string;
  placement: "hero" | "editorial" | "promo";
  title: string;
  subtitle: string;
  alt: string;
  image: string;
  href: string;
  enabled: boolean;
}

export interface PolicySection {
  heading: string;
  body: string[];
  list?: string[];
}

export type PolicyKind =
  | "terms"
  | "privacy"
  | "shipping"
  | "returns"
  | "cancellation"
  | "payment";

export interface PolicyPage {
  kind: PolicyKind;
  title: string;
  eyebrow: string;
  description: string;
  updated: string;
  sections: PolicySection[];
}

/** Imagery for storefront sections that are not products, categories or banners. */
export type SectionImageKey =
  | "newArrivalsBanner"
  | "bridalBanner"
  | "aboutHero"
  | "aboutBrandStory"
  | "aboutCraftsmanship"
  | "aboutLifestyle"
  | "contactBanner";

export type SectionImages = Record<SectionImageKey, string>;

/** Business details are configuration placeholders until the owner supplies them. */
export interface StoreSettings {
  brandName: string;
  tagline: string;
  announcement: string;
  shippingMessage: string;
  /** Third rotating announcement, e.g. customer assistance hours. */
  careMessage: string;
  supportEmail: string;
  supportPhone: string;
  /** WhatsApp business number in international format, digits only (e.g. 919876543210). */
  whatsapp: string;
  supportMessage: string;
  businessAddress: string;
  gstin: string;
  instagram: string;
  facebook: string;
  youtube: string;
  /** Comma-separated payment methods actually enabled for the store. */
  paymentMethods: string;
  freeShippingThreshold: number;
  shippingFee: number;
  gstRate: number;
}
