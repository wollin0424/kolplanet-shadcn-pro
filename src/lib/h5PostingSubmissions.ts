export type H5PostLinkHealth = "empty" | "verifying" | "verified" | "private" | "issue";

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

const VERIFICATION_DELAY_MS = 2000;

function scheduleMasterVerification(kolId: string, entryId: string) {
  if (typeof window === "undefined") return;
  window.setTimeout(() => {
    updateState(kolId, (state) => ({
      ...state,
      masters: state.masters.map((entry) => {
        if (entry.id !== entryId || entry.health !== "verifying") return entry;
        return {
          ...entry,
          health: resolveLinkHealth(entry.url),
          submitted: true,
        };
      }),
    }));
  }, VERIFICATION_DELAY_MS);
}

function scheduleMirroredVerification(kolId: string, entryId: string) {
  if (typeof window === "undefined") return;
  window.setTimeout(() => {
    updateState(kolId, (state) => ({
      ...state,
      mirrored: state.mirrored.map((entry) => {
        if (entry.id !== entryId || entry.health !== "verifying") return entry;
        return {
          ...entry,
          health: resolveLinkHealth(entry.url),
          submitted: true,
        };
      }),
    }));
  }, VERIFICATION_DELAY_MS);
}

function resolveLinkHealth(url: string): H5PostLinkHealth {
  const trimmed = url.trim();
  if (!trimmed) return "empty";
  if (/private/i.test(trimmed)) return "private";
  if (/invalid|error|404/i.test(trimmed)) return "issue";
  return "verified";
}

export type H5FigmaPostingStateKey =
  | "empty"
  | "links-draft"
  | "links-verified"
  | "links-errors"
  | "insight-pending"
  | "insight-submitted";

const FIGMA_INSIGHT_PREVIEW = "/script-empty-workspace.png";

function parseFigmaPostingStateKey(
  value: string | undefined
): H5FigmaPostingStateKey {
  const key = value?.trim().toLowerCase();
  if (
    key === "empty" ||
    key === "links-draft" ||
    key === "links-verified" ||
    key === "links-errors" ||
    key === "insight-pending" ||
    key === "insight-submitted"
  ) {
    return key;
  }
  return "empty";
}

