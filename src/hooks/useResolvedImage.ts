import { useEffect, useState } from "react";
import { cachedImageUrl, isStoredImageRef, resolveImageRef } from "@/lib/imageStore";

/**
 * Resolves a product/banner image reference to a displayable URL.
 * Plain paths resolve synchronously; `idb:` references resolve from IndexedDB
 * and become object URLs once available.
 */
export function useResolvedImage(ref: string | undefined): string {
  const [url, setUrl] = useState(() => {
    if (!ref) return "";
    return isStoredImageRef(ref) ? cachedImageUrl(ref) ?? "" : ref;
  });

  useEffect(() => {
    if (!ref) {
      setUrl("");
      return;
    }
    if (!isStoredImageRef(ref)) {
      setUrl(ref);
      return;
    }
    const cached = cachedImageUrl(ref);
    if (cached) {
      setUrl(cached);
      return;
    }
    let active = true;
    resolveImageRef(ref)
      .then((next) => {
        if (active) setUrl(next);
      })
      .catch(() => {
        if (active) setUrl("");
      });
    return () => {
      active = false;
    };
  }, [ref]);

  return url;
}
