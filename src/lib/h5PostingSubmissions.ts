import {
  cacheH5InsightPreviewUrl,
  deleteH5InsightPreview,
  getH5InsightPreview,
  saveH5InsightPreview,
} from "@/lib/h5InsightPreviewStore";

export type H5PostLinkHealth = "empty" | "verifying" | "verified" | "private" | "issue";

export type H5PostLinkEntry = {
  id: string;
  url: string;
  health: H5PostLinkHealth;
  submitted: boolean;
};

export type H5MasterTaskGroup = {
  id: string;
  master: H5PostLinkEntry;
  mirrored: H5PostLinkEntry[];
  insightDraftFiles: H5InsightFile[];
  insightSubmitted: boolean;
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
  taskGroups: H5MasterTaskGroup[];
};

export const H5_MIRRORED_MAX = 3;

const STORAGE_KEY = "kolplanet:h5-posting:v3";
const LEGACY_STORAGE_KEYS = ["kolplanet:h5-posting:v2", "kolplanet:h5-posting:v1"];
const CHANGE_EVENT = "kolplanet:h5-posting-change";

type LegacyH5TaskGroup = {
  id: string;
  master: H5PostLinkEntry;
  mirrored: H5PostLinkEntry[];
  insightDraftFiles?: H5InsightFile[];
  insightSubmitted?: boolean;
};

type LegacyH5PostingState = {
  masters?: H5PostLinkEntry[];
  mirrored?: H5PostLinkEntry[];
  taskGroups?: LegacyH5TaskGroup[];
  insightDraftFiles?: H5InsightFile[];
  insightSubmitted?: boolean;
};

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createEmptyMasterEntry(): H5PostLinkEntry {
  return { id: createId(), url: "", health: "empty", submitted: false };
}

function createEmptyTaskGroup(): H5MasterTaskGroup {
  return {
    id: createId(),
    master: createEmptyMasterEntry(),
    mirrored: [],
    insightDraftFiles: [],
    insightSubmitted: false,
  };
}

function normalizeTaskGroup(group: LegacyH5TaskGroup): H5MasterTaskGroup {
  return {
    id: group.id,
    master: group.master,
    mirrored: group.mirrored.slice(0, H5_MIRRORED_MAX),
    insightDraftFiles: group.insightDraftFiles ?? [],
    insightSubmitted: group.insightSubmitted ?? false,
  };
}

function attachLegacyInsightToFirstGroup(
  taskGroups: H5MasterTaskGroup[],
  legacyInsightFiles: H5InsightFile[],
  legacyInsightSubmitted: boolean
): H5MasterTaskGroup[] {
  if (!legacyInsightFiles.length || !taskGroups.length) return taskGroups;
  if (taskGroups.some((group) => group.insightDraftFiles.length > 0)) return taskGroups;

  const [first, ...rest] = taskGroups;
  return [
    {
      ...first,
      insightDraftFiles: legacyInsightFiles,
      insightSubmitted: legacyInsightSubmitted,
    },
    ...rest,
  ];
}

function migrateLegacyPostingState(stored: LegacyH5PostingState): H5PostingState {
  const legacyInsightFiles = stored.insightDraftFiles ?? [];
  const legacyInsightSubmitted = stored.insightSubmitted ?? false;

  if (stored.taskGroups?.length) {
    const taskGroups = attachLegacyInsightToFirstGroup(
      stored.taskGroups.map(normalizeTaskGroup),
      legacyInsightFiles,
      legacyInsightSubmitted
    );
    return { taskGroups };
  }

  const masters =
    stored.masters?.length && stored.masters.length > 0
      ? stored.masters
      : [createEmptyMasterEntry()];
  const legacyMirrored = stored.mirrored ?? [];

  const taskGroups = attachLegacyInsightToFirstGroup(
    masters.map((master, index) => ({
      id: createId(),
      master,
      mirrored: index === 0 ? legacyMirrored : [],
      insightDraftFiles: [],
      insightSubmitted: false,
    })),
    legacyInsightFiles,
    legacyInsightSubmitted
  );

  return { taskGroups };
}