export function getFigmaCaptureH5PostingState(
  _kolId: string,
  stateKey?: string
): H5PostingState {
  const state = parseFigmaPostingStateKey(stateKey);

  if (state === "empty") {
    return {
      masters: [{ id: "figma-master-0", url: "", health: "empty", submitted: false }],
      mirrored: [{ id: "figma-mirrored-0", url: "", health: "empty", submitted: false }],
      insightDraftFiles: [],
      insightSubmitted: false,
    };
  }

  if (state === "links-draft") {
    return {
      masters: [
        {
          id: "figma-master-0",
          url: "https://www.instagram.com/p/draft-not-submitted/",
          health: "empty",
          submitted: false,
        },
      ],
      mirrored: [{ id: "figma-mirrored-0", url: "", health: "empty", submitted: false }],
      insightDraftFiles: [],
      insightSubmitted: false,
    };
  }

  if (state === "links-verified") {
    return {
      masters: [
        {
          id: "figma-master-0",
          url: "https://www.instagram.com/p/figma-verified/",
          health: "verified",
          submitted: true,
        },
      ],
      mirrored: [{ id: "figma-mirrored-0", url: "", health: "empty", submitted: false }],
      insightDraftFiles: [],
      insightSubmitted: false,
    };
  }

  if (state === "links-errors") {
    return {
      masters: [
        {
          id: "figma-master-private",
          url: "https://www.instagram.com/p/3-private",
          health: "private",
          submitted: true,
        },
        {
          id: "figma-master-issue",
          url: "https://www.instagram.com/p/invalid-error-404",
          health: "issue",
          submitted: true,
        },
      ],
      mirrored: [
        {
          id: "figma-mirrored-issue",
          url: "https://www.tiktok.com/invalid-error",
          health: "issue",
          submitted: true,
        },
      ],
      insightDraftFiles: [],
      insightSubmitted: false,
    };
  }

  if (state === "insight-pending") {
    return {
      masters: [
        {
          id: "figma-master-0",
          url: "https://www.instagram.com/p/figma-verified/",
          health: "verified",
          submitted: true,
        },
      ],
      mirrored: [{ id: "figma-mirrored-0", url: "", health: "empty", submitted: false }],
      insightDraftFiles: [
        {
          id: "figma-insight-draft-1",
          name: "insight-week-1.png",
          previewUrl: FIGMA_INSIGHT_PREVIEW,
          sizeLabel: "1.1 MB",
          locked: false,
        },
        {
          id: "figma-insight-draft-2",
          name: "insight-week-2.png",
          previewUrl: FIGMA_INSIGHT_PREVIEW,
          sizeLabel: "860 KB",
          locked: false,
        },
      ],
      insightSubmitted: false,
    };
  }

  return {
    masters: [
      {
        id: "figma-master-0",
        url: "https://www.instagram.com/p/figma-verified/",
        health: "verified",
        submitted: true,
      },
    ],
    mirrored: [
      {
        id: "figma-mirrored-0",
        url: "https://www.tiktok.com/@creator/video/figma-mirrored",
        health: "verified",
        submitted: true,
      },
    ],
    insightDraftFiles: [
      {
        id: "figma-insight-submitted-1",
        name: "insight-jun-01.png",
        previewUrl: FIGMA_INSIGHT_PREVIEW,
        sizeLabel: "420 KB",
        locked: true,
      },
      {
        id: "figma-insight-submitted-2",
        name: "insight-jun-08.png",
        previewUrl: FIGMA_INSIGHT_PREVIEW,
        sizeLabel: "380 KB",
        locked: true,
      },
      {
        id: "figma-insight-draft-1",
        name: "insight-new-upload.png",
        previewUrl: FIGMA_INSIGHT_PREVIEW,
        sizeLabel: "1.1 MB",
        locked: false,
      },
    ],
    insightSubmitted: true,
  };
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

export function subscribeH5InsightSync(listener: (kolId: string) => void) {
  if (typeof window === "undefined") return () => undefined;

  const handler = (event: Event) => {
    const detail = (event as CustomEvent<{ kolId: string }>).detail;
    if (detail?.kolId) listener(detail.kolId);
  };

  window.addEventListener("kolplanet:h5-insight-sync", handler);
  return () => window.removeEventListener("kolplanet:h5-insight-sync", handler);
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
      if (!entry.url.trim()) {
        return { ...entry, health: "empty" as const, submitted: false };
      }
      if (entry.health === "verifying") {
        return {
          ...entry,
          health: resolveLinkHealth(entry.url),
          submitted: true,
        };
      }
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
  let shouldVerify = false;
  updateState(kolId, (state) => ({
    ...state,
    masters: state.masters.map((entry) => {
      if (entry.id !== entryId || !entry.url.trim() || entry.submitted) return entry;
      shouldVerify = true;
      return { ...entry, submitted: true, health: "verifying" as const };
    }),
  }));
  if (shouldVerify) scheduleMasterVerification(kolId, entryId);
}

export function submitMirroredLink(kolId: string, entryId: string) {
  let shouldVerify = false;
  updateState(kolId, (state) => ({
    ...state,
    mirrored: state.mirrored.map((entry) => {
      if (entry.id !== entryId || !entry.url.trim() || entry.submitted) return entry;
      shouldVerify = true;
      return { ...entry, submitted: true, health: "verifying" as const };
    }),
  }));
  if (shouldVerify) scheduleMirroredVerification(kolId, entryId);
}

export function refreshMirroredLink(kolId: string, entryId: string) {
  updateState(kolId, (state) => ({
    ...state,
    mirrored: state.mirrored.map((entry) => {
      if (entry.id !== entryId) return entry;
      if (!entry.url.trim()) {
        return { ...entry, health: "empty" as const, submitted: false };
      }
      if (entry.health === "verifying") {
        return {
          ...entry,
          health: resolveLinkHealth(entry.url),
          submitted: true,
        };
      }
      const health = resolveLinkHealth(entry.url);
      return {
        ...entry,
        health,
        submitted: entry.url.trim().length > 0,
      };
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

/** Web admin: remove any H5 insight file, including submitted/locked ones. */
export function removeH5InsightFile(kolId: string, fileId: string) {
  updateState(kolId, (state) => {
    const insightDraftFiles = state.insightDraftFiles.filter((file) => file.id !== fileId);
    return {
      ...state,
      insightDraftFiles,
      insightSubmitted: insightDraftFiles.length > 0 ? state.insightSubmitted : false,
    };
  });

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("kolplanet:h5-insight-sync", { detail: { kolId } })
    );
  }
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

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("kolplanet:h5-insight-sync", { detail: { kolId } })
    );
  }
}
