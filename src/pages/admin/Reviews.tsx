import { useMemo, useState } from "react";
import { Star, Eye, EyeOff, Trash2 } from "lucide-react";
import { AdminPageHeader, AdminTable } from "@/components/admin/AdminUI";
import { DemoNote } from "@/components/ui/DemoNote";
import { Rating } from "@/components/ui/Rating";
import { reviews as seedReviews } from "@/data/products";
import { useCatalogue } from "@/context/CatalogueContext";
import { formatDate } from "@/lib/utils";

interface AdminReview {
  id: string;
  author: string;
  productName: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
  published: boolean;
}

function buildInitialReviews(
  findProduct: (id: string) => { name: string } | undefined
): AdminReview[] {
  return seedReviews.map((review) => ({
    id: review.id,
    author: review.author,
    productName: findProduct(review.productId)?.name ?? "Unknown product",
    rating: review.rating,
    title: review.title,
    body: review.body,
    date: review.date,
    verified: review.verified,
    published: true,
  }));
}

export function AdminReviews() {
  const { getProductById } = useCatalogue();
  const [items, setItems] = useState<AdminReview[]>(() =>
    buildInitialReviews(getProductById)
  );
  const [filter, setFilter] = useState<"all" | "published" | "hidden">("all");

  const filtered = useMemo(
    () =>
      items.filter((r) =>
        filter === "all" ? true : filter === "published" ? r.published : !r.published
      ),
    [items, filter]
  );

  const average =
    items.length > 0 ? items.reduce((sum, r) => sum + r.rating, 0) / items.length : 0;

  return (
    <div>
      <AdminPageHeader
        title="Reviews"
        description="Moderate sample customer reviews. Publish or hide them from the storefront."
      />

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: "Total reviews", value: String(items.length) },
          { label: "Published", value: String(items.filter((r) => r.published).length) },
          { label: "Hidden", value: String(items.filter((r) => !r.published).length) },
          { label: "Average rating", value: average.toFixed(1) },
        ].map((stat) => (
          <div key={stat.label} className="border border-line bg-white px-3.5 py-3">
            <p className="text-[8.5px] uppercase tracking-[0.14em] text-stone">{stat.label}</p>
            <p className="mt-1.5 font-serif text-xl text-ink">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex gap-1.5">
        {(["all", "published", "hidden"] as const).map((option) => (
          <button
            key={option}
            onClick={() => setFilter(option)}
            className={
              filter === option
                ? "border border-ink bg-ink px-3 py-1.5 text-[9.5px] uppercase tracking-[0.12em] text-ivory"
                : "border border-line bg-white px-3 py-1.5 text-[9.5px] uppercase tracking-[0.12em] text-charcoal/60 hover:border-charcoal/30"
            }
          >
            {option}
          </button>
        ))}
      </div>

      <AdminTable head={["Review", "Product", "Rating", "Date", "Status", "Actions"]}>
        {filtered.map((review) => (
          <tr key={review.id} className="text-[11.5px]">
            <td className="max-w-[320px] px-4 py-3">
              <p className="font-medium text-ink">{review.title}</p>
              <p className="mt-0.5 line-clamp-2 text-[10.5px] leading-relaxed text-charcoal/55">{review.body}</p>
              <p className="mt-1 text-[9.5px] text-stone">
                {review.author}{review.verified ? " · Verified purchase" : ""}
              </p>
            </td>
            <td className="max-w-[160px] px-4 py-3 text-charcoal/65">{review.productName}</td>
            <td className="px-4 py-3">
              <Rating value={review.rating} size={11} />
            </td>
            <td className="px-4 py-3 text-charcoal/55">{formatDate(review.date)}</td>
            <td className="px-4 py-3">
              <span
                className={
                  review.published
                    ? "border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[8.5px] uppercase tracking-[0.1em] text-emerald-700"
                    : "border border-line bg-cream px-2 py-0.5 text-[8.5px] uppercase tracking-[0.1em] text-stone"
                }
              >
                {review.published ? "Published" : "Hidden"}
              </span>
            </td>
            <td className="px-4 py-3">
              <div className="flex gap-1">
                <button
                  onClick={() =>
                    setItems((current) =>
                      current.map((r) => (r.id === review.id ? { ...r, published: !r.published } : r))
                    )
                  }
                  aria-label={review.published ? "Hide review" : "Publish review"}
                  className="p-1.5 text-charcoal/60 hover:text-gold-dark"
                >
                  {review.published ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button
                  onClick={() => setItems((current) => current.filter((r) => r.id !== review.id))}
                  aria-label="Delete review"
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
              No reviews in this view.
            </td>
          </tr>
        )}
      </AdminTable>

      <DemoNote className="mt-4">
        Reviews are sample content. Moderation changes apply to this admin session only and
        do not alter the storefront. A real review system needs server-side persistence and
        purchase verification.
      </DemoNote>

      <div className="mt-4 flex items-center gap-2 text-[10px] text-stone">
        <Star size={12} className="text-gold-dark" />
        Ratings displayed on product pages come from the sample catalogue.
      </div>
    </div>
  );
}
