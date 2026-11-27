import { useCatalogue } from "@/context/CatalogueContext";
import { ListingView } from "@/components/product/ListingView";
import { SECTION_IMAGES } from "@/data/siteImages";

export function Shop() {
  const { publishedProducts } = useCatalogue();

  return (
    <ListingView
      title="All Jewellery"
      eyebrow="The Complete Edit"
      description="Every published LEO JEWELS piece in one place — filter by category, material and price to find the one that feels like you."
      banner={SECTION_IMAGES.promotional.bestSellers}
      bannerAlt="A curated edit of LEO JEWELS jewellery"
      crumb="All Jewellery"
      products={publishedProducts}
      contextLabel="All Jewellery"
    />
  );
}
