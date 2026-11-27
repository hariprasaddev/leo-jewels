import { useMemo } from "react";
import { useCatalogue } from "@/context/CatalogueContext";
import { ListingView } from "@/components/product/ListingView";

export function NewArrivals() {
  const { publishedProducts, sectionImages } = useCatalogue();

  const newProducts = useMemo(
    () =>
      publishedProducts
        .filter((product) => product.isNew)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    [publishedProducts]
  );

  return (
    <ListingView
      title="New Arrivals"
      eyebrow="The New Edit"
      description="Discover the latest expressions of timeless elegance."
      bannerDescription="A first look at the season's newest necklaces, rings and bridal pieces — chosen for the moments still to come."
      banner={sectionImages.newArrivalsBanner}
      bannerAlt="New gold jewellery arrivals"
      crumb="New Arrivals"
      products={newProducts}
      contextLabel="New Arrivals"
      showProductCount
      emptyTitle="New arrivals are on their way"
      emptyDescription="Our next edit is being finished by hand. Explore the full collection while the new pieces make their way to you."
    />
  );
}
