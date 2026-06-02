export type ScriptDraftStatus = "Under Review" | "Approved" | "Revision Needed";

export type ScriptDraftMessageAuthor = "client" | "kol";

export type ScriptDraftMessage = {
  id: string;
  author: ScriptDraftMessageAuthor;
  authorLabel: string;
  content: string;
  images?: string[];
  sentAt: string;
};

export type ScriptDraftSubmission = {
  version: number;
  status: ScriptDraftStatus;
  submittedAt: string;
  content: string;
  messages: ScriptDraftMessage[];
  /** @deprecated Legacy single feedback — migrated into messages on read */
  feedback?: string;
  feedbackImages?: string[];
  feedbackSentAt?: string;
};

const STORAGE_KEY = "kolplanet:script-drafts:v1";
const SUBMISSION_LIMIT = 5;
const DRAFT_EVENT = "kolplanet:script-draft-change";

function readAll(): Record<string, ScriptDraftSubmission[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, ScriptDraftSubmission[]>;
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, ScriptDraftSubmission[]>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent(DRAFT_EVENT, { detail: { key: STORAGE_KEY } }));
}

export function formatScriptDraftTimestamp(date = new Date()) {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeSubmission(submission: ScriptDraftSubmission): ScriptDraftSubmission {
  if (submission.messages?.length) {
    return { ...submission, messages: submission.messages };
  }

  if (submission.feedback?.trim() || submission.feedbackImages?.length) {
    return {
      ...submission,
      messages: [
        {
          id: createMessageId(),
          author: "client",
          authorLabel: "Client",
          content: submission.feedback?.trim() ?? "",
          images: submission.feedbackImages,
          sentAt: submission.feedbackSentAt ?? submission.submittedAt,
        },
      ],
    };
  }

  return { ...submission, messages: [] };
}

export function getScriptDraftSubmissions(kolId: string): ScriptDraftSubmission[] {
  return (readAll()[kolId] ?? []).map(normalizeSubmission);
}

export function getScriptDraftSubmissionLimit() {
  return SUBMISSION_LIMIT;
}

export function addScriptDraftSubmission(kolId: string, content: string) {
  const trimmed = content.trim();
  if (!trimmed) return null;

  const all = readAll();
  const existing = (all[kolId] ?? []).map(normalizeSubmission);
  if (existing.length >= SUBMISSION_LIMIT) return null;

  const submission: ScriptDraftSubmission = {
    version: existing.length + 1,
    status: "Under Review",
    submittedAt: formatScriptDraftTimestamp(),
    content: trimmed,
    messages: [],
  };

  all[kolId] = [...existing, submission];
  writeAll(all);
  return submission;
}

export function addScriptDraftMessage(
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
  const existing = (all[kolId] ?? []).map(normalizeSubmission);

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

/** @deprecated Use addScriptDraftMessage */
export function updateScriptDraftFeedback(
  kolId: string,
  version: number,
  feedback: string,
  feedbackImages?: string[]
) {
  addScriptDraftMessage(kolId, version, {
    author: "client",
    authorLabel: "Client",
    content: feedback,
    images: feedbackImages,
  });
}

export function approveScriptDraft(kolId: string, version: number) {
  const all = readAll();
  const existing = (all[kolId] ?? []).map(normalizeSubmission);
  all[kolId] = existing.map((item) =>
    item.version === version ? { ...item, status: "Approved" as const } : item
  );
  writeAll(all);
}

export function subscribeScriptDraftChanges(listener: () => void) {
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
