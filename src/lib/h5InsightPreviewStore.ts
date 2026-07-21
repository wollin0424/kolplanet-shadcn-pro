const DB_NAME = "kolplanet-h5-insight-previews";
const DB_VERSION = 1;
const STORE_NAME = "previews";

const previewObjectUrlCache = new Map<string, string>();

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("IndexedDB is unavailable"));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB"));
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  return response.blob();
}

export function cacheH5InsightPreviewUrl(fileId: string, previewUrl: string) {
  previewObjectUrlCache.set(fileId, previewUrl);
}

export function revokeH5InsightPreviewUrl(fileId: string) {
  const cached = previewObjectUrlCache.get(fileId);
  if (cached?.startsWith("blob:")) {
    URL.revokeObjectURL(cached);
  }
  previewObjectUrlCache.delete(fileId);
}

export async function saveH5InsightPreview(fileId: string, previewUrl: string): Promise<void> {
  if (!previewUrl || typeof window === "undefined") return;

  if (previewUrl.startsWith("data:")) {
    const blob = await dataUrlToBlob(previewUrl);
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("Failed to save preview"));
      tx.objectStore(STORE_NAME).put(blob, fileId);
    });
    db.close();
    cacheH5InsightPreviewUrl(fileId, previewUrl);
    return;
  }

  cacheH5InsightPreviewUrl(fileId, previewUrl);
}

export async function getH5InsightPreview(fileId: string): Promise<string | undefined> {
  const cached = previewObjectUrlCache.get(fileId);
  if (cached) return cached;

  if (typeof window === "undefined") return undefined;

  const db = await openDb();
  const blob = await new Promise<Blob | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).get(fileId);
    request.onsuccess = () => resolve(request.result as Blob | undefined);
    request.onerror = () => reject(request.error ?? new Error("Failed to read preview"));
  });
  db.close();

  if (!blob) return undefined;

  const objectUrl = URL.createObjectURL(blob);
  previewObjectUrlCache.set(fileId, objectUrl);
  return objectUrl;
}

export async function deleteH5InsightPreview(fileId: string): Promise<void> {
  revokeH5InsightPreviewUrl(fileId);
  if (typeof window === "undefined") return;

  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("Failed to delete preview"));
    tx.objectStore(STORE_NAME).delete(fileId);
  });
  db.close();
}
