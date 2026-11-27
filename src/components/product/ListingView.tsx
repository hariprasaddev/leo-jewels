import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronDown, SlidersHorizontal, Search, X, ArrowDown } from "lucide-react";
import type { Category, CollectionSlug, Product } from "@/types";
import { useCatalogue } from "@/context/CatalogueContext";
import { ProductCard } from "./ProductCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Modal } from "@/components/ui/Modal";
import { ProductImage } from "@/components/ui/ProductImage";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { useProductFilters, type FilterState, type SortKey } from "@/hooks/useProductFilters";
import { formatINR } from "@/lib/utils";

interface ListingViewProps {
  title: string;
  eyebrow: string;
  description: string;
  banner: string;
  bannerAlt: string;
  crumb: string;
  products: Product[];
  collection?: CollectionSlug;
  contextLabel: string;
  bannerDescription?: string;
  showProductCount?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "popularity", label: "Popularity" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "newest", label: "Newest first" },
];

export function ListingView({
  title,
  eyebrow,
  description,
  banner,
  bannerAlt,
  crumb,
  products,
  collection,
  contextLabel,
  bannerDescription,
  showProductCount = false,
  emptyTitle,
  emptyDescription,
}: ListingViewProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories: allCategories } = useCatalogue();
  const {
    filters,
    setFilters,
    toggleArrayValue,
    reset,
    filtered,
    visible,
    hasMore,
    setVisibleCount,
    priceBounds,
  } = useProductFilters(products, collection);

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Seed filters from URL (?category=, ?sort=) and keep the sort param in sync.
  useEffect(() => {
    const category = searchParams.get("category");
    const sort = searchParams.get("sort") as SortKey | null;
    setFilters((current) => ({
      ...current,
      categories: category ? [category] : current.categories,
      sort:
        sort && SORT_OPTIONS.some((o) => o.value === sort)
          ? sort
          : current.sort,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateSort = (sort: SortKey) => {
    setFilters((current) => ({ ...current, sort }));
    const next = new URLSearchParams(searchParams);
    next.set("sort", sort);
    setSearchParams(next, { replace: true });
  };

  const materials = useMemo(
    () => Array.from(new Set(products.map((p) => p.material))).sort(),
    [products]
  );
  const availableCategories = useMemo(() => {
    const slugs = new Set(products.map((p) => p.category));
    return allCategories.filter((c) => slugs.has(c.slug));
  }, [products]);

  const activeFilterCount =
    filters.categories.length +
    filters.materials.length +
    (filters.inStockOnly ? 1 : 0) +
    (filters.minPrice > 0 || filters.maxPrice < 1000000 ? 1 : 0);

  const filterPanel = (
    <FilterPanel
      filters={filters}
      setFilters={setFilters}
      toggleArrayValue={toggleArrayValue}
      reset={reset}
      categories={availableCategories}
      materials={materials}
      priceBounds={priceBounds}
    />
  );

  return (
    <div>
      {/* Editorial banner — kept compact so the product grid remains the focus. */}
      <div className="relative h-[230px] overflow-hidden bg-ink sm:h-[260px] lg:h-[285px]">
        <div className="absolute inset-0">
          <ProductImage
            src={banner}
            alt={bannerAlt}
            label={title}
            eager
            className="h-full w-full"
            imgClassName="object-[center_45%] opacity-85"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/40 to-ink/5" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink/45 to-transparent" />
        <div className="container-lux relative flex h-full flex-col justify-end pb-6 sm:pb-7">
          <p className="eyebrow text-gold-light">{eyebrow}</p>
          <h1 className="mt-2 font-serif text-[30px] uppercase leading-none tracking-[0.045em] text-ivory sm:text-[38px] lg:text-[42px]">
            {title}
          </h1>
          {bannerDescription && (
            <p className="mt-2.5 max-w-lg text-[11.5px] leading-relaxed text-ivory/75 sm:text-[12.5px]">
              {bannerDescription}
            </p>
          )}
        </div>
      </div>

      <div className="container-lux pt-6 pb-5 sm:pt-7">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: crumb }]} />
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-serif text-[24px] uppercase leading-tight tracking-[0.035em] text-ink sm:text-[27px]">
              {title}
            </h2>
            <p className="mt-1.5 max-w-2xl text-[12.5px] leading-relaxed text-charcoal/60">
              {description}
            </p>
          </div>
          {showProductCount && (
            <p className="shrink-0 text-[9.5px] uppercase tracking-[0.2em] text-stone">
              {products.length} {products.length === 1 ? "piece" : "pieces"}
            </p>
          )}
        </div>
      </div>

      <div className="container-lux grid gap-8 pb-20 lg:grid-cols-[240px_1fr] lg:gap-10">
        {/* Desktop filters */}
        <aside className="hidden lg:block">
          <div className="sticky top-[100px]">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-ink">Filters</p>
              {activeFilterCount > 0 && (
                <button onClick={reset} className="text-[10px] text-gold-dark underline underline-offset-2">
                  Clear all
                </button>
              )}
            </div>
            {filterPanel}
          </div>
        </aside>

        <div>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="flex items-center gap-2 border border-line px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-charcoal lg:hidden"
              >
                <SlidersHorizontal size={14} /> Filters
                {activeFilterCount > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] text-ink">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <p className="text-[11px] text-stone">
                Showing{" "}
                <span className="text-charcoal">{visible.length}</span> of{" "}
                <span className="text-charcoal">{filtered.length}</span> pieces
              </p>
            </div>
            <div className="relative flex items-center gap-2">
              <label htmlFor="sort" className="text-[10px] uppercase tracking-[0.14em] text-stone">
                Sort
              </label>
              <div className="relative">
                <select
                  id="sort"
                  value={filters.sort}
                  onChange={(e) => updateSort(e.target.value as SortKey)}
                  className="appearance-none border border-line bg-white py-2 pl-3 pr-8 text-[11px] text-charcoal outline-none focus:border-gold"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-stone" />
              </div>
            </div>
          </div>

          {/* Inline search */}
          <div className="mt-4">
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone" />
              <input
                type="search"
                value={filters.query}
                onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
                placeholder={`Search within ${contextLabel.toLowerCase()}…`}
                aria-label={`Search within ${contextLabel}`}
                className="h-11 w-full border border-line bg-white pl-10 pr-10 text-[12.5px] text-ink outline-none placeholder:text-stone/70 focus:border-gold"
              />
              {filters.query && (
                <button
                  onClick={() => setFilters((f) => ({ ...f, query: "" }))}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone hover:text-ink"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Active chips */}
          {activeFilterCount > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {filters.categories.map((slug) => {
                const cat = allCategories.find((c) => c.slug === slug);
                return (
                  <FilterChip
                    key={slug}
                    label={cat?.name ?? slug}
                    onRemove={() => toggleArrayValue("categories", slug)}
                  />
                );
              })}
              {filters.materials.map((material) => (
                <FilterChip
                  key={material}
                  label={material}
                  onRemove={() => toggleArrayValue("materials", material)}
                />
              ))}
              {filters.inStockOnly && (
                <FilterChip
                  label="In stock"
                  onRemove={() => setFilters((f) => ({ ...f, inStockOnly: false }))}
                />
              )}
              {(filters.minPrice > 0 || filters.maxPrice < 1000000) && (
                <FilterChip
                  label={`${formatINR(filters.minPrice)} – ${
                    filters.maxPrice >= 1000000 ? "Any" : formatINR(filters.maxPrice)
                  }`}
                  onRemove={() =>
                    setFilters((f) => ({ ...f, minPrice: 0, maxPrice: 1000000 }))
                  }
                />
              )}
            </div>
          )}

          {products.length === 0 ? (
            <EmptyState
              title={emptyTitle ?? "No pieces available yet"}
              description={
                emptyDescription ??
                "This edit is being prepared. Explore the full collection in the meantime."
              }
              action={
                <Link to="/shop" className="btn-outline">
                  Explore all jewellery
                </Link>
              }
              className="py-16"
            />
          ) : visible.length === 0 ? (
            <EmptyState
              title="No pieces match these filters"
              description="Try widening your price range, clearing a filter, or searching for a different style."
              action={
                <Button onClick={reset} variant="outline">
                  Clear all filters
                </Button>
              }
              className="py-16"
            />
          ) : (
            <>
              <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 lg:grid-cols-3">
                {visible.map((product, index) => (
                  <ProductCard key={product.id} product={product} priority={index < 3} />
                ))}
              </div>
              {hasMore && (
                <div className="mt-12 flex flex-col items-center gap-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-stone">
                    You've viewed {visible.length} of {filtered.length} pieces
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setVisibleCount((c) => c + 9)}
                  >
                    Load more
                    <ArrowDown size={14} />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Modal
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        title="Refine"
        panelClassName="sm:max-w-md"
      >
        <div className="p-6">{filterPanel}
          <div className="mt-6 flex gap-3">
            <Button variant="outline" onClick={reset} className="flex-1">
              Clear
            </Button>
            <Button onClick={() => setMobileFiltersOpen(false)} className="flex-1">
              Show {filtered.length} pieces
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function FilterPanel({
  filters,
  setFilters,
  toggleArrayValue,
  reset,
  categories,
  materials,
  priceBounds,
}: {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  toggleArrayValue: (key: "categories" | "materials", value: string) => void;
  reset: () => void;
  categories: Category[];
  materials: string[];
  priceBounds: { min: number; max: number };
}) {
  return (
    <div className="divide-y divide-line">
      <FilterGroup title="Category">
        <div className="space-y-2.5">
          {categories.map((cat) => (
            <label key={cat.slug} className="flex cursor-pointer items-center gap-2.5 text-[12px] text-charcoal/75 hover:text-ink">
              <input
                type="checkbox"
                checked={filters.categories.includes(cat.slug)}
                onChange={() => toggleArrayValue("categories", cat.slug)}
                className="h-3.5 w-3.5 accent-[#C6A15B]"
              />
              {cat.name}
            </label>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Price">
        <div className="space-y-2.5">
          {[
            { label: "Under ₹5,000", min: 0, max: 5000 },
            { label: "₹5,000 – ₹20,000", min: 5000, max: 20000 },
            { label: "₹20,000 – ₹50,000", min: 20000, max: 50000 },
            { label: "Above ₹50,000", min: 50000, max: 1000000 },
          ].map((range) => (
            <label key={range.label} className="flex cursor-pointer items-center gap-2.5 text-[12px] text-charcoal/75 hover:text-ink">
              <input
                type="radio"
                name="price-preset"
                checked={filters.minPrice === range.min && filters.maxPrice === range.max}
                onChange={() =>
                  setFilters((f) => ({ ...f, minPrice: range.min, maxPrice: range.max }))
                }
                className="h-3.5 w-3.5 accent-[#C6A15B]"
              />
              {range.label}
            </label>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            aria-label="Minimum price"
            placeholder={String(priceBounds.min)}
            value={filters.minPrice || ""}
            onChange={(e) =>
              setFilters((f) => ({ ...f, minPrice: Math.max(0, Number(e.target.value) || 0) }))
            }
            className="h-9 w-full border border-line bg-white px-2.5 text-[11.5px] outline-none focus:border-gold"
          />
          <span className="text-stone">–</span>
          <input
            type="number"
            inputMode="numeric"
            aria-label="Maximum price"
            placeholder={String(priceBounds.max)}
            value={filters.maxPrice >= 1000000 ? "" : filters.maxPrice}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                maxPrice: Number(e.target.value) || 1000000,
              }))
            }
            className="h-9 w-full border border-line bg-white px-2.5 text-[11.5px] outline-none focus:border-gold"
          />
        </div>
      </FilterGroup>

      <FilterGroup title="Material">
        <div className="max-h-40 space-y-2.5 overflow-y-auto pr-1">
          {materials.map((material) => (
            <label key={material} className="flex cursor-pointer items-start gap-2.5 text-[12px] leading-snug text-charcoal/75 hover:text-ink">
              <input
                type="checkbox"
                checked={filters.materials.includes(material)}
                onChange={() => toggleArrayValue("materials", material)}
                className="mt-0.5 h-3.5 w-3.5 accent-[#C6A15B]"
              />
              {material}
            </label>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Availability">
        <label className="flex cursor-pointer items-center gap-2.5 text-[12px] text-charcoal/75 hover:text-ink">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => setFilters((f) => ({ ...f, inStockOnly: e.target.checked }))}
            className="h-3.5 w-3.5 accent-[#C6A15B]"
          />
          In stock only
        </label>
      </FilterGroup>

      <div className="pt-4 lg:hidden">
        <button onClick={reset} className="text-[11px] text-gold-dark underline underline-offset-2">
          Clear all filters
        </button>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-5">
      <p className="mb-3 text-[10px] uppercase tracking-[0.18em] text-ink">{title}</p>
      {children}
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 border border-gold/40 bg-gold/10 px-2.5 py-1 text-[10.5px] text-charcoal">
      {label}
      <button onClick={onRemove} aria-label={`Remove filter ${label}`} className="text-gold-dark hover:text-ink">
        <X size={11} />
      </button>
    </span>
  );
}
