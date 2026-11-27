import { useMemo, useState } from "react";
import type { CollectionSlug, Product } from "@/types";

export type SortKey = "featured" | "price-asc" | "price-desc" | "popularity" | "newest";

export interface FilterState {
  query: string;
  sort: SortKey;
  categories: string[];
  materials: string[];
  minPrice: number;
  maxPrice: number;
  inStockOnly: boolean;
}

export const emptyFilters: FilterState = {
  query: "",
  sort: "featured",
  categories: [],
  materials: [],
  minPrice: 0,
  maxPrice: 1000000,
  inStockOnly: false,
};

export function useProductFilters(source: Product[], collection?: CollectionSlug) {
  const scoped = useMemo(
    () =>
      collection
        ? source.filter((p) => p.collections.includes(collection))
        : source,
    [source, collection]
  );

  const priceBounds = useMemo(() => {
    if (scoped.length === 0) return { min: 0, max: 100000 };
    const prices = scoped.map((p) => p.price);
    return {
      min: Math.floor(Math.min(...prices) / 500) * 500,
      max: Math.ceil(Math.max(...prices) / 500) * 500,
    };
  }, [scoped]);

  const [filters, setFilters] = useState<FilterState>({
    ...emptyFilters,
    minPrice: 0,
    maxPrice: 1000000,
  });
  const [visibleCount, setVisibleCount] = useState(9);

  const toggleArrayValue = (key: "categories" | "materials", value: string) => {
    setVisibleCount(9);
    setFilters((current) => {
      const next = current[key].includes(value)
        ? current[key].filter((v) => v !== value)
        : [...current[key], value];
      return { ...current, [key]: next };
    });
  };

  const reset = () => {
    setFilters(emptyFilters);
    setVisibleCount(9);
  };

  const filtered = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    const result = scoped.filter((p) => {
      if (
        query &&
        !`${p.name} ${p.category} ${p.material} ${p.tags.join(" ")}`
          .toLowerCase()
          .includes(query)
      )
        return false;
      if (filters.categories.length && !filters.categories.includes(p.category)) return false;
      if (filters.materials.length && !filters.materials.includes(p.material)) return false;
      if (p.price < filters.minPrice || p.price > filters.maxPrice) return false;
      if (filters.inStockOnly && p.stock <= 0) return false;
      return true;
    });

    const sorted = [...result];
    switch (filters.sort) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "popularity":
        sorted.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case "newest":
        sorted.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      default:
        sorted.sort(
          (a, b) =>
            Number(!!b.isBestSeller) - Number(!!a.isBestSeller) ||
            Number(!!b.isTrending) - Number(!!a.isTrending)
        );
    }
    return sorted;
  }, [scoped, filters]);

  const visible = filtered.slice(0, visibleCount);

  return {
    scoped,
    filters,
    setFilters,
    toggleArrayValue,
    reset,
    filtered,
    visible,
    visibleCount,
    setVisibleCount,
    hasMore: visibleCount < filtered.length,
    priceBounds,
  };
}
