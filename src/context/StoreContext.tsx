import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, Coupon, Product } from "@/types";
import { coupons } from "@/data/products";
import { useCatalogue } from "@/context/CatalogueContext";
import { readStorage, STORAGE_KEYS, writeStorage } from "@/lib/storage";

export interface CartLine {
  product: Product;
  quantity: number;
  size?: string;
}

interface Totals {
  subtotal: number;
  mrpTotal: number;
  productSavings: number;
  couponDiscount: number;
  shipping: number;
  tax: number;
  total: number;
}

interface StoreContextValue {
  cart: CartItem[];
  savedForLater: string[];
  wishlist: string[];
  coupon: Coupon | null;
  cartLines: CartLine[];
  cartCount: number;
  totals: Totals;
  freeShippingThreshold: number;
  addToCart: (productId: string, quantity?: number, size?: string) => void;
  updateQuantity: (productId: string, size: string | undefined, quantity: number) => void;
  removeFromCart: (productId: string, size?: string) => void;
  saveForLater: (productId: string, size?: string) => void;
  moveToCart: (productId: string) => void;
  removeSaved: (productId: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => boolean;
  isWishlisted: (productId: string) => boolean;
  applyCoupon: (code: string) => { ok: boolean; message: string };
  removeCoupon: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const { getProductById, settings } = useCatalogue();
  const FREE_SHIPPING_THRESHOLD = settings.freeShippingThreshold;
  const SHIPPING_FEE = settings.shippingFee;
  const GST_RATE = settings.gstRate;
  const [cart, setCart] = useState<CartItem[]>(() =>
    readStorage<CartItem[]>(STORAGE_KEYS.cart, [])
  );
  const [savedForLater, setSavedForLater] = useState<string[]>(() =>
    readStorage<string[]>(STORAGE_KEYS.savedForLater, [])
  );
  const [wishlist, setWishlist] = useState<string[]>(() =>
    readStorage<string[]>(STORAGE_KEYS.wishlist, [])
  );
  const [coupon, setCoupon] = useState<Coupon | null>(() =>
    readStorage<Coupon | null>(STORAGE_KEYS.coupon, null)
  );

  useEffect(() => writeStorage(STORAGE_KEYS.cart, cart), [cart]);
  useEffect(() => writeStorage(STORAGE_KEYS.savedForLater, savedForLater), [savedForLater]);
  useEffect(() => writeStorage(STORAGE_KEYS.wishlist, wishlist), [wishlist]);
  useEffect(() => writeStorage(STORAGE_KEYS.coupon, coupon), [coupon]);

  const addToCart = useCallback(
    (productId: string, quantity = 1, size?: string) => {
      setCart((current) => {
        const existing = current.find(
          (item) => item.productId === productId && item.size === size
        );
        if (existing) {
          return current.map((item) =>
            item === existing
              ? { ...item, quantity: Math.min(item.quantity + quantity, 10) }
              : item
          );
        }
        return [...current, { productId, quantity: Math.min(quantity, 10), size }];
      });
    },
    []
  );

  const updateQuantity = useCallback(
    (productId: string, size: string | undefined, quantity: number) => {
      if (quantity < 1) return;
      setCart((current) =>
        current.map((item) =>
          item.productId === productId && item.size === size
            ? { ...item, quantity: Math.min(quantity, 10) }
            : item
        )
      );
    },
    []
  );

  const removeFromCart = useCallback((productId: string, size?: string) => {
    setCart((current) =>
      current.filter((item) => !(item.productId === productId && item.size === size))
    );
  }, []);

  const saveForLater = useCallback((productId: string, size?: string) => {
    setCart((current) =>
      current.filter((item) => !(item.productId === productId && item.size === size))
    );
    setSavedForLater((current) =>
      current.includes(productId) ? current : [...current, productId]
    );
  }, []);

  const moveToCart = useCallback((productId: string) => {
    setCart((current) =>
      current.some((item) => item.productId === productId)
        ? current
        : [...current, { productId, quantity: 1 }]
    );
    setSavedForLater((current) => current.filter((id) => id !== productId));
  }, []);

  const removeSaved = useCallback((productId: string) => {
    setSavedForLater((current) => current.filter((id) => id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setCoupon(null);
  }, []);

  const toggleWishlist = useCallback(
    (productId: string) => {
      const added = !wishlist.includes(productId);
      setWishlist(
        added ? [...wishlist, productId] : wishlist.filter((id) => id !== productId)
      );
      return added;
    },
    [wishlist]
  );

  const isWishlisted = useCallback(
    (productId: string) => wishlist.includes(productId),
    [wishlist]
  );

  const applyCoupon = useCallback(
    (code: string) => {
      const found = coupons.find(
        (c) => c.code.toLowerCase() === code.trim().toLowerCase()
      );
      if (!found) {
        return { ok: false, message: "This coupon code is not valid." };
      }
      const subtotal = cart.reduce((sum, item) => {
        const product = getProductById(item.productId);
        return sum + (product ? product.price * item.quantity : 0);
      }, 0);
      if (subtotal < found.minOrder) {
        return {
          ok: false,
          message: `This coupon needs a minimum order of ₹${found.minOrder.toLocaleString("en-IN")}.`,
        };
      }
      setCoupon(found);
      return { ok: true, message: `${found.code} applied — ${found.description}.` };
    },
    [cart, getProductById]
  );

  const removeCoupon = useCallback(() => setCoupon(null), []);

  const cartLines = useMemo<CartLine[]>(
    () =>
      cart.flatMap((item) => {
        const product = getProductById(item.productId);
        return product ? [{ product, quantity: item.quantity, size: item.size }] : [];
      }),
    [cart, getProductById]
  );

  const totals = useMemo<Totals>(() => {
    const subtotal = cartLines.reduce((sum, l) => sum + l.product.price * l.quantity, 0);
    const mrpTotal = cartLines.reduce(
      (sum, l) => sum + (l.product.mrp ?? l.product.price) * l.quantity,
      0
    );
    const couponDiscount = coupon
      ? coupon.type === "percent"
        ? Math.round((subtotal * coupon.value) / 100)
        : Math.min(coupon.value, subtotal)
      : 0;
    const taxable = Math.max(subtotal - couponDiscount, 0);
    const shipping = taxable === 0 || taxable >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const tax = Math.round(taxable * GST_RATE);
    return {
      subtotal,
      mrpTotal,
      productSavings: mrpTotal - subtotal,
      couponDiscount,
      shipping,
      tax,
      total: taxable + shipping + tax,
    };
  }, [cartLines, coupon, FREE_SHIPPING_THRESHOLD, SHIPPING_FEE, GST_RATE]);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const value: StoreContextValue = {
    cart,
    savedForLater,
    wishlist,
    coupon,
    cartLines,
    cartCount,
    totals,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    addToCart,
    updateQuantity,
    removeFromCart,
    saveForLater,
    moveToCart,
    removeSaved,
    clearCart,
    toggleWishlist,
    isWishlisted,
    applyCoupon,
    removeCoupon,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
