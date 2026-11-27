import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Category, Collection } from "@/types";
import { AdminPageHeader, AdminTable, AdminField } from "@/components/admin/AdminUI";
import { ImageManager } from "@/components/admin/ImageManager";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ProductImage } from "@/components/ui/ProductImage";
import { useCatalogue } from "@/context/CatalogueContext";
import { slugify } from "@/lib/utils";

export function AdminCategories() {
  const {
    categories,
    collections,
    products,
    saveCategory,
    deleteCategory,
    saveCollection,
    deleteCollection,
  } = useCatalogue();

  const [catModal, setCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [deletingCat, setDeletingCat] = useState<Category | null>(null);
  const [catDraft, setCatDraft] = useState({ name: "", blurb: "", image: "" });
  const [catError, setCatError] = useState("");

  const [colModal, setColModal] = useState(false);
  const [editingCol, setEditingCol] = useState<Collection | null>(null);
  const [deletingCol, setDeletingCol] = useState<Collection | null>(null);
  const [colDraft, setColDraft] = useState({
    name: "",
    tagline: "",
    description: "",
    intro: "",
    banner: "",
  });
  const [colError, setColError] = useState("");

  const openAddCat = () => {
    setEditingCat(null);
    setCatDraft({ name: "", blurb: "", image: "" });
    setCatError("");
    setCatModal(true);
  };

  const openEditCat = (category: Category) => {
    setEditingCat(category);
    setCatDraft({
      name: category.name,
      blurb: category.blurb,
      image: category.image,
    });
    setCatError("");
    setCatModal(true);
  };

  const saveCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (catDraft.name.trim().length < 2) {
      setCatError("Enter a category name.");
      return;
    }
    if (!catDraft.image) {
      setCatError("Add a category image.");
      return;
    }
    const slug =
      editingCat?.slug ?? (slugify(catDraft.name) || `category-${Date.now()}`);
    if (!editingCat && categories.some((c) => c.slug === slug)) {
      setCatError("A category with that name already exists.");
      return;
    }
    saveCategory({
      slug,
      name: catDraft.name.trim(),
      blurb: catDraft.blurb.trim() || "New category",
      image: catDraft.image,
      featured: true,
    });
    setCatModal(false);
  };

  const openAddCol = () => {
    setEditingCol(null);
    setColDraft({ name: "", tagline: "", description: "", intro: "", banner: "" });
    setColError("");
    setColModal(true);
  };

  const openEditCol = (collection: Collection) => {
    setEditingCol(collection);
    setColDraft({
      name: collection.name,
      tagline: collection.tagline,
      description: collection.description,
      intro: collection.intro,
      banner: collection.banner,
    });
    setColError("");
    setColModal(true);
  };

  const saveCol = (e: React.FormEvent) => {
    e.preventDefault();
    if (colDraft.name.trim().length < 2) {
      setColError("Enter a collection name.");
      return;
    }
    const slug =
      editingCol?.slug ?? (slugify(colDraft.name) || `collection-${Date.now()}`);
    if (!editingCol && collections.some((c) => c.slug === slug)) {
      setColError("A collection with that name already exists.");
      return;
    }
    saveCollection({
      slug,
      name: colDraft.name.trim(),
      tagline: colDraft.tagline.trim() || "Curated edit",
      description: colDraft.description.trim() || "",
      intro: colDraft.intro.trim() || colDraft.description.trim() || "",
      banner: colDraft.banner || categories[0]?.image || "",
    });
    setColModal(false);
  };

  return (
    <div>
      <AdminPageHeader
        title="Categories & collections"
        description="Shape how the catalogue is grouped. Slugs are used in storefront URLs."
        action={
          <Button size="sm" onClick={openAddCat}>
            <Plus size={14} /> Add category
          </Button>
        }
      />

      <AdminTable head={["Category", "Slug", "Products", "Description", "Actions"]}>
        {categories.map((category) => {
          const count = products.filter((p) => p.category === category.slug).length;
          return (
            <tr key={category.slug} className="text-[11.5px]">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <ProductImage src={category.image} alt={category.name} label={category.name} className="h-11 w-11 shrink-0" />
                  <p className="font-medium text-ink">{category.name}</p>
                </div>
              </td>
              <td className="px-4 py-3 text-[10px] text-stone">{category.slug}</td>
              <td className="px-4 py-3 text-charcoal">{count}</td>
              <td className="max-w-[260px] px-4 py-3 text-charcoal/55">{category.blurb}</td>
              <td className="px-4 py-3">
                <div className="flex gap-1">
                  <button onClick={() => openEditCat(category)} aria-label={`Edit ${category.name}`} className="p-1.5 text-charcoal/60 hover:text-gold-dark">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => setDeletingCat(category)} aria-label={`Delete ${category.name}`} className="p-1.5 text-charcoal/60 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </AdminTable>

      <div className="mt-10 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl text-ink">Collections</h2>
          <p className="mt-1 text-[11px] text-stone">
            Curated edits surfaced in navigation and on the homepage.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={openAddCol}>
          <Plus size={14} /> Add collection
        </Button>
      </div>

      <div className="mt-4">
        <AdminTable head={["Collection", "Tagline", "Pieces", "Banner", "Actions"]}>
          {collections.map((collection) => (
            <tr key={collection.slug} className="text-[11.5px]">
              <td className="px-4 py-3">
                <p className="font-medium text-ink">{collection.name}</p>
                <p className="text-[9px] text-stone">{collection.slug}</p>
              </td>
              <td className="px-4 py-3 text-charcoal/60">{collection.tagline}</td>
              <td className="px-4 py-3 text-charcoal">
                {products.filter((p) => p.collections.includes(collection.slug)).length}
              </td>
              <td className="px-4 py-3">
                <ProductImage src={collection.banner} alt={collection.name} label={collection.name} className="h-10 w-16 shrink-0" />
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-1">
                  <button onClick={() => openEditCol(collection)} aria-label={`Edit ${collection.name}`} className="p-1.5 text-charcoal/60 hover:text-gold-dark">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => setDeletingCol(collection)} aria-label={`Delete ${collection.name}`} className="p-1.5 text-charcoal/60 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      </div>

      <p className="mt-4 text-[10px] leading-relaxed text-stone">
        Deleting a category or collection never deletes its products. Products keep
        their assignment so you can restore the grouping later.
      </p>

      <Modal open={catModal} onClose={() => setCatModal(false)} title={editingCat ? "Edit category" : "Add category"} panelClassName="sm:max-w-lg">
        <form onSubmit={saveCat} className="space-y-4 p-6">
          <AdminField id="cat-name" label="Category name" value={catDraft.name} onChange={(v) => setCatDraft({ ...catDraft, name: v })} required />
          <AdminField id="cat-blurb" label="Short description" value={catDraft.blurb} onChange={(v) => setCatDraft({ ...catDraft, blurb: v })} />
          <ImageManager
            images={catDraft.image ? [catDraft.image] : []}
            onChange={(images) => setCatDraft({ ...catDraft, image: images[0] ?? "" })}
            single
            label="Category image"
          />
          {catError && <p className="text-[10.5px] text-red-500">{catError}</p>}
          <div className="flex gap-3 pt-1">
            <Button type="submit" className="flex-1">Save category</Button>
            <Button variant="outline" className="flex-1" onClick={() => setCatModal(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      <Modal open={colModal} onClose={() => setColModal(false)} title={editingCol ? "Edit collection" : "Add collection"} panelClassName="sm:max-w-lg">
        <form onSubmit={saveCol} className="space-y-4 p-6">
          <AdminField id="col-name" label="Collection name" value={colDraft.name} onChange={(v) => setColDraft({ ...colDraft, name: v })} required />
          <AdminField id="col-tagline" label="Tagline" value={colDraft.tagline} onChange={(v) => setColDraft({ ...colDraft, tagline: v })} />
          <AdminField id="col-description" label="Short description" value={colDraft.description} onChange={(v) => setColDraft({ ...colDraft, description: v })} />
          <div>
            <label htmlFor="col-intro" className="field-label">Intro paragraph</label>
            <textarea
              id="col-intro"
              rows={3}
              value={colDraft.intro}
              onChange={(e) => setColDraft({ ...colDraft, intro: e.target.value })}
              className="field h-auto resize-none py-2.5 text-[12.5px]"
            />
          </div>
          <ImageManager
            images={colDraft.banner ? [colDraft.banner] : []}
            onChange={(images) => setColDraft({ ...colDraft, banner: images[0] ?? "" })}
            single
            label="Collection banner"
          />
          {colError && <p className="text-[10.5px] text-red-500">{colError}</p>}
          <div className="flex gap-3 pt-1">
            <Button type="submit" className="flex-1">Save collection</Button>
            <Button variant="outline" className="flex-1" onClick={() => setColModal(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(deletingCat)} onClose={() => setDeletingCat(null)} title="Delete category" panelClassName="sm:max-w-md">
        <div className="p-6">
          <p className="text-[13px] leading-relaxed text-charcoal/70">
            Delete <strong className="text-ink">{deletingCat?.name}</strong>? Products in
            this category will remain in the catalogue.
          </p>
          <div className="mt-6 flex gap-3">
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (deletingCat) deleteCategory(deletingCat.slug);
                setDeletingCat(null);
              }}
            >
              Delete
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => setDeletingCat(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      <Modal open={Boolean(deletingCol)} onClose={() => setDeletingCol(null)} title="Delete collection" panelClassName="sm:max-w-md">
        <div className="p-6">
          <p className="text-[13px] leading-relaxed text-charcoal/70">
            Delete <strong className="text-ink">{deletingCol?.name}</strong>? Products stay
            in the catalogue and other collections.
          </p>
          <div className="mt-6 flex gap-3">
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (deletingCol) deleteCollection(deletingCol.slug);
                setDeletingCol(null);
              }}
            >
              Delete
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => setDeletingCol(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
