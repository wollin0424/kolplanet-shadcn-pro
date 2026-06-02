"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  CampaignHubDetailHeader,
  CampaignHubToolbarActionButton,
} from "@/components/CampaignHubDetailToolbar";
import { CampaignHubFilterSelect } from "@/components/CampaignHubFilterSelect";
import {
  InfluencerMetaIcons,
  type KolRelationship,
} from "@/components/InfluencerMetaIcons";
import { InfluencerAvatar } from "@/components/InfluencerAvatar";
import { Button } from "@/components/ui/button";
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
  ArrowLeftRight,
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
  Pencil,
  Search,
  Sparkles,
  Trash2,
  X,
} from "@/lib/icons";

type ScriptStatus = "Pending" | "Waiting for Approval" | "Approved";
type StatusFilter = "All" | ScriptStatus;

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
  attachments?: string[];
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
  timezone: "UTC+08:00",
};

function formatSubmissionDeadlineLabel(deadline: SubmissionDeadline) {
  if (!deadline.date) return "";
  const [year, month, day] = deadline.date.split("-").map(Number);
  if (!year || !month || !day) return "";

  const parts: string[] = [
    new Date(year, month - 1, day).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  ];

  if (deadline.time) {
    parts.push(deadline.time);
  }

  if (deadline.timezone) {
    parts.push(deadline.timezone);
  }

  return parts.join(" ");
}

const sectionActionLinkClass =
  "inline-flex items-center gap-1 text-xs font-medium text-brand transition-colors hover:text-brand/80";

function buildMockH5Link(influencerId: string) {
  const slug = influencerId.replace(/[^a-z0-9]/gi, "").slice(-5).toLowerCase() || "x8y2z";
  return `kolp.la/s/${slug}`;
}

