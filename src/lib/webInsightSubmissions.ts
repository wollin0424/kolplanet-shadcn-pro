export type WebInsightStoredFile = {
  name: string;
  previewUrl: string;
  sizeLabel: string;
};

const STORAGE_KEY = "kolplanet:web-insight:v1";
const CHANGE_EVENT = "kolplanet:web-insight-change";

function readAll(): Record<string, WebInsightStoredFile[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, WebInsightStoredFile[]>;
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, WebInsightStoredFile[]>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getWebInsightFiles(rowId: string): WebInsightStoredFile[] {
  return readAll()[rowId] ?? [];
}

export function setWebInsightFiles(rowId: string, files: WebInsightStoredFile[]) {
  const all = readAll();
  if (files.length === 0) {
    delete all[rowId];
  } else {
    all[rowId] = files;
  }
  writeAll(all);
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(CHANGE_EVENT, { detail: { rowId } })
    );
  }
}

export function subscribeWebInsightChanges(
  listener: (rowId: string) => void
): () => void {
  if (typeof window === "undefined") return () => undefined;

  const handler = (event: Event) => {
    const detail = (event as CustomEvent<{ rowId: string }>).detail;
    if (detail?.rowId) listener(detail.rowId);
  };

  window.addEventListener(CHANGE_EVENT, handler);
  return () => window.removeEventListener(CHANGE_EVENT, handler);
}
