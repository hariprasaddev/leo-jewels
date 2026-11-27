import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search, Minus } from "lucide-react";
import type { Product } from "@/types";
import { AdminPageHeader, AdminTable, AdminField, StatusPill } from "@/components/admin/AdminUI";
import { ImageManager } from "@/components/admin/ImageManager";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ProductImage } from "@/components/ui/ProductImage";
import { useCatalogue } from "@/context/CatalogueContext";
import { cn, formatINR, generateId, slugify } from "@/lib/utils";

type StockFilter = "all" | "in" | "low" | "out";

interface ProductDraft {
  name: string;
  sku: string;
  category: string;
  collections: string[];
  price: string;
  mrp: string;
  stock: string;
  material: string;
  colour: string;
  plating: string;
  stone: string;
  dimensions: string;
  weight: string;
  description: string;
  details: string;
  images: string[];
  sizes: string;
  tags: string;
  isFeatured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  isTrending: boolean;
  published: boolean;
}

const EMPTY_DRAFT: ProductDraft = {
  name: "",
  sku: "",
  category: "",
  collections: [],
  price: "",
  mrp: "",
  stock: "",
  material: "",
  colour: "",
  plating: "",
  stone: "",
  dimensions: "",
  weight: "",
  description: "",
  details: "",
  images: [],
  sizes: "",
  tags: "",
  isFeatured: false,
  isNew: true,
  isBestSeller: false,
  isTrending: false,
  published: true,
};