function isRasterDataPreview(previewUrl: string) {
  return (
    previewUrl.startsWith("data:image/") && !previewUrl.startsWith("data:image/svg+xml")
  );
}

function shouldPersistPreviewInStorage(previewUrl: string) {
  return previewUrl.startsWith("data:image/svg+xml");
}

function stripInsightFileForStorage(file: H5InsightFile): H5InsightFile {
  if (!file.previewUrl || shouldPersistPreviewInStorage(file.previewUrl)) return file;
  return { ...file, previewUrl: "" };
}

function stripPostingStateForStorage(state: H5PostingState): H5PostingState {
  return {
    taskGroups: state.taskGroups.map((group) => ({
      ...group,
      insightDraftFiles: group.insightDraftFiles.map(stripInsightFileForStorage),
    })),
  };
}

let previewMigrationScheduled = false;

function scheduleLegacyPreviewMigration(states: Record<string, H5PostingState>) {
  if (previewMigrationScheduled || typeof window === "undefined") return;
  previewMigrationScheduled = true;

  void (async () => {
    for (const state of Object.values(states)) {
      for (const group of state.taskGroups) {
        for (const file of group.insightDraftFiles) {
          if (isRasterDataPreview(file.previewUrl)) {
            await saveH5InsightPreview(file.id, file.previewUrl);
          }
        }
      }
    }

    const stripped = Object.fromEntries(
      Object.entries(states).map(([kolId, state]) => [
        kolId,
        stripPostingStateForStorage(state),
      ])
    );

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stripped));
    } catch {
      // Ignore quota errors during background migration.
    }
  })();
}

async function hydrateInsightFile(file: H5InsightFile): Promise<H5InsightFile> {
  if (file.previewUrl) {
    if (isRasterDataPreview(file.previewUrl)) {
      await saveH5InsightPreview(file.id, file.previewUrl);
      cacheH5InsightPreviewUrl(file.id, file.previewUrl);
    }
    return file;
  }

  const previewUrl = await getH5InsightPreview(file.id);
  return previewUrl ? { ...file, previewUrl } : file;
}

export async function hydrateInsightFiles(files: H5InsightFile[]): Promise<H5InsightFile[]> {
  return Promise.all(files.map((file) => hydrateInsightFile(file)));
}

export async function hydratePostingStateInsightPreviews(
  state: H5PostingState
): Promise<H5PostingState> {
  const taskGroups = await Promise.all(
    state.taskGroups.map(async (group) => ({
      ...group,
      insightDraftFiles: await hydrateInsightFiles(group.insightDraftFiles),
    }))
  );
  return { taskGroups };
}

function readAll(): Record<string, H5PostingState> {
  if (typeof window === "undefined") return {};
  try {
    let raw = window.localStorage.getItem(STORAGE_KEY);
    let fromLegacyKey: string | undefined;
    if (!raw) {
      for (const legacyKey of LEGACY_STORAGE_KEYS) {
        raw = window.localStorage.getItem(legacyKey);
        if (raw) {
          fromLegacyKey = legacyKey;
          break;
        }
      }
    }
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, LegacyH5PostingState>;
    const migrated = Object.fromEntries(
      Object.entries(parsed).map(([kolId, state]) => [kolId, migrateLegacyPostingState(state)])
    );
    if (fromLegacyKey) {
      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(
            Object.fromEntries(
              Object.entries(migrated).map(([kolId, state]) => [
                kolId,
                stripPostingStateForStorage(state),
              ])
            )
          )
        );
      } catch {
        // Ignore quota errors during migration write.
      }
    } else {
      const needsRepair = Object.values(migrated).some(
        (state) => !state.taskGroups?.length
      );
      if (needsRepair) {
        try {
          window.localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(
              Object.fromEntries(
                Object.entries(migrated).map(([kolId, state]) => [
                  kolId,
                  stripPostingStateForStorage(state),
                ])
              )
            )
          );
        } catch {
          // Ignore quota errors during repair write.
        }
      }
    }
    scheduleLegacyPreviewMigration(migrated);
    return migrated;
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, H5PostingState>) {
  if (typeof window === "undefined") return;
  const stripped = Object.fromEntries(
    Object.entries(data).map(([kolId, state]) => [kolId, stripPostingStateForStorage(state)])
  );
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stripped));
  } catch (error) {
    console.error("Failed to persist H5 posting state", error);
    return;
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { key: STORAGE_KEY } }));
}

