import { useParams } from "react-router-dom";
import { useCatalogue } from "@/context/CatalogueContext";
import { ListingView } from "@/components/product/ListingView";
import { shopCategoryImage } from "@/data/siteImages";
import { NotFound } from "./NotFound";

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { categories, publishedProducts } = useCatalogue();
  const category = slug
    ? categories.find((entry) => entry.slug === slug)
    : undefined;

  if (!category) return <NotFound />;

  const scoped = publishedProducts.filter((p) => p.category === category.slug);
  // Seeded categories always use the curated local photograph, even if an
  // older taxonomy saved in the browser still points at a stale image path.
  const banner = shopCategoryImage(category.slug) ?? category.image;

  return (
    <ListingView
      key={category.slug}
      title={category.name}
      eyebrow="Shop the category"
      description={category.blurb}
      banner={banner}
      bannerAlt={category.name}
      crumb={category.name}
      products={scoped}
      contextLabel={category.name}
    />
  );
}
