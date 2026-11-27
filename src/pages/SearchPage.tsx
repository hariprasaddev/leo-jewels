import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useCatalogue } from "@/context/CatalogueContext";
import { ProductCard } from "@/components/product/ProductCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initial = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initial);
  const { publishedProducts } = useCatalogue();

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  const results = useMemo(() => {
    const q = initial.trim().toLowerCase();
    if (!q) return [];
    return publishedProducts.filter((p) =>
      `${p.name} ${p.description} ${p.category} ${p.material} ${p.tags.join(" ")}`
        .toLowerCase()
        .includes(q)
    );
  }, [initial, publishedProducts]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams();
    if (query.trim()) next.set("q", query.trim());
    setSearchParams(next);
  };

  return (
    <div className="container-lux py-8 lg:py-12">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Search" }]} />
      <div className="mt-6 max-w-2xl">
        <p className="eyebrow">Find Your Piece</p>
        <h1 className="mt-2 font-serif text-3xl text-ink sm:text-4xl">
          Search LEO JEWELS
        </h1>
        <p className="mt-3 text-[13px] text-charcoal/60">
          Search by name, material, or collection — try “pearl”, “silver ring” or
          “bridal”.
        </p>
        <form onSubmit={submit} className="mt-6 flex items-center border-b border-ink/25 pb-2">
          <Search size={19} className="mr-3 shrink-0 text-stone" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search necklaces, rings, earrings…"
            aria-label="Search products"
            className="w-full bg-transparent font-serif text-xl text-ink outline-none placeholder:text-stone/60"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSearchParams({});
              }}
              aria-label="Clear search"
              className="mr-2 text-stone hover:text-ink"
            >
              <X size={17} />
            </button>
          )}
          <Button type="submit" size="sm">
            Search
          </Button>
        </form>
      </div>

      <div className="mt-10">
        {!initial.trim() ? (
          <EmptyState
            title="What are you looking for?"
            description="Enter a product name, material or occasion above to explore the collection."
          />
        ) : results.length === 0 ? (
          <EmptyState
            title={`No results for “${initial}”`}
            description="Check the spelling, try a more general term, or browse the collections from the navigation."
            action={
              <Button variant="outline" onClick={() => setSearchParams({ q: "gold" })}>
                Search gold-tone pieces
              </Button>
            }
          />
        ) : (
          <>
            <p className="border-b border-line pb-4 text-[11px] text-stone">
              <span className="text-charcoal">{results.length}</span>{" "}
              {results.length === 1 ? "piece" : "pieces"} found for “{initial}”
            </p>
            <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 lg:grid-cols-4">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
