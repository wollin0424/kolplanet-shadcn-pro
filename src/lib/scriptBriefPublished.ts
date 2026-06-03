export type ScriptBriefPublishedAttachment = {
  name: string;
  locked?: boolean;
};

export type ScriptBriefPublishedReferenceScript = {
  title: string;
  original: string;
  translation: string;
};

export type ScriptBriefPublished = {
  guidelines: string;
  attachments: ScriptBriefPublishedAttachment[];
  referenceScripts: ScriptBriefPublishedReferenceScript[];
  deadlineLabel: string;
};

const STORAGE_KEY = "kolplanet:script-brief-published:v1";
const BRIEF_EVENT = "kolplanet:script-brief-published-change";

function readAll(): Record<string, ScriptBriefPublished> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, ScriptBriefPublished>;
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, ScriptBriefPublished>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent(BRIEF_EVENT, { detail: { key: STORAGE_KEY } }));
}

export function getScriptBriefPublished(kolId: string): ScriptBriefPublished | null {
  return readAll()[kolId] ?? null;
}

export function saveScriptBriefPublished(kolId: string, payload: ScriptBriefPublished) {
  const all = readAll();
  all[kolId] = payload;
  writeAll(all);
}

export function subscribeScriptBriefPublishedChanges(listener: () => void) {
  if (typeof window === "undefined") return () => {};

  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  const onCustom = () => listener();

  window.addEventListener("storage", onStorage);
  window.addEventListener(BRIEF_EVENT, onCustom);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BRIEF_EVENT, onCustom);
  };
}
