/**
 * Central image configuration.
 *
 * HOME_IMAGES points at the original flat files in `public/images/`. Those
 * files and paths are intentionally preserved: the existing home page must keep
 * loading exactly as it did. Do not move or rename them.
 *
 * Every other section reads from its own folder under `public/images/`.
 * When an image is missing, the shared <ProductImage> component renders a
 * labelled placeholder rather than a broken image.
 */

/** Original, unchanged home-page artwork (flat files under public/images/). */
export const HOME_IMAGES = {
  necklaceAurelia: "/images/necklace-aurelia.jpg",
  necklaceSolene: "/images/necklace-solene.jpg",
  necklaceBust: "/images/necklace-bust.jpg",
  chainGold: "/images/chain-gold.jpg",
  ringDiamond: "/images/ring-diamond.jpg",
  ringGold: "/images/ring-gold.jpg",
  ringsStack: "/images/rings-stack.jpg",
  bangle: "/images/bangle-noor.jpg",
  earringsPearl: "/images/earrings-pearl.jpg",
  earringsGold: "/images/earrings-gold.jpg",
  earringsDrop: "/images/earrings-drop.jpg",
  bridal: "/images/bridal-shagun.jpg",
  bridalWhite: "/images/bridal-white.jpg",
  flatlay: "/images/flatlay.jpg",
  ringSilver: "/images/ring-silver.jpg",
  necklaceSilver: "/images/necklace-silver.jpg",
  goldSet: "/images/gold-set.jpg",
  model: "/images/model-portrait.jpg",
  ringsHand: "/images/rings-hand.jpg",
  necklaceLux: "/images/necklace-lux.jpg",
} as const;

/** Home fallbacks — these exact paths must stay unchanged. */
export const HERO_IMAGE = HOME_IMAGES.necklaceBust;
export const STORY_IMAGE = HOME_IMAGES.necklaceAurelia;
export const STORY_IMAGE_2 = HOME_IMAGES.bridal;

export const SECTION_IMAGES = {
  newArrivals: {
    banner: "/images/new-arrivals/banner/new-arrivals-banner.jpg",
    product: "/images/new-arrivals/products/solene-pendant-necklace.jpg",
  },
  bridal: {
    banner: "/images/bridal/banner/bridal-banner.jpg",
    collection: "/images/bridal/collections/bridal-collection.jpg",
    product: "/images/bridal/products/bridal-set.jpg",
  },
  about: {
    hero: "/images/about/lifestyle/lifestyle.jpg",
    brandStory: "/images/about/brand-story/brand-story.jpg",
    craftsmanship: "/images/about/craftsmanship/craftsmanship.jpg",
    lifestyle: "/images/about/lifestyle/lifestyle.jpg",
  },
  contact: {
    banner: "/images/contact/contact-banner/contact-banner.jpg",
  },
  promotional: {
    bestSellers: "/images/banners/promotional/best-sellers.jpg",
    trending: "/images/banners/promotional/trending.jpg",
    exclusive: "/images/banners/promotional/exclusive.jpg",
  },
  seasonal: {
    festive: "/images/banners/seasonal/festive.jpg",
    bridal: "/images/banners/seasonal/bridal.jpg",
  },
} as const;

/**
 * One photograph per seeded category. Every path is an existing local file.
 *
 * Two folders ship imagery that does not match their name (the bracelets
 * folder contains bangles, and the only pendant-set photograph lives in the
 * daily-wear folder), so the correct photograph is referenced in place rather
 * than moving, renaming or duplicating any existing asset.
 */
export const CATEGORY_IMAGES: Record<string, string> = {
  "necklace-sets": "/images/collections/necklace-sets/category.jpg",
  earrings: "/images/collections/earrings/category.jpg",
  bangles: "/images/collections/bangles/bangle-noor.jpg",
  bracelets: "/images/collections/bangles/category.jpg",
  rings: "/images/collections/rings/rings-stack.jpg",
  "bridal-jewellery": "/images/collections/bridal-jewellery/category.jpg",
  "pendant-sets": "/images/collections/daily-wear/necklace-solene.jpg",
  "daily-wear": "/images/collections/daily-wear/flatlay.jpg",
};

/**
 * Shop mega-menu categories.
 *
 * The navigation intentionally owns its own slug → folder → route mapping so a
 * category tile can never point at a missing image, a stale admin-saved path or
 * the wrong collection. Every image below exists locally under
 * public/images/collections/<slug>/category.jpg.
 */
export interface ShopCategoryLink {
  slug: string;
  name: string;
  blurb: string;
  image: string;
  to: string;
}

export const SHOP_CATEGORIES: ShopCategoryLink[] = [
  {
    slug: "necklace-sets",
    name: "Necklace Sets",
    blurb: "Necklaces and matched sets",
    image: CATEGORY_IMAGES["necklace-sets"],
    to: "/category/necklace-sets",
  },
  {
    slug: "earrings",
    name: "Earrings",
    blurb: "Studs, hoops and drops",
    image: CATEGORY_IMAGES.earrings,
    to: "/category/earrings",
  },
  {
    slug: "bangles",
    name: "Bangles",
    blurb: "Classic silhouettes to stack",
    image: CATEGORY_IMAGES.bangles,
    to: "/category/bangles",
  },
  {
    slug: "bracelets",
    name: "Bracelets",
    blurb: "Fine links and charms",
    image: CATEGORY_IMAGES.bracelets,
    to: "/category/bracelets",
  },
  {
    slug: "rings",
    name: "Rings",
    blurb: "Bands, solitaires and stacks",
    image: CATEGORY_IMAGES.rings,
    to: "/category/rings",
  },
  {
    slug: "bridal-jewellery",
    name: "Bridal Jewellery",
    blurb: "Ceremony-ready sets",
    image: CATEGORY_IMAGES["bridal-jewellery"],
    to: "/category/bridal-jewellery",
  },
  {
    slug: "pendant-sets",
    name: "Pendant Sets",
    blurb: "Single stones with earrings",
    image: CATEGORY_IMAGES["pendant-sets"],
    to: "/category/pendant-sets",
  },
  {
    slug: "daily-wear",
    name: "Daily Wear",
    blurb: "Light pieces for every day",
    image: CATEGORY_IMAGES["daily-wear"],
    to: "/category/daily-wear",
  },
];

/** Secondary links shown beneath the mega-menu category grid. */
export const SHOP_MENU_LINKS = [
  { label: "All Jewellery", to: "/shop" },
  { label: "New Arrivals", to: "/new-arrivals" },
  { label: "Bridal Collection", to: "/collections/bridal" },
  { label: "Best Sellers", to: "/collections/best-sellers" },
  { label: "Daily Wear", to: "/category/daily-wear" },
  { label: "Track Your Order", to: "/track-order" },
];

/** Resolve a category tile image, preferring the configured local photograph. */
export function shopCategoryImage(slug: string): string | undefined {
  return CATEGORY_IMAGES[slug];
}

/**
 * Seed product photos live under their category folder. Admin-uploaded images
 * use `idb:` references and are never routed through this helper.
 */
export function categoryProductImage(category: string, ref: string): string {
  if (!ref.startsWith("/images/")) return ref;
  const file = ref.split("/").pop();
  if (!file || !CATEGORY_IMAGES[category]) return ref;
  return `/images/collections/${category}/${file}`;
}