export function AdminProducts() {
  const { products, categories, collections, saveProduct, deleteProduct } =
    useCatalogue();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [draft, setDraft] = useState<ProductDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleting, setDeleting] = useState<Product | null>(null);

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        if (
          query &&
          !`${p.name} ${p.sku} ${p.material}`.toLowerCase().includes(query.toLowerCase())
        )
          return false;
        if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
        if (stockFilter === "in" && p.stock <= 6) return false;
        if (stockFilter === "low" && (p.stock > 6 || p.stock === 0)) return false;
        if (stockFilter === "out" && p.stock !== 0) return false;
        return true;
      }),
    [products, query, categoryFilter, stockFilter]
  );

  const openAdd = () => {
    setEditing(null);
    setDraft({
      ...EMPTY_DRAFT,
      sku: `LJ-${Math.floor(1000 + Math.random() * 9000)}`,
      category: categories[0]?.slug ?? "",
    });
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setDraft({
      name: product.name,
      sku: product.sku,
      category: product.category,
      collections: [...product.collections],
      price: String(product.price),
      mrp: product.mrp ? String(product.mrp) : "",
      stock: String(product.stock),
      material: product.material,
      colour: product.colour ?? "",
      plating: product.plating ?? "",
      stone: product.stone ?? "",
      dimensions: product.dimensions ?? "",
      weight: product.weightGrams ? String(product.weightGrams) : "",
      description: product.description,
      details: product.details.join("\n"),
      images: [...product.images],
      sizes: product.sizes?.join(", ") ?? "",
      tags: product.tags.join(", "),
      isFeatured: Boolean(product.isFeatured),
      isNew: Boolean(product.isNew),
      isBestSeller: Boolean(product.isBestSeller),
      isTrending: Boolean(product.isTrending),
      published: product.published !== false,
    });
    setErrors({});
    setModalOpen(true);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (draft.name.trim().length < 3) next.name = "Enter a product name.";
    if (draft.sku.trim().length < 3) next.sku = "Enter a SKU.";
    if (!draft.category) next.category = "Choose a category.";
    if (!Number(draft.price) || Number(draft.price) <= 0) next.price = "Enter a valid price.";
    if (draft.mrp && Number(draft.mrp) < Number(draft.price))
      next.mrp = "MRP should be at least the selling price.";
    if (draft.stock === "" || Number(draft.stock) < 0) next.stock = "Enter stock quantity.";
    if (!draft.material.trim()) next.material = "Enter the material.";
    if (draft.images.length === 0) next.images = "Add at least one product image.";
    if (
      products.some(
        (p) =>
          p.sku.trim().toLowerCase() === draft.sku.trim().toLowerCase() &&
          p.id !== editing?.id
      )
    ) {
      next.sku = "That SKU is already in use.";
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    const splitList = (value: string) =>
      value
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean);
    const sizes = splitList(draft.sizes);
    const tags = splitList(draft.tags);
    const details = draft.details
      .split("\n")
      .map((entry) => entry.trim())
      .filter(Boolean);

    const base = {
      name: draft.name.trim(),
      sku: draft.sku.trim().toUpperCase(),
      category: draft.category,
      collections: draft.collections,
      price: Number(draft.price),
      mrp: draft.mrp ? Number(draft.mrp) : undefined,
      stock: Number(draft.stock),
      material: draft.material.trim(),
      colour: draft.colour.trim() || undefined,
      plating: draft.plating.trim() || undefined,
      stone: draft.stone.trim() || undefined,
      dimensions: draft.dimensions.trim() || undefined,
      weightGrams: draft.weight ? Number(draft.weight) : undefined,
      description: draft.description.trim(),
      details,
      images: draft.images,
      sizes: sizes.length ? sizes : undefined,
      tags,
      isFeatured: draft.isFeatured,
      isNew: draft.isNew,
      isBestSeller: draft.isBestSeller,
      isTrending: draft.isTrending,
      published: draft.published,
    };

    if (editing) {
      saveProduct({
        ...editing,
        ...base,
        description:
          base.description || editing.description,
        slug: editing.name === base.name ? editing.slug : slugify(base.name) || editing.slug,
      });
    } else {
      saveProduct({
        ...base,
        id: generateId("p"),
        slug: slugify(base.name) || generateId("piece"),
        description:
          base.description ||
          "Description to be completed. This product was added from the admin console.",
        details: details.length ? details : ["Added from the admin console"],
        rating: 0,
        reviewCount: 0,
        createdAt: new Date().toISOString().slice(0, 10),
      });
    }
    setModalOpen(false);
  };

  const discountPercent =
    draft.mrp && Number(draft.mrp) > Number(draft.price)
      ? Math.round((1 - Number(draft.price) / Number(draft.mrp)) * 100)
      : 0;

  const adjustStock = (product: Product, delta: number) => {
    saveProduct({ ...product, stock: Math.max(0, product.stock + delta) });
  };

  return (
    <div>
      <AdminPageHeader
        title="Products & inventory"
        description="Add, edit and remove catalogue pieces. Changes publish to the storefront immediately."
        action={
          <Button onClick={openAdd} size="sm">
            <Plus size={14} /> Add product
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or SKU…"
            aria-label="Search products"
            className="h-10 w-full border border-line bg-white pl-9 pr-3 text-[12px] outline-none focus:border-gold"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          aria-label="Filter by category"
          className="h-10 border border-line bg-white px-3 text-[11.5px] text-charcoal outline-none focus:border-gold"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value as StockFilter)}
          aria-label="Filter by stock"
          className="h-10 border border-line bg-white px-3 text-[11.5px] text-charcoal outline-none focus:border-gold"
        >
          <option value="all">All stock</option>
          <option value="in">In stock</option>
          <option value="low">Low stock (≤6)</option>
          <option value="out">Sold out</option>
        </select>
        <span className="ml-auto text-[10.5px] text-stone">{filtered.length} products</span>
      </div>

      <AdminTable head={["Product", "Category", "Price", "Stock", "Status", "Actions"]}>
        {filtered.map((product) => (
          <tr key={product.id} className="text-[11.5px]">
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <ProductImage src={product.images[0]} alt={product.name} label={product.name} className="h-12 w-10 shrink-0" />
                <div className="min-w-0">
                  <p className="max-w-[220px] truncate font-medium text-ink">{product.name}</p>
                  <p className="text-[9.5px] text-stone">{product.sku}</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3 text-charcoal/65">
              {categories.find((c) => c.slug === product.category)?.name ?? product.category}
            </td>
            <td className="px-4 py-3 text-ink">{formatINR(product.price)}</td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => adjustStock(product, -1)}
                  disabled={product.stock === 0}
                  aria-label={`Decrease stock for ${product.name}`}
                  className="flex h-6 w-6 items-center justify-center border border-line text-charcoal hover:border-ink disabled:opacity-30"
                >
                  <Minus size={10} />
                </button>
                <span className={cn("w-7 text-center tabular-nums", product.stock === 0 ? "text-red-500" : product.stock <= 6 ? "text-gold-deep" : "text-charcoal")}>
                  {product.stock}
                </span>
                <button
                  onClick={() => adjustStock(product, 1)}
                  aria-label={`Increase stock for ${product.name}`}
                  className="flex h-6 w-6 items-center justify-center border border-line text-charcoal hover:border-ink"
                >
                  <Plus size={10} />
                </button>
              </div>
            </td>
            <td className="px-4 py-3">
              <StatusPill
                status={
                  product.published === false
                    ? "Draft"
                    : product.stock === 0
                      ? "Sold out"
                      : product.stock <= 6
                        ? "Low stock"
                        : "Published"
                }
              />
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEdit(product)}
                  aria-label={`Edit ${product.name}`}
                  className="p-1.5 text-charcoal/60 hover:text-gold-dark"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => setDeleting(product)}
                  aria-label={`Delete ${product.name}`}
                  className="p-1.5 text-charcoal/60 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </td>
          </tr>
        ))}
        {filtered.length === 0 && (
          <tr>
            <td colSpan={6} className="px-4 py-10 text-center text-[12px] text-stone">
              No products match these filters.
            </td>
          </tr>
        )}
      </AdminTable>

      <p className="mt-4 text-[10px] leading-relaxed text-stone">
        Catalogue changes are saved in this browser and appear on the storefront
        immediately. Images are stored as blobs in IndexedDB and referenced by id;
        images still used by another product are never deleted.
      </p>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit product" : "Add product"}
        panelClassName="sm:max-w-3xl"
      >
        <form onSubmit={save} noValidate className="grid gap-4 p-6 sm:grid-cols-2">
          <AdminField id="prod-name" label="Product name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} required className="sm:col-span-2" />
          {errors.name && <p className="-mt-3 text-[10.5px] text-red-500 sm:col-span-2">{errors.name}</p>}
          <AdminField id="prod-sku" label="SKU" value={draft.sku} onChange={(v) => setDraft({ ...draft, sku: v })} required />
          <div>
            <label htmlFor="prod-category" className="field-label">Category</label>
            <select
              id="prod-category"
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value })}
              className="field h-11 text-[12.5px]"
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-[10.5px] text-red-500">{errors.category}</p>}
          </div>

          <div>
            <label htmlFor="prod-status" className="field-label">Product status</label>
            <select
              id="prod-status"
              value={draft.published ? "published" : "draft"}
              onChange={(e) => setDraft({ ...draft, published: e.target.value === "published" })}
              className="field h-11 text-[12.5px]"
            >
              <option value="published">Published — visible on storefront</option>
              <option value="draft">Draft — hidden from customers</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <p className="field-label">Collections</p>
            <div className="flex flex-wrap gap-1.5">
              {collections.map((collection) => {
                const active = draft.collections.includes(collection.slug);
                return (
                  <button
                    key={collection.slug}
                    type="button"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        collections: active
                          ? draft.collections.filter((c) => c !== collection.slug)
                          : [...draft.collections, collection.slug],
                      })
                    }
                    className={cn(
                      "border px-2.5 py-1.5 text-[10px] uppercase tracking-[0.1em] transition-colors",
                      active
                        ? "border-gold bg-gold/15 text-ink"
                        : "border-line bg-white text-charcoal/60 hover:border-gold/60"
                    )}
                  >
                    {collection.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="sm:col-span-2">
            <ImageManager
              images={draft.images}
              onChange={(images) => setDraft({ ...draft, images })}
            />
            {errors.images && <p className="mt-1 text-[10.5px] text-red-500">{errors.images}</p>}
          </div>

          <AdminField id="prod-price" label="Selling price (₹)" value={draft.price} onChange={(v) => setDraft({ ...draft, price: v.replace(/\D/g, "") })} required />
          <div>
            <AdminField id="prod-mrp" label="Compare-at MRP (₹, optional)" value={draft.mrp} onChange={(v) => setDraft({ ...draft, mrp: v.replace(/\D/g, "") })} />
            <p className="mt-1 text-[10px] text-stone">
              {discountPercent > 0
                ? `Discount: ${discountPercent}% off MRP, shown on the storefront.`
                : "Set an MRP above the selling price to show a discount."}
            </p>
          </div>
          <AdminField id="prod-stock" label="Stock quantity" value={draft.stock} onChange={(v) => setDraft({ ...draft, stock: v.replace(/\D/g, "") })} required />
          <AdminField id="prod-material" label="Material" value={draft.material} onChange={(v) => setDraft({ ...draft, material: v })} required />
          <AdminField id="prod-colour" label="Colour" value={draft.colour} onChange={(v) => setDraft({ ...draft, colour: v })} />
          <AdminField id="prod-plating" label="Plating / finish" value={draft.plating} onChange={(v) => setDraft({ ...draft, plating: v })} />
          <AdminField id="prod-stone" label="Stone details" value={draft.stone} onChange={(v) => setDraft({ ...draft, stone: v })} />
          <AdminField id="prod-dimensions" label="Dimensions" value={draft.dimensions} onChange={(v) => setDraft({ ...draft, dimensions: v })} />
          <AdminField id="prod-weight" label="Weight (g)" value={draft.weight} onChange={(v) => setDraft({ ...draft, weight: v.replace(/[^0-9.]/g, "") })} />
          <AdminField id="prod-sizes" label="Sizes (comma separated)" value={draft.sizes} onChange={(v) => setDraft({ ...draft, sizes: v })} />
          <AdminField id="prod-tags" label="Tags (comma separated)" value={draft.tags} onChange={(v) => setDraft({ ...draft, tags: v })} className="sm:col-span-2" />

          <div className="sm:col-span-2">
            <label htmlFor="prod-description" className="field-label">Description</label>
            <textarea
              id="prod-description"
              rows={3}
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              className="field h-auto resize-none py-2.5 text-[12.5px]"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="prod-details" className="field-label">Detail lines (one per line)</label>
            <textarea
              id="prod-details"
              rows={3}
              value={draft.details}
              onChange={(e) => setDraft({ ...draft, details: e.target.value })}
              className="field h-auto resize-none py-2.5 text-[12.5px]"
            />
          </div>

          <div className="sm:col-span-2">
            <p className="field-label">Merchandising</p>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {([
                ["isFeatured", "Featured"],
                ["isNew", "New arrival"],
                ["isBestSeller", "Best seller"],
                ["isTrending", "Trending"],
              ] as const).map(([key, label]) => (
                <label key={key} className="flex cursor-pointer items-center gap-2 text-[11.5px] text-charcoal/75">
                  <input
                    type="checkbox"
                    checked={draft[key]}
                    onChange={(e) => setDraft({ ...draft, [key]: e.target.checked })}
                    className="h-3.5 w-3.5 accent-[#C6A15B]"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {errors.price && <p className="-mt-3 text-[10.5px] text-red-500 sm:col-span-2">{errors.price}</p>}
          {errors.mrp && <p className="-mt-3 text-[10.5px] text-red-500 sm:col-span-2">{errors.mrp}</p>}
          {errors.stock && <p className="-mt-3 text-[10.5px] text-red-500 sm:col-span-2">{errors.stock}</p>}
          {errors.material && <p className="-mt-3 text-[10.5px] text-red-500 sm:col-span-2">{errors.material}</p>}
          {errors.sku && <p className="-mt-3 text-[10.5px] text-red-500 sm:col-span-2">{errors.sku}</p>}
          <div className="flex gap-3 pt-2 sm:col-span-2">
            <Button type="submit" className="flex-1">{editing ? "Save changes" : "Add product"}</Button>
            <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(deleting)} onClose={() => setDeleting(null)} title="Delete product" panelClassName="sm:max-w-md">
        <div className="p-6">
          <p className="text-[13px] leading-relaxed text-charcoal/70">
            Remove <strong className="text-ink">{deleting?.name}</strong> from the catalogue?
            This cannot be undone. Uploaded images used only by this product stay in
            storage until you remove them from the media library.
          </p>
          <div className="mt-6 flex gap-3">
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (deleting) deleteProduct(deleting.id);
                setDeleting(null);
              }}
            >
              Delete product
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => setDeleting(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
