import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/Button";
import { useCatalogue } from "@/context/CatalogueContext";
import { listStoredImages, type StoredImage } from "@/lib/imageStore";
import { useResolvedImage } from "@/hooks/useResolvedImage";

function MediaThumb({ imageRef, name }: { imageRef: string; name: string }) {
  const src = useResolvedImage(imageRef);
  return src ? (
    <img src={src} alt={name} className="h-full w-full object-cover" loading="lazy" />
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-beige text-[9px] uppercase tracking-[0.15em] text-stone">
      No preview
    </div>
  );
}

export function AdminMedia() {
  const { isImageReferenced, deleteImageIfUnused } = useCatalogue();
  const [images, setImages] = useState<StoredImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  const refresh = async () => {
    const stored = await listStoredImages();
    setImages(
      stored.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    );
    setLoading(false);
  };

  useEffect(() => {
    void refresh();
  }, []);

  const remove = async (image: StoredImage) => {
    const ref = `idb:${image.id}`;
    if (isImageReferenced(ref)) {
      setNotice("This image is still used by a product, category, collection or banner.");
      return;
    }
    const deleted = await deleteImageIfUnused(ref);
    setNotice(
      deleted
        ? "Image deleted."
        : "This image could not be deleted because it is still referenced."
    );
    await refresh();
  };

  return (
    <div>
      <AdminPageHeader
        title="Media library"
        description="Images uploaded from this browser. Files are stored locally as blobs, so they are not part of the deployed bundle."
      />

      {notice && (
        <p className="mb-4 border border-gold/40 bg-gold/10 px-3 py-2 text-[11px] text-gold-deep">
          {notice}
        </p>
      )}

      {loading ? (
        <p className="text-[12px] text-stone">Loading library…</p>
      ) : images.length === 0 ? (
        <div className="border border-dashed border-line bg-white px-6 py-14 text-center">
          <p className="text-[13px] text-charcoal/70">No uploaded images yet.</p>
          <p className="mt-1 text-[11px] text-stone">
            Upload images while adding a product, category, collection or banner.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {images.map((image) => {
            const ref = `idb:${image.id}`;
            const used = isImageReferenced(ref);
            return (
              <div key={image.id} className="border border-line bg-white">
                <div className="aspect-[4/3] w-full overflow-hidden bg-cream">
                  <MediaThumb imageRef={ref} name={image.name} />
                </div>
                <div className="p-3">
                  <p className="truncate text-[11.5px] font-medium text-ink" title={image.name}>
                    {image.name}
                  </p>
                  <p className="mt-0.5 text-[9.5px] text-stone">
                    {(image.size / 1024).toFixed(0)} KB ·{" "}
                    {new Date(image.createdAt).toLocaleDateString("en-IN")}
                  </p>
                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <span
                      className={
                        used
                          ? "border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[8px] uppercase tracking-[0.1em] text-emerald-700"
                          : "border border-line bg-cream px-2 py-0.5 text-[8px] uppercase tracking-[0.1em] text-stone"
                      }
                    >
                      {used ? "In use" : "Unused"}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={used}
                      onClick={() => void remove(image)}
                      className="px-2 py-1"
                    >
                      <Trash2 size={12} /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-4 text-[10px] leading-relaxed text-stone">
        Deleting an unused image removes it from this browser's IndexedDB. Images
        referenced anywhere in the catalogue are protected and cannot be deleted.
      </p>
    </div>
  );
}
