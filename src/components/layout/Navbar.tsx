import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";
import { useCatalogue } from "@/context/CatalogueContext";
import { formatINR, cn } from "@/lib/utils";
import { ProductImage } from "@/components/ui/ProductImage";
import { ShopMegaMenu } from "./ShopMegaMenu";
import { SHOP_CATEGORIES } from "@/data/siteImages";
import { BRAND } from "@/data/brandAssets";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "New Arrivals", to: "/new-arrivals" },
  { label: "Bridal", to: "/bridal" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

const MOBILE_LINKS = [
  { label: "Track Your Order", to: "/track-order" },
  { label: "Book a Consultation", to: "/book-consultation" },
  { label: "Help & FAQ", to: "/faq" },
];

/** Shared header action: identical hit area, icon rhythm and tooltip styling. */
function HeaderAction({
  href,
  onClick,
  label,
  tooltip,
  count,
  align = "center",
  children,
  buttonRef,
}: {
  href?: string;
  onClick?: () => void;
  label: string;
  tooltip: string;
  count?: number;
  align?: "center" | "right";
  children: React.ReactNode;
  buttonRef?: React.RefObject<HTMLButtonElement>;
}) {
  const className =
    "group relative flex h-9 w-9 items-center justify-center text-warm-ivory/85 transition-colors duration-300 hover:text-champagne focus-visible:text-champagne focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-champagne/70 focus-visible:ring-offset-2 focus-visible:ring-offset-espresso sm:h-10 sm:w-10";
  const content = (
    <>
      <span className="flex h-[19px] w-[19px] items-center justify-center transition-transform duration-300 ease-silk group-hover:-translate-y-px">
        {children}
      </span>
      {count !== undefined && (
        <span
          aria-hidden="true"
          className="absolute -right-0.5 -top-0.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-champagne px-1 text-[8.5px] font-semibold leading-none text-espresso"
        >
          {count}
        </span>
      )}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none invisible absolute top-full z-[60] mt-1.5 whitespace-nowrap border border-brown-sep bg-espresso-deep px-2.5 py-1.5 text-[8.5px] uppercase tracking-[0.16em] text-warm-ivory opacity-0 shadow-[0_10px_24px_-12px_rgba(0,0,0,0.8)] transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:visible group-focus-visible:translate-y-0 group-focus-visible:opacity-100",
          align === "right" ? "right-0" : "left-1/2 -translate-x-1/2 translate-y-1"
        )}
      >
        {tooltip}
      </span>
    </>
  );

  if (href) {
    return (
      <Link to={href} aria-label={label} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      aria-label={label}
      className={className}
    >
      {content}
    </button>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const shopButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { cartCount, wishlist } = useStore();
  const { user } = useAuth();
  const { categories, publishedProducts } = useCatalogue();

  const shopSectionActive =
    pathname === "/shop" || pathname.startsWith("/category/");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 80);
      return () => window.clearTimeout(t);
    }
  }, [searchOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen || searchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, searchOpen]);

  // Never leave the menu open on top of a freshly navigated page.
  useEffect(() => {
    setShopOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  const cancelShopClose = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const openShopMenu = () => {
    cancelShopClose();
    setShopOpen(true);
  };

  const scheduleShopClose = () => {
    cancelShopClose();
    closeTimer.current = window.setTimeout(() => {
      setShopOpen(false);
      closeTimer.current = null;
    }, 180);
  };

  useEffect(() => () => cancelShopClose(), []);

  useEffect(() => {
    if (!shopOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (shopButtonRef.current?.contains(target)) return;
      setShopOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [shopOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const hadMenuFocus =
        !!menuRef.current && menuRef.current.contains(document.activeElement);
      setSearchOpen(false);
      setMobileOpen(false);
      setShopOpen(false);
      if (hadMenuFocus) shopButtonRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return publishedProducts.filter((p) => p.isBestSeller).slice(0, 4);
    return publishedProducts
      .filter((p) =>
        `${p.name} ${p.category} ${p.tags.join(" ")} ${p.material}`
          .toLowerCase()
          .includes(q)
      )
      .slice(0, 5);
  }, [query, publishedProducts]);

  const submitSearch = (term: string) => {
    const value = term.trim();
    setSearchOpen(false);
    setMobileOpen(false);
    setQuery("");
    navigate(value ? `/search?q=${encodeURIComponent(value)}` : "/search");
  };

  const navItemClass =
    "group/nav relative inline-flex items-center whitespace-nowrap py-2.5 text-[10.5px] font-medium uppercase tracking-[0.16em] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne/60 focus-visible:ring-offset-4 focus-visible:ring-offset-espresso";

  return (
    <>
      <header
        onMouseEnter={cancelShopClose}
        onMouseLeave={scheduleShopClose}
        className={cn(
          "sticky top-0 z-50 border-b bg-espresso transition-[box-shadow,border-color,background-color] duration-300",
          scrolled
            ? "border-brown-sep/90 bg-espresso shadow-[0_18px_40px_-26px_rgba(0,0,0,0.9)]"
            : "border-brown-sep/60"
        )}
      >
        <div className="container-lux">
          <div className="flex h-[72px] items-center justify-between gap-3 lg:h-[82px]">
            {/* Mobile: menu */}
            <div className="flex flex-1 items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                className="-ml-2 flex h-10 w-10 items-center justify-center text-warm-ivory transition-colors duration-300 hover:text-champagne focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-champagne/70 focus-visible:ring-offset-2 focus-visible:ring-offset-espresso"
              >
                <Menu size={21} strokeWidth={1.5} />
              </button>
            </div>

            {/* Logo */}
            <div className="flex shrink-0 items-center justify-center lg:w-auto lg:min-w-[250px] lg:justify-start">
              <div className="hidden lg:block">
                <Logo variant="dark" size="md" />
              </div>
              <div className="lg:hidden">
                <Logo variant="dark" size="sm" withTagline={false} />
              </div>
            </div>

            {/* Desktop navigation */}
            <nav
              aria-label="Primary"
              className="hidden flex-1 items-center justify-center gap-6 lg:flex xl:gap-8"
            >
              <div className="relative">
                <button
                  ref={shopButtonRef}
                  type="button"
                  onClick={() => (shopOpen ? setShopOpen(false) : openShopMenu())}
                  onMouseEnter={openShopMenu}
                  aria-expanded={shopOpen}
                  aria-controls="shop-mega-menu"
                  aria-haspopup="true"
                  title="Shop all jewellery"
                  className={cn(
                    navItemClass,
                    "gap-1.5",
                    shopOpen || shopSectionActive
                      ? "text-champagne"
                      : "text-warm-ivory/80 hover:text-champagne"
                  )}
                >
                  Shop
                  <ChevronDown
                    size={11}
                    strokeWidth={1.7}
                    aria-hidden="true"
                    className={cn(
                      "transition-transform duration-300",
                      shopOpen && "rotate-180"
                    )}
                  />
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute -bottom-0.5 left-0 h-px bg-champagne transition-all duration-300 ease-silk",
                      shopOpen || shopSectionActive
                        ? "w-full opacity-90"
                        : "w-0 opacity-0 group-hover/nav:w-full group-hover/nav:opacity-50"
                    )}
                  />
                </button>
              </div>

              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
                  onMouseEnter={() => setShopOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      navItemClass,
                      isActive
                        ? "text-champagne"
                        : "text-warm-ivory/80 hover:text-champagne"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.label}
                      <span
                        aria-hidden="true"
                        className={cn(
                          "absolute -bottom-0.5 left-0 h-px bg-champagne transition-all duration-300 ease-silk",
                          isActive
                            ? "w-full opacity-90"
                            : "w-0 opacity-0 group-hover/nav:w-full group-hover/nav:opacity-50"
                        )}
                      />
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Actions */}
            <div className="hidden flex-1 items-center justify-end gap-0.5 lg:flex lg:gap-1">
              <HeaderAction
                onClick={() => setSearchOpen(true)}
                label="Search jewellery"
                tooltip="Search"
              >
                <Search size={19} strokeWidth={1.5} />
              </HeaderAction>
              <HeaderAction
                href="/wishlist"
                label={`Wishlist, ${wishlist.length} ${wishlist.length === 1 ? "item" : "items"}`}
                tooltip="Wishlist"
                count={wishlist.length > 0 ? wishlist.length : undefined}
              >
                <Heart size={19} strokeWidth={1.5} />
              </HeaderAction>
              <HeaderAction
                href={user ? "/account" : "/login"}
                label={user ? "My account" : "Sign in"}
                tooltip={user ? "My Account" : "Sign In"}
              >
                <UserRound size={19} strokeWidth={1.5} />
              </HeaderAction>
              <HeaderAction
                href="/cart"
                label={`Shopping bag, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}
                tooltip="Shopping Bag"
                count={cartCount}
                align="right"
              >
                <ShoppingBag size={19} strokeWidth={1.5} />
              </HeaderAction>
            </div>

            {/* Mobile: search + bag */}
            <div className="flex flex-1 items-center justify-end gap-0.5 lg:hidden">
              <HeaderAction
                onClick={() => setSearchOpen(true)}
                label="Search jewellery"
                tooltip="Search"
              >
                <Search size={19} strokeWidth={1.5} />
              </HeaderAction>
              <HeaderAction
                href="/cart"
                label={`Shopping bag, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}
                tooltip="Shopping Bag"
                count={cartCount}
                align="right"
              >
                <ShoppingBag size={19} strokeWidth={1.5} />
              </HeaderAction>
            </div>
          </div>
        </div>

        <ShopMegaMenu
          open={shopOpen}
          onClose={() => setShopOpen(false)}
          panelRef={menuRef}
        />
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[70]">
          <button
            className="absolute inset-0 bg-ink/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setSearchOpen(false)}
            aria-label="Close search"
          />
          <div className="relative animate-fade-up border-b border-line bg-ivory">
            <div className="container-lux py-6 sm:py-8">
              <div className="flex items-center justify-between">
                <p className="eyebrow">Search LEO JEWELS</p>
                <button
                  onClick={() => setSearchOpen(false)}
                  aria-label="Close search"
                  className="p-1 text-charcoal hover:text-gold-dark"
                >
                  <X size={20} />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitSearch(query);
                }}
                className="mt-4 flex items-center border-b border-ink/25 pb-3"
              >
                <Search size={20} className="mr-3 shrink-0 text-stone" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search necklaces, rings, bridal sets…"
                  className="w-full bg-transparent font-serif text-xl text-ink outline-none placeholder:text-stone/60 sm:text-2xl"
                  aria-label="Search products"
                />
                <button type="submit" className="ml-3 hidden items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-gold-dark sm:flex">
                  Search <ArrowRight size={14} />
                </button>
              </form>

              <div className="mt-7 grid gap-8 md:grid-cols-[1fr_1.4fr]">
                <div>
                  <p className="text-[9.5px] uppercase tracking-[0.22em] text-stone">
                    Browse categories
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {categories.slice(0, 6).map((cat) => (
                      <button
                        key={cat.slug}
                        onClick={() => {
                          setSearchOpen(false);
                          navigate(`/category/${cat.slug}`);
                        }}
                        className="border border-line px-3 py-1.5 text-[10.5px] text-charcoal/75 transition-colors hover:border-gold hover:text-ink"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[9.5px] uppercase tracking-[0.22em] text-stone">
                    {query ? "Matching pieces" : "Most loved"}
                  </p>
                  {suggestions.length === 0 ? (
                    <p className="mt-3 text-sm text-charcoal/55">
                      No pieces found. Try “necklace”, “ring” or “bridal”.
                    </p>
                  ) : (
                    <ul className="mt-3 divide-y divide-line">
                      {suggestions.map((p) => (
                        <li key={p.id}>
                          <button
                            onClick={() => {
                              setSearchOpen(false);
                              setQuery("");
                              navigate(`/product/${p.slug}`);
                            }}
                            className="group flex w-full items-center gap-3 py-2.5 text-left"
                          >
                            <ProductImage
                              src={p.images[0]}
                              alt={p.name}
                              label={p.name}
                              className="h-12 w-12 shrink-0"
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-serif text-[15px] text-ink group-hover:text-gold-dark">
                                {p.name}
                              </span>
                              <span className="block text-[11px] text-stone">
                                {formatINR(p.price)}
                              </span>
                            </span>
                            <ChevronRight size={14} className="text-line transition-transform group-hover:translate-x-0.5 group-hover:text-gold" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[75] lg:hidden">
          <button
            className="absolute inset-0 bg-ink/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          />
          <div className="relative flex h-[100dvh] w-[88%] max-w-[360px] flex-col border-r border-brown-sep bg-espresso text-warm-ivory animate-fade-in">
            <div className="flex items-center justify-between border-b border-brown-sep px-5 py-4">
              <Logo
                variant="dark"
                size="sm"
                withTagline={false}
                onClick={() => setMobileOpen(false)}
              />
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center text-warm-ivory/80 transition-colors hover:text-champagne focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-champagne/70"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setSearchOpen(true);
                }}
                className="mb-5 flex w-full items-center gap-3 border border-brown-sep bg-white/[0.04] px-4 py-3 text-[12px] tracking-[0.04em] text-warm-ivory/60 transition-colors hover:border-champagne/50 hover:text-warm-ivory"
              >
                <Search size={16} strokeWidth={1.5} /> Search jewellery
              </button>

              <nav aria-label="Mobile" className="flex flex-col">
                <div className="border-b border-brown-sep/80">
                  <button
                    type="button"
                    onClick={() => setMobileShopOpen((open) => !open)}
                    aria-expanded={mobileShopOpen}
                    aria-controls="mobile-shop-menu"
                    className="flex w-full items-center justify-between py-3.5 text-left font-serif text-[19px] text-warm-ivory"
                  >
                    <span className="flex items-center gap-2">
                      Shop
                      {shopSectionActive && (
                        <span className="h-1 w-1 rounded-full bg-champagne" aria-hidden="true" />
                      )}
                    </span>
                    <ChevronDown
                      size={16}
                      strokeWidth={1.5}
                      aria-hidden="true"
                      className={cn(
                        "text-champagne/70 transition-transform duration-300",
                        mobileShopOpen && "rotate-180"
                      )}
                    />
                  </button>

                  {mobileShopOpen && (
                    <div id="mobile-shop-menu" className="pb-4">
                      <Link
                        to="/shop"
                        onClick={() => setMobileOpen(false)}
                        className="mb-3 inline-flex items-center gap-2 border-b border-champagne/40 pb-1 text-[9.5px] uppercase tracking-[0.2em] text-champagne"
                      >
                        All Jewellery <ArrowRight size={12} strokeWidth={1.6} />
                      </Link>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-3">
                        {SHOP_CATEGORIES.map((category) => (
                          <Link
                            key={category.slug}
                            to={category.to}
                            onClick={() => setMobileOpen(false)}
                            className="group flex items-center gap-2.5 py-1"
                          >
                            <span className="relative block h-10 w-10 shrink-0 overflow-hidden bg-cream">
                              <ProductImage
                                src={category.image}
                                alt={`${category.name} jewellery`}
                                label={category.name}
                                eager
                                className="h-10 w-10"
                                imgClassName="transition-transform duration-500 group-hover:scale-105"
                              />
                            </span>
                            <span className="text-[11.5px] leading-tight text-warm-ivory/80 transition-colors group-hover:text-champagne">
                              {category.name}
                            </span>
                          </Link>
                        ))}
                      </div>
                      <div className="mt-4 grid grid-cols-1 gap-2 border-t border-brown-sep/60 pt-3">
                        <Link
                          to="/new-arrivals"
                          onClick={() => setMobileOpen(false)}
                          className="text-[10px] uppercase tracking-[0.16em] text-warm-ivory/60 transition-colors hover:text-champagne"
                        >
                          New Arrivals
                        </Link>
                        <Link
                          to="/collections/bridal"
                          onClick={() => setMobileOpen(false)}
                          className="text-[10px] uppercase tracking-[0.16em] text-warm-ivory/60 transition-colors hover:text-champagne"
                        >
                          Bridal Collection
                        </Link>
                        <Link
                          to="/collections/best-sellers"
                          onClick={() => setMobileOpen(false)}
                          className="text-[10px] uppercase tracking-[0.16em] text-warm-ivory/60 transition-colors hover:text-champagne"
                        >
                          Best Sellers
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === "/"}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center justify-between border-b border-brown-sep/80 py-3.5 font-serif text-[19px] transition-colors",
                        isActive ? "text-champagne" : "text-warm-ivory hover:text-champagne"
                      )
                    }
                  >
                    {link.label}
                    <ChevronRight size={15} strokeWidth={1.5} className="text-warm-ivory/25" aria-hidden="true" />
                  </NavLink>
                ))}
              </nav>

              <div className="mt-6 space-y-4">
                <Link
                  to={user ? "/account" : "/login"}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 text-[10.5px] uppercase tracking-[0.18em] text-warm-ivory/75 transition-colors hover:text-champagne"
                >
                  <UserRound size={16} strokeWidth={1.5} /> {user ? "My Account" : "Sign In / Register"}
                </Link>
                {MOBILE_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="block text-[10.5px] uppercase tracking-[0.18em] text-warm-ivory/75 transition-colors hover:text-champagne"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  to="/wishlist"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 text-[10.5px] uppercase tracking-[0.18em] text-warm-ivory/75 transition-colors hover:text-champagne"
                >
                  <Heart size={16} strokeWidth={1.5} /> Wishlist
                  {wishlist.length > 0 && (
                    <span className="text-[9px] text-champagne">({wishlist.length})</span>
                  )}
                </Link>
              </div>
            </div>

            <div className="border-t border-brown-sep px-5 py-4">
              <p className="flex items-center gap-2 font-serif text-[17px] italic text-champagne">
                <Sparkles size={13} strokeWidth={1.5} aria-hidden="true" />
                {BRAND.tagline}.
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-warm-ivory/35">
                Gold · Silver · Bridal · Imitation
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
