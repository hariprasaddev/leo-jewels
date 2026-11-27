import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, RefreshCw, Star, Trash2, Upload } from "lucide-react";
import {
  ACCEPTED_IMAGE_LABEL,
  MAX_IMAGE_BYTES,
  saveImage,
} from "@/lib/imageStore";
import { useResolvedImage } from "@/hooks/useResolvedImage";
import { cn } from "@/lib/utils";

interface ImageManagerProps {
  images: string[];
  onChange: (images: string[]) => void;
  /** Banners only ever hold one image. */
  single?: boolean;
  label?: string;
  maxImages?: number;
}

function Thumb({ src, alt }: { src: string; alt: string }) {
  const resolved = useResolvedImage(src);
  if (!resolved) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-beige text-[9px] uppercase tracking-[0.15em] text-stone">
        No preview
      </div>
    );
  }
  return (
    <img
      src={resolved}
      alt={alt}
      loading="lazy"
      className="h-full w-full object-cover"
    />
  );
}

export function ImageManager({
  images,
  onChange,
  single = false,
  label = "Product images",
  maxImages = 8,
}: ImageManagerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [url, setUrl] = useState("");

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError("");
    const room = single ? 1 : Math.max(0, maxImages - images.length);
    if (room === 0) {
      setError(`You can add up to ${maxImages} images. Remove one first.`);
      return;
    }
    setUploading(true);
    const added: string[] = [];
    const rejected: string[] = [];
    for (const file of Array.from(files).slice(0, room)) {
      try {
        added.push(await saveImage(file));
      } catch (uploadError) {
        rejected.push(
          uploadError instanceof Error ? uploadError.message : `${file.name} could not be added.`
        );
      }
    }
    if (added.length) {
      onChange(single ? [added[0]] : [...images, ...added]);
    }
    if (rejected.length) setError(rejected[0]);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const replaceImage = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file || replaceIndex === null) return;
    setUploading(true);
    setError("");
    try {
      const ref = await saveImage(file);
      onChange(images.map((src, i) => (i === replaceIndex ? ref : src)));
    } catch (replaceError) {
      setError(
        replaceError instanceof Error
          ? replaceError.message
          : "The replacement image could not be added."
      );
    } finally {
      setUploading(false);
      setReplaceIndex(null);
      if (replaceRef.current) replaceRef.current.value = "";
    }
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const next = images.slice();
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  const remove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const addUrl = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith("/")) {
      setError(
        "Use an uploaded file or a path to an image bundled in this site (starting with /)."
      );
      return;
    }
    if (single) onChange([trimmed]);
    else if (images.length < maxImages) onChange([...images, trimmed]);
    setUrl("");
    setError("");
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="field-label mb-0">{label}</p>
        <p className="text-[9.5px] text-stone">
          {ACCEPTED_IMAGE_LABEL} · max {Math.round(MAX_IMAGE_BYTES / (1024 * 1024))} MB
          {!single && ` · ${images.length}/${maxImages}`}
        </p>
      </div>

      {images.length > 0 ? (
        <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {images.map((src, index) => (
            <div
              key={`${src}-${index}`}
              className="group relative overflow-hidden border border-line bg-cream"
            >
              <div className="aspect-[4/5] w-full">
                <Thumb src={src} alt={`Image ${index + 1}`} />
              </div>
              {index === 0 && (
                <span className="absolute left-1.5 top-1.5 bg-gold px-1.5 py-0.5 text-[8.5px] uppercase tracking-[0.12em] text-ink">
                  Primary
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-ink/75 px-1.5 py-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                {!single && (
                  <div className="flex gap-0.5">
                    <button
                      type="button"
                      aria-label="Move image earlier"
                      onClick={() => move(index, index - 1)}
                      disabled={index === 0}
                      className="p-1 text-ivory/80 hover:text-gold disabled:opacity-30"
                    >
                      <ArrowLeft size={12} />
                    </button>
                    <button
                      type="button"
                      aria-label="Move image later"
                      onClick={() => move(index, index + 1)}
                      disabled={index === images.length - 1}
                      className="p-1 text-ivory/80 hover:text-gold disabled:opacity-30"
                    >
                      <ArrowRight size={12} />
                    </button>
                  </div>
                )}
                <div className="ml-auto flex gap-0.5">
                  {index !== 0 && (
                    <button
                      type="button"
                      aria-label="Make primary image"
                      onClick={() => move(index, 0)}
                      className="p-1 text-ivory/80 hover:text-gold"
                    >
                      <Star size={12} />
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label="Replace image"
                    onClick={() => {
                      setReplaceIndex(index);
                      replaceRef.current?.click();
                    }}
                    className="p-1 text-ivory/80 hover:text-gold"
                  >
                    <RefreshCw size={12} />
                  </button>
                  <button
                    type="button"
                    aria-label="Remove image"
                    onClick={() => remove(index)}
                    className="p-1 text-ivory/80 hover:text-red-400"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-2.5 flex aspect-[4/1] flex-col items-center justify-center gap-1.5 border border-dashed border-line bg-cream/60 text-center">
          <ImagePlus size={20} className="text-stone" strokeWidth={1.4} />
          <p className="text-[10.5px] text-stone">
            No images yet — upload one or add a URL.
          </p>
        </div>
      )}

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple={!single}
          className="hidden"
          onChange={(e) => void handleFiles(e.target.files)}
        />
        <input
          ref={replaceRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => void replaceImage(e.target.files)}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 border border-line bg-white px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-charcoal transition-colors hover:border-gold disabled:opacity-50"
        >
          <Upload size={12} /> {uploading ? "Uploading…" : "Upload from computer"}
        </button>
        <div className="flex min-w-[190px] flex-1 items-center gap-1.5">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="…or add a bundled path (/images/…)"
            aria-label="Bundled image path"
            className="h-9 w-full border border-line bg-white px-2.5 text-[11px] outline-none focus:border-gold"
          />
          <button
            type="button"
            onClick={addUrl}
            className={cn(
              "h-9 shrink-0 border border-line px-2.5 text-[10px] uppercase tracking-[0.1em]",
              "text-charcoal transition-colors hover:border-gold"
            )}
          >
            Add
          </button>
        </div>
      </div>
      {error && <p className="mt-1.5 text-[10.5px] text-red-500">{error}</p>}
      {!single && images.length > 1 && (
        <p className="mt-1.5 text-[9.5px] leading-relaxed text-stone">
          The first image is the primary one. Hover an image to reorder, replace,
          set it as primary or remove it.
        </p>
      )}
    </div>
  );
}
