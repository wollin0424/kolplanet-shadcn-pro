"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CampaignHubDetailHeader,
  CampaignHubToolbarActionButton,
} from "@/components/CampaignHubDetailToolbar";
import { CampaignHubFilterSelect } from "@/components/CampaignHubFilterSelect";
import {
  InfluencerMetaIcons,
  type KolRelationship,
} from "@/components/InfluencerMetaIcons";
import { ScriptKolDraftPanel } from "@/components/ScriptKolDraftPanel";
import { getScriptDraftSubmissions, subscribeScriptDraftChanges } from "@/lib/scriptDraftSubmissions";
import { getScriptBriefPublished, saveScriptBriefPublished } from "@/lib/scriptBriefPublished";
import { formatDeadlineDisplayTime } from "@/lib/scriptBriefDeadline";
import { getStageBadgeClass, STAGE_STATUS_PILL_CLASS } from "@/lib/pipeline/stageStatuses";
import { InfluencerAvatar } from "@/components/InfluencerAvatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getMockInfluencerAvatar } from "@/lib/mockInfluencerAvatars";
import { denseDateInputClass, denseSelectTriggerClass } from "@/lib/toolbarControls";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Languages,
  Link,
  Lock,
  Pencil,
  Search,
  Sparkles,
  Trash2,
  X,
} from "@/lib/icons";

type ScriptStatus = "Pending" | "Waiting for Approval" | "Approved";
type StatusFilter = "All" | ScriptStatus;

type ScriptAttachment = {
  name: string;
  locked?: boolean;
};

/** Attachments synced from campaign settings — always shown and cannot be removed. */
const CAMPAIGN_SCRIPT_ATTACHMENTS = ["模块-支付管理.pdf"] as const;

function isCampaignSyncedAttachment(name: string) {
  return CAMPAIGN_SCRIPT_ATTACHMENTS.includes(
    name as (typeof CAMPAIGN_SCRIPT_ATTACHMENTS)[number]
  );
}

function normalizeScriptAttachments(
  attachments: ScriptAttachment[] | undefined
): ScriptAttachment[] {
  return (attachments ?? []).map((attachment) => ({
    name: attachment.name,
    locked: attachment.locked ?? isCampaignSyncedAttachment(attachment.name),
  }));
}

function mergeCampaignScriptAttachments(attachments: ScriptAttachment[]): ScriptAttachment[] {
  const merged = new Map<string, ScriptAttachment>();

  for (const name of CAMPAIGN_SCRIPT_ATTACHMENTS) {
    merged.set(name, { name, locked: true });
  }

  for (const attachment of normalizeScriptAttachments(attachments)) {
    merged.set(attachment.name, attachment);
  }

  return Array.from(merged.values());
}

type ScriptInfluencer = {
  id: string;
  name: string;
  handle: string;
  platform: string;
  manager: string;
  relationship: KolRelationship;
  status: ScriptStatus;
  deadline: string;
  deadlineDate: string;
  deadlineTime: string;
  timezone: string;
  guidelines: string;
  attachments?: ScriptAttachment[];
  overdue: boolean;
};

type SubmissionDeadline = {
  date: string;
  time: string;
  timezone: string;
};

const DEADLINE_TIMEZONE_OPTIONS = [
  { value: "UTC+08:00", label: "UTC+08:00 (CN/MY/SG)" },
  { value: "UTC+07:00", label: "UTC+07:00 (TH/VN/ID)" },
  { value: "UTC", label: "UTC" },
] as const;

const DEFAULT_DEADLINE: SubmissionDeadline = {
  date: "",
  time: "",
  timezone: "",
};

function getSubmissionDeadlineParts(deadline: SubmissionDeadline) {
  if (!deadline.date) return null;
  const [year, month, day] = deadline.date.split("-").map(Number);
  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const time = deadline.time ? formatDeadlineDisplayTime(deadline.time) : undefined;

  return {
    date,
    time,
    dateTime: [date, deadline.time].filter(Boolean).join(" "),
    timezone: deadline.timezone || undefined,
  };
}

const sectionActionLinkClass =
  "inline-flex items-center gap-1 text-xs font-medium text-brand transition-colors hover:text-brand/80";

function buildMockH5Link(influencerId: string) {
  const slug = influencerId.replace(/[^a-z0-9]/gi, "").slice(-5).toLowerCase() || "x8y2z";
  return `kolp.la/s/${slug}`;
}

function getH5PreviewPath(influencerId: string) {
  return `/h5/kol-info/${encodeURIComponent(influencerId)}`;
}

function ScriptH5LinkBar({ link, influencerId }: { link: string; influencerId: string }) {
  const previewPath = getH5PreviewPath(influencerId);
  const copyValue = link.startsWith("http") ? link : `https://${link}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyValue);
    } catch {
      // Clipboard may be unavailable outside secure context.
    }
  };

  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2.5">
      <Link size={14} className="shrink-0 text-gray-400" strokeWidth={2} />
      <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 text-xs text-gray-600">
        <span className="shrink-0 font-medium text-gray-800">H5 Link for KOL:</span>
        <span className="inline-flex min-w-0 items-center gap-0.5">
          <a
            href={previewPath}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-gray-600 hover:text-gray-800"
          >
            {link}
          </a>
          <a
            href={previewPath}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-brand transition-colors hover:bg-brand-50"
            aria-label="Open H5 link"
          >
            <ExternalLink size={14} strokeWidth={2} />
          </a>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-brand transition-colors hover:bg-brand-50"
            aria-label="Copy H5 link"
          >
            <Copy size={14} strokeWidth={2} />
          </button>
        </span>
      </div>
    </div>
  );
}

function SectionTranslatorButton({
  onClick,
  disabled = false,
  className,
}: {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        sectionActionLinkClass,
        disabled && "cursor-not-allowed opacity-45",
        className
      )}
    >
      <Languages size={13} className="text-brand" strokeWidth={2} />
      Translator
    </button>
  );
}

const STATUS_FILTERS: StatusFilter[] = [
  "All",
  "Pending",
  "Waiting for Approval",
  "Approved",
];

const STATUS_BADGE: Record<ScriptStatus, string> = {
  Pending: "border-gray-200 bg-gray-50 text-gray-600",
  "Waiting for Approval": getStageBadgeClass("sky"),
  Approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

function resolveScriptStatusFromDraft(kolId: string, fallback: ScriptStatus): ScriptStatus {
  const latest = getScriptDraftSubmissions(kolId).at(-1);
  if (!latest) return fallback;
  if (latest.status === "Approved") return "Approved";
  return "Waiting for Approval";
}

const TRANSLATION_LANGUAGES = [
  "Bahasa Indonesia",
  "Bahasa Melayu",
  "Thai",
  "Vietnamese",
  "Japanese",
  "English",
  "Chinese (Traditional)",
] as const;

const AUTO_DETECT_LANGUAGE = "auto";

const SOURCE_LANGUAGE_OPTIONS = [
  { value: AUTO_DETECT_LANGUAGE, label: "Detect language" },
  { value: "English", label: "English" },
  ...TRANSLATION_LANGUAGES.filter((lang) => lang !== "English").map((lang) => ({
    value: lang,
    label: lang,
  })),
] as const;

const TARGET_LANGUAGE_OPTIONS = [
  { value: "English", label: "English" },
  { value: "Bahasa Indonesia", label: "Bahasa Indonesia" },
  ...TRANSLATION_LANGUAGES.filter(
    (lang) => lang !== "English" && lang !== "Bahasa Indonesia"
  ).map((lang) => ({
    value: lang,
    label: lang,
  })),
];

const DEFAULT_SOURCE_LANGUAGE = AUTO_DETECT_LANGUAGE;

function mockTranslateText(
  source: string,
  sourceLanguage: string,
  targetLanguage: string
) {
  const detected =
    sourceLanguage === AUTO_DETECT_LANGUAGE ? "English" : sourceLanguage;
  return `[${targetLanguage} · from ${detected}] ${source}`;
}

const GENERATION_TAGS = [
  "更幽默一点",
  "强调限时折扣",
  "口语化日常风",
  "开头更抓人",
] as const;

type GenerateIdeasPhase = "idle" | "loading" | "results";

type ScriptIdea = {
  title: string;
  summary: string;
  hook: string;
  coreFlow: string;
  executionNotes: string;
  cta: string;
};

type ScriptIdeaBody = Pick<ScriptIdea, "hook" | "coreFlow" | "executionNotes" | "cta">;

const GENERATION_LOADING_MS = 1400;

const SCRIPT_IDEA_STYLES = [
  {
    label: "Honest Review",
    letter: "a",
    summary: "Straight opinion, clean talking-head delivery.",
  },
  {
    label: "Problem / Solution",
    letter: "b",
    summary: "Pain point first, then smooth feature reveal.",
  },
  {
    label: "Lifestyle Integration",
    letter: "c",
    summary: "Product woven into a natural daily-life scene.",
  },
] as const;

function formatReferenceScriptsForStorage(ideas: ScriptIdea[]) {
  return ideas.map(formatScriptIdeaForStorage).join("\n\n");
}

function buildMockScriptIdeas(prompt: string, influencerName: string): ScriptIdea[] {
  const direction = prompt.trim() || "Keep the creator's established tone.";
  return SCRIPT_IDEA_STYLES.map((style, index) => ({
    title: `Option ${index + 1} - Style ${String.fromCharCode(65 + index)} - ${style.label}`,
    summary: style.summary,
    hook: `Open with a ${style.letter} - ${style.label.toLowerCase()} beat that feels native to ${influencerName}'s posting rhythm.`,
    coreFlow: `${style.summary} Connect it to this brief requirement: Highlight the campaign value naturally and keep the delivery easy to follow.`,
    executionNotes: `Keep the language natural for ID audience, preserve ${influencerName}'s familiar cadence, and apply this direction: ${direction}`,
    cta: "Close with one concrete audience takeaway and a clear next action that feels platform-native.",
  }));
}

