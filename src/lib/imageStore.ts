/**
 * IndexedDB-backed image storage.
 *
 * Uploaded files live in the browser as Blobs, never inside the product record.
 * A product or banner stores a short reference such as `idb:8f2c1a...`; the
 * records themselves stay small and serialisable. Deletion is guarded by the
 * catalogue layer, which checks references before calling `deleteImage`.
 */
const DB_NAME = "leojewels.media";
const DB_VERSION = 1;
const STORE = "images";

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const ACCEPTED_IMAGE_LABEL = "JPG, PNG or WebP";

export interface StoredImage {
  id: string;
  name: string;
  type: string;
  size: number;
  createdAt: string;
  blob: Blob;
}

export interface UploadValidation {
  ok: boolean;
  error?: string;
}

const isBrowser = typeof window !== "undefined";

function validate(file: File): UploadValidation {
  const type = file.type.toLowerCase();
  if (!ACCEPTED_IMAGE_TYPES.includes(type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    return { ok: false, error: `Use a ${ACCEPTED_IMAGE_LABEL} file.` };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return {
      ok: false,
      error: `Images must be under ${Math.round(MAX_IMAGE_BYTES / (1024 * 1024))} MB.`,
    };
  }
  if (file.size === 0) {
    return { ok: false, error: "That file is empty." };
  }
  return { ok: true };
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (!isBrowser || typeof indexedDB === "undefined") {
    return Promise.reject(new Error("Image storage is not available in this browser."));
  }
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Could not open image storage."));
  });
  return dbPromise;
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("Image storage failed."));
    tx.onabort = () => reject(tx.error ?? new Error("Image storage was aborted."));
  });
}

export function isStoredImageRef(ref: string | undefined | null): boolean {
  return typeof ref === "string" && ref.startsWith("idb:");
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function saveImage(file: File): Promise<string> {
  const check = validate(file);
  if (!check.ok) throw new Error(check.error);

  const record: StoredImage = {
    id: newId(),
    name: file.name,
    type: file.type,
    size: file.size,
    createdAt: new Date().toISOString(),
    blob: file,
  };
  const db = await openDb();
  const tx = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).put(record);
  await txDone(tx);
  return `idb:${record.id}`;
}

export async function getStoredImage(id: string): Promise<StoredImage | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, "readonly").objectStore(STORE).get(id);
    request.onsuccess = () => resolve(request.result as StoredImage | undefined);
    request.onerror = () =>
      reject(request.error ?? new Error("Could not read image."));
  });
}

export async function listStoredImages(): Promise<StoredImage[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
    request.onsuccess = () => resolve((request.result as StoredImage[]) ?? []);
    request.onerror = () =>
      reject(request.error ?? new Error("Could not list images."));
  });
}

export async function deleteStoredImage(ref: string): Promise<void> {
  const id = ref.replace(/^idb:/, "");
  const db = await openDb();
  const tx = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).delete(id);
  await txDone(tx);
  const cached = urlCache.get(ref);
  if (cached) {
    URL.revokeObjectURL(cached);
    urlCache.delete(ref);
  }
}

const urlCache = new Map<string, string>();

export function cachedImageUrl(ref: string): string | undefined {
  return urlCache.get(ref);
}

export async function resolveImageRef(ref: string): Promise<string> {
  if (!isStoredImageRef(ref)) return ref;
  const cached = urlCache.get(ref);
  if (cached) return cached;
  const record = await getStoredImage(ref.slice(4));
  if (!record?.blob) return "";
  const url = URL.createObjectURL(record.blob);
  urlCache.set(ref, url);
  return url;
}

export async function resolveOptional(ref?: string): Promise<string | undefined> {
  if (!ref) return undefined;
  try {
    return await resolveImageRef(ref);
  } catch {
    return undefined;
  }
}
