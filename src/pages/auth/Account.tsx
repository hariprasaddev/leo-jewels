import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  User,
  MapPin,
  Package,
  Heart,
  LogOut,
  Plus,
  Trash2,
  Pencil,
  Check,
  ArrowRight,
  Truck,
  Video,
  RotateCcw,
  Settings,
  Lock,
  ExternalLink,
} from "lucide-react";
import type { Address, ConsultationBooking, Order } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";
import { useToast } from "@/context/ToastContext";
import { DemoNote } from "@/components/ui/DemoNote";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductImage } from "@/components/ui/ProductImage";
import { Button } from "@/components/ui/Button";
import { useCatalogue } from "@/context/CatalogueContext";
import { orderService } from "@/services/orderService";
import { consultationService } from "@/services/consultationService";
import { generateId, formatDate, formatINR, cn, isValidIndianMobile } from "@/lib/utils";
import { readStorage, STORAGE_KEYS, writeStorage } from "@/lib/storage";

type Tab =
  | "profile"
  | "addresses"
  | "orders"
  | "track"
  | "wishlist"
  | "consultations"
  | "returns"
  | "settings";

const TABS: { key: Tab; label: string; icon: typeof User }[] = [
  { key: "profile", label: "My Profile", icon: User },
  { key: "orders", label: "My Orders", icon: Package },
  { key: "track", label: "Track Orders", icon: Truck },
  { key: "wishlist", label: "My Wishlist", icon: Heart },
  { key: "addresses", label: "Saved Addresses", icon: MapPin },
  { key: "consultations", label: "Consultations", icon: Video },
  { key: "returns", label: "Return Requests", icon: RotateCcw },
  { key: "settings", label: "Account Settings", icon: Settings },
];

const EMPTY_ADDRESS: Omit<Address, "id"> = {
  label: "Home",
  fullName: "",
  mobile: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
};