function formatScriptIdeaForStorage(idea: ScriptIdea) {
  return `${idea.title}\n\n${idea.summary}\n\nHook: ${idea.hook}\n\nCore flow: ${idea.coreFlow}\n\nExecution notes: ${idea.executionNotes}\n\nCTA: ${idea.cta}`;
}

function formatScriptIdeaBody(body: ScriptIdeaBody) {
  return `Hook: ${body.hook}\n\nCore flow: ${body.coreFlow}\n\nExecution notes: ${body.executionNotes}\n\nCTA: ${body.cta}`;
}

function formatIdeaBody(idea: ScriptIdea) {
  return `Hook: ${idea.hook}\n\nCore flow: ${idea.coreFlow}\n\nExecution notes: ${idea.executionNotes}\n\nCTA: ${idea.cta}`;
}

function parseIdeaBody(
  text: string,
  fallback: ScriptIdea
): Pick<ScriptIdea, "hook" | "coreFlow" | "executionNotes" | "cta"> {
  const readSection = (label: string, nextLabels: string[]) => {
    const escaped = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (nextLabels.length === 0) {
      const match = text.match(new RegExp(`${escaped(label)}:\\s*([\\s\\S]*)$`));
      return match?.[1]?.trim();
    }
    const until = nextLabels.map(escaped).join("|");
    const match = text.match(
      new RegExp(`${escaped(label)}:\\s*([\\s\\S]*?)(?=\\n\\n(?:${until}))`)
    );
    return match?.[1]?.trim();
  };

  return {
    hook: readSection("Hook", ["Core flow:"]) ?? fallback.hook,
    coreFlow: readSection("Core flow", ["Execution notes:"]) ?? fallback.coreFlow,
    executionNotes: readSection("Execution notes", ["CTA:"]) ?? fallback.executionNotes,
    cta: readSection("CTA", []) ?? fallback.cta,
  };
}

function ReferenceScriptIdeaBodyFields({
  hook,
  coreFlow,
  executionNotes,
  cta,
}: ScriptIdeaBody) {
  return (
    <div className="space-y-2.5 text-xs leading-relaxed text-gray-600">
      <p>
        <span className="font-semibold text-gray-800">Hook:</span> {hook}
      </p>
      <p>
        <span className="font-semibold text-gray-800">Core flow:</span> {coreFlow}
      </p>
      <p>
        <span className="font-semibold text-gray-800">Execution notes:</span> {executionNotes}
      </p>
      <p>
        <span className="font-semibold text-gray-800">CTA:</span> {cta}
      </p>
    </div>
  );
}

function ReferenceScriptOptionCard({ idea }: { idea: ScriptIdea }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="inline-flex rounded-md bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
          {idea.title}
        </span>
        {idea.summary ? (
          <span className="text-xs leading-relaxed text-gray-500">{idea.summary}</span>
        ) : null}
      </div>
      <div className="mt-4 rounded-lg border border-gray-200 bg-white px-3 py-3">
        <ReferenceScriptIdeaBodyFields
          hook={idea.hook}
          coreFlow={idea.coreFlow}
          executionNotes={idea.executionNotes}
          cta={idea.cta}
        />
      </div>
    </div>
  );
}

