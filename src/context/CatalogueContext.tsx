import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  Banner,
  Category,
  Collection,
  PolicyPage,
  Product,
  SectionImageKey,
  SectionImages,
  StoreSettings,
} from "@/types";
import {
  products as seedProducts,
  categories as seedCategories,
  collections as seedCollections,
} from "@/data/products";
import {
  banners as seedBanners,
  sectionImages as seedSectionImages,
  storeSettings as seedSettings,
} from "@/data/site";
import { policyPages as seedPolicies } from "@/data/policies";
import { deleteStoredImage, isStoredImageRef } from "@/lib/imageStore";
import { STORAGE_KEYS } from "@/lib/storage";

const SCHEMA_VERSION = 2;

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as { version?: number; data?: T };
    if (parsed.version !== SCHEMA_VERSION || parsed.data === undefined) {
      return fallback;
    }
    return parsed.data;
  } catch {
    return fallback;
  }
}

function persist<T>(key: string, data: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify({ version: SCHEMA_VERSION, data }));
  } catch {
    /* Storage can fail in private mode or when full; the session still works. */
  }
}

export interface CatalogueValue {
  products: Product[];
  categories: Category[];
  collections: Collection[];
  banners: Banner[];
  policies: PolicyPage[];
  settings: StoreSettings;
  sectionImages: SectionImages;
  publishedProducts: Product[];
  getProductBySlug: (slug: string) => Product | undefined;
  getProductById: (id: string) => Product | undefined;
  getCategory: (slug: string) => Category | undefined;
  getCollection: (slug: string) => Collection | undefined;
  getPolicy: (kind: string) => PolicyPage | undefined;
  saveProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  saveCategory: (category: Category) => void;
  deleteCategory: (slug: string) => void;
  saveCollection: (collection: Collection) => void;
  deleteCollection: (slug: string) => void;
  saveBanner: (banner: Banner) => void;
  deleteBanner: (id: string) => void;
  updatePolicy: (kind: string, page: PolicyPage) => void;
  updateSettings: (patch: Partial<StoreSettings>) => void;
  updateSectionImage: (key: SectionImageKey, ref: string) => void;
  isImageReferenced: (ref: string) => boolean;
  deleteImageIfUnused: (ref: string) => Promise<boolean>;
  restoreDefaults: () => void;
}

const CatalogueContext = createContext<CatalogueValue | null>(null);

function upsert<T>(list: T[], item: T, same: (a: T, b: T) => boolean): T[] {
  const index = list.findIndex((entry) => same(entry, item));
  if (index === -1) return [item, ...list];
  const next = list.slice();
  next[index] = item;
  return next;
}