export function Account() {
  const { user, logout, updateProfile, changePassword, isDemo } = useAuth();
  const { wishlist } = useStore();
  const { notify } = useToast();
  const { getProductById } = useCatalogue();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab") as Tab | null;
  const activeTab: Tab =
    requestedTab && TABS.some((tab) => tab.key === requestedTab)
      ? requestedTab
      : "profile";

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [mobile, setMobile] = useState(user?.mobile ?? "");
  const [profileError, setProfileError] = useState("");
  const [addresses, setAddresses] = useState<Address[]>(() =>
    readStorage<Address[]>(STORAGE_KEYS.addresses, [])
  );
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addressDraft, setAddressDraft] = useState<Omit<Address, "id">>(EMPTY_ADDRESS);
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [consultations, setConsultations] = useState<ConsultationBooking[]>([]);
  const [returnOrder, setReturnOrder] = useState<Order | null>(null);
  const [returnReason, setReturnReason] = useState("");
  const [returnError, setReturnError] = useState("");
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);

  useEffect(() => {
    document.title = "My Account — LEO JEWELS";
  }, []);

  useEffect(() => {
    if (["orders", "track", "returns"].includes(activeTab)) {
      setOrders(orderService.myOrders());
    }
    if (activeTab === "consultations") {
      setConsultations(consultationService.forEmail(user?.email ?? ""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.addresses, addresses);
  }, [addresses]);

  const wishlistProducts = useMemo(
    () => wishlist.flatMap((id) => {
      const product = getProductById(id);
      return product ? [product] : [];
    }),
    [wishlist, getProductById]
  );

  if (!user) return null;

  const initials = user.fullName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName.trim().length < 2) {
      setProfileError("Enter your full name.");
      return;
    }
    if (!isValidIndianMobile(mobile)) {
      setProfileError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    setProfileError("");
    updateProfile({ fullName: fullName.trim(), mobile: mobile.trim() });
    notify("Profile updated.");
  };

  const openAddressModal = (address?: Address) => {
    setAddressDraft(address ? { ...address } : { ...EMPTY_ADDRESS, fullName: user.fullName, mobile: user.mobile });
    setAddressErrors({});
    setAddressModalOpen(true);
  };

  const saveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (addressDraft.fullName.trim().length < 2) errors.fullName = "Enter the recipient's name.";
    if (!isValidIndianMobile(addressDraft.mobile)) errors.mobile = "Enter a valid 10-digit mobile number.";
    if (addressDraft.line1.trim().length < 5) errors.line1 = "Enter the street address.";
    if (!addressDraft.city.trim()) errors.city = "Enter the city.";
    if (!addressDraft.state.trim()) errors.state = "Enter the state.";
    if (!/^[1-9]\d{5}$/.test(addressDraft.pincode.trim())) errors.pincode = "Enter a valid 6-digit PIN code.";
    setAddressErrors(errors);
    if (Object.keys(errors).length) return;

    const editingId = (addressDraft as Address).id;
    if (editingId) {
      setAddresses((current) =>
        current.map((a) => (a.id === editingId ? ({ ...addressDraft, id: editingId } as Address) : a))
      );
      notify("Address updated.");
    } else {
      setAddresses((current) => [
        ...current,
        { ...addressDraft, id: generateId("addr"), isDefault: current.length === 0 },
      ]);
      notify("Address saved.");
    }
    setAddressModalOpen(false);
  };

  const setDefault = (id: string) => {
    setAddresses((current) => current.map((a) => ({ ...a, isDefault: a.id === id })));
    notify("Default address updated.", "info");
  };

  const submitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnOrder) return;
    if (returnReason.trim().length < 10) {
      setReturnError("Tell us briefly why you would like to return this order (at least 10 characters).");
      return;
    }
    try {
      const updated = await orderService.requestReturn(returnOrder.id, returnReason.trim());
      if (updated) {
        setOrders((current) => current.map((order) => (order.id === updated.id ? updated : order)));
      }
      notify("Return request submitted. Our care team will contact you.", "info");
      setReturnOrder(null);
      setReturnReason("");
      setReturnError("");
    } catch (error) {
      setReturnError(error instanceof Error ? error.message : "Unable to submit this request.");
    }
  };

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.next.length < 8) {
      setPasswordError("Use at least 8 characters for your new password.");
      return;
    }
    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordError("The new passwords do not match.");
      return;
    }
    setPasswordError("");
    try {
      await changePassword(passwordForm.current, passwordForm.next);
      setPasswordForm({ current: "", next: "", confirm: "" });
      setPasswordSaved(true);
      window.setTimeout(() => setPasswordSaved(false), 2500);
      notify("Password updated.");
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : "Unable to update password.");
    }
  };

  return (
    <div className="container-lux py-10 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-8">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink font-serif text-xl text-gold">
            {initials}
          </span>
          <div>
            <p className="eyebrow">My Account</p>
            <h1 className="mt-1 font-serif text-3xl text-ink">Hello, {user.fullName.split(" ")[0]}</h1>
            <p className="mt-0.5 text-[11.5px] text-stone">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            notify("You have been signed out.", "info");
            navigate("/");
          }}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-charcoal/60 hover:text-ink"
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>

      <div className="grid gap-8 pt-8 lg:grid-cols-[210px_1fr] lg:gap-12">
        <aside>
          <nav className="flex gap-1 overflow-x-auto border-b border-line pb-2 no-scrollbar lg:flex-col lg:gap-0 lg:border-b-0 lg:pb-0">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSearchParams({ tab: key })}
                className={cn(
                  "flex shrink-0 items-center gap-2.5 px-3 py-3 text-left text-[11px] uppercase tracking-[0.14em] transition-colors lg:border-b lg:border-line/70 lg:px-0",
                  activeTab === key
                    ? "text-gold-dark"
                    : "text-charcoal/60 hover:text-ink"
                )}
              >
                <Icon size={15} strokeWidth={1.5} />
                {label}
              </button>
            ))}
          </nav>
          <div className="mt-6 hidden lg:block">
            <DemoNote>
              {isDemo
                ? "Demo account activity is stored in this browser only."
                : "Connected to the configured backend."}
            </DemoNote>
          </div>
        </aside>

        <div className="min-w-0">
          {activeTab === "profile" && (
            <section className="max-w-xl">
              <h2 className="font-serif text-2xl text-ink">Profile details</h2>
              <p className="mt-1.5 text-[12px] text-charcoal/55">
                Keep your contact details up to date for order updates.
              </p>
              <form onSubmit={saveProfile} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="account-name" className="field-label">Full name</label>
                  <input
                    id="account-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="field"
                  />
                </div>
                <div>
                  <label htmlFor="account-email" className="field-label">Email address</label>
                  <input id="account-email" value={user.email} readOnly className="field bg-cream/60 text-charcoal/60" />
                  <p className="mt-1.5 text-[10.5px] text-stone">
                    Email changes require verification and are not available in this build.
                  </p>
                </div>
                <div>
                  <label htmlFor="account-mobile" className="field-label">Mobile number</label>
                  <input
                    id="account-mobile"
                    value={mobile}
                    inputMode="numeric"
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="field"
                  />
                </div>
                {profileError && <p className="text-[11px] text-red-500">{profileError}</p>}
                <div className="flex items-center gap-4">
                  <Button type="submit">Save changes</Button>
                  <span className="text-[10.5px] text-stone">
                    Member since {formatDate(user.createdAt)}
                  </span>
                </div>
              </form>
            </section>
          )}

          {activeTab === "addresses" && (
            <section>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl text-ink">Saved addresses</h2>
                  <p className="mt-1.5 text-[12px] text-charcoal/55">
                    Manage delivery addresses for a faster checkout.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => openAddressModal()}>
                  <Plus size={14} /> Add address
                </Button>
              </div>

              {addresses.length === 0 ? (
                <EmptyState
                  title="No saved addresses"
                  description="Add a delivery address now, or enter one during checkout."
                  icon={<MapPin size={22} className="text-gold-dark" />}
                  action={
                    <Button variant="outline" onClick={() => openAddressModal()}>
                      Add your first address
                    </Button>
                  }
                />
              ) : (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {addresses.map((address) => (
                    <div key={address.id} className="card p-5">
                      <div className="flex items-start justify-between gap-3">
                        <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-gold-dark">
                          <MapPin size={12} /> {address.label}
                        </span>
                        {address.isDefault && (
                          <span className="bg-cream px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-gold-deep">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="mt-3 text-[13px] font-medium text-ink">{address.fullName}</p>
                      <p className="mt-1 text-[12px] leading-relaxed text-charcoal/60">
                        {[address.line1, address.line2, address.city, address.state, address.pincode]
                          .filter(Boolean)
                          .join(", ")}
                        <br />
                        {address.mobile}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-line pt-3 text-[10px] uppercase tracking-[0.12em]">
                        <button onClick={() => openAddressModal(address)} className="flex items-center gap-1.5 text-charcoal/65 hover:text-ink">
                          <Pencil size={11} /> Edit
                        </button>
                        <button
                          onClick={() => {
                            setAddresses((current) => current.filter((a) => a.id !== address.id));
                            notify("Address removed.", "info");
                          }}
                          className="flex items-center gap-1.5 text-charcoal/65 hover:text-red-500"
                        >
                          <Trash2 size={11} /> Remove
                        </button>
                        {!address.isDefault && (
                          <button onClick={() => setDefault(address.id)} className="flex items-center gap-1.5 text-gold-dark hover:text-ink">
                            <Check size={11} /> Set default
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "orders" && (
            <section>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl text-ink">My orders</h2>
                  <p className="mt-1.5 text-[12px] text-charcoal/55">
                    Orders placed while signed in to this browser.
                  </p>
                </div>
                <Link to="/order-tracking" className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-gold-dark hover:text-ink">
                  <Truck size={13} /> Track order
                </Link>
              </div>

              {orders.length === 0 ? (
                <EmptyState
                  title="No orders yet"
                  description="Your placed orders will appear here. Explore the collections to find your first piece."
                  icon={<Package size={22} className="text-gold-dark" />}
                  action={<Link to="/collections/best-sellers" className="btn-primary">Explore collections</Link>}
                />
              ) : (
                <div className="mt-6 space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="card">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.16em] text-stone">Order</p>
                          <p className="mt-0.5 font-medium text-ink">{order.id}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-[11px] text-stone">{formatDate(order.createdAt)}</span>
                          <span className="border border-gold/40 bg-gold/10 px-2.5 py-1 text-[9.5px] uppercase tracking-[0.14em] text-gold-deep">
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <div className="divide-y divide-line/70 px-5">
                        {order.items.map((item) => (
                          <div key={`${order.id}-${item.sku}`} className="flex items-center gap-4 py-3.5">
                            <ProductImage src={item.image} alt={item.name} label={item.name} className="h-16 w-14 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <Link to={`/product/${getProductById(item.productId)?.slug ?? ""}`} className="text-[12.5px] text-ink hover:text-gold-dark">
                                {item.name}
                              </Link>
                              <p className="mt-0.5 text-[10.5px] text-stone">
                                {item.sku} {item.size ? `· Size ${item.size}` : ""} · Qty {item.quantity}
                              </p>
                            </div>
                            <span className="text-[12px] text-ink">{formatINR(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-5 py-3.5">
                        <p className="text-[10.5px] text-stone">
                          {order.paymentMethod} · {order.paymentStatus}
                          {order.isDemo && " · Demo order"}
                        </p>
                        <p className="text-[13px] text-ink">Total {formatINR(order.total)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <DemoNote className="mt-6">
                Orders created in demo mode are not transmitted to a warehouse or payment
                provider. No money is taken.
              </DemoNote>
            </section>
          )}

          {activeTab === "track" && (
            <section>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl text-ink">Track your orders</h2>
                  <p className="mt-1.5 text-[12px] text-charcoal/55">
                    Open live status for any order placed while signed in.
                  </p>
                </div>
                <Link to="/track-order" className="btn-outline">
                  <Truck size={14} /> Open tracking
                </Link>
              </div>

              {orders.length === 0 ? (
                <EmptyState
                  title="No orders to track yet"
                  description="Once you place an order, its status will appear here and on the tracking page."
                  icon={<Truck size={22} className="text-gold-dark" />}
                  action={<Link to="/shop" className="btn-primary">Start shopping</Link>}
                />
              ) : (
                <div className="mt-6 space-y-3">
                  {orders.map((order) => (
                    <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 border border-line bg-white px-4 py-3.5">
                      <div>
                        <p className="font-medium text-ink">{order.id}</p>
                        <p className="mt-0.5 text-[10.5px] text-stone">
                          {formatDate(order.createdAt)} · {order.items.length} {order.items.length === 1 ? "piece" : "pieces"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="border border-gold/40 bg-gold/10 px-2.5 py-1 text-[9px] uppercase tracking-[0.12em] text-gold-deep">
                          {order.status}
                        </span>
                        <Link
                          to={`/track-order?orderId=${encodeURIComponent(order.id)}&contact=${encodeURIComponent(user.email)}`}
                          className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-gold-dark hover:text-ink"
                        >
                          Track <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "consultations" && (
            <section>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl text-ink">Consultation bookings</h2>
                  <p className="mt-1.5 text-[12px] text-charcoal/55">
                    Your video appointments with our jewellery specialists.
                  </p>
                </div>
                <Link to="/book-consultation" className="btn-outline">
                  <Video size={14} /> Book a consultation
                </Link>
              </div>

              {consultations.length === 0 ? (
                <EmptyState
                  title="No consultations booked"
                  description="Book a personal video appointment for bridal styling, product selection or a custom enquiry."
                  icon={<Video size={22} className="text-gold-dark" />}
                  action={<Link to="/book-consultation" className="btn-primary">Book a consultation</Link>}
                />
              ) : (
                <div className="mt-6 space-y-4">
                  {consultations.map((booking) => (
                    <div key={booking.id} className="border border-line bg-white p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-serif text-[17px] text-ink">{booking.type}</p>
                          <p className="mt-1 text-[11px] text-stone">
                            {formatDate(booking.date)} at {booking.time} · {booking.category}
                          </p>
                        </div>
                        <span className="border border-gold/40 bg-gold/10 px-2.5 py-1 text-[9px] uppercase tracking-[0.12em] text-gold-deep">
                          {booking.status}
                        </span>
                      </div>
                      {booking.productReference && (
                        <p className="mt-2 text-[11.5px] text-charcoal/60">
                          Reference: {booking.productReference}
                        </p>
                      )}
                      {booking.meetingLink ? (
                        <a
                          href={booking.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.12em] text-gold-dark hover:text-ink"
                        >
                          <ExternalLink size={12} /> Join meeting
                        </a>
                      ) : (
                        <p className="mt-3 text-[10.5px] text-stone">
                          A meeting link will appear here once our team approves the appointment.
                        </p>
                      )}
                      {booking.adminNote && (
                        <p className="mt-2 border-t border-line pt-2 text-[11px] text-charcoal/65">
                          Note from our team: {booking.adminNote}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "returns" && (
            <section>
              <div>
                <h2 className="font-serif text-2xl text-ink">Return requests</h2>
                <p className="mt-1.5 text-[12px] text-charcoal/55">
                  Request a return for a delivered order. Unworn pieces in original packaging
                  are eligible within 7 days of delivery.
                </p>
              </div>

              {orders.filter((order) =>
                ["Delivered", "Return Requested", "Returned", "Refunded"].includes(order.status)
              ).length === 0 ? (
                <EmptyState
                  title="No eligible orders"
                  description="Return requests become available once an order has been delivered."
                  icon={<RotateCcw size={22} className="text-gold-dark" />}
                  action={<Link to="/return-policy" className="btn-outline">Read return policy</Link>}
                />
              ) : (
                <div className="mt-6 space-y-4">
                  {orders
                    .filter((order) => ["Delivered", "Return Requested", "Returned", "Refunded"].includes(order.status))
                    .map((order) => (
                      <div key={order.id} className="border border-line bg-white p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-medium text-ink">{order.id}</p>
                            <p className="mt-0.5 text-[10.5px] text-stone">
                              Delivered order · {formatDate(order.createdAt)} · {formatINR(order.total)}
                            </p>
                          </div>
                          <span className="border border-gold/40 bg-gold/10 px-2.5 py-1 text-[9px] uppercase tracking-[0.12em] text-gold-deep">
                            {order.status}
                          </span>
                        </div>
                        {order.status === "Delivered" && (
                          <button
                            onClick={() => {
                              setReturnOrder(order);
                              setReturnReason("");
                              setReturnError("");
                            }}
                            className="mt-3 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-gold-dark hover:text-ink"
                          >
                            <RotateCcw size={12} /> Request a return
                          </button>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "settings" && (
            <section className="max-w-xl">
              <h2 className="font-serif text-2xl text-ink">Account settings</h2>
              <p className="mt-1.5 text-[12px] text-charcoal/55">
                Update the password used to sign in to your LEO JEWELS account.
              </p>
              <form onSubmit={submitPassword} className="mt-6 space-y-4 border border-line bg-white p-5">
                <div>
                  <label htmlFor="pwd-current" className="field-label">Current password</label>
                  <input
                    id="pwd-current"
                    type="password"
                    autoComplete="current-password"
                    value={passwordForm.current}
                    onChange={(e) => {
                      setPasswordForm((current) => ({ ...current, current: e.target.value }));
                      setPasswordError("");
                    }}
                    className="field"
                  />
                </div>
                <div>
                  <label htmlFor="pwd-new" className="field-label">New password</label>
                  <input
                    id="pwd-new"
                    type="password"
                    autoComplete="new-password"
                    value={passwordForm.next}
                    onChange={(e) => {
                      setPasswordForm((current) => ({ ...current, next: e.target.value }));
                      setPasswordError("");
                    }}
                    className="field"
                  />
                  <p className="mt-1.5 text-[10.5px] text-stone">Use at least 8 characters.</p>
                </div>
                <div>
                  <label htmlFor="pwd-confirm" className="field-label">Confirm new password</label>
                  <input
                    id="pwd-confirm"
                    type="password"
                    autoComplete="new-password"
                    value={passwordForm.confirm}
                    onChange={(e) => {
                      setPasswordForm((current) => ({ ...current, confirm: e.target.value }));
                      setPasswordError("");
                    }}
                    className="field"
                  />
                </div>
                {passwordError && <p className="text-[11px] text-red-500">{passwordError}</p>}
                <div className="flex items-center gap-4">
                  <Button type="submit">
                    <Lock size={13} /> {passwordSaved ? "Password updated" : "Update password"}
                  </Button>
                  <span className="text-[10.5px] text-stone">{user.email}</span>
                </div>
                <DemoNote>
                  {isDemo
                    ? "Demo mode: passwords are stored in this browser with a non-cryptographic hash. Set up the Spring Boot authentication service before using real customer accounts."
                    : "Password changes are verified and stored by the configured backend."}
                </DemoNote>
              </form>
            </section>
          )}

          {activeTab === "wishlist" && (
            <section>
              <h2 className="font-serif text-2xl text-ink">Your wishlist</h2>
              <p className="mt-1.5 text-[12px] text-charcoal/55">
                {wishlistProducts.length} {wishlistProducts.length === 1 ? "piece" : "pieces"} saved.
              </p>
              {wishlistProducts.length === 0 ? (
                <EmptyState
                  title="Nothing saved yet"
                  description="Tap the heart on any piece to keep it here for later."
                  icon={<Heart size={22} className="text-gold-dark" />}
                  action={<Link to="/new-arrivals" className="btn-primary">Discover new pieces</Link>}
                />
              ) : (
                <>
                  <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-9 lg:grid-cols-3">
                    {wishlistProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                  <Link to="/wishlist" className="mt-6 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-gold-dark hover:text-ink">
                    Manage full wishlist <ArrowRight size={13} />
                  </Link>
                </>
              )}
            </section>
          )}
        </div>
      </div>

      <Modal open={addressModalOpen} onClose={() => setAddressModalOpen(false)} title="Delivery address">
        <form onSubmit={saveAddress} noValidate className="space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="addr-label" className="field-label">Label</label>
              <select
                id="addr-label"
                value={addressDraft.label}
                onChange={(e) => setAddressDraft({ ...addressDraft, label: e.target.value })}
                className="field"
              >
                <option>Home</option>
                <option>Work</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="addr-name" className="field-label">Full name</label>
              <input
                id="addr-name"
                value={addressDraft.fullName}
                onChange={(e) => setAddressDraft({ ...addressDraft, fullName: e.target.value })}
                className={cn("field", addressErrors.fullName && "field-error")}
              />
              {addressErrors.fullName && <p className="mt-1 text-[10.5px] text-red-500">{addressErrors.fullName}</p>}
            </div>
          </div>
          <div>
            <label htmlFor="addr-mobile" className="field-label">Mobile number</label>
            <input
              id="addr-mobile"
              value={addressDraft.mobile}
              inputMode="numeric"
              onChange={(e) => setAddressDraft({ ...addressDraft, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })}
              className={cn("field", addressErrors.mobile && "field-error")}
            />
            {addressErrors.mobile && <p className="mt-1 text-[10.5px] text-red-500">{addressErrors.mobile}</p>}
          </div>
          <div>
            <label htmlFor="addr-line1" className="field-label">Address line 1</label>
            <input
              id="addr-line1"
              value={addressDraft.line1}
              onChange={(e) => setAddressDraft({ ...addressDraft, line1: e.target.value })}
              placeholder="House / flat, street"
              className={cn("field", addressErrors.line1 && "field-error")}
            />
            {addressErrors.line1 && <p className="mt-1 text-[10.5px] text-red-500">{addressErrors.line1}</p>}
          </div>
          <div>
            <label htmlFor="addr-line2" className="field-label">Address line 2 (optional)</label>
            <input
              id="addr-line2"
              value={addressDraft.line2 ?? ""}
              onChange={(e) => setAddressDraft({ ...addressDraft, line2: e.target.value })}
              placeholder="Area, landmark"
              className="field"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="addr-city" className="field-label">City</label>
              <input
                id="addr-city"
                value={addressDraft.city}
                onChange={(e) => setAddressDraft({ ...addressDraft, city: e.target.value })}
                className={cn("field", addressErrors.city && "field-error")}
              />
              {addressErrors.city && <p className="mt-1 text-[10.5px] text-red-500">{addressErrors.city}</p>}
            </div>
            <div>
              <label htmlFor="addr-state" className="field-label">State</label>
              <input
                id="addr-state"
                value={addressDraft.state}
                onChange={(e) => setAddressDraft({ ...addressDraft, state: e.target.value })}
                className={cn("field", addressErrors.state && "field-error")}
              />
              {addressErrors.state && <p className="mt-1 text-[10.5px] text-red-500">{addressErrors.state}</p>}
            </div>
            <div>
              <label htmlFor="addr-pin" className="field-label">PIN code</label>
              <input
                id="addr-pin"
                value={addressDraft.pincode}
                inputMode="numeric"
                onChange={(e) => setAddressDraft({ ...addressDraft, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                className={cn("field", addressErrors.pincode && "field-error")}
              />
              {addressErrors.pincode && <p className="mt-1 text-[10.5px] text-red-500">{addressErrors.pincode}</p>}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1">Save address</Button>
            <Button variant="outline" onClick={() => setAddressModalOpen(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(returnOrder)}
        onClose={() => setReturnOrder(null)}
        title="Request a return"
        panelClassName="sm:max-w-md"
      >
        <form onSubmit={submitReturn} className="space-y-4 p-6">
          <p className="text-[12px] leading-relaxed text-charcoal/65">
            Order <strong className="text-ink">{returnOrder?.id}</strong>. Tell us why you
            would like to return this order. Our care team will review the request and reply
            with return instructions.
          </p>
          <div>
            <label htmlFor="return-reason" className="field-label">Reason for return</label>
            <textarea
              id="return-reason"
              rows={4}
              value={returnReason}
              onChange={(e) => {
                setReturnReason(e.target.value);
                setReturnError("");
              }}
              placeholder="e.g. The size does not fit and the piece is unworn in its original packaging."
              className="field min-h-[110px] py-3"
            />
          </div>
          {returnError && <p className="text-[11px] text-red-500">{returnError}</p>}
          <p className="text-[10.5px] leading-relaxed text-stone">
            Submitting a request does not guarantee a return. Please read the{" "}
            <Link to="/return-policy" className="text-gold-dark underline underline-offset-2">
              Return and Refund Policy
            </Link>
            .
          </p>
          <div className="flex gap-3 pt-1">
            <Button type="submit" className="flex-1">Submit request</Button>
            <Button variant="outline" onClick={() => setReturnOrder(null)} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
