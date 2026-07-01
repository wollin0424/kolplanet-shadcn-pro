export type H5PostLinkHealth = "empty" | "verified" | "private" | "issue";

export type H5PostLinkEntry = {
  id: string;
  url: string;
  health: H5PostLinkHealth;
  submitted: boolean;
};

export type H5InsightFile = {
  id: string;
  name: string;
  previewUrl: string;
  sizeLabel: string;
  /** Locked after a successful submit; cannot be removed. */
  locked?: boolean;
};

export type H5PostingState = {
  masters: H5PostLinkEntry[];
  mirrored: H5PostLinkEntry[];
  insightDraftFiles: H5InsightFile[];
  insightSubmitted: boolean;
};

const STORAGE_KEY = "kolplanet:h5-posting:v1";
const CHANGE_EVENT = "kolplanet:h5-posting-change";

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function readAll(): Record<string, H5PostingState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, H5PostingState>;
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, H5PostingState>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { key: STORAGE_KEY } }));
}

export function formatH5InsightFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function resolveLinkHealth(url: string): H5PostLinkHealth {
  const trimmed = url.trim();
  if (!trimmed) return "empty";
  if (/private/i.test(trimmed)) return "private";
  if (/invalid|error|404/i.test(trimmed)) return "issue";
  return "verified";
}

export function getDefaultH5PostingState(kolId: string): H5PostingState {
  if (kolId === "1") {
    return {
      masters: [
        {
          id: createId(),
          url: "https://www.instagram.com/p/3-private",
          health: "private",
          submitted: true,
        },
      ],
      mirrored: [{ id: createId(), url: "", health: "empty", submitted: false }],
      insightDraftFiles: [],
      insightSubmitted: false,
    };
  }

  return {
    masters: [{ id: createId(), url: "", health: "empty", submitted: false }],
    mirrored: [{ id: createId(), url: "", health: "empty", submitted: false }],
    insightDraftFiles: [],
    insightSubmitted: false,
  };
}

export function getH5PostingState(kolId: string): H5PostingState {
  const stored = readAll()[kolId];
  if (!stored) return getDefaultH5PostingState(kolId);
  if (!stored.insightSubmitted) return stored;
  return {
    ...stored,
    insightDraftFiles: stored.insightDraftFiles.map((file) => ({
      ...file,
      // Pending uploads must explicitly set locked: false; legacy rows without the field stay locked.
      locked: file.locked === false ? false : true,
    })),
  };
}

export function subscribeH5PostingChanges(listener: () => void) {
  if (typeof window === "undefined") return () => undefined;
  const handler = () => listener();
  window.addEventListener(CHANGE_EVENT, handler);
  return () => window.removeEventListener(CHANGE_EVENT, handler);
}

function updateState(kolId: string, updater: (state: H5PostingState) => H5PostingState) {
  const all = readAll();
  const current = all[kolId] ?? getDefaultH5PostingState(kolId);
  all[kolId] = updater(current);
  writeAll(all);
}

export function hasVerifiedMasterPost(state: H5PostingState) {
  return state.masters.some((entry) => entry.submitted && entry.health === "verified");
}

export function updateMasterUrl(kolId: string, entryId: string, url: string) {
  updateState(kolId, (state) => ({
    ...state,
    masters: state.masters.map((entry) =>
      entry.id === entryId && !entry.submitted
        ? { ...entry, url, health: "empty" as const }
        : entry
    ),
  }));
}

export function refreshMasterLink(kolId: string, entryId: string) {
  updateState(kolId, (state) => ({
    ...state,
    masters: state.masters.map((entry) => {
      if (entry.id !== entryId) return entry;
      const health = resolveLinkHealth(entry.url);
      return {
        ...entry,
        health,
        submitted: entry.url.trim().length > 0,
      };
    }),
  }));
}

export function addMasterPost(kolId: string) {
  updateState(kolId, (state) => ({
    ...state,
    masters: [
      ...state.masters,
      { id: createId(), url: "", health: "empty", submitted: false },
    ],
  }));
}

export function updateMirroredDraftUrl(kolId: string, entryId: string, url: string) {
  updateState(kolId, (state) => ({
    ...state,
    mirrored: state.mirrored.map((entry) =>
      entry.id === entryId && !entry.submitted
        ? { ...entry, url, health: "empty" as const }
        : entry
    ),
  }));
}

export function submitMasterLink(kolId: string, entryId: string) {
  refreshMasterLink(kolId, entryId);
}

export function submitMirroredLink(kolId: string, entryId: string) {
  updateState(kolId, (state) => ({
    ...state,
    mirrored: state.mirrored.map((entry) => {
      if (entry.id !== entryId) return entry;
      if (!entry.url.trim()) return entry;
      const health = resolveLinkHealth(entry.url);
      return { ...entry, health, submitted: true };
    }),
  }));
}

export function refreshMirroredLink(kolId: string, entryId: string) {
  updateState(kolId, (state) => ({
    ...state,
    mirrored: state.mirrored.map((entry) => {
      if (entry.id !== entryId) return entry;
      const health = resolveLinkHealth(entry.url);
      return { ...entry, health, submitted: entry.url.trim().length > 0 };
    }),
  }));
}

export function addMirroredPost(kolId: string) {
  updateState(kolId, (state) => ({
    ...state,
    mirrored: [
      ...state.mirrored,
      { id: createId(), url: "", health: "empty", submitted: false },
    ],
  }));
}

export function addInsightDraftFiles(kolId: string, files: H5InsightFile[]) {
  updateState(kolId, (state) => ({
    ...state,
    insightDraftFiles: [
      ...state.insightDraftFiles,
      ...files.map((file) => ({ ...file, locked: false as const })),
    ],
  }));
}

export function removeInsightDraftFile(kolId: string, fileId: string) {
  updateState(kolId, (state) => ({
    ...state,
    insightDraftFiles: state.insightDraftFiles.filter(
      (file) => file.id !== fileId || file.locked
    ),
  }));
}

export function submitInsightReport(kolId: string) {
  updateState(kolId, (state) => {
    const hasPending = state.insightDraftFiles.some((file) => !file.locked);
    if (!hasPending) return state;

    return {
      ...state,
      insightSubmitted: true,
      insightDraftFiles: state.insightDraftFiles.map((file) =>
        file.locked ? file : { ...file, locked: true }
      ),
    };
  });
}
