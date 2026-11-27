import { useParams } from "react-router-dom";
import { useCatalogue } from "@/context/CatalogueContext";
import { ListingView } from "@/components/product/ListingView";
import { NotFound } from "./NotFound";

export function CollectionPage() {
  const { slug } = useParams<{ slug: string }>();
  const { collections, publishedProducts, sectionImages } = useCatalogue();
  const collection = slug
    ? collections.find((entry) => entry.slug === slug)
    : undefined;

  if (!collection) return <NotFound />;

  const scoped = publishedProducts.filter((p) =>
    p.collections.includes(collection.slug)
  );

  return (
    <ListingView
      key={collection.slug}
      title={collection.name}
      eyebrow={collection.tagline}
      description={collection.intro}
      banner={
        collection.slug === "bridal"
          ? sectionImages.bridalBanner || collection.banner
          : collection.banner
      }
      bannerAlt={`${collection.name} campaign imagery`}
      crumb={collection.name}
      products={scoped}
      collection={collection.slug}
      contextLabel={collection.name}
    />
  );
}
