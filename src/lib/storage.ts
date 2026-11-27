export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Storage may be unavailable (private mode / quota). Fail silently. */
  }
}

export function removeStorage(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* no-op */
  }
}

export const STORAGE_KEYS = {
  cart: "leojewels.cart.v1",
  savedForLater: "leojewels.saved.v1",
  wishlist: "leojewels.wishlist.v1",
  coupon: "leojewels.coupon.v1",
  session: "leojewels.session.v1",
  addresses: "leojewels.addresses.v1",
  orders: "leojewels.orders.v1",
  recentSearches: "leojewels.searches.v1",
  adminSession: "leojewels.admin.session.v1",
  catalogue: "leojewels.catalogue.v1",
  taxonomy: "leojewels.taxonomy.v1",
  banners: "leojewels.banners.v1",
  policies: "leojewels.policies.v1",
  settings: "leojewels.settings.v1",
  sectionImages: "leojewels.sectionImages.v1",
  consultations: "leojewels.consultations.v1",
  consultationAvailability: "leojewels.consultationAvailability.v1",
  newsletter: "leojewels.newsletter.v1",
} as const;
