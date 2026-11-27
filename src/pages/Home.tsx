import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  PackageCheck,
  Headphones,
  Gem,
  Truck,
  RotateCcw,
  Video,
  CalendarDays,
} from "lucide-react";
import { HERO_IMAGE, STORY_IMAGE, STORY_IMAGE_2 } from "@/data/siteImages";
import { useCatalogue } from "@/context/CatalogueContext";
import type { Product } from "@/types";
import { ProductImage } from "@/components/ui/ProductImage";
import { ProductCard } from "@/components/product/ProductCard";
import { NewsletterForm } from "@/components/marketing/NewsletterForm";
import { formatINR, cn } from "@/lib/utils";

const TABS = [
  { key: "best", label: "Best Sellers", to: "/collections/best-sellers?sort=popularity" },
  { key: "new", label: "New Arrivals", to: "/new-arrivals" },
  { key: "trending", label: "Trending Now", to: "/collections/trending?sort=popularity" },
  { key: "bridal", label: "Bridal Collection", to: "/bridal" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function Home() {
  const [tab, setTab] = useState<TabKey>("best");
  const { categories, publishedProducts, banners, settings } = useCatalogue();
  const heroBanner = banners.find((b) => b.enabled && b.placement === "hero");
  const editorialBanner = banners.find(
    (b) => b.enabled && b.placement === "editorial"
  );

  const shown: Product[] = useMemo(() => {
    switch (tab) {
      case "new":
        return [...publishedProducts]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 4);
      case "trending":
        return publishedProducts.filter((p) => p.isTrending).slice(0, 4);
      case "bridal":
        return publishedProducts
          .filter((p) => p.collections.includes("bridal"))
          .slice(0, 4);
      default:
        return publishedProducts.filter((p) => p.isBestSeller).slice(0, 4);
    }
  }, [tab, publishedProducts]);

  const activeTab = TABS.find((t) => t.key === tab)!;

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-cream">
        <div className="pointer-events-none absolute -right-24 top-0 h-full w-1/2 bg-[radial-gradient(ellipse_at_top_right,rgba(198,161,91,0.16),transparent_65%)]" />
        <div className="container-lux relative grid items-center gap-10 py-10 sm:py-14 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:py-20">
          <div className="max-w-xl animate-fade-up">
            <p className="eyebrow flex items-center gap-3">
              <span className="h-px w-8 bg-gold" />
              Fine & Imitation Jewellery
            </p>
            <h1 className="mt-6 font-serif text-[42px] leading-[1.02] text-ink sm:text-6xl xl:text-[76px]">
              Elegance That
              <br />
              <span className="italic text-gold-dark">Lives Forever</span>
            </h1>
            <p className="mt-6 max-w-md text-[14px] leading-relaxed text-charcoal/65 sm:text-[15px]">
              Discover necklaces, earrings, rings and bridal sets crafted for
              everyday elegance and the moments you will remember.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/collections/best-sellers" className="btn-primary group">
                Explore Best Sellers
                <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link to="/collections/bridal" className="btn-outline">
                Shop Bridal Collection
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-6">
              {[
                {
                  icon: Truck,
                  text: `Free shipping over ₹${settings.freeShippingThreshold.toLocaleString("en-IN")}`,
                },
                { icon: RotateCcw, text: "7-day easy returns" },
                { icon: Gem, text: "Gift-ready packaging" },
              ].map(({ icon: Icon, text }) => (
                <span key={text} className="flex items-center gap-2 text-[10.5px] uppercase tracking-[0.1em] text-charcoal/60">
                  <Icon size={14} className="text-gold-dark" strokeWidth={1.5} /> {text}
                </span>
              ))}
            </div>
          </div>

          <div className="relative animate-fade-up [animation-delay:120ms]">
            <div className="relative mx-auto max-w-[560px]">
              <div className="absolute -left-3 -top-3 h-full w-full border border-gold/50 sm:-left-5 sm:-top-5" />
              <ProductImage
                src={heroBanner?.image ?? HERO_IMAGE}
                alt={heroBanner?.alt || "Signature gold necklace from the LEO JEWELS campaign"}
                label="Signature gold collection"
                eager
                className="relative aspect-[4/5] w-full"
              />
              <div className="absolute -bottom-6 left-4 right-4 border border-line bg-ivory/95 p-4 backdrop-blur-sm sm:-bottom-8 sm:left-8 sm:right-auto sm:w-72 sm:p-5">
                <p className="text-[9px] uppercase tracking-[0.22em] text-gold-dark">Signature piece</p>
                <p className="mt-1.5 font-serif text-lg text-ink">
                  {heroBanner?.title || "Aurelia Chain Necklace"}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="max-w-[60%] text-[11px] leading-snug text-charcoal/70">
                    {heroBanner?.subtitle || formatINR(58900)}
                  </span>
                  <Link to={heroBanner?.href || "/product/aurelia-gold-necklace"} className="text-[9.5px] uppercase tracking-[0.18em] text-gold-dark hover:text-ink">
                    Discover →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container-lux py-16 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Find Your Piece</p>
            <h2 className="mt-3 font-serif text-3xl text-ink sm:text-4xl lg:text-[44px]">
              Shop by Category
            </h2>
          </div>
          <p className="max-w-sm text-[13px] leading-relaxed text-charcoal/55">
            From everyday essentials to bridal heirlooms — a considered edit for
            every occasion.
          </p>
        </div>

        <div className="mt-9 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {categories.map((category, index) => (
            <Link
              key={category.slug}
              to={`/category/${category.slug}`}
              className={cn(
                "group relative block overflow-hidden bg-ink",
                index === 0 || index === 5 ? "lg:col-span-1" : ""
              )}
            >
              <ProductImage
                src={category.image}
                alt={category.name}
                label={category.name}
                className="aspect-[3/4] w-full"
                imgClassName="transition-transform duration-[900ms] ease-silk group-hover:scale-[1.06]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <p className="font-serif text-[19px] leading-tight text-ivory sm:text-[22px]">
                  {category.name}
                </p>
                <div className="mt-1.5 flex items-center gap-2 overflow-hidden">
                  <span className="text-[9px] uppercase tracking-[0.18em] text-ivory/60 transition-colors group-hover:text-gold">
                    Explore
                  </span>
                  <ArrowRight
                    size={12}
                    className="text-gold opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED / PRODUCT SHOWCASE */}
      <section className="border-y border-line bg-ivory">
        <div className="container-lux py-16 lg:py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Curated For You</p>
              <h2 className="mt-3 font-serif text-3xl text-ink sm:text-4xl lg:text-[44px]">
                Featured Collections
              </h2>
            </div>
            <Link
              to={activeTab.to}
              className="group flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-charcoal hover:text-gold-dark"
            >
              View collection
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="mt-8 flex gap-1 overflow-x-auto border-b border-line no-scrollbar">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                aria-pressed={tab === t.key}
                className={cn(
                  "relative shrink-0 px-4 py-3.5 text-[10px] uppercase tracking-[0.16em] transition-colors sm:px-6 sm:text-[10.5px]",
                  tab === t.key ? "text-ink" : "text-stone hover:text-charcoal"
                )}
              >
                {t.label}
                <span
                  className={cn(
                    "absolute inset-x-0 -bottom-px h-[1.5px] bg-gold transition-opacity",
                    tab === t.key ? "opacity-100" : "opacity-0"
                  )}
                />
              </button>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 lg:grid-cols-4">
            {shown.map((product) => (
              <ProductCard key={`${tab}-${product.id}`} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* BRAND STORY */}
      <section className="container-lux py-16 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative">
            <ProductImage
              src={editorialBanner?.image ?? STORY_IMAGE}
              alt={editorialBanner?.alt || "Detail of a hand-finished gold necklace from LEO JEWELS"}
              label="Beauty in every detail"
              className="aspect-[4/5] w-[82%]"
            />
            <div className="absolute -bottom-6 right-0 w-[45%] border-[6px] border-ivory sm:-bottom-8">
              <ProductImage
                src={STORY_IMAGE_2}
                alt="Bridal jewellery styled for a celebration"
                label="The bridal edit"
                className="aspect-square w-full"
              />
            </div>
            <div className="absolute left-5 top-5 bg-ivory/95 px-3.5 py-2 backdrop-blur-sm">
              <p className="font-serif text-[13px] tracking-[0.12em] text-ink">LEO JEWELS</p>
            </div>
          </div>

          <div className="lg:pl-4">
            <p className="eyebrow">Our Story</p>
            <h2 className="mt-3 font-serif text-3xl leading-tight text-ink sm:text-4xl lg:text-[46px]">
              Beauty in Every Detail
            </h2>
            <p className="mt-5 text-[14px] leading-[1.85] text-charcoal/65">
              LEO JEWELS began with a simple belief: jewellery should feel personal.
              Not a display of excess, but a collection of small, beautiful things that
              become part of your story.
            </p>
            <p className="mt-4 text-[14px] leading-[1.85] text-charcoal/65">
              We work across gold, silver, diamond, bridal and imitation collections,
              choosing each piece for balance, finish and wearability. The result is an
              edit that moves easily between ordinary mornings and once-in-a-lifetime
              celebrations.
            </p>
            <div className="mt-7 grid grid-cols-3 gap-4 border-y border-line py-6">
              {[
                { value: "Gold & Silver", label: "Fine collections" },
                { value: "Bridal", label: "Complete sets" },
                { value: "Everyday", label: "Imitation edits" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-serif text-lg text-gold-dark">{stat.value}</p>
                  <p className="mt-1 text-[9.5px] uppercase tracking-[0.14em] text-stone">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
            <Link
              to="/about"
              className="group mt-7 inline-flex items-center gap-2 border-b border-ink/25 pb-1 text-[10.5px] uppercase tracking-[0.2em] text-ink transition-colors hover:border-gold hover:text-gold-dark"
            >
              About LEO JEWELS
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* CONSULTATION */}
      <section className="relative overflow-hidden border-y border-line bg-cream">
        <div className="pointer-events-none absolute -right-20 top-0 h-full w-[36rem] bg-[radial-gradient(circle_at_center,rgba(198,161,91,0.16),transparent_70%)]" />
        <div className="container-lux relative grid gap-8 py-14 lg:grid-cols-[1.35fr_1fr] lg:items-center lg:gap-16 lg:py-20">
          <div>
            <p className="eyebrow">Private Appointments</p>
            <h2 className="mt-3 font-serif text-3xl leading-tight text-ink sm:text-4xl lg:text-[46px]">
              Experience Jewellery, <span className="italic text-gold-dark">Personally</span>
            </h2>
            <p className="mt-5 max-w-xl text-[13.5px] leading-relaxed text-charcoal/65">
              Not sure which design suits your occasion? Connect with our jewellery
              specialists through a personal video consultation.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-7 gap-y-3 text-[10.5px] uppercase tracking-[0.12em] text-charcoal/60">
              <span className="flex items-center gap-2"><Video size={14} className="text-gold-dark" /> Live video appointment</span>
              <span className="flex items-center gap-2"><CalendarDays size={14} className="text-gold-dark" /> Choose your time</span>
            </div>
            <Link to="/book-consultation" className="btn-primary group mt-8">
              Book a Live Video Consultation
              <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="border border-line bg-ivory p-6 sm:p-7">
            <p className="eyebrow text-gold-dark">Bring to your call</p>
            <ul className="mt-4 space-y-4">
              {[
                "The occasion you are dressing for and your preferred budget.",
                "Any pieces from our collections you would like to see closer.",
                "Questions about materials, sizing, delivery or styling.",
              ].map((item) => (
                <li key={item} className="flex gap-3 text-[12.5px] leading-relaxed text-charcoal/70">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-5 border-t border-line pt-4 text-[10.5px] leading-relaxed text-stone">
              Meeting links are shared after our team confirms your appointment.
            </p>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="border-y border-line bg-cream">
        <div className="container-lux py-12 lg:py-14">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: ShieldCheck,
                title: "Secure Checkout",
                copy: "Your details are handled over encrypted connections. Online payments are processed by the configured payment provider.",
              },
              {
                icon: PackageCheck,
                title: "Easy Order Tracking",
                copy: "Follow your order from confirmation to delivery with your order ID and registered contact.",
              },
              {
                icon: Headphones,
                title: "Customer Support",
                copy: "Questions about sizing, materials or delivery? Write to our care team and we'll help.",
              },
              {
                icon: Gem,
                title: "Product Quality Information",
                copy: "Material details are listed on every product page. Purity and hallmarking are confirmed by the brand before dispatch.",
              },
            ].map(({ icon: Icon, title, copy }) => (
              <div key={title} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold-dark">
                  <Icon size={19} strokeWidth={1.4} />
                </span>
                <div>
                  <h3 className="font-serif text-[17px] text-ink">{title}</h3>
                  <p className="mt-1.5 text-[11.5px] leading-relaxed text-charcoal/55">{copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="relative overflow-hidden bg-ink">
        <div className="pointer-events-none absolute -left-20 top-0 h-full w-96 bg-[radial-gradient(circle_at_center,rgba(198,161,91,0.18),transparent_70%)]" />
        <div className="container-lux relative grid gap-8 py-16 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:py-20">
          <div>
            <p className="eyebrow text-gold">The Inner Circle</p>
            <h2 className="mt-4 max-w-xl font-serif text-3xl leading-tight text-ivory sm:text-4xl lg:text-[44px]">
              Be the First to Discover
              <span className="italic text-gold"> Something Beautiful</span>
            </h2>
            <p className="mt-4 max-w-lg text-[13px] leading-relaxed text-ivory/50">
              New collections, styling notes and private previews — a few thoughtful
              emails, never noise. Unsubscribe at any time.
            </p>
          </div>
          <div>
            <NewsletterForm variant="dark" />
            <p className="mt-3 text-[10px] leading-relaxed text-ivory/30">
              By subscribing you agree to our{" "}
              <Link to="/privacy-policy" className="underline underline-offset-2 hover:text-gold">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
