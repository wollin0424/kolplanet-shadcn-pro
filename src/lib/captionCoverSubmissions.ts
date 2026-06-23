import {
  formatScriptDraftTimestamp,
  type ScriptDraftMessage,
  type ScriptDraftMessageAuthor,
  type ScriptDraftStatus,
} from "@/lib/scriptDraftSubmissions";

export type CaptionCoverFile = {
  name: string;
  previewUrl: string;
  sizeLabel: string;
};

export type CaptionCoverSubmission = {
  version: number;
  status: ScriptDraftStatus;
  submittedAt: string;
  caption: string;
  cover?: CaptionCoverFile;
  messages: ScriptDraftMessage[];
};

const STORAGE_KEY = "kolplanet:caption-cover:v1";
const SUBMISSION_LIMIT = 5;
const DRAFT_EVENT = "kolplanet:caption-cover-change";

function readAll(): Record<string, CaptionCoverSubmission[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, CaptionCoverSubmission[]>;
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, CaptionCoverSubmission[]>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent(DRAFT_EVENT, { detail: { key: STORAGE_KEY } }));
}

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function formatCaptionCoverFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getCaptionCoverSubmissions(kolId: string): CaptionCoverSubmission[] {
  return readAll()[kolId] ?? [];
}

export function getCaptionCoverSubmissionLimit() {
  return SUBMISSION_LIMIT;
}

export function addCaptionCoverSubmission(
  kolId: string,
  caption: string,
  cover?: CaptionCoverFile
) {
  const trimmed = caption.trim();
  if (!trimmed || !cover) return null;

  const all = readAll();
  const existing = all[kolId] ?? [];
  if (existing.length >= SUBMISSION_LIMIT) return null;

  const submission: CaptionCoverSubmission = {
    version: existing.length + 1,
    status: "Under Review",
    submittedAt: formatScriptDraftTimestamp(),
    caption: trimmed,
    cover,
    messages: [],
  };

  all[kolId] = [...existing, submission];
  writeAll(all);
  return submission;
}

export function setCaptionCoverSubmissions(kolId: string, submissions: CaptionCoverSubmission[]) {
  const all = readAll();
  all[kolId] = submissions;
  writeAll(all);
}

export function approveCaptionCover(kolId: string, version: number) {
  const all = readAll();
  const existing = all[kolId] ?? [];
  all[kolId] = existing.map((item) =>
    item.version === version ? { ...item, status: "Approved" as const } : item
  );
  writeAll(all);
}

export function addCaptionCoverMessage(
  kolId: string,
  version: number,
  payload: {
    author: ScriptDraftMessageAuthor;
    authorLabel: string;
    content: string;
    images?: string[];
  }
) {
  const trimmed = payload.content.trim();
  const images = payload.images?.length ? payload.images : undefined;
  if (!trimmed && !images?.length) return;

  const all = readAll();
  const existing = all[kolId] ?? [];

  const message: ScriptDraftMessage = {
    id: createMessageId(),
    author: payload.author,
    authorLabel: payload.authorLabel,
    content: trimmed,
    images,
    sentAt: formatScriptDraftTimestamp(),
  };

  all[kolId] = existing.map((item) => {
    if (item.version !== version) return item;

    const nextStatus =
      item.status === "Approved"
        ? item.status
        : payload.author === "client"
          ? ("Revision Needed" as const)
          : ("Under Review" as const);

    return {
      ...item,
      messages: [...item.messages, message],
      status: nextStatus,
    };
  });

  writeAll(all);
}

export function subscribeCaptionCoverChanges(listener: () => void) {
  if (typeof window === "undefined") return () => {};

  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  const onCustom = () => listener();

  window.addEventListener("storage", onStorage);
  window.addEventListener(DRAFT_EVENT, onCustom);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(DRAFT_EVENT, onCustom);
  };
}