function ScriptIdeaCard({
  idea,
  selected,
  editing,
  onToggleSelect,
  onEdit,
  onCancelEdit,
  onSave,
  onRemove,
}: {
  idea: ScriptIdea;
  selected: boolean;
  editing: boolean;
  onToggleSelect: () => void;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: (patch: Pick<ScriptIdea, "hook" | "coreFlow" | "executionNotes" | "cta">) => void;
  onRemove: () => void;
}) {
  const [draftBody, setDraftBody] = useState("");

  useEffect(() => {
    if (editing) {
      setDraftBody(formatIdeaBody(idea));
    }
  }, [editing, idea]);

  return (
    <div
      className={cn(
        "relative rounded-xl border bg-white p-4 transition-colors",
        selected ? "border-brand/40 ring-1 ring-brand/15" : "border-gray-200"
      )}
    >
      <Checkbox
        checked={selected}
        onCheckedChange={onToggleSelect}
        className="absolute top-4 right-4"
        aria-label={`Select ${idea.title}`}
      />

      <span className="inline-flex max-w-[calc(100%-2rem)] rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
        {idea.title}
      </span>

      <p className="mt-2 text-xs leading-relaxed text-gray-600">{idea.summary}</p>

      {editing ? (
        <Textarea
          value={draftBody}
          onChange={(e) => setDraftBody(e.target.value)}
          className="mt-3 min-h-[160px] resize-none border-brand/50 text-xs leading-relaxed ring-1 ring-brand/15 focus-visible:border-brand focus-visible:ring-brand/25"
        />
      ) : (
        <div className="mt-3 space-y-2.5 text-xs leading-relaxed text-gray-600">
          <p>
            <span className="font-semibold text-gray-800">Hook:</span> {idea.hook}
          </p>
          <p>
            <span className="font-semibold text-gray-800">Core flow:</span> {idea.coreFlow}
          </p>
          <p>
            <span className="font-semibold text-gray-800">Execution notes:</span>{" "}
            {idea.executionNotes}
          </p>
          <p>
            <span className="font-semibold text-gray-800">CTA:</span> {idea.cta}
          </p>
        </div>
      )}

      <div className="mt-4 flex justify-end gap-4">
        {editing ? (
          <>
            <button
              type="button"
              onClick={() => onSave(parseIdeaBody(draftBody, idea))}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-brand transition-colors hover:text-brand/80"
            >
              <Check size={13} strokeWidth={2} />
              Save
            </button>
            <button
              type="button"
              onClick={onCancelEdit}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 transition-colors hover:text-gray-800"
            >
              <X size={13} strokeWidth={2} />
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 transition-colors hover:text-gray-800"
            >
              <Pencil size={13} strokeWidth={2} />
              Edit
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 transition-colors hover:text-red-600"
            >
              <Trash2 size={13} strokeWidth={2} />
              Remove
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const MOCK_INFLUENCERS: ScriptInfluencer[] = [
  {
    id: "s1",
    name: "Amelia Stone",
    handle: "@instagram ins",
    platform: "Instagram",
    manager: "Wollin",
    relationship: "Manager",
    status: "Approved",
    deadline: "Jun 10, 2026",
    deadlineDate: "2026-06-10",
    deadlineTime: "18:00",
    timezone: "UTC+08:00",
    guidelines: "3456789",
    attachments: [
      { name: "模块-支付管理.pdf", locked: true },
      { name: "Contract_James_Morgan_Final_2026.pdf" },
    ],
    overdue: false,
  },
  {
    id: "s2",
    name: "Ava Collins",
    handle: "@avacollins",
    platform: "Instagram",
    manager: "Wollin",
    relationship: "Direct",
    status: "Approved",
    deadline: "Jun 12, 2026",
    deadlineDate: "2026-06-12",
    deadlineTime: "12:00",
    timezone: "GMT+8",
    guidelines: "Highlight summer collection drop.",
    overdue: false,
  },
  {
    id: "s3",
    name: "Ethan Carter",
    handle: "@foodie.my",
    platform: "Instagram",
    manager: "Chris",
    relationship: "Manager",
    status: "Waiting for Approval",
    deadline: "Jun 8, 2026",
    deadlineDate: "2026-06-08",
    deadlineTime: "09:00",
    timezone: "GMT+8",
    guidelines: "",
    overdue: true,
  },
  {
    id: "s4",
    name: "Lucas Turner",
    handle: "@lucasturner",
    platform: "TikTok",
    manager: "Wollin",
    relationship: "Direct",
    status: "Pending",
    deadline: "Jun 15, 2026",
    deadlineDate: "2026-06-15",
    deadlineTime: "15:30",
    timezone: "GMT+8",
    guidelines: "Keep tone energetic and product-first.",
    overdue: false,
  },
  {
    id: "s5",
    name: "Mia Sullivan",
    handle: "@miachen",
    platform: "Instagram",
    manager: "Moca",
    relationship: "MCN",
    status: "Approved",
    deadline: "Jun 11, 2026",
    deadlineDate: "2026-06-11",
    deadlineTime: "20:00",
    timezone: "GMT+8",
    guidelines: "",
    overdue: false,
  },
  {
    id: "s6",
    name: "James Miller",
    handle: "@jamesm",
    platform: "YouTube",
    manager: "Chris",
    relationship: "Manager",
    status: "Approved",
    deadline: "Jun 9, 2026",
    deadlineDate: "2026-06-09",
    deadlineTime: "11:00",
    timezone: "GMT+8",
    guidelines: "Include CTA in first 5 seconds.",
    overdue: false,
  },
  {
    id: "s7",
    name: "Priya Sharma",
    handle: "@priyasharma",
    platform: "Instagram",
    manager: "Wollin",
    relationship: "Direct",
    status: "Waiting for Approval",
    deadline: "Jun 14, 2026",
    deadlineDate: "2026-06-14",
    deadlineTime: "10:00",
    timezone: "GMT+8",
    guidelines: "",
    overdue: false,
  },
  {
    id: "s8",
    name: "Jordan Lee",
    handle: "@jordanlee",
    platform: "TikTok",
    manager: "Moca",
    relationship: "MCN",
    status: "Pending",
    deadline: "Jun 16, 2026",
    deadlineDate: "2026-06-16",
    deadlineTime: "16:00",
    timezone: "GMT+8",
    guidelines: "",
    overdue: false,
  },
  {
    id: "s9",
    name: "Sofia Reyes",
    handle: "@sofiareyes",
    platform: "Instagram",
    manager: "Chris",
    relationship: "Direct",
    status: "Waiting for Approval",
    deadline: "Jun 17, 2026",
    deadlineDate: "2026-06-17",
    deadlineTime: "14:00",
    timezone: "GMT+8",
    guidelines: "Focus on unboxing and first impressions.",
    overdue: false,
  },
  {
    id: "s10",
    name: "Noah Brooks",
    handle: "@noahbrooks",
    platform: "TikTok",
    manager: "Wollin",
    relationship: "Manager",
    status: "Approved",
    deadline: "Jun 18, 2026",
    deadlineDate: "2026-06-18",
    deadlineTime: "17:30",
    timezone: "GMT+8",
    guidelines: "",
    overdue: false,
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);
}

function ScriptAttachmentPill({
  name,
  locked = false,
  onRemove,
}: {
  name: string;
  locked?: boolean;
  onRemove?: () => void;
}) {
  return (
    <div className="inline-flex max-w-full items-center gap-2 rounded-md border border-gray-200 bg-white py-1.5 pr-2 pl-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <span
        className="inline-flex shrink-0 items-center justify-center rounded-[3px] bg-rose-500 px-1 py-px text-[9px] font-bold leading-none tracking-wide text-white"
        aria-hidden
      >
        PDF
      </span>
      <span className="max-w-[200px] truncate text-xs font-medium text-gray-800">{name}</span>
      {locked ? (
        <span
          className="ml-0.5 inline-flex size-5 shrink-0 items-center justify-center text-gray-500"
          title="Synced from campaign settings and cannot be removed"
          aria-label={`${name} is synced from campaign settings and cannot be removed`}
        >
          <Lock size={14} strokeWidth={1.75} />
        </span>
      ) : (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label={`Remove ${name}`}
        >
          <X size={12} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}

function ScriptAttachmentsSection({
  attachments,
  onAddFiles,
  onRemove,
}: {
  attachments: ScriptAttachment[];
  onAddFiles: (files: FileList) => void;
  onRemove: (index: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="mt-3 flex flex-col items-start gap-2">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        multiple
        className="sr-only"
        onChange={(e) => {
          const { files } = e.target;
          if (files?.length) onAddFiles(files);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:text-brand/80"
      >
        + Add Attachment
      </button>
      {attachments.length > 0 ? (
        <div className="flex w-full flex-wrap gap-2">
          {attachments.map((attachment, index) => {
            const locked =
              attachment.locked === true || isCampaignSyncedAttachment(attachment.name);

            return (
              <ScriptAttachmentPill
                key={`${attachment.name}-${index}`}
                name={attachment.name}
                locked={locked}
                onRemove={locked ? undefined : () => onRemove(index)}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function StatusPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition-colors",
        active
          ? "border-brand bg-brand-50 text-brand"
          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
      )}
    >
      {label}
      <span
        className={cn(
          "inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1 text-[10px] font-bold tabular-nums leading-none",
          active ? "bg-white text-brand" : "bg-gray-100 text-gray-600"
        )}
      >
        {count}
      </span>
    </button>
  );
}

function ScriptEmptyWorkspace() {
  return (
    <div className="-translate-y-6 flex flex-col items-center justify-center px-8 py-16 text-center">
      <img
        src="/script-empty-workspace.png"
        alt=""
        className="mb-4 size-24 object-contain drop-shadow-[0_10px_24px_rgba(15,23,42,0.18)]"
      />
      <p className="max-w-sm text-sm font-medium text-gray-600">
        Select an influencer on the left to open the Script workspace.
      </p>
    </div>
  );
}

const TRANSLATOR_VISIBLE_LANGUAGE_COUNT = 2;

function detectSourceLanguageLabel(source: string) {
  if (/[\u4e00-\u9fff]/.test(source)) return "Chinese";
  if (/[\u0600-\u06ff]/.test(source)) return "Arabic";
  if (/[\u0e00-\u0e7f]/.test(source)) return "Thai";
  return "English";
}

function stripMockTranslationPrefix(text: string) {
  return text.replace(/^\[[^\]]+\]\s*/, "");
}

function resolveSourceLanguageLabel(sourceLanguage: string, source: string) {
  if (sourceLanguage === AUTO_DETECT_LANGUAGE) {
    return detectSourceLanguageLabel(source);
  }
  return sourceLanguage;
}

type ScriptTranslatorResult = {
  source: string;
  sourceLanguage: string;
  translation: string;
  targetLanguage: string;
};

type ScriptBilingualTranslation = {
  sourceLanguage: string;
  translation: string;
  targetLanguage: string;
};

type ReferenceScriptsTranslation = {
  sourceLanguage: string;
  targetLanguage: string;
  items: ScriptIdeaBody[];
};

function translateScriptIdeaBody(
  idea: ScriptIdea,
  sourceLanguage: string,
  targetLanguage: string
): ScriptIdeaBody {
  return parseIdeaBody(
    stripMockTranslationPrefix(
      mockTranslateText(formatIdeaBody(idea), sourceLanguage, targetLanguage)
    ),
    idea
  );
}

function ReferenceScriptBilingualCard({
  idea,
  translation,
  targetLanguage,
}: {
  idea: ScriptIdea;
  translation: ScriptIdeaBody;
  targetLanguage: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <span className="inline-flex rounded-md bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
        {idea.title}
      </span>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="min-w-0">
          <p className="mb-2 text-xs font-medium text-gray-500">Original</p>
          <div className="min-h-[180px] rounded-lg border border-gray-200 bg-white px-3 py-3">
            <ReferenceScriptIdeaBodyFields
              hook={idea.hook}
              coreFlow={idea.coreFlow}
              executionNotes={idea.executionNotes}
              cta={idea.cta}
            />
          </div>
        </div>
        <div className="min-w-0">
          <p className="mb-2 text-xs font-medium text-gray-500">
            Translation ({targetLanguage})
          </p>
          <div className="min-h-[180px] rounded-lg border border-gray-200 bg-gray-50/40 px-3 py-3">
            <ReferenceScriptIdeaBodyFields {...translation} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ScriptBilingualPanel({
  source,
  sourceLanguage,
  translation,
  targetLanguage,
  onSourceChange,
  onTranslationChange,
  sourcePlaceholder,
  minHeightClass = "min-h-[120px]",
}: {
  source: string;
  sourceLanguage: string;
  translation: string;
  targetLanguage: string;
  onSourceChange: (value: string) => void;
  onTranslationChange: (value: string) => void;
  sourcePlaceholder?: string;
  minHeightClass?: string;
}) {
  const textareaClass = cn(
    "field-sizing-fixed max-h-[240px] w-full resize-none overflow-y-auto rounded-lg border-0 bg-transparent px-3 py-3 text-[13px] leading-relaxed shadow-none focus-visible:ring-0",
    minHeightClass
  );
  const fieldShellClass =
    "rounded-lg border border-gray-200 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/25";

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="min-w-0">
        <p className="mb-2 text-xs font-medium text-gray-500">Original</p>
        <div className={cn(fieldShellClass, "bg-white")}>
          <Textarea
            value={source}
            onChange={(e) => onSourceChange(e.target.value)}
            placeholder={sourcePlaceholder}
            className={textareaClass}
          />
        </div>
      </div>
      <div className="min-w-0">
        <p className="mb-2 text-xs font-medium text-gray-500">
          Translation ({targetLanguage})
        </p>
        <div className={cn(fieldShellClass, "bg-gray-50/40")}>
          <Textarea
            value={translation}
            onChange={(e) => onTranslationChange(e.target.value)}
            className={textareaClass}
          />
        </div>
      </div>
    </div>
  );
}

const TRANSLATOR_TAB_ROW_CLASS =
  "inline-flex h-10 shrink-0 items-center border-b-2 px-2.5 text-[13px] font-medium leading-none transition-colors";

function translatorTabClass(active: boolean) {
  return cn(
    TRANSLATOR_TAB_ROW_CLASS,
    active
      ? "border-brand text-gray-900"
      : "border-transparent text-gray-500 hover:text-gray-800"
  );
}

function TranslatorLanguageTabs({
  value,
  onValueChange,
  options,
  detectedLabel,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
  detectedLabel?: string;
}) {
  const visibleOptions = options.slice(0, TRANSLATOR_VISIBLE_LANGUAGE_COUNT);
  const overflowOptions = options.slice(TRANSLATOR_VISIBLE_LANGUAGE_COUNT);
  const overflowActive = overflowOptions.some((option) => option.value === value);

  return (
    <div className="flex w-full min-w-0 flex-nowrap items-center gap-0.5 overflow-x-auto">
      {visibleOptions.map((option) => {
        const isAuto = option.value === AUTO_DETECT_LANGUAGE;
        const label =
          isAuto && detectedLabel ? `${detectedLabel} - Detected` : option.label;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onValueChange(option.value)}
            className={translatorTabClass(value === option.value)}
          >
            {label}
          </button>
        );
      })}

      {overflowOptions.length > 0 ? (
        <Select
          value={value || undefined}
          onValueChange={(next) => next && onValueChange(next)}
          modal={false}
        >
          <SelectTrigger
            aria-label="More languages"
            className={cn(
              translatorTabClass(overflowActive),
              "gap-1 rounded-none border-x-0 border-t-0 bg-transparent py-0 shadow-none hover:bg-transparent focus-visible:border-transparent focus-visible:ring-0 data-[size=default]:h-10 data-[size=sm]:h-10",
              overflowActive ? "w-auto pr-1" : "w-10 justify-center px-0"
            )}
          >
            {overflowActive ? <SelectValue /> : null}
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            {overflowOptions.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-xs">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
    </div>
  );
}

function ScriptTranslatorDialog({
  open,
  onOpenChange,
  source,
  onConfirm,
  sourcePlaceholder = "Type to translate.",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source: string;
  onConfirm: (result: ScriptTranslatorResult) => void;
  sourcePlaceholder?: string;
}) {
  if (!open) return null;

  return (
    <ScriptTranslatorDialogBody
      key={source}
      onOpenChange={onOpenChange}
      source={source}
      onConfirm={onConfirm}
      sourcePlaceholder={sourcePlaceholder}
    />
  );
}

function ScriptTranslatorDialogBody({
  onOpenChange,
  source,
  onConfirm,
  sourcePlaceholder,
}: {
  onOpenChange: (open: boolean) => void;
  source: string;
  onConfirm: (result: ScriptTranslatorResult) => void;
  sourcePlaceholder: string;
}) {
  const [draftSource, setDraftSource] = useState(source);
  const [sourceLanguage, setSourceLanguage] = useState(DEFAULT_SOURCE_LANGUAGE);
  const [targetLanguage, setTargetLanguage] = useState("");
  const [translation, setTranslation] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);

  useEffect(() => {
    setDraftSource(source);
    setTranslation("");
    setHasGenerated(false);
    setSourceLanguage(DEFAULT_SOURCE_LANGUAGE);
    setTargetLanguage("");
  }, [source]);

  const detectedLabel = useMemo(() => detectSourceLanguageLabel(draftSource), [draftSource]);

  const targetOptions = useMemo(() => {
    if (sourceLanguage === AUTO_DETECT_LANGUAGE) return TARGET_LANGUAGE_OPTIONS;
    return TARGET_LANGUAGE_OPTIONS.filter((option) => option.value !== sourceLanguage);
  }, [sourceLanguage]);

  useEffect(() => {
    if (!targetLanguage) return;
    if (targetOptions.some((option) => option.value === targetLanguage)) return;
    setTargetLanguage("");
    setTranslation("");
    setHasGenerated(false);
  }, [targetLanguage, targetOptions]);

  const handleGenerateTranslation = (
    target: string,
    sourceLang = sourceLanguage,
    text = draftSource
  ) => {
    if (!target || !text.trim()) {
      setTranslation("");
      setHasGenerated(false);
      return;
    }

    setTranslation(mockTranslateText(text, sourceLang, target));
    setHasGenerated(true);
  };

  const handleTargetLanguageChange = (value: string) => {
    setTargetLanguage(value);
    handleGenerateTranslation(value, sourceLanguage, draftSource);
  };

  const handleConfirm = () => {
    onConfirm({
      source: draftSource,
      sourceLanguage,
      translation:
        hasGenerated && translation.trim()
          ? stripMockTranslationPrefix(translation)
          : "",
      targetLanguage,
    });
    onOpenChange(false);
  };

  const textareaClass =
    "field-sizing-fixed h-full min-h-0 w-full resize-none overflow-y-auto rounded-none border-0 bg-white px-4 py-3 text-[13px] leading-relaxed shadow-none focus-visible:ring-0";

  const editorBoxClass =
    "h-[280px] max-h-[calc(90vh-16rem)] shrink-0 overflow-hidden rounded-xl border border-gray-200";

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl"
        showCloseButton
      >
        <div className="shrink-0 border-b border-gray-100 px-6 py-4">
          <div className="flex items-start gap-3 pr-8">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand">
              <Languages size={18} strokeWidth={2} />
            </span>
            <div>
              <DialogTitle className="text-base font-semibold text-gray-900">
                Translator
              </DialogTitle>
              <DialogDescription className="mt-1 text-xs text-gray-500">
                Select the target language, then click the arrow to generate the translated version.
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 overflow-hidden px-6 py-5 lg:grid-cols-2">
          <div className="flex min-h-0 min-w-0 flex-col gap-2">
            <TranslatorLanguageTabs
              value={sourceLanguage}
              onValueChange={(value) => {
                setSourceLanguage(value);
                setTargetLanguage("");
                setHasGenerated(false);
                setTranslation("");
              }}
              options={SOURCE_LANGUAGE_OPTIONS}
              detectedLabel={detectedLabel}
            />
            <div className={cn(editorBoxClass, "bg-white")}>
              <Textarea
                value={draftSource}
                onChange={(e) => {
                  setDraftSource(e.target.value);
                  setHasGenerated(false);
                  setTranslation("");
                }}
                placeholder={sourcePlaceholder}
                className={textareaClass}
              />
            </div>
          </div>

          <div className="flex min-h-0 min-w-0 flex-col gap-2">
            <TranslatorLanguageTabs
              value={targetLanguage}
              onValueChange={handleTargetLanguageChange}
              options={targetOptions}
            />
            <div className={cn(editorBoxClass, "bg-gray-50/90")}>
              {hasGenerated && translation.trim() ? (
                <Textarea
                  value={translation}
                  readOnly
                  tabIndex={-1}
                  className={cn(
                    textareaClass,
                    "cursor-default bg-transparent text-gray-700"
                  )}
                />
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center text-[13px] leading-relaxed text-gray-400">
                  Select a target language to generate the translated version.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            className="h-9 px-4 text-[13px] text-gray-500 hover:text-gray-800"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" variant="brand" className="h-9 px-4 text-[13px]" onClick={handleConfirm}>
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ReferenceScriptTranslatorCard({
  idea,
  translation,
  hasTranslation,
}: {
  idea: ScriptIdea;
  translation?: ScriptIdeaBody;
  hasTranslation: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="inline-flex rounded-md bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
          {idea.title}
        </span>
        {idea.summary ? (
          <span className="text-xs leading-relaxed text-gray-500">{idea.summary}</span>
        ) : null}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="min-w-0">
          <p className="mb-2 text-xs font-medium text-gray-500">Original</p>
          <div className="min-h-[220px] overflow-y-auto rounded-lg border border-gray-200 bg-white px-3 py-3">
            <ReferenceScriptIdeaBodyFields
              hook={idea.hook}
              coreFlow={idea.coreFlow}
              executionNotes={idea.executionNotes}
              cta={idea.cta}
            />
          </div>
        </div>
        <div className="min-w-0">
          <p className="mb-2 text-xs font-medium text-gray-500">Translation</p>
          <div className="min-h-[220px] overflow-y-auto rounded-lg border border-gray-200 bg-gray-50/40 px-3 py-3">
            {hasTranslation && translation ? (
              <ReferenceScriptIdeaBodyFields {...translation} />
            ) : (
              <div className="flex h-full min-h-[220px] items-center justify-center px-4 text-center text-[13px] leading-relaxed text-gray-400">
                Select a target language to generate translated scripts.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScriptReferenceTranslatorDialog({
  open,
  onOpenChange,
  ideas,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ideas: ScriptIdea[];
  onConfirm: (result: ReferenceScriptsTranslation) => void;
}) {
  if (!open) return null;

  return (
    <ScriptReferenceTranslatorDialogBody
      key={ideas.map((idea) => idea.title).join("|")}
      ideas={ideas}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
    />
  );
}

function ScriptReferenceTranslatorDialogBody({
  ideas,
  onOpenChange,
  onConfirm,
}: {
  ideas: ScriptIdea[];
  onOpenChange: (open: boolean) => void;
  onConfirm: (result: ReferenceScriptsTranslation) => void;
}) {
  const [sourceLanguage, setSourceLanguage] = useState(DEFAULT_SOURCE_LANGUAGE);
  const [targetLanguage, setTargetLanguage] = useState("");
  const [translations, setTranslations] = useState<ScriptIdeaBody[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  const combinedSource = useMemo(
    () => ideas.map((idea) => formatIdeaBody(idea)).join("\n\n"),
    [ideas]
  );
  const detectedLabel = useMemo(() => detectSourceLanguageLabel(combinedSource), [combinedSource]);

  const targetOptions = useMemo(() => {
    if (sourceLanguage === AUTO_DETECT_LANGUAGE) return TARGET_LANGUAGE_OPTIONS;
    return TARGET_LANGUAGE_OPTIONS.filter((option) => option.value !== sourceLanguage);
  }, [sourceLanguage]);

  useEffect(() => {
    if (!targetLanguage) return;
    if (targetOptions.some((option) => option.value === targetLanguage)) return;
    setTargetLanguage("");
    setTranslations([]);
    setHasGenerated(false);
  }, [targetLanguage, targetOptions]);

  const handleTargetLanguageChange = (value: string) => {
    setTargetLanguage(value);
    if (!value) {
      setTranslations([]);
      setHasGenerated(false);
      return;
    }

    setTranslations(
      ideas.map((idea) => translateScriptIdeaBody(idea, sourceLanguage, value))
    );
    setHasGenerated(true);
  };

  const handleConfirm = () => {
    if (!targetLanguage || !hasGenerated) return;
    onConfirm({
      sourceLanguage,
      targetLanguage,
      items: translations,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent
        className="grid max-h-[90vh] grid-rows-[auto_auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0 sm:max-w-4xl"
        showCloseButton
      >
        <div className="shrink-0 border-b border-gray-100 px-6 py-4">
          <div className="flex items-start gap-3 pr-8">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand">
              <Languages size={18} strokeWidth={2} />
            </span>
            <div>
              <DialogTitle className="text-base font-semibold text-gray-900">
                Translator
              </DialogTitle>
              <DialogDescription className="mt-1 text-xs text-gray-500">
                Translate each reference script individually, then confirm to sync the translated
                content back into the tab.
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="grid shrink-0 grid-cols-1 gap-4 px-6 pt-4 pb-0 lg:grid-cols-2">
          <TranslatorLanguageTabs
            value={sourceLanguage}
            onValueChange={(value) => {
              setSourceLanguage(value);
              setTargetLanguage("");
              setTranslations([]);
              setHasGenerated(false);
            }}
            options={SOURCE_LANGUAGE_OPTIONS}
            detectedLabel={detectedLabel}
          />
          <TranslatorLanguageTabs
            value={targetLanguage}
            onValueChange={handleTargetLanguageChange}
            options={targetOptions}
          />
        </div>

        <div className="min-h-0 overflow-y-auto overscroll-contain">
          <div className="space-y-4 px-6 py-5">
            {ideas.map((idea, index) => (
              <ReferenceScriptTranslatorCard
                key={`${idea.title}-${index}`}
                idea={idea}
                translation={translations[index]}
                hasTranslation={hasGenerated}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 flex shrink-0 items-center justify-end gap-3 border-t border-gray-100 bg-white px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            className="h-9 px-4 text-[13px] text-gray-500 hover:text-gray-800"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="brand"
            className="h-9 px-4 text-[13px]"
            disabled={!hasGenerated}
            onClick={handleConfirm}
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ScriptGenerateIdeasDialog({
  open,
  onOpenChange,
  influencerName,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  influencerName: string;
  onConfirm: (ideas: ScriptIdea[]) => void;
}) {
  if (!open) return null;

  return (
    <ScriptGenerateIdeasDialogBody
      key={influencerName}
      onOpenChange={onOpenChange}
      influencerName={influencerName}
      onConfirm={onConfirm}
    />
  );
}

function ScriptGenerateIdeasDialogBody({
  onOpenChange,
  influencerName,
  onConfirm,
}: {
  onOpenChange: (open: boolean) => void;
  influencerName: string;
  onConfirm: (ideas: ScriptIdea[]) => void;
}) {
  const [customPrompt, setCustomPrompt] = useState("");
  const [phase, setPhase] = useState<GenerateIdeasPhase>("idle");
  const [ideas, setIdeas] = useState<ScriptIdea[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [generationRuns, setGenerationRuns] = useState(0);
  const generationLimitReached = generationRuns >= 3;

  const toggleSelect = (index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else if (next.size < 3) next.add(index);
      return next;
    });
  };

  const updateIdea = (index: number, patch: Partial<ScriptIdea>) => {
    setIdeas((prev) =>
      prev.map((idea, ideaIndex) => (ideaIndex === index ? { ...idea, ...patch } : idea))
    );
  };

  const removeIdea = (index: number) => {
    setIdeas((prev) => {
      const next = prev.filter((_, ideaIndex) => ideaIndex !== index);
      if (next.length === 0) {
        setPhase("idle");
        setEditingIndex(null);
      }
      return next;
    });
    setSelected((prev) => {
      const next = new Set<number>();
      prev.forEach((ideaIndex) => {
        if (ideaIndex < index) next.add(ideaIndex);
        else if (ideaIndex > index) next.add(ideaIndex - 1);
      });
      return next;
    });
    setEditingIndex((current) => {
      if (current === null) return null;
      if (current === index) return null;
      if (current > index) return current - 1;
      return current;
    });
  };

  const handleGenerate = (prompt?: string) => {
    if (generationLimitReached || phase === "loading") return;
    const base = prompt?.trim() || customPrompt.trim() || "Campaign brief";
    setPhase("loading");
    setSelected(new Set());
    setEditingIndex(null);
    window.setTimeout(() => {
      setIdeas(buildMockScriptIdeas(base, influencerName));
      setGenerationRuns((count) => count + 1);
      setPhase("results");
    }, GENERATION_LOADING_MS);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && phase === "loading") return;
    onOpenChange(open);
  };

  return (
    <Sheet open onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex h-full flex-col gap-0 border-l border-gray-100 bg-white p-0 data-[side=right]:w-full data-[side=right]:max-w-[640px] data-[side=right]:sm:max-w-[640px]"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-100 px-6 py-5">
          <div className="flex min-w-0 items-start gap-3">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Sparkles size={18} strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <SheetTitle className="text-base font-semibold text-gray-900">
                Generate Script Ideas
              </SheetTitle>
              <SheetDescription className="mt-1 text-[13px] leading-relaxed text-gray-500">
                Let AI analyze the campaign brief and {influencerName}&apos;s style to create 3
                distinct scripts.
              </SheetDescription>
            </div>
          </div>
          <SheetClose
            render={
              <button
                type="button"
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close"
              />
            }
          >
            <X size={16} strokeWidth={2} />
          </SheetClose>
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-5 px-6 py-5">
            {phase === "idle" ? (
              <>
                <div className="flex items-start gap-3 rounded-xl border border-sky-100 bg-sky-50/70 px-4 py-3.5">
                  <Sparkles
                    size={16}
                    className="mt-0.5 shrink-0 text-amber-500"
                    strokeWidth={2}
                  />
                  <p className="text-[13px] leading-relaxed text-gray-600">
                    Click{" "}
                    <button
                      type="button"
                      onClick={() => handleGenerate()}
                      disabled={generationLimitReached}
                      className="font-semibold text-brand transition-colors hover:text-brand/80 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Generate
                    </button>{" "}
                    to brainstorm reference scripts for the KOL.
                  </p>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
                  <p className="mb-3 text-xs text-gray-500">
                    Not satisfied? Try a custom style or instruction.
                  </p>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {GENERATION_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleGenerate(tag)}
                        disabled={generationLimitReached}
                        className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-medium text-gray-600 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <Input
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Add your own style or generation instruction."
                      className="h-9 bg-white pr-10 text-xs"
                      disabled={generationLimitReached}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleGenerate();
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleGenerate()}
                      disabled={generationLimitReached}
                      className="absolute top-1/2 right-2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-brand disabled:opacity-50"
                      aria-label="Generate with custom prompt"
                    >
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </>
            ) : null}

            {phase === "loading" ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span
                  className="mb-4 inline-block size-10 animate-spin rounded-full border-[3px] border-brand/20 border-t-brand"
                  aria-hidden
                />
                <p className="text-[13px] font-medium text-gray-800">Generating script ideas…</p>
                <p className="mt-1 text-xs text-gray-500">
                  Analyzing the brief and {influencerName}&apos;s style
                </p>
              </div>
            ) : null}

            {phase === "results" ? (
              <div className="space-y-4">
                {ideas.map((idea, index) => (
                  <ScriptIdeaCard
                    key={`${idea.title}-${index}`}
                    idea={idea}
                    selected={selected.has(index)}
                    editing={editingIndex === index}
                    onToggleSelect={() => toggleSelect(index)}
                    onEdit={() => setEditingIndex(index)}
                    onCancelEdit={() => setEditingIndex(null)}
                    onSave={(patch) => {
                      updateIdea(index, patch);
                      setEditingIndex(null);
                    }}
                    onRemove={() => removeIdea(index)}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </ScrollArea>

        <div className="flex shrink-0 flex-col gap-3 border-t border-gray-100 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-gray-500">
            <p>
              Selected:{" "}
              <span className="font-semibold tabular-nums text-gray-800">{selected.size}/3</span>
            </p>
            <p className="mt-0.5">
              {generationRuns > 0 ? (
                <span className="text-gray-400">
                  Generation limit ({generationRuns}/3) reached.
                </span>
              ) : (
                <span className="text-gray-400">Generation limit (0/3) reached.</span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              className="h-9 text-[13px] text-gray-600"
              onClick={() => onOpenChange(false)}
              disabled={phase === "loading"}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="brand"
              className="h-9 text-[13px]"
              disabled={selected.size === 0 || phase !== "results"}
              onClick={() => {
                onConfirm(
                  [...selected]
                    .sort((a, b) => a - b)
                    .map((index) => ideas[index])
                );
                onOpenChange(false);
              }}
            >
              Confirm & Add
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function CampaignHubScriptView({
  campaignId,
  onBack,
}: {
  campaignId: string;
  onBack: () => void;
}) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [platformFilter, setPlatformFilter] = useState("All");
  const [managerFilter, setManagerFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [workspaceTab, setWorkspaceTab] = useState<"brief" | "draft">("brief");
  const [guidelinesById, setGuidelinesById] = useState<Record<string, string>>(() =>
    Object.fromEntries(MOCK_INFLUENCERS.map((row) => [row.id, row.guidelines]))
  );
  const [guidelinesTranslationById, setGuidelinesTranslationById] = useState<
    Record<string, ScriptBilingualTranslation>
  >({});
  const [referenceScriptIdeasById, setReferenceScriptIdeasById] = useState<
    Record<string, ScriptIdea[]>
  >({});
  const [scriptsTranslationById, setScriptsTranslationById] = useState<
    Record<string, ReferenceScriptsTranslation>
  >({});
  const [translatorOpen, setTranslatorOpen] = useState(false);
  const [translatorForId, setTranslatorForId] = useState<string | null>(null);
  const [scriptsTranslatorOpen, setScriptsTranslatorOpen] = useState(false);
  const [scriptsTranslatorForId, setScriptsTranslatorForId] = useState<string | null>(null);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [deadlineById, setDeadlineById] = useState<Record<string, SubmissionDeadline>>({});
  const [attachmentsById, setAttachmentsById] = useState<Record<string, ScriptAttachment[]>>(
    () =>
      Object.fromEntries(
        MOCK_INFLUENCERS.map((row) => [
          row.id,
          normalizeScriptAttachments(row.attachments),
        ])
      )
  );
  const [h5LinkById, setH5LinkById] = useState<Record<string, string>>({});
  const [publishToast, setPublishToast] = useState<string | null>(null);
  const publishToastTimerRef = useRef<number | null>(null);
  const [statusById, setStatusById] = useState<Record<string, ScriptStatus>>(() =>
    Object.fromEntries(MOCK_INFLUENCERS.map((row) => [row.id, row.status]))
  );
  const [draftSyncTick, setDraftSyncTick] = useState(0);

  useEffect(() => {
    const sync = () => setDraftSyncTick((value) => value + 1);
    sync();
    return subscribeScriptDraftChanges(sync);
  }, []);

  useEffect(() => {
    setH5LinkById((prev) => {
      const next = { ...prev };
      let changed = false;

      for (const row of MOCK_INFLUENCERS) {
        if (next[row.id]) continue;
        if (!getScriptBriefPublished(row.id)) continue;
        next[row.id] = buildMockH5Link(row.id);
        changed = true;
      }

      return changed ? next : prev;
    });
  }, []);

  const influencers = useMemo(
    () =>
      MOCK_INFLUENCERS.map((row) => ({
        ...row,
        status: resolveScriptStatusFromDraft(row.id, statusById[row.id] ?? row.status),
      })),
    [statusById, draftSyncTick]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return influencers.filter((row) => {
      if (statusFilter !== "All" && row.status !== statusFilter) return false;
      if (platformFilter !== "All" && row.platform !== platformFilter) return false;
      if (managerFilter !== "All" && row.manager !== managerFilter) return false;
      if (overdueOnly && !row.overdue) return false;
      if (!q) return true;
      return (
        row.name.toLowerCase().includes(q) ||
        row.handle.toLowerCase().includes(q)
      );
    });
  }, [influencers, statusFilter, platformFilter, managerFilter, overdueOnly, query]);

  const statusCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = {
      All: influencers.length,
      Pending: 0,
      "Waiting for Approval": 0,
      Approved: 0,
    };
    for (const row of influencers) {
      counts[row.status] += 1;
    }
    return counts;
  }, [influencers]);

  const activeSelectedId =
    selectedId && filtered.some((row) => row.id === selectedId) ? selectedId : null;

  const selected = activeSelectedId
    ? (influencers.find((row) => row.id === activeSelectedId) ?? null)
    : null;

  const selectedGuidelines = selected ? (guidelinesById[selected.id] ?? "") : "";
  const selectedGuidelinesTranslation = selected
    ? guidelinesTranslationById[selected.id]
    : undefined;
  const guidelinesTranslatorOpen =
    Boolean(selected && translatorOpen && translatorForId === selected.id);
  const scriptsTranslatorOpenForSelected = Boolean(
    selected && scriptsTranslatorOpen && scriptsTranslatorForId === selected.id
  );

  const closeTranslators = () => {
    setTranslatorOpen(false);
    setScriptsTranslatorOpen(false);
  };

  const openGuidelinesTranslator = () => {
    if (!selected) return;
    setTranslatorForId(selected.id);
    setTranslatorOpen(true);
  };

  const openScriptsTranslator = () => {
    if (!selected) return;
    if (!(referenceScriptIdeasById[selected.id] ?? []).length) return;
    setScriptsTranslatorForId(selected.id);
    setScriptsTranslatorOpen(true);
  };
  const selectedAttachments = selected
    ? mergeCampaignScriptAttachments(attachmentsById[selected.id] ?? [])
    : [];
  const selectedReferenceIdeas = selected ? (referenceScriptIdeasById[selected.id] ?? []) : [];
  const hasReferenceScripts = selectedReferenceIdeas.length > 0;
  const selectedScriptsTranslation = selected ? scriptsTranslationById[selected.id] : undefined;
  const selectedH5Link = selected ? h5LinkById[selected.id] : undefined;
  const isBriefPublished = Boolean(selectedH5Link);

  const showPublishToast = (message: string) => {
    if (publishToastTimerRef.current) {
      window.clearTimeout(publishToastTimerRef.current);
    }
    setPublishToast(message);
    publishToastTimerRef.current = window.setTimeout(() => {
      setPublishToast(null);
      publishToastTimerRef.current = null;
    }, 3200);
  };

  const handleSaveAndPublish = () => {
    if (!selected) return;

    const deadline = { ...DEFAULT_DEADLINE, ...deadlineById[selected.id] };
    const deadlineParts = getSubmissionDeadlineParts(deadline);
    const guidelinesTranslation = guidelinesTranslationById[selected.id];
    const ideas = referenceScriptIdeasById[selected.id] ?? [];
    const scriptsTranslation = scriptsTranslationById[selected.id];

    const guidelinesOriginal = guidelinesById[selected.id]?.trim() ?? "";
    const guidelinesTranslated =
      guidelinesTranslation?.translation?.trim() || guidelinesOriginal;

    saveScriptBriefPublished(selected.id, {
      guidelines: {
        original: guidelinesOriginal,
        translation: guidelinesTranslated,
      },
      attachments: mergeCampaignScriptAttachments(attachmentsById[selected.id] ?? []).map(
        (attachment) => ({
          name: attachment.name,
          locked: attachment.locked,
        })
      ),
      referenceScripts: ideas.map((idea, index) => {
        const original = formatIdeaBody(idea);
        const translatedBody = scriptsTranslation?.items[index];
        return {
          title: idea.title,
          original,
          translation: translatedBody ? formatScriptIdeaBody(translatedBody) : original,
        };
      }),
      deadline: deadlineParts
        ? {
            date: deadlineParts.date,
            time: deadlineParts.time,
            timezone: deadlineParts.timezone,
          }
        : { date: "" },
    });

    if (isBriefPublished) {
      showPublishToast("Brief updated successfully.");
      return;
    }

    setH5LinkById((prev) => ({
      ...prev,
      [selected.id]: buildMockH5Link(selected.id),
    }));
    showPublishToast("H5 link generated successfully.");
  };

  const handleDraftApproved = useCallback((kolId: string) => {
    setStatusById((prev) => ({
      ...prev,
      [kolId]: "Approved",
    }));
  }, []);

  const handleDraftNeedsRevision = useCallback((kolId: string) => {
    setStatusById((prev) => ({
      ...prev,
      [kolId]: "Waiting for Approval",
    }));
  }, []);

  useEffect(() => {
    return () => {
      if (publishToastTimerRef.current) {
        window.clearTimeout(publishToastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setPublishToast(null);
    if (publishToastTimerRef.current) {
      window.clearTimeout(publishToastTimerRef.current);
      publishToastTimerRef.current = null;
    }
  }, [selectedId]);
  const selectedDeadline = selected
    ? { ...DEFAULT_DEADLINE, ...deadlineById[selected.id] }
    : DEFAULT_DEADLINE;

  const patchDeadline = (id: string, patch: Partial<SubmissionDeadline>) => {
    setDeadlineById((prev) => ({
      ...prev,
      [id]: { ...DEFAULT_DEADLINE, ...prev[id], ...patch },
    }));
  };

  const addAttachments = (id: string, files: FileList) => {
    const next = Array.from(files).map((file) => ({ name: file.name }));
    if (next.length === 0) return;
    setAttachmentsById((prev) => ({
      ...prev,
      [id]: [...(prev[id] ?? []), ...next],
    }));
  };

  const removeAttachment = (id: string, index: number) => {
    setAttachmentsById((prev) => {
      const visible = mergeCampaignScriptAttachments(prev[id] ?? []);
      const target = visible[index];
      if (!target || target.locked || isCampaignSyncedAttachment(target.name)) return prev;

      return {
        ...prev,
        [id]: (prev[id] ?? []).filter((attachment) => attachment.name !== target.name),
      };
    });
  };

  return (
    <TooltipProvider>
      <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
        <span className="sr-only">{campaignId}</span>

        <CampaignHubDetailHeader title="Script" onBack={onBack} />

        <div className="shrink-0 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((filter) => (
              <StatusPill
                key={filter}
                label={filter}
                count={statusCounts[filter]}
                active={statusFilter === filter}
                onClick={() => {
                  setStatusFilter(filter);
                  setSelectedId(null);
                  closeTranslators();
                }}
              />
            ))}
          </div>
        </div>

        <div className="shrink-0 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex flex-wrap items-center gap-2">
            <CampaignHubFilterSelect
              label="Platform"
              value={platformFilter}
              options={["All", "Instagram", "TikTok", "YouTube"]}
              onChange={setPlatformFilter}
            />
            <CampaignHubFilterSelect
              label="KOL Manager"
              value={managerFilter}
              options={["All", "Wollin", "Chris", "Moca"]}
              onChange={setManagerFilter}
            />
            <div className="relative min-w-[220px] flex-1 sm:max-w-[280px]">
              <Search
                size={12}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search influencer name..."
                className="h-8 border-gray-200 bg-gray-50/80 py-0 pl-8 text-xs leading-8 placeholder:text-xs focus:bg-white"
              />
            </div>
            <div className="ml-auto flex shrink-0 items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-gray-600">
                Overdue
                <Switch
                  checked={overdueOnly}
                  onCheckedChange={(checked) => setOverdueOnly(checked === true)}
                  className="h-4 w-7 [&_[data-slot=switch-thumb]]:size-3 [&_[data-slot=switch-thumb]]:translate-x-0.5 [&_[data-slot=switch-thumb]]:data-checked:translate-x-3.5"
                />
              </label>
              <CampaignHubToolbarActionButton>
                <Download size={13} />
                Download
              </CampaignHubToolbarActionButton>
            </div>
          </div>
        </div>

        <div className="flex min-h-[680px] flex-1 shrink-0 gap-3">
          <div className="flex min-h-[680px] w-[360px] shrink-0 flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="shrink-0 border-b border-gray-100 px-4 py-3">
              <p className="text-xs font-semibold text-gray-700">
                Influencers{" "}
                <span className="tabular-nums text-gray-500">({filtered.length})</span>
              </p>
            </div>
            <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <p className="px-2 py-6 text-center text-xs text-gray-400">
                  No influencers match the current filters.
                </p>
              ) : null}
              {filtered.map((row) => {
                const isSelected = row.id === activeSelectedId;
                const rowDeadline = deadlineById[row.id] ?? {
                  date: row.deadlineDate,
                  time: row.deadlineTime,
                  timezone: row.timezone,
                };
                const rowDeadlineParts = getSubmissionDeadlineParts(rowDeadline);
                return (
                  <div
                    key={row.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setSelectedId(row.id);
                      closeTranslators();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedId(row.id);
                        closeTranslators();
                      }
                    }}
                    className={cn(
                      "mb-2 w-full cursor-pointer rounded-xl border p-3 text-left transition-colors last:mb-0",
                      isSelected
                        ? "border-brand/35 bg-brand-50/30"
                        : "border-transparent bg-white hover:border-gray-200 hover:bg-gray-50/80"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <InfluencerAvatar
                        src={getMockInfluencerAvatar(row.id)}
                        alt={row.name}
                        platform={row.platform}
                        size="md"
                        fallback={initials(row.name)}
                        fallbackClassName="bg-violet-100 text-violet-700"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex min-w-0 items-center gap-1">
                              <span className="truncate text-sm font-semibold text-gray-900">
                                {row.name}
                              </span>
                              <InfluencerMetaIcons
                                kolManager={row.manager}
                                relationship={row.relationship}
                              />
                            </div>
                            <p className="mt-1 truncate text-xs text-gray-500">{row.handle}</p>
                          </div>
                          <span
                            className={cn(STAGE_STATUS_PILL_CLASS, STATUS_BADGE[row.status])}
                          >
                            {row.status}
                          </span>
                        </div>
                        {rowDeadlineParts ? (
                          <p className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-gray-500">
                            <span>Deadline: {rowDeadlineParts.dateTime}</span>
                            {rowDeadlineParts.timezone ? (
                              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium leading-none text-gray-400">
                                {rowDeadlineParts.timezone}
                              </span>
                            ) : null}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex min-h-[680px] min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            {!selected ? (
              <div className="flex h-full items-center justify-center p-6">
                <ScriptEmptyWorkspace />
              </div>
            ) : (
              <div className="flex h-full min-h-0 flex-col overflow-hidden">
                <div className="shrink-0 border-b border-gray-100 px-5 py-4">
                  <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                    <button
                      type="button"
                      onClick={() => setWorkspaceTab("brief")}
                      className={cn(
                        "rounded-md px-4 py-1.5 text-xs font-semibold transition-colors",
                        workspaceTab === "brief"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      )}
                    >
                      Brief & H5 Link
                    </button>
                    <button
                      type="button"
                      onClick={() => setWorkspaceTab("draft")}
                      className={cn(
                        "rounded-md px-4 py-1.5 text-xs font-semibold transition-colors",
                        workspaceTab === "draft"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      )}
                    >
                      KOL Draft
                    </button>
                  </div>
                </div>

                {workspaceTab === "brief" && selectedH5Link ? (
                  <div className="shrink-0 border-b border-gray-100 px-5 py-3">
                    <ScriptH5LinkBar link={selectedH5Link} influencerId={selected.id} />
                  </div>
                ) : null}

                <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-5">
                  {workspaceTab === "brief" ? (
                    <div className="flex w-full min-w-0 flex-col gap-6">
                      <section>
                        <div className="mb-2 flex items-center gap-3">
                          <h3 className="shrink-0 text-sm font-semibold text-gray-900">
                            Content Guidelines
                          </h3>
                          <a
                            href="#"
                            className={sectionActionLinkClass}
                            onClick={(e) => e.preventDefault()}
                          >
                            Preview Link
                            <ExternalLink size={12} strokeWidth={2} />
                          </a>
                          <SectionTranslatorButton
                            onClick={openGuidelinesTranslator}
                            className="ml-auto"
                          />
                        </div>
                        {selectedGuidelinesTranslation ? (
                          <ScriptBilingualPanel
                            source={selectedGuidelines}
                            sourceLanguage={selectedGuidelinesTranslation.sourceLanguage}
                            translation={selectedGuidelinesTranslation.translation}
                            targetLanguage={selectedGuidelinesTranslation.targetLanguage}
                            onSourceChange={(value) =>
                              setGuidelinesById((prev) => ({
                                ...prev,
                                [selected.id]: value,
                              }))
                            }
                            onTranslationChange={(value) =>
                              setGuidelinesTranslationById((prev) => ({
                                ...prev,
                                [selected.id]: {
                                  ...selectedGuidelinesTranslation,
                                  translation: value,
                                },
                              }))
                            }
                            sourcePlaceholder="Enter content guidelines for this creator."
                          />
                        ) : (
                          <Textarea
                            value={selectedGuidelines}
                            onChange={(e) =>
                              setGuidelinesById((prev) => ({
                                ...prev,
                                [selected.id]: e.target.value,
                              }))
                            }
                            placeholder="Enter content guidelines for this creator."
                            className="min-h-[120px] resize-none border-gray-200 bg-white text-[13px] focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/25"
                          />
                        )}
                        {selected ? (
                          <ScriptAttachmentsSection
                            attachments={selectedAttachments}
                            onAddFiles={(files) => addAttachments(selected.id, files)}
                            onRemove={(index) => removeAttachment(selected.id, index)}
                          />
                        ) : null}
                      </section>

                      <section>
                        <div className="mb-2 flex items-center gap-3">
                          <h3 className="shrink-0 text-sm font-semibold text-gray-900">
                            Reference Scripts
                          </h3>
                          <button
                            type="button"
                            onClick={() => setGenerateOpen(true)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700"
                          >
                            <Sparkles size={13} className="text-amber-600" strokeWidth={2} />
                            AI Generate Ideas
                          </button>
                          {hasReferenceScripts ? (
                            <SectionTranslatorButton
                              disabled={!hasReferenceScripts}
                              onClick={openScriptsTranslator}
                              className="ml-auto"
                            />
                          ) : null}
                        </div>
                        {hasReferenceScripts ? (
                          selectedScriptsTranslation ? (
                            <div className="space-y-3">
                              {selectedReferenceIdeas.map((idea, index) => (
                                <ReferenceScriptBilingualCard
                                  key={`${idea.title}-${index}`}
                                  idea={idea}
                                  translation={
                                    selectedScriptsTranslation.items[index] ?? {
                                      hook: idea.hook,
                                      coreFlow: idea.coreFlow,
                                      executionNotes: idea.executionNotes,
                                      cta: idea.cta,
                                    }
                                  }
                                  targetLanguage={selectedScriptsTranslation.targetLanguage}
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {selectedReferenceIdeas.map((idea, index) => (
                                <ReferenceScriptOptionCard
                                  key={`${idea.title}-${index}`}
                                  idea={idea}
                                />
                              ))}
                            </div>
                          )
                        ) : null}
                      </section>

                      <section>
                        <h3 className="mb-3 text-sm font-semibold text-gray-900">
                          Submission Deadline
                        </h3>
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="relative w-[148px] shrink-0">
                            <input
                              type="date"
                              value={selectedDeadline.date}
                              onChange={(e) =>
                                patchDeadline(selected.id, { date: e.target.value })
                              }
                              className={cn(
                                denseDateInputClass(),
                                !selectedDeadline.date && "text-gray-400"
                              )}
                            />
                            <Calendar
                              size={14}
                              className="pointer-events-none absolute top-1/2 right-3 z-0 -translate-y-1/2 text-gray-400"
                            />
                          </div>
                          <div className="relative w-[148px] shrink-0">
                            <input
                              type="time"
                              value={selectedDeadline.time}
                              onChange={(e) =>
                                patchDeadline(selected.id, { time: e.target.value })
                              }
                              className={cn(
                                denseDateInputClass(),
                                !selectedDeadline.time && "text-gray-400"
                              )}
                            />
                            <Clock
                              size={14}
                              className="pointer-events-none absolute top-1/2 right-3 z-0 -translate-y-1/2 text-gray-400"
                            />
                          </div>
                          <Select
                            modal={false}
                            value={selectedDeadline.timezone || null}
                            onValueChange={(value) => {
                              if (value) patchDeadline(selected.id, { timezone: value });
                            }}
                          >
                            <SelectTrigger
                              size="sm"
                              className={cn(
                                denseSelectTriggerClass("w-[148px] shrink-0"),
                                !selectedDeadline.timezone && "[&_[data-slot=select-value]]:text-gray-400"
                              )}
                            >
                              <SelectValue placeholder="Time Zone" />
                            </SelectTrigger>
                            <SelectContent alignItemWithTrigger={false}>
                              {DEADLINE_TIMEZONE_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value} className="text-xs">
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </section>
                    </div>
                  ) : (
                    <ScriptKolDraftPanel
                      kolId={selected.id}
                      kolName={selected.name}
                      onApproved={() => handleDraftApproved(selected.id)}
                      onNeedsRevision={() => handleDraftNeedsRevision(selected.id)}
                    />
                  )}
                </div>

                {workspaceTab === "brief" ? (
                  <div className="relative shrink-0 border-t border-gray-100 bg-white px-5 py-4">
                    {publishToast ? (
                      <div className="absolute right-5 bottom-full mb-2 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800 shadow-sm">
                        <CheckCircle2 size={14} className="shrink-0 text-emerald-600" strokeWidth={2} />
                        {publishToast}
                      </div>
                    ) : null}
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedId(null)}
                        className="text-[13px] font-medium text-gray-500 transition-colors hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-9 border-brand/20 bg-brand-50/60 px-4 text-[13px] font-medium text-brand hover:bg-brand-50 hover:text-brand"
                      >
                        Save Draft
                      </Button>
                      <Button
                        type="button"
                        variant="brand"
                        className="h-9 px-4 text-[13px]"
                        onClick={handleSaveAndPublish}
                      >
                        {isBriefPublished ? "Update" : "Save & Publish"}
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {selected ? (
          <>
            <ScriptTranslatorDialog
              open={guidelinesTranslatorOpen}
              onOpenChange={(open) => {
                setTranslatorOpen(open);
                if (!open) setTranslatorForId(null);
              }}
              source={selectedGuidelines}
              onConfirm={(result) => {
                setGuidelinesById((prev) => ({
                  ...prev,
                  [selected.id]: result.source,
                }));
                if (result.translation) {
                  setGuidelinesTranslationById((prev) => ({
                    ...prev,
                    [selected.id]: {
                      sourceLanguage: result.sourceLanguage,
                      translation: result.translation,
                      targetLanguage: result.targetLanguage,
                    },
                  }));
                }
              }}
              sourcePlaceholder="Enter content guidelines for this creator."
            />
            <ScriptReferenceTranslatorDialog
              open={scriptsTranslatorOpenForSelected}
              onOpenChange={(open) => {
                setScriptsTranslatorOpen(open);
                if (!open) setScriptsTranslatorForId(null);
              }}
              ideas={selectedReferenceIdeas}
              onConfirm={(result) => {
                if (!selected) return;
                setScriptsTranslationById((prev) => ({
                  ...prev,
                  [selected.id]: result,
                }));
              }}
            />
            <ScriptGenerateIdeasDialog
              open={generateOpen}
              onOpenChange={setGenerateOpen}
              influencerName={selected.name}
              onConfirm={(ideas) => {
                setReferenceScriptIdeasById((prev) => ({
                  ...prev,
                  [selected.id]: ideas,
                }));
                setScriptsTranslationById((prev) => {
                  const next = { ...prev };
                  delete next[selected.id];
                  return next;
                });
                setScriptsTranslatorOpen(false);
              }}
            />
          </>
        ) : null}
      </div>
    </TooltipProvider>
  );
}