export function formatH5InsightFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const VERIFICATION_DELAY_MS = 2000;

function scheduleMasterVerification(kolId: string, groupId: string) {
  if (typeof window === "undefined") return;
  window.setTimeout(() => {
    updateState(kolId, (state) => ({
      ...state,
      taskGroups: state.taskGroups.map((group) => {
        if (group.id !== groupId || group.master.health !== "verifying") return group;
        return {
          ...group,
          master: {
            ...group.master,
            health: resolveLinkHealth(group.master.url),
            submitted: true,
          },
        };
      }),
    }));
  }, VERIFICATION_DELAY_MS);
}

function scheduleMirroredVerification(kolId: string, groupId: string, entryId: string) {
  if (typeof window === "undefined") return;
  window.setTimeout(() => {
    updateState(kolId, (state) => ({
      ...state,
      taskGroups: state.taskGroups.map((group) => {
        if (group.id !== groupId) return group;
        return {
          ...group,
          mirrored: group.mirrored.map((entry) => {
            if (entry.id !== entryId || entry.health !== "verifying") return entry;
            return {
              ...entry,
              health: resolveLinkHealth(entry.url),
              submitted: true,
            };
          }),
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
  | "multi-master"
  | "links-draft"
  | "links-verified"
  | "links-errors"
  | "insight-pending"
  | "insight-submitted";

function figmaInsightPreviewDataUrl(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const FIGMA_H5_INSIGHT_PREVIEW_A = figmaInsightPreviewDataUrl(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240"><rect width="320" height="240" fill="#ffffff"/><circle cx="160" cy="112" r="56" fill="#E60023"/><path fill="#fff" d="M160 72c-10 0-18 7-18 16 0 6 4 12 9 14-1-3-2-7 0-10 1-2 5-20 5-20s-1 0-4-1c-4-2-3-6-1-8 2-2 7-2 7-2 6 1 7 7 6 11-1 5-4 9-4 9s2 0 4 1c10 7 6 21 6 21 0 0 2 0 4-1 7-4 12-12 12-22 0-14-10-24-22-24z"/></svg>`
);

const FIGMA_H5_INSIGHT_PREVIEW_B = figmaInsightPreviewDataUrl(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240"><rect width="320" height="240" fill="#ffffff"/><rect x="72" y="72" width="176" height="96" rx="20" fill="#06C755"/><text x="160" y="132" text-anchor="middle" fill="#fff" font-family="Arial,sans-serif" font-size="42" font-weight="700">LINE</text></svg>`
);

const FIGMA_H5_INSIGHT_PREVIEW_C = figmaInsightPreviewDataUrl(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240"><rect width="320" height="240" fill="#ffffff"/><circle cx="160" cy="112" r="56" fill="#2AABEE"/><path fill="#fff" d="M118 154l6-58c1-8 6-7 10-5l72 42c4 2 3 5-1 6l-74 28c-7 3-7 1-5-5l12-36 46-41c2-2 0-3-3-1l-56 35z"/></svg>`
);

function parseFigmaPostingStateKey(
  value: string | undefined
): H5FigmaPostingStateKey {
  const key = value?.trim().toLowerCase();
  // Developer-facing aliases for the core progressive states
  if (key === "links" || key === "after-links") return "links-verified";
  if (key === "images" || key === "after-images") return "insight-submitted";
  if (
    key === "empty" ||
    key === "multi-master" ||
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

export function getFigmaCaptureH5InsightHoverCardId(
  stateKey?: string
): string | undefined {
  const raw = stateKey?.trim().toLowerCase();
  // Hover is opt-in so default image states stay readable for developers
  if (raw === "insight-pending-hover" || raw === "insight-draft-hover") {
    return "figma-insight-draft-2";
  }
  if (raw === "insight-submitted-hover") {
    return "figma-insight-draft-1";
  }
  return undefined;
}

function figmaTaskGroup(
  master: H5PostLinkEntry,
  mirrored: H5PostLinkEntry[] = [],
  insight?: Pick<H5MasterTaskGroup, "insightDraftFiles" | "insightSubmitted">
): H5MasterTaskGroup {
  return {
    id: createId(),
    master,
    mirrored,
    insightDraftFiles: insight?.insightDraftFiles ?? [],
    insightSubmitted: insight?.insightSubmitted ?? false,
  };
}

function figmaDefaultState(taskGroups: H5MasterTaskGroup[]): H5PostingState {
  return { taskGroups };
}

export function getFigmaCaptureH5PostingState(
  _kolId: string,
  stateKey?: string
): H5PostingState {
  const state = parseFigmaPostingStateKey(stateKey);

  if (state === "empty") {
    return figmaDefaultState([createEmptyTaskGroup()]);
  }

  if (state === "multi-master") {
    return figmaDefaultState(Array.from({ length: 6 }, () => createEmptyTaskGroup()));
  }

  if (state === "links-draft") {
    return figmaDefaultState([
      figmaTaskGroup({
        id: "figma-master-0",
        url: "https://www.instagram.com/p/draft-not-submitted/",
        health: "empty",
        submitted: false,
      }),
    ]);
  }

  if (state === "links-verified") {
    return figmaDefaultState([
      figmaTaskGroup(
        {
          id: "figma-master-0",
          url: "https://www.instagram.com/p/figma-verified/",
          health: "verified",
          submitted: true,
        },
        [
          {
            id: "figma-mirrored-0",
            url: "https://www.tiktok.com/@creator/video/figma-mirrored",
            health: "verified",
            submitted: true,
          },
        ]
      ),
    ]);
  }

  if (state === "links-errors") {
    return figmaDefaultState([
      figmaTaskGroup(
        {
          id: "figma-master-private",
          url: "https://www.instagram.com/p/3-private",
          health: "private",
          submitted: true,
        },
        [
          {
            id: "figma-mirrored-issue",
            url: "https://www.tiktok.com/invalid-error",
            health: "issue",
            submitted: true,
          },
        ]
      ),
      figmaTaskGroup({
        id: "figma-master-issue",
        url: "https://www.instagram.com/p/invalid-error-404",
        health: "issue",
        submitted: true,
      }),
    ]);
  }

  if (state === "insight-pending") {
    return figmaDefaultState([
      figmaTaskGroup(
        {
          id: "figma-master-0",
          url: "https://www.instagram.com/p/figma-verified/",
          health: "verified",
          submitted: true,
        },
        [],
        {
          insightDraftFiles: [
            {
              id: "figma-insight-draft-1",
              name: "Pinterest.png",
              previewUrl: FIGMA_H5_INSIGHT_PREVIEW_A,
              sizeLabel: "3.9 KB",
              locked: false,
            },
            {
              id: "figma-insight-draft-2",
              name: "Line.png",
              previewUrl: FIGMA_H5_INSIGHT_PREVIEW_B,
              sizeLabel: "3.2 KB",
              locked: false,
            },
          ],
          insightSubmitted: false,
        }
      ),
    ]);
  }

  return figmaDefaultState([
    figmaTaskGroup(
      {
        id: "figma-master-0",
        url: "https://www.instagram.com/p/figma-verified/",
        health: "verified",
        submitted: true,
      },
      [
        {
          id: "figma-mirrored-0",
          url: "https://www.tiktok.com/@creator/video/figma-mirrored",
          health: "verified",
          submitted: true,
        },
      ],
      {
        insightDraftFiles: [
          {
            id: "figma-insight-submitted-1",
            name: "Pinterest.png",
            previewUrl: FIGMA_H5_INSIGHT_PREVIEW_A,
            sizeLabel: "3.9 KB",
            locked: true,
          },
          {
            id: "figma-insight-submitted-2",
            name: "Line.png",
            previewUrl: FIGMA_H5_INSIGHT_PREVIEW_B,
            sizeLabel: "3.2 KB",
            locked: true,
          },
          {
            id: "figma-insight-draft-1",
            name: "Telegram.png",
            previewUrl: FIGMA_H5_INSIGHT_PREVIEW_C,
            sizeLabel: "3.2 KB",
            locked: false,
          },
        ],
        insightSubmitted: true,
      }
    ),
  ]);
}

export function getDefaultH5PostingState(_kolId: string): H5PostingState {
  return {
    taskGroups: [createEmptyTaskGroup()],
  };
}

function normalizeLockedInsightFiles(files: H5InsightFile[]): H5InsightFile[] {
  return files.map((file) => ({
    ...file,
    locked: file.locked === false ? false : true,
  }));
}

export function getH5InsightFilesForMasterIndex(
  state: H5PostingState,
  masterIndex: number
): H5InsightFile[] {
  return state.taskGroups[masterIndex]?.insightDraftFiles ?? [];
}

export function getAllH5InsightFiles(state: H5PostingState): H5InsightFile[] {
  return state.taskGroups.flatMap((group) => group.insightDraftFiles);
}

export function getH5PostingState(kolId: string): H5PostingState {
  const stored = readAll()[kolId];
  if (!stored) return getDefaultH5PostingState(kolId);

  const normalized = migrateLegacyPostingState(stored as LegacyH5PostingState);
  const taskGroups =
    normalized.taskGroups.length > 0
      ? normalized.taskGroups
      : getDefaultH5PostingState(kolId).taskGroups;

  return {
    taskGroups: taskGroups.map((group) =>
      group.insightSubmitted
        ? {
            ...group,
            insightDraftFiles: normalizeLockedInsightFiles(group.insightDraftFiles),
          }
        : group
    ),
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
  return state.taskGroups.some(
    (group) => group.master.submitted && group.master.health === "verified"
  );
}

export function hasSubmittedMasterPost(state: H5PostingState) {
  return state.taskGroups.some(
    (group) => group.master.submitted && group.master.url.trim().length > 0
  );
}

export function updateMasterUrl(kolId: string, groupId: string, url: string) {
  updateState(kolId, (state) => ({
    ...state,
    taskGroups: state.taskGroups.map((group) =>
      group.id === groupId && !group.master.submitted
        ? {
            ...group,
            master: { ...group.master, url, health: "empty" as const },
          }
        : group
    ),
  }));
}

export function refreshMasterLink(kolId: string, groupId: string) {
  updateState(kolId, (state) => ({
    ...state,
    taskGroups: state.taskGroups.map((group) => {
      if (group.id !== groupId) return group;
      const entry = group.master;
      if (!entry.url.trim()) {
        return {
          ...group,
          master: { ...entry, health: "empty" as const, submitted: false },
        };
      }
      if (entry.health === "verifying") {
        return {
          ...group,
          master: {
            ...entry,
            health: resolveLinkHealth(entry.url),
            submitted: true,
          },
        };
      }
      const health = resolveLinkHealth(entry.url);
      return {
        ...group,
        master: {
          ...entry,
          health,
          submitted: entry.url.trim().length > 0,
        },
      };
    }),
  }));
}

export function addMasterPost(kolId: string) {
  updateState(kolId, (state) => ({
    ...state,
    taskGroups: [...state.taskGroups, createEmptyTaskGroup()],
  }));
}

export function updateMirroredDraftUrl(
  kolId: string,
  groupId: string,
  entryId: string,
  url: string
) {
  updateState(kolId, (state) => ({
    ...state,
    taskGroups: state.taskGroups.map((group) =>
      group.id === groupId
        ? {
            ...group,
            mirrored: group.mirrored.map((entry) =>
              entry.id === entryId && !entry.submitted
                ? { ...entry, url, health: "empty" as const }
                : entry
            ),
          }
        : group
    ),
  }));
}

export function submitMasterLink(kolId: string, groupId: string) {
  let shouldVerify = false;
  updateState(kolId, (state) => ({
    ...state,
    taskGroups: state.taskGroups.map((group) => {
      if (group.id !== groupId) return group;
      const entry = group.master;
      if (!entry.url.trim() || entry.submitted) return group;
      shouldVerify = true;
      return {
        ...group,
        master: { ...entry, submitted: true, health: "verifying" as const },
      };
    }),
  }));
  if (shouldVerify) scheduleMasterVerification(kolId, groupId);
}

export function submitMirroredLink(kolId: string, groupId: string, entryId: string) {
  let shouldVerify = false;
  updateState(kolId, (state) => ({
    ...state,
    taskGroups: state.taskGroups.map((group) => {
      if (group.id !== groupId) return group;
      return {
        ...group,
        mirrored: group.mirrored.map((entry) => {
          if (entry.id !== entryId || !entry.url.trim() || entry.submitted) return entry;
          shouldVerify = true;
          return { ...entry, submitted: true, health: "verifying" as const };
        }),
      };
    }),
  }));
  if (shouldVerify) scheduleMirroredVerification(kolId, groupId, entryId);
}

export function refreshMirroredLink(kolId: string, groupId: string, entryId: string) {
  updateState(kolId, (state) => ({
    ...state,
    taskGroups: state.taskGroups.map((group) => {
      if (group.id !== groupId) return group;
      return {
        ...group,
        mirrored: group.mirrored.map((entry) => {
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
      };
    }),
  }));
}

export function addMirroredPost(kolId: string, groupId: string) {
  updateState(kolId, (state) => ({
    ...state,
    taskGroups: state.taskGroups.map((group) => {
      if (group.id !== groupId || group.mirrored.length >= H5_MIRRORED_MAX) return group;
      return {
        ...group,
        mirrored: [
          ...group.mirrored,
          { id: createId(), url: "", health: "empty", submitted: false },
        ],
      };
    }),
  }));
}

export async function addInsightDraftFiles(
  kolId: string,
  groupId: string,
  files: H5InsightFile[]
) {
  await Promise.all(
    files.map(async (file) => {
      await saveH5InsightPreview(file.id, file.previewUrl);
      cacheH5InsightPreviewUrl(file.id, file.previewUrl);
    })
  );

  updateState(kolId, (state) => ({
    ...state,
    taskGroups: state.taskGroups.map((group) =>
      group.id === groupId
        ? {
            ...group,
            insightDraftFiles: [
              ...group.insightDraftFiles,
              ...files.map((file) => ({
                id: file.id,
                name: file.name,
                sizeLabel: file.sizeLabel,
                locked: false as const,
                previewUrl: "",
              })),
            ],
          }
        : group
    ),
  }));
}

export function removeInsightDraftFile(kolId: string, groupId: string, fileId: string) {
  void deleteH5InsightPreview(fileId);
  updateState(kolId, (state) => ({
    ...state,
    taskGroups: state.taskGroups.map((group) =>
      group.id === groupId
        ? {
            ...group,
            insightDraftFiles: group.insightDraftFiles.filter(
              (file) => file.id !== fileId || file.locked
            ),
          }
        : group
    ),
  }));
}

/** Web admin: remove any H5 insight file, including submitted/locked ones. */
export function removeH5InsightFile(kolId: string, fileId: string) {
  void deleteH5InsightPreview(fileId);
  updateState(kolId, (state) => {
    let changed = false;
    const taskGroups = state.taskGroups.map((group) => {
      const insightDraftFiles = group.insightDraftFiles.filter((file) => file.id !== fileId);
      if (insightDraftFiles.length === group.insightDraftFiles.length) return group;
      changed = true;
      return {
        ...group,
        insightDraftFiles,
        insightSubmitted: insightDraftFiles.length > 0 ? group.insightSubmitted : false,
      };
    });
    return changed ? { ...state, taskGroups } : state;
  });

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("kolplanet:h5-insight-sync", { detail: { kolId } })
    );
  }
}

export function submitInsightReport(kolId: string, groupId: string) {
  updateState(kolId, (state) => {
    let changed = false;
    const taskGroups = state.taskGroups.map((group) => {
      if (group.id !== groupId) return group;
      const hasPending = group.insightDraftFiles.some((file) => !file.locked);
      if (!hasPending) return group;
      changed = true;
      return {
        ...group,
        insightSubmitted: true,
        insightDraftFiles: group.insightDraftFiles.map((file) =>
          file.locked ? file : { ...file, locked: true }
        ),
      };
    });
    return changed ? { ...state, taskGroups } : state;
  });

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("kolplanet:h5-insight-sync", { detail: { kolId } })
    );
  }
}