export function CatalogueProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() =>
    load(STORAGE_KEYS.catalogue, seedProducts)
  );
  const [taxonomy] = useState<{ categories: Category[]; collections: Collection[] } | null>(() =>
    load(STORAGE_KEYS.taxonomy, null)
  );
  const [categories, setCategories] = useState<Category[]>(
    () => taxonomy?.categories ?? seedCategories
  );
  const [collections, setCollections] = useState<Collection[]>(
    () => taxonomy?.collections ?? seedCollections
  );
  const [banners, setBanners] = useState<Banner[]>(() =>
    load(STORAGE_KEYS.banners, seedBanners)
  );
  const [policies, setPolicies] = useState<PolicyPage[]>(() =>
    load(STORAGE_KEYS.policies, seedPolicies)
  );
  // Merge defaults so settings saved by an older build gain newly added fields
  // (support message, social links, payment methods) instead of becoming undefined.
  const [settings, setSettings] = useState<StoreSettings>(() => ({
    ...seedSettings,
    ...load<Partial<StoreSettings>>(STORAGE_KEYS.settings, {}),
  }));
  const [sectionImages, setSectionImages] = useState<SectionImages>(() => ({
    ...seedSectionImages,
    ...load<Partial<SectionImages>>(STORAGE_KEYS.sectionImages, {}),
  }));

  useEffect(() => persist(STORAGE_KEYS.catalogue, products), [products]);
  useEffect(
    () => persist(STORAGE_KEYS.taxonomy, { categories, collections }),
    [categories, collections]
  );
  useEffect(() => persist(STORAGE_KEYS.banners, banners), [banners]);
  useEffect(() => persist(STORAGE_KEYS.policies, policies), [policies]);
  useEffect(() => persist(STORAGE_KEYS.settings, settings), [settings]);
  useEffect(
    () => persist(STORAGE_KEYS.sectionImages, sectionImages),
    [sectionImages]
  );

  const publishedProducts = useMemo(
    () => products.filter((product) => product.published !== false),
    [products]
  );

  const getProductBySlug = useCallback(
    (slug: string) => products.find((product) => product.slug === slug),
    [products]
  );
  const getProductById = useCallback(
    (id: string) => products.find((product) => product.id === id),
    [products]
  );
  const getCategory = useCallback(
    (slug: string) => categories.find((category) => category.slug === slug),
    [categories]
  );
  const getCollection = useCallback(
    (slug: string) => collections.find((collection) => collection.slug === slug),
    [collections]
  );
  const getPolicy = useCallback(
    (kind: string) => policies.find((page) => page.kind === kind),
    [policies]
  );

  const imageRefs = useMemo(() => {
    const refs = new Set<string>();
    products.forEach((product) => product.images.forEach((ref) => refs.add(ref)));
    banners.forEach((banner) => {
      if (banner.image) refs.add(banner.image);
    });
    categories.forEach((category) => {
      if (category.image) refs.add(category.image);
    });
    collections.forEach((collection) => {
      if (collection.banner) refs.add(collection.banner);
    });
    Object.values(sectionImages).forEach((ref) => {
      if (ref) refs.add(ref);
    });
    return refs;
  }, [products, banners, categories, collections, sectionImages]);

  const isImageReferenced = useCallback(
    (ref: string) => imageRefs.has(ref),
    [imageRefs]
  );

  const deleteImageIfUnused = useCallback(
    async (ref: string) => {
      if (!isStoredImageRef(ref)) return false;
      if (imageRefs.has(ref)) return false;
      await deleteStoredImage(ref);
      return true;
    },
    [imageRefs]
  );

  const value = useMemo<CatalogueValue>(
    () => ({
      products,
      categories,
      collections,
      banners,
      policies,
      settings,
      sectionImages,
      publishedProducts,
      getProductBySlug,
      getProductById,
      getCategory,
      getCollection,
      getPolicy,
      saveProduct: (product) =>
        setProducts((list) => upsert(list, product, (a, b) => a.id === b.id)),
      deleteProduct: (id) => setProducts((list) => list.filter((p) => p.id !== id)),
      saveCategory: (category) =>
        setCategories((list) =>
          upsert(list, category, (a, b) => a.slug === b.slug)
        ),
      deleteCategory: (slug) =>
        setCategories((list) => list.filter((c) => c.slug !== slug)),
      saveCollection: (collection) =>
        setCollections((list) =>
          upsert(list, collection, (a, b) => a.slug === b.slug)
        ),
      deleteCollection: (slug) =>
        setCollections((list) => list.filter((c) => c.slug !== slug)),
      saveBanner: (banner) =>
        setBanners((list) => upsert(list, banner, (a, b) => a.id === b.id)),
      deleteBanner: (id) => setBanners((list) => list.filter((b) => b.id !== id)),
      updatePolicy: (_kind, page) =>
        setPolicies((list) => upsert(list, page, (a, b) => a.kind === b.kind)),
      updateSettings: (patch) =>
        setSettings((current) => ({ ...current, ...patch })),
      updateSectionImage: (key, ref) =>
        setSectionImages((current) => ({ ...current, [key]: ref })),
      isImageReferenced,
      deleteImageIfUnused,
      restoreDefaults: () => {
        setProducts(seedProducts);
        setCategories(seedCategories);
        setCollections(seedCollections);
        setBanners(seedBanners);
        setPolicies(seedPolicies);
        setSettings(seedSettings);
        setSectionImages(seedSectionImages);
      },
    }),
    [
      products,
      categories,
      collections,
      banners,
      policies,
      settings,
      sectionImages,
      publishedProducts,
      getProductBySlug,
      getProductById,
      getCategory,
      getCollection,
      getPolicy,
      isImageReferenced,
      deleteImageIfUnused,
    ]
  );

  return (
    <CatalogueContext.Provider value={value}>{children}</CatalogueContext.Provider>
  );
}

export function useCatalogue(): CatalogueValue {
  const context = useContext(CatalogueContext);
  if (!context) {
    throw new Error("useCatalogue must be used inside a CatalogueProvider");
  }
  return context;
}
