import type { Product } from "@/types";
import { products } from "@/data/products";
import { apiRequest, isApiConfigured } from "./apiClient";
import { sleep } from "@/lib/utils";

/**
 * Product reads go to the Spring Boot API when VITE_API_BASE_URL is set.
 * Otherwise the bundled demonstration catalogue is used and is labelled as
 * sample data in the admin UI.
 */
export const productService = {
  async list(): Promise<Product[]> {
    if (isApiConfigured()) {
      return apiRequest<Product[]>("/products");
    }
    await sleep(250);
    return products;
  },

  async getBySlug(slug: string): Promise<Product | undefined> {
    if (isApiConfigured()) {
      return apiRequest<Product>(`/products/${encodeURIComponent(slug)}`);
    }
    await sleep(200);
    return products.find((p) => p.slug === slug);
  },
};
