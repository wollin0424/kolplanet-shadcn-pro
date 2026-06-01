"use client";

import { useMemo, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getMockInfluencerAvatar } from "@/lib/mockInfluencerAvatars";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Calendar,
  Clock,
  Download,
  FileText,
  Languages,
  ScrollText,
  Search,
  Sparkles,
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
  attachment?: string;
  overdue: boolean;
};

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
] as const;

const GENERATION_TAGS = [
  "更幽默一点",
  "强调限时折扣",
  "口语化日常风",
  "开头更抓人",
] as const;

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
    timezone: "GMT+8",
    guidelines: "3456789",
    attachment: "Contract_Mia_Sullivan_Final_2026-03.pdf",
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
    status: "Pending",
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
    status: "Approved",
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
    status: "Pending",
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
    status: "Waiting for Approval",
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
    status: "Pending",
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
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);
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
    <div className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-8 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <ScrollText size={28} className="text-brand/70" strokeWidth={1.5} />
      </div>
      <p className="max-w-sm text-sm font-medium text-gray-700">
        Select an influencer on the left to open the Script workspace.
      </p>
    </div>
  );
}

function ScriptTranslatorDialog({
  open,
  onOpenChange,
  original,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  original: string;
  onConfirm: (translation: string, language: string) => void;
}) {
  if (!open) return null;

  return (
    <ScriptTranslatorDialogBody
      key={original}
      onOpenChange={onOpenChange}
      original={original}
      onConfirm={onConfirm}
    />
  );
}

