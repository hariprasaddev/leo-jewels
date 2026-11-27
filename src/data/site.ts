import type { Banner, SectionImages, StoreSettings } from "@/types";
import { SECTION_IMAGES } from "./siteImages";

/** Default imagery for non-product storefront sections (admin-editable). */
export const sectionImages: SectionImages = {
  newArrivalsBanner: SECTION_IMAGES.newArrivals.banner,
  bridalBanner: SECTION_IMAGES.bridal.banner,
  aboutHero: SECTION_IMAGES.about.hero,
  aboutBrandStory: SECTION_IMAGES.about.brandStory,
  aboutCraftsmanship: SECTION_IMAGES.about.craftsmanship,
  aboutLifestyle: SECTION_IMAGES.about.lifestyle,
  contactBanner: SECTION_IMAGES.contact.banner,
};

export const banners: Banner[] = [
  {
    id: "bn-hero-1",
    placement: "hero",
    title: "Jewellery That Tells Your Story",
    subtitle:
      "Discover exquisite designs for celebrations, traditions and everyday elegance.",
    alt: "Model wearing a layered gold-tone necklace",
    image: "/images/necklace-bust.jpg",
    href: "/collections/new-arrivals",
    enabled: true,
  },
  {
    id: "bn-edit-1",
    placement: "editorial",
    title: "The Bridal Edit",
    subtitle: "Ceremony-ready sets, chosen for the photographs you will keep.",
    alt: "Bridal jewellery set with pearl details",
    image: "/images/bridal-shagun.jpg",
    href: "/bridal",
    enabled: true,
  },
  {
    id: "bn-edit-2",
    placement: "editorial",
    title: "Quiet Everyday Pieces",
    subtitle: "Fine chains, small studs and bands you can wear without thinking.",
    alt: "Minimal gold-tone jewellery arranged on a flat surface",
    image: "/images/flatlay.jpg",
    href: "/category/daily-wear",
    enabled: true,
  },
  {
    id: "bn-promo-1",
    placement: "promo",
    title: "Festive Styling Notes",
    subtitle: "Kundan-style chokers and chandelier earrings for the season.",
    alt: "Gold-tone festive jewellery set",
    image: "/images/gold-set.jpg",
    href: "/collections/festive",
    enabled: true,
  },
];

/**
 * Contact details, registration numbers and addresses are deliberately left
 * empty. They are configuration placeholders the owner must fill in from the
 * admin console; the storefront shows a clear "not configured" state instead
 * of inventing business details.
 */
export const storeSettings: StoreSettings = {
  brandName: "LEO JEWELS",
  tagline: "Where Elegance Meets Eternity",
  announcement: "Complimentary shipping on orders above ₹4,999",
  shippingMessage: "Carefully packed and dispatched within 2 business days.",
  careMessage: "New collections available — our customer care team is here to help.",
  supportEmail: "",
  supportPhone: "",
  whatsapp: "",
  supportMessage:
    "Questions about a piece, your order or a consultation? We are happy to help.",
  businessAddress: "",
  gstin: "",
  instagram: "",
  facebook: "",
  youtube: "",
  paymentMethods: "UPI, Credit Card, Debit Card, Net Banking, Cash on Delivery",
  freeShippingThreshold: 4999,
  shippingFee: 99,
  gstRate: 0.03,
};