function ScriptH5LinkBar({ link }: { link: string }) {
  const href = link.startsWith("http") ? link : `https://${link}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(href);
    } catch {
      // Clipboard may be unavailable outside secure context.
    }
  };

  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2.5">
      <Link size={14} className="shrink-0 text-gray-400" strokeWidth={2} />
      <p className="min-w-0 flex-1 truncate text-xs text-gray-600">
        H5 Link for KOL:{" "}
        <span className="font-medium text-gray-800">{link}</span>
      </p>
      <a
        href={href}
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
    </div>
  );
}

function SectionTranslatorButton({
  active,
  onClick,
  disabled = false,
  className,
}: {
  active: boolean;
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
        active && "rounded-md bg-brand-50 px-2 py-1",
        disabled && "cursor-not-allowed opacity-45",
        className
      )}
    >
      <Languages size={13} className="text-brand" strokeWidth={2} />
      {active ? "Close translator" : "Translator"}
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
  "Waiting for Approval": "border-amber-200 bg-amber-50 text-amber-800",
  Approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

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

const TARGET_LANGUAGE_OPTIONS = TRANSLATION_LANGUAGES.map((lang) => ({
  value: lang,
  label: lang,
}));

const DEFAULT_SOURCE_LANGUAGE = AUTO_DETECT_LANGUAGE;
const DEFAULT_TARGET_LANGUAGE = "Bahasa Indonesia";

function mockTranslateText(
  source: string,
  sourceLanguage: string,
  targetLanguage: string
) {
  const detected =
    sourceLanguage === AUTO_DETECT_LANGUAGE ? "English" : sourceLanguage;
  return `[${targetLanguage} · from ${detected}] ${source}`;
}

function TranslatorLanguageSelect({
  value,
  onValueChange,
  options,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={(v) => v && onValueChange(v)} modal={false}>
      <SelectTrigger
        size="sm"
        className={cn(
          "h-8 w-full min-w-0 border-0 bg-transparent px-0 text-[13px] font-medium text-gray-800 shadow-none hover:bg-transparent focus-visible:ring-0",
          className
        )}
      >
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} className="text-xs">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
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
    label: "Quick Demo",
    letter: "c",
    summary: "Fast product walkthrough with clear proof points.",
  },
] as const;

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
    status: "Pending",
    deadline: "Jun 10, 2026",
    deadlineDate: "2026-06-10",
    deadlineTime: "18:00",
    timezone: "UTC+08:00",
    guidelines: "3456789",
    attachments: [
      "模块-支付管理.pdf",
      "模块-支付管理.pdf",
      "Contract_James_Morgan_Final_2026.pdf",
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
    timezone: "UTC+08:00",
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
    status: "Pending",
    deadline: "Jun 8, 2026",
    deadlineDate: "2026-06-08",
    deadlineTime: "09:00",
    timezone: "UTC+08:00",
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
    status: "Approved",
    deadline: "Jun 15, 2026",
    deadlineDate: "2026-06-15",
    deadlineTime: "15:30",
    timezone: "UTC+08:00",
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
    status: "Pending",
    deadline: "Jun 11, 2026",
    deadlineDate: "2026-06-11",
    deadlineTime: "20:00",
    timezone: "UTC+08:00",
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
    status: "Waiting for Approval",
    deadline: "Jun 9, 2026",
    deadlineDate: "2026-06-09",
    deadlineTime: "11:00",
    timezone: "UTC+08:00",
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
    status: "Pending",
    deadline: "Jun 14, 2026",
    deadlineDate: "2026-06-14",
    deadlineTime: "10:00",
    timezone: "UTC+08:00",
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
    timezone: "UTC+08:00",
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
    timezone: "UTC+08:00",
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
    timezone: "UTC+08:00",
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
  onRemove,
}: {
  name: string;
  onRemove: () => void;
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
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        aria-label={`Remove ${name}`}
      >
        <X size={12} strokeWidth={2} />
      </button>
    </div>
  );
}

function ScriptAttachmentsSection({
  attachments,
  onAddFiles,
  onRemove,
}: {
  attachments: string[];
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
          {attachments.map((name, index) => (
            <ScriptAttachmentPill
              key={`${name}-${index}`}
              name={name}
              onRemove={() => onRemove(index)}
            />
          ))}
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
      <span className={cn("tabular-nums", active ? "text-brand" : "text-gray-400")}>
        ({count})
      </span>
    </button>
  );
}

function ScriptEmptyWorkspace() {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
      <span className="mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-sky-50 text-brand">
        <Sparkles size={26} strokeWidth={1.75} />
      </span>
      <p className="max-w-sm text-sm font-medium text-gray-600">
        Select an influencer on the left to open the Script workspace.
      </p>
    </div>
  );
}

const TRANSLATOR_PANE_MIN_HEIGHT = 120;

function InlineTranslatorPanel({
  source,
  onSourceChange,
  sourceReadOnly = false,
  defaultSourceLanguage = DEFAULT_SOURCE_LANGUAGE,
  defaultTargetLanguage = DEFAULT_TARGET_LANGUAGE,
  sourcePlaceholder = "Type to translate.",
  translationPlaceholder = "Translation",
}: {
  source: string;
  onSourceChange?: (value: string) => void;
  sourceReadOnly?: boolean;
  defaultSourceLanguage?: string;
  defaultTargetLanguage?: string;
  sourcePlaceholder?: string;
  translationPlaceholder?: string;
}) {
  const sourceRef = useRef<HTMLTextAreaElement>(null);
  const translationRef = useRef<HTMLTextAreaElement>(null);
  const [draftSource, setDraftSource] = useState(source);
  const [sourceLanguage, setSourceLanguage] = useState(defaultSourceLanguage);
  const [targetLanguage, setTargetLanguage] = useState(defaultTargetLanguage);
  const [translation, setTranslation] = useState("");
  const [paneHeight, setPaneHeight] = useState(TRANSLATOR_PANE_MIN_HEIGHT);

  useEffect(() => {
    setDraftSource(source);
  }, [source]);

  const handleSourceChange = (value: string) => {
    setDraftSource(value);
    onSourceChange?.(value);
  };

  const syncPaneHeight = useCallback(() => {
    const sourceEl = sourceRef.current;
    const translationEl = translationRef.current;
    if (!sourceEl || !translationEl) return;

    sourceEl.style.height = "0px";
    translationEl.style.height = "0px";

    const nextHeight = Math.max(
      TRANSLATOR_PANE_MIN_HEIGHT,
      sourceEl.scrollHeight,
      translationEl.scrollHeight
    );

    sourceEl.style.height = `${nextHeight}px`;
    translationEl.style.height = `${nextHeight}px`;
    setPaneHeight(nextHeight);
  }, []);

  useLayoutEffect(() => {
    syncPaneHeight();
  }, [draftSource, translation, syncPaneHeight]);

  useEffect(() => {
    const sourceEl = sourceRef.current;
    if (!sourceEl) return;

    const observer = new ResizeObserver(() => {
      syncPaneHeight();
    });
    observer.observe(sourceEl);
    return () => observer.disconnect();
  }, [syncPaneHeight]);

  const targetOptions = useMemo(() => {
    if (sourceLanguage === AUTO_DETECT_LANGUAGE) return TARGET_LANGUAGE_OPTIONS;
    return TARGET_LANGUAGE_OPTIONS.filter((option) => option.value !== sourceLanguage);
  }, [sourceLanguage]);

  useEffect(() => {
    if (targetOptions.every((option) => option.value !== targetLanguage)) {
      setTargetLanguage(targetOptions[0]?.value ?? DEFAULT_TARGET_LANGUAGE);
    }
  }, [targetLanguage, targetOptions]);

  useEffect(() => {
    if (!draftSource.trim()) {
      setTranslation("");
      return;
    }

    const timer = window.setTimeout(() => {
      setTranslation(mockTranslateText(draftSource, sourceLanguage, targetLanguage));
    }, 450);

    return () => window.clearTimeout(timer);
  }, [draftSource, sourceLanguage, targetLanguage]);

  const handleSwapLanguages = () => {
    if (sourceLanguage === AUTO_DETECT_LANGUAGE) return;

    const nextSource = targetLanguage;
    const nextTarget = sourceLanguage;
    setSourceLanguage(nextSource);
    setTargetLanguage(nextTarget);

    if (translation.trim()) {
      const stripped = translation.replace(/^\[[^\]]+\]\s*/, "");
      setDraftSource(stripped);
      onSourceChange?.(stripped);
      setTranslation(draftSource);
    }
  };

  const textareaClass = cn(
    "w-full resize-none overflow-hidden rounded-none border-0",
    "bg-white px-4 py-3 text-[13px] leading-relaxed shadow-none focus-visible:ring-0"
  );

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <div className="flex items-stretch border-b border-gray-200 bg-gray-50/50">
        <div className="min-w-0 flex-1 px-3 py-1">
          <TranslatorLanguageSelect
            value={sourceLanguage}
            onValueChange={setSourceLanguage}
            options={SOURCE_LANGUAGE_OPTIONS}
          />
        </div>
        <button
          type="button"
          onClick={handleSwapLanguages}
          disabled={sourceLanguage === AUTO_DETECT_LANGUAGE}
          className="inline-flex w-10 shrink-0 items-center justify-center border-x border-gray-200 text-gray-500 transition-colors hover:bg-white hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Swap languages"
        >
          <ArrowLeftRight size={15} strokeWidth={2} />
        </button>
        <div className="min-w-0 flex-1 px-3 py-1">
          <TranslatorLanguageSelect
            value={targetLanguage}
            onValueChange={setTargetLanguage}
            options={targetOptions}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ minHeight: paneHeight }}>
        <Textarea
          ref={sourceRef}
          value={draftSource}
          onChange={(e) => handleSourceChange(e.target.value)}
          readOnly={sourceReadOnly}
          placeholder={sourcePlaceholder}
          style={{ height: paneHeight }}
          className={cn(
            textareaClass,
            sourceReadOnly ? "cursor-default bg-gray-50/80 text-gray-700" : "bg-white"
          )}
        />
        <Textarea
          ref={translationRef}
          value={translation}
          readOnly
          tabIndex={-1}
          placeholder={translationPlaceholder}
          style={{ height: paneHeight }}
          className={cn(
            textareaClass,
            "cursor-default border-t border-gray-200 bg-gray-50/80 text-gray-700 lg:border-t-0 lg:border-l"
          )}
        />
      </div>
    </div>
  );
}

function ScriptGuidelinesEditor({
  guidelines,
  onGuidelinesChange,
  translatorOpen,
}: {
  guidelines: string;
  onGuidelinesChange: (value: string) => void;
  translatorOpen: boolean;
}) {
  if (!translatorOpen) {
    return (
      <Textarea
        value={guidelines}
        onChange={(e) => onGuidelinesChange(e.target.value)}
        placeholder="Enter content guidelines for this creator."
        className="min-h-[120px] resize-none text-[13px]"
      />
    );
  }

  return (
    <InlineTranslatorPanel
      source={guidelines}
      onSourceChange={onGuidelinesChange}
      sourcePlaceholder="Enter content guidelines for this creator."
    />
  );
}

function ScriptReferenceScriptsEditor({
  scripts,
  onScriptsChange,
  translatorOpen,
}: {
  scripts: string;
  onScriptsChange: (value: string) => void;
  translatorOpen: boolean;
}) {
  if (translatorOpen) {
    return (
      <InlineTranslatorPanel
        source={scripts}
        onSourceChange={onScriptsChange}
        sourcePlaceholder="Type to translate."
        translationPlaceholder="Translation"
      />
    );
  }

  return (
    <Textarea
      value={scripts}
      onChange={(e) => onScriptsChange(e.target.value)}
      className="min-h-[200px] resize-none text-[13px] leading-relaxed"
    />
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
  onConfirm: (scripts: string[]) => void;
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
  onConfirm: (scripts: string[]) => void;
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
                    .map((index) => formatScriptIdeaForStorage(ideas[index]))
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
  const [referenceScriptsById, setReferenceScriptsById] = useState<Record<string, string>>({});
  const [translatorOpen, setTranslatorOpen] = useState(false);
  const [translatorForId, setTranslatorForId] = useState<string | null>(null);
  const [scriptsTranslatorOpen, setScriptsTranslatorOpen] = useState(false);
  const [scriptsTranslatorForId, setScriptsTranslatorForId] = useState<string | null>(null);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [deadlineById, setDeadlineById] = useState<Record<string, SubmissionDeadline>>({});
  const [attachmentsById, setAttachmentsById] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(
      MOCK_INFLUENCERS.map((row) => [row.id, row.attachments ?? []])
    )
  );
  const [h5LinkById, setH5LinkById] = useState<Record<string, string>>({});
  const [publishToast, setPublishToast] = useState<string | null>(null);
  const publishToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_INFLUENCERS.filter((row) => {
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
  }, [statusFilter, platformFilter, managerFilter, overdueOnly, query]);

  const statusCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = {
      All: MOCK_INFLUENCERS.length,
      Pending: 0,
      "Waiting for Approval": 0,
      Approved: 0,
    };
    for (const row of MOCK_INFLUENCERS) {
      counts[row.status] += 1;
    }
    return counts;
  }, []);

  const activeSelectedId =
    selectedId && filtered.some((row) => row.id === selectedId) ? selectedId : null;

  const selected = activeSelectedId
    ? (MOCK_INFLUENCERS.find((row) => row.id === activeSelectedId) ?? null)
    : null;

  const selectedGuidelines = selected ? (guidelinesById[selected.id] ?? "") : "";
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
    if (!(referenceScriptsById[selected.id] ?? "").trim()) return;
    setScriptsTranslatorForId(selected.id);
    setScriptsTranslatorOpen(true);
  };
  const selectedAttachments = selected ? (attachmentsById[selected.id] ?? []) : [];
  const selectedReferenceScripts = selected ? (referenceScriptsById[selected.id] ?? "") : "";
  const hasReferenceScripts = selectedReferenceScripts.trim().length > 0;
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
    const names = Array.from(files).map((file) => file.name);
    if (names.length === 0) return;
    setAttachmentsById((prev) => ({
      ...prev,
      [id]: [...(prev[id] ?? []), ...names],
    }));
  };

  const removeAttachment = (id: string, index: number) => {
    setAttachmentsById((prev) => ({
      ...prev,
      [id]: (prev[id] ?? []).filter((_, i) => i !== index),
    }));
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
                const rowDeadlineLabel = formatSubmissionDeadlineLabel(
                  deadlineById[row.id] ?? DEFAULT_DEADLINE
                );
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
                            className={cn(
                              "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold leading-tight",
                              STATUS_BADGE[row.status]
                            )}
                          >
                            {row.status === "Waiting for Approval" ? "Waiting" : row.status}
                          </span>
                        </div>
                        {rowDeadlineLabel ? (
                          <p className="mt-2 text-[11px] font-medium text-gray-500">
                            Deadline: {rowDeadlineLabel}
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
                    <ScriptH5LinkBar link={selectedH5Link} />
                  </div>
                ) : null}

                <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-5">
                  {workspaceTab === "brief" ? (
                    <div className="mx-auto flex max-w-3xl flex-col gap-6">
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
                            active={guidelinesTranslatorOpen}
                            onClick={() => {
                              if (guidelinesTranslatorOpen) {
                                setTranslatorOpen(false);
                                return;
                              }
                              openGuidelinesTranslator();
                            }}
                            className="ml-auto"
                          />
                        </div>
                        <ScriptGuidelinesEditor
                          guidelines={selectedGuidelines}
                          onGuidelinesChange={(value) =>
                            setGuidelinesById((prev) => ({
                              ...prev,
                              [selected.id]: value,
                            }))
                          }
                          translatorOpen={guidelinesTranslatorOpen}
                        />
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
                          <SectionTranslatorButton
                            active={scriptsTranslatorOpenForSelected}
                            disabled={!hasReferenceScripts}
                            onClick={() => {
                              if (!hasReferenceScripts) return;
                              if (scriptsTranslatorOpenForSelected) {
                                setScriptsTranslatorOpen(false);
                                return;
                              }
                              openScriptsTranslator();
                            }}
                            className="ml-auto"
                          />
                        </div>
                        {hasReferenceScripts ? (
                          <ScriptReferenceScriptsEditor
                            scripts={selectedReferenceScripts}
                            onScriptsChange={(value) =>
                              setReferenceScriptsById((prev) => ({
                                ...prev,
                                [selected.id]: value,
                              }))
                            }
                            translatorOpen={scriptsTranslatorOpenForSelected}
                          />
                        ) : (
                          <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/50 px-4 py-8 text-center text-xs text-gray-400">
                            Generated reference scripts will appear here.
                          </div>
                        )}
                      </section>

                      <section>
                        <h3 className="mb-3 text-sm font-semibold text-gray-900">
                          Submission Deadline
                        </h3>
                        <div className="grid gap-3 sm:grid-cols-3">
                          <div className="relative">
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
                          <div className="relative">
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
                            value={selectedDeadline.timezone}
                            onValueChange={(value) => {
                              if (value) patchDeadline(selected.id, { timezone: value });
                            }}
                          >
                            <SelectTrigger size="sm" className={denseSelectTriggerClass()}>
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
                    <div className="mx-auto flex max-w-3xl flex-col gap-4">
                      <p className="text-sm font-semibold text-gray-900">KOL Draft</p>
                      <Textarea
                        placeholder="Paste or write the influencer's script draft here."
                        className="min-h-[240px] resize-none text-[13px]"
                      />
                    </div>
                  )}
                </div>

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
              </div>
            )}
          </div>
        </div>

        {selected ? (
          <>
            <ScriptGenerateIdeasDialog
              open={generateOpen}
              onOpenChange={setGenerateOpen}
              influencerName={selected.name}
              onConfirm={(scripts) => {
                setReferenceScriptsById((prev) => ({
                  ...prev,
                  [selected.id]: scripts.join("\n\n"),
                }));
                setScriptsTranslatorOpen(false);
              }}
            />
          </>
        ) : null}
      </div>
    </TooltipProvider>
  );
}
