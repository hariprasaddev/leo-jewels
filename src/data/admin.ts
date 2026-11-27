import type { Order } from "@/types";

/**
 * SAMPLE ADMIN DATA — not real business data.
 * Every admin screen labels these figures as sample/demonstration data.
 */

export const SAMPLE_MONTHLY_REVENUE = [
  { month: "Jun", revenue: 428000, orders: 36 },
  { month: "Jul", revenue: 512000, orders: 44 },
  { month: "Aug", revenue: 486000, orders: 41 },
  { month: "Sep", revenue: 634000, orders: 52 },
  { month: "Oct", revenue: 728000, orders: 61 },
  { month: "Nov", revenue: 592000, orders: 48 },
];

export const SAMPLE_CUSTOMERS = [
  { id: "c-01", name: "Ananya Rao", email: "ananya.rao@example.com", mobile: "9876543210", orders: 4, spent: 128600, joined: "2026-03-12" },
  { id: "c-02", name: "Devika Sharma", email: "devika.sharma@example.com", mobile: "9823456781", orders: 2, spent: 44900, joined: "2026-05-08" },
  { id: "c-03", name: "Meera Krishnan", email: "meera.k@example.com", mobile: "9900112233", orders: 6, spent: 213500, joined: "2026-01-24" },
  { id: "c-04", name: "Priya Nair", email: "priya.nair@example.com", mobile: "9765432109", orders: 3, spent: 82900, joined: "2026-06-17" },
  { id: "c-05", name: "Rhea Menon", email: "rhea.menon@example.com", mobile: "9811223344", orders: 1, spent: 3290, joined: "2026-09-02" },
  { id: "c-06", name: "Kabir Ahmed", email: "kabir.ahmed@example.com", mobile: "9700556677", orders: 2, spent: 6680, joined: "2026-07-19" },
  { id: "c-07", name: "Lakshmi Venkat", email: "lakshmi.v@example.com", mobile: "9944556677", orders: 5, spent: 162400, joined: "2026-02-14" },
  { id: "c-08", name: "Nandini Trivedi", email: "nandini.t@example.com", mobile: "9866778899", orders: 2, spent: 8490, joined: "2026-08-30" },
];

const sampleCustomer = {
  fullName: "Ananya Rao",
  email: "ananya.rao@example.com",
  mobile: "9876543210",
  address: "12 Jubilee Hills Road, Hyderabad, Telangana, 500033",
};

export const SAMPLE_ORDERS: Order[] = [
  {
    id: "LJ-SAMPLE-1042",
    items: [
      { productId: "p-001", name: "Aurelia Chain Necklace", sku: "LJ-GN-1001", image: "/images/necklace-aurelia.jpg", price: 58900, quantity: 1 },
    ],
    subtotal: 58900,
    discount: 5890,
    shipping: 0,
    tax: 1590,
    total: 54600,
    status: "Delivered",
    paymentMethod: "UPI",
    paymentStatus: "Paid",
    createdAt: "2026-11-18T10:24:00.000Z",
    customer: sampleCustomer,
    isDemo: true,
  },
  {
    id: "LJ-SAMPLE-1043",
    items: [
      { productId: "p-004", name: "Aria Solitaire Ring", sku: "LJ-GR-2001", image: "/images/ring-diamond.jpg", price: 34900, quantity: 1, size: "14" },
      { productId: "p-009", name: "Lune Pearl Drop Earrings", sku: "LJ-ER-4001", image: "/images/earrings-pearl.jpg", price: 3290, quantity: 2 },
    ],
    subtotal: 41480,
    discount: 0,
    shipping: 0,
    tax: 1244,
    total: 42724,
    status: "Shipped",
    paymentMethod: "Credit Card",
    paymentStatus: "Paid",
    createdAt: "2026-11-20T08:15:00.000Z",
    customer: { ...sampleCustomer, fullName: "Meera Krishnan", email: "meera.k@example.com", mobile: "9900112233" },
    isDemo: true,
  },
  {
    id: "LJ-SAMPLE-1044",
    items: [
      { productId: "p-012", name: "Shagun Bridal Set", sku: "LJ-BR-5001", image: "/images/bridal-shagun.jpg", price: 24900, quantity: 1 },
    ],
    subtotal: 24900,
    discount: 2490,
    shipping: 0,
    tax: 672,
    total: 23082,
    status: "Packed",
    paymentMethod: "Net Banking",
    paymentStatus: "Paid",
    createdAt: "2026-11-21T14:40:00.000Z",
    customer: { ...sampleCustomer, fullName: "Priya Nair", email: "priya.nair@example.com", mobile: "9765432109" },
    isDemo: true,
  },
  {
    id: "LJ-SAMPLE-1045",
    items: [
      { productId: "p-015", name: "Kashi Silver Chain", sku: "LJ-SV-6001", image: "/images/necklace-silver.jpg", price: 3890, quantity: 1 },
    ],
    subtotal: 3890,
    discount: 0,
    shipping: 99,
    tax: 117,
    total: 4106,
    status: "Confirmed",
    paymentMethod: "Cash on Delivery",
    paymentStatus: "Not required",
    createdAt: "2026-11-22T09:05:00.000Z",
    customer: { ...sampleCustomer, fullName: "Kabir Ahmed", email: "kabir.ahmed@example.com", mobile: "9700556677" },
    isDemo: true,
  },
  {
    id: "LJ-SAMPLE-1046",
    items: [
      { productId: "p-007", name: "Noor Classic Bangle", sku: "LJ-GB-3001", image: "/images/bangle-noor.jpg", price: 46800, quantity: 2, size: "2.6" },
    ],
    subtotal: 93600,
    discount: 14040,
    shipping: 0,
    tax: 2369,
    total: 81929,
    status: "Confirmed",
    paymentMethod: "UPI",
    paymentStatus: "Paid",
    createdAt: "2026-11-22T17:32:00.000Z",
    customer: { ...sampleCustomer, fullName: "Lakshmi Venkat", email: "lakshmi.v@example.com", mobile: "9944556677" },
    isDemo: true,
  },
  {
    id: "LJ-SAMPLE-1047",
    items: [
      { productId: "p-020", name: "Sana Kundan-Style Choker", sku: "LJ-IM-7003", image: "/images/gold-set.jpg", price: 5490, quantity: 1 },
    ],
    subtotal: 5490,
    discount: 0,
    shipping: 0,
    tax: 165,
    total: 5655,
    status: "Cancelled",
    paymentMethod: "Credit Card",
    paymentStatus: "Refunded",
    createdAt: "2026-11-19T11:12:00.000Z",
    customer: { ...sampleCustomer, fullName: "Nandini Trivedi", email: "nandini.t@example.com", mobile: "9866778899" },
    isDemo: true,
  },
];

export const SAMPLE_COUPONS: {
  code: string;
  description: string;
  type: "Percent" | "Fixed";
  value: string;
  minOrder: number;
  active: boolean;
  uses: number;
}[] = [
  { code: "LEO10", description: "10% off orders above ₹4,999", type: "Percent", value: "10%", minOrder: 4999, active: true, uses: 84 },
  { code: "FESTIVE15", description: "15% off orders above ₹19,999", type: "Percent", value: "15%", minOrder: 19999, active: true, uses: 31 },
  { code: "WELCOME500", description: "₹500 off orders above ₹2,999", type: "Fixed", value: "₹500", minOrder: 2999, active: false, uses: 57 },
];

export const LOW_STOCK_THRESHOLD = 6;