function ScriptTranslatorDialogBody({
  onOpenChange,
  original,
  onConfirm,
}: {
  onOpenChange: (open: boolean) => void;
  original: string;
  onConfirm: (translation: string, language: string) => void;
}) {
  const [language, setLanguage] = useState<string>(TRANSLATION_LANGUAGES[0]);
  const [source, setSource] = useState(original);
  const [translation, setTranslation] = useState("");

  const handleTranslate = () => {
    if (!source.trim()) return;
    setTranslation(`[${language}] ${source}`);
  };

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-3xl" showCloseButton>
        <DialogHeader className="border-b border-gray-100 px-6 py-4">
          <div className="flex items-start gap-3">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand">
              <Languages size={18} strokeWidth={2} />
            </span>
            <div>
              <DialogTitle className="text-base font-semibold text-gray-900">
                Translator
              </DialogTitle>
              <DialogDescription className="mt-1 text-xs text-gray-500">
                Select the target language, then click the arrow to generate the translated
                version.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-4 px-6 py-5 sm:grid-cols-[1fr_auto_1fr] sm:items-start">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-700">Original (EN)</p>
            <Textarea
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Enter content guidelines for this creator."
              className="min-h-[180px] resize-none text-[13px]"
            />
          </div>

          <button
            type="button"
            onClick={handleTranslate}
            className="mx-auto mt-8 inline-flex size-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand"
            aria-label="Translate"
          >
            <ArrowRight size={18} strokeWidth={2} />
          </button>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-gray-700">Translation</p>
              <Select value={language} onValueChange={(v) => setLanguage(v ?? language)}>
                <SelectTrigger className="h-7 w-[160px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRANSLATION_LANGUAGES.map((lang) => (
                    <SelectItem key={lang} value={lang} className="text-xs">
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Textarea
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              placeholder="Translation will appear here after you click the arrow."
              className="min-h-[180px] resize-none text-[13px]"
            />
          </div>
        </div>

        <DialogFooter className="border-t border-gray-100 bg-white px-6 py-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="brand"
            onClick={() => {
              onConfirm(translation, language);
              onOpenChange(false);
            }}
            disabled={!translation.trim()}
          >
            Confirm
          </Button>
        </DialogFooter>
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
  const [generated, setGenerated] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
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

  const handleGenerate = (prompt?: string) => {
    if (generationLimitReached) return;
    const base = prompt?.trim() || customPrompt.trim() || "Campaign brief hook";
    setGenerated([
      `${base} — Open with a bold question, then reveal the product benefit in 10 seconds.`,
      `${base} — Start with a relatable pain point and transition into a limited-time offer.`,
      `${base} — Use a quick before/after demo with a friendly, conversational tone.`,
    ]);
    setSelected(new Set());
    setGenerationRuns((count) => count + 1);
  };

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-2xl" showCloseButton>
        <DialogHeader className="border-b border-gray-100 px-6 py-4">
          <div className="flex items-start gap-3">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Sparkles size={18} strokeWidth={2} />
            </span>
            <div>
              <DialogTitle className="text-base font-semibold text-gray-900">
                Generate Script Ideas
              </DialogTitle>
              <DialogDescription className="mt-1 text-xs text-gray-500">
                Let AI analyze the campaign brief and {influencerName}&apos;s style to create 3
                distinct scripts.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 px-6 py-5">
          <div className="flex items-center justify-between gap-3 rounded-lg border border-sky-100 bg-sky-50/80 px-4 py-3">
            <p className="text-xs font-medium text-sky-800">
              Click Generate to brainstorm reference scripts for the KOL.
            </p>
            <Button
              variant="brand"
              size="sm"
              onClick={() => handleGenerate()}
              disabled={generationLimitReached}
            >
              Generate
            </Button>
          </div>

          <div>
            <p className="mb-2 text-xs text-gray-500">
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
                placeholder="Add your own style or generation instruction"
                className="pr-10 text-xs"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleGenerate();
                }}
              />
              <button
                type="button"
                onClick={() => handleGenerate()}
                className="absolute top-1/2 right-2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-brand"
                aria-label="Generate with custom prompt"
              >
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {generated.length > 0 ? (
            <div className="space-y-2">
              {generated.map((idea, index) => {
                const isSelected = selected.has(index);
                return (
                  <button
                    key={idea}
                    type="button"
                    onClick={() => toggleSelect(index)}
                    className={cn(
                      "w-full rounded-lg border px-4 py-3 text-left text-xs leading-relaxed transition-colors",
                      isSelected
                        ? "border-brand bg-brand-50 text-gray-800"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    )}
                  >
                    {idea}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        <DialogFooter className="flex-col gap-3 border-t border-gray-100 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-500">
            Selected:{" "}
            <span className="font-semibold tabular-nums text-gray-800">{selected.size}/3</span>
            {generationLimitReached ? (
              <span className="ml-2 text-gray-400">
                Generation limit ({generationRuns}/3) reached.
              </span>
            ) : null}
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              variant="brand"
              disabled={selected.size === 0}
              onClick={() => {
                onConfirm(
                  [...selected].sort((a, b) => a - b).map((index) => generated[index])
                );
                onOpenChange(false);
              }}
            >
              Confirm & Add
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
  const [referenceScriptsById, setReferenceScriptsById] = useState<Record<string, string[]>>(
    {}
  );
  const [translatorOpen, setTranslatorOpen] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);

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
  const selectedReferenceScripts = selected ? (referenceScriptsById[selected.id] ?? []) : [];

  return (
    <TooltipProvider>
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
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

        <div className="flex min-h-0 flex-1 gap-3 overflow-hidden">
          <div className="flex w-[300px] shrink-0 flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
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
                return (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => setSelectedId(row.id)}
                    className={cn(
                      "mb-2 w-full rounded-xl border p-3 text-left transition-colors last:mb-0",
                      isSelected
                        ? "border-brand bg-brand-50/50 ring-1 ring-brand/20"
                        : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/80"
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
                        {isSelected ? (
                          <p className="mt-2 text-[11px] font-medium text-brand">
                            Deadline: {row.deadline}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            {!selected ? (
              <div className="flex flex-1 items-center justify-center p-6">
                <ScriptEmptyWorkspace />
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
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

                <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-5">
                  {workspaceTab === "brief" ? (
                    <div className="mx-auto flex max-w-3xl flex-col gap-6">
                      <section>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <h3 className="text-sm font-semibold text-gray-900">
                            Content Guidelines
                          </h3>
                          <button
                            type="button"
                            onClick={() => setTranslatorOpen(true)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:text-brand/80"
                          >
                            <Languages size={13} />
                            Translator
                          </button>
                        </div>
                        <Textarea
                          value={selectedGuidelines}
                          onChange={(e) =>
                            setGuidelinesById((prev) => ({
                              ...prev,
                              [selected.id]: e.target.value,
                            }))
                          }
                          placeholder="Enter content guidelines for this creator."
                          className="min-h-[120px] resize-none text-[13px]"
                        />
                        <button
                          type="button"
                          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand hover:text-brand/80"
                        >
                          + Add Attachment
                        </button>
                        {selected.attachment ? (
                          <div className="mt-2 inline-flex max-w-full items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                            <FileText size={14} className="shrink-0 text-rose-500" />
                            <span className="truncate text-xs font-medium text-gray-700">
                              {selected.attachment}
                            </span>
                            <button
                              type="button"
                              className="ml-1 shrink-0 text-gray-400 hover:text-gray-600"
                              aria-label="Remove attachment"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : null}
                      </section>

                      <section>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <h3 className="text-sm font-semibold text-gray-900">
                            Reference Scripts
                          </h3>
                          <button
                            type="button"
                            onClick={() => setGenerateOpen(true)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:text-brand/80"
                          >
                            <Sparkles size={13} />
                            AI Generate Ideas
                          </button>
                        </div>
                        {selectedReferenceScripts.length > 0 ? (
                          <div className="space-y-2">
                            {selectedReferenceScripts.map((script) => (
                              <div
                                key={script}
                                className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-xs leading-relaxed text-gray-700"
                              >
                                {script}
                              </div>
                            ))}
                          </div>
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
                        <div className="grid gap-3 sm:grid-cols-3" key={selected.id}>
                          <div className="relative">
                            <Calendar
                              size={14}
                              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                            />
                            <Input
                              type="date"
                              defaultValue={selected.deadlineDate}
                              className="pl-9 text-xs"
                            />
                          </div>
                          <div className="relative">
                            <Clock
                              size={14}
                              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                            />
                            <Input
                              type="time"
                              defaultValue={selected.deadlineTime}
                              className="pl-9 text-xs"
                            />
                          </div>
                          <Select defaultValue={selected.timezone}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Time Zone" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="GMT+8" className="text-xs">
                                GMT+8
                              </SelectItem>
                              <SelectItem value="GMT+7" className="text-xs">
                                GMT+7
                              </SelectItem>
                              <SelectItem value="UTC" className="text-xs">
                                UTC
                              </SelectItem>
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
              </div>
            )}
          </div>
        </div>

        {selected ? (
          <>
            <ScriptTranslatorDialog
              open={translatorOpen}
              onOpenChange={setTranslatorOpen}
              original={selectedGuidelines}
              onConfirm={(translation) => {
                setGuidelinesById((prev) => ({
                  ...prev,
                  [selected.id]: translation || prev[selected.id],
                }));
              }}
            />
            <ScriptGenerateIdeasDialog
              open={generateOpen}
              onOpenChange={setGenerateOpen}
              influencerName={selected.name}
              onConfirm={(scripts) => {
                setReferenceScriptsById((prev) => ({
                  ...prev,
                  [selected.id]: scripts,
                }));
              }}
            />
          </>
        ) : null}
      </div>
    </TooltipProvider>
  );
}
