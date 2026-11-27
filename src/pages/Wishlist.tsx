import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { useToast } from "@/context/ToastContext";
import { useCatalogue } from "@/context/CatalogueContext";
import { ProductCard } from "@/components/product/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";

export function Wishlist() {
  const { wishlist, toggleWishlist, addToCart } = useStore();
  const { notify } = useToast();
  const { getProductById } = useCatalogue();
  const products = wishlist.flatMap((id) => {
    const product = getProductById(id);
    return product ? [product] : [];
  });

  const addAll = () => {
    products.filter((p) => p.stock > 0).forEach((p) => addToCart(p.id, 1, p.sizes?.[0]));
    notify(`${products.filter((p) => p.stock > 0).length} pieces added to your bag.`);
  };

  return (
    <div className="container-lux py-8 lg:py-12">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Wishlist" }]} />
      <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="eyebrow">Saved Pieces</p>
          <h1 className="mt-2 font-serif text-3xl text-ink sm:text-4xl">Your Wishlist</h1>
          <p className="mt-2 text-[12px] text-charcoal/55">
            {products.length} {products.length === 1 ? "piece" : "pieces"} saved to this browser.
          </p>
        </div>
        {products.length > 0 && (
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={addAll}>
              Add all to bag
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                products.forEach((p) => toggleWishlist(p.id));
                notify("Wishlist cleared.", "info");
              }}
            >
              Clear wishlist
            </Button>
          </div>
        )}
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="Your wishlist is waiting"
          description="Save the pieces you love and return to them whenever you're ready."
          icon={<Heart size={24} className="text-gold-dark" />}
          action={<Link to="/new-arrivals" className="btn-primary">Discover new arrivals</Link>}
          className="py-24"
        />
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
