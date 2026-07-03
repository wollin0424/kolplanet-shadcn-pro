"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { CaptionCoverKolDraftPanel } from "@/components/CaptionCoverKolDraftPanel";
import { ContentGuidelinesDisplayBlock, ContentGuidelinesTranslationNote } from "@/components/ContentGuidelinesDisplayBlock";
import { InfluencerAvatar } from "@/components/InfluencerAvatar";
import { ScriptKolDraftPanel } from "@/components/ScriptKolDraftPanel";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { subscribeCampaignExecutionGuideChanges } from "@/lib/campaignExecutionGuide";
import { ensureContentScriptReviewDemoData } from "@/lib/contentScriptReviewDemo";
import { getMockInfluencerAvatar } from "@/lib/mockInfluencerAvatars";
import {
  getScriptBriefH5Data,
  getScriptBriefH5Defaults,
  type ScriptBriefH5Data,
} from "@/lib/scriptBriefH5Mock";
import { scriptBriefDeadlineToSubmissionDeadline } from "@/lib/scriptBriefDeadline";
import {
  getScriptBriefPublished,
  saveScriptBriefPublished,
  subscribeScriptBriefPublishedChanges,
  type ScriptBriefPublished,
} from "@/lib/scriptBriefPublished";
import { formInputClass } from "@/lib/formControls";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  Languages,
  Lightbulb,
  Pencil,
  Sparkles,
  Trash2,
  X,
} from "@/lib/icons";

type SheetTab = "comments" | "brief";

export type ContentReviewTrack = "script" | "visual" | "caption";

const CONTENT_REVIEW_TRACK_LABEL: Record<ContentReviewTrack, string> = {
  script: "Script",
  visual: "Visual Draft",
  caption: "Caption & Cover",
};

function getContentReviewDraftKolId(kolId: string, track: ContentReviewTrack) {
  if (track === "visual") return `${kolId}-video`;
  if (track === "caption") return `${kolId}-caption`;
  return kolId;
}

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

const CONTENT_BRIEF_DEFAULTS: Record<string, { deadline: SubmissionDeadline }> = {
  s1: {
    deadline: { date: "2026-06-24", time: "20:33", timezone: "UTC+08:00" },
  },
};

const sectionActionLinkClass =
  "inline-flex items-center gap-1 text-xs font-medium text-brand transition-colors hover:text-brand/80";

const GENERATION_TAGS = [
  "Make it more humorous",
  "Emphasize the limited-time discount",
  "Use a casual everyday tone",
  "Push the opening hook harder",
] as const;

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

type GenerateIdeasPhase = "idle" | "loading" | "results";

type ScriptIdeaBody = Pick<ScriptIdea, "hook" | "coreFlow" | "executionNotes" | "cta">;

type ScriptIdea = {
  title: string;
  summary: string;
  hook: string;
  coreFlow: string;
  executionNotes: string;
  cta: string;
  translation?: ScriptIdeaBody;
  targetLanguage?: string;
};

const REFERENCE_SCRIPT_TARGET_LANGUAGES = [
  "Bahasa Indonesia",
  "Bahasa Melayu",
  "Thai",
  "Vietnamese",
  "Japanese",
  "English",
  "Chinese (Traditional)",
] as const;

const referenceScriptTabClass = (active: boolean) =>
  cn(
    "inline-flex h-9 shrink-0 items-center border-b-2 px-2.5 text-[12px] font-medium leading-none transition-colors",
    active
      ? "border-brand text-gray-900"
      : "border-transparent text-gray-500 hover:text-gray-800"
  );

function translateScriptIdeaBody(idea: ScriptIdeaBody, targetLanguage: string): ScriptIdeaBody {
  const translate = (text: string) => `[${targetLanguage}] ${text}`;
  return {
    hook: translate(idea.hook),
    coreFlow: translate(idea.coreFlow),
    executionNotes: translate(idea.executionNotes),
    cta: translate(idea.cta),
  };
}

function formatReferenceScriptTranslation(body: ScriptIdeaBody) {
  return `Hook: ${body.hook}\n\nCore flow: ${body.coreFlow}\n\nExecution notes: ${body.executionNotes}\n\nCTA: ${body.cta}`;
}

function ReferenceScriptIdeaBodyView({ body }: { body: ScriptIdeaBody }) {
  return (
    <div className="space-y-2.5 text-[13px] font-normal leading-relaxed text-gray-600">
      <p>
        <span className="font-semibold text-gray-800">Hook:</span> {body.hook}
      </p>
      <p>
        <span className="font-semibold text-gray-800">Core flow:</span> {body.coreFlow}
      </p>
      <p>
        <span className="font-semibold text-gray-800">Execution notes:</span> {body.executionNotes}
      </p>
      <p>
        <span className="font-semibold text-gray-800">CTA:</span> {body.cta}
      </p>
    </div>
  );
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

function formatIdeaBody(idea: Pick<ScriptIdea, "hook" | "coreFlow" | "executionNotes" | "cta">) {
  return `Hook: ${idea.hook}\n\nCore flow: ${idea.coreFlow}\n\nExecution notes: ${idea.executionNotes}\n\nCTA: ${idea.cta}`;
}

function parseIdeaBody(
  text: string,
  fallback: ScriptIdeaBody
): ScriptIdeaBody {
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

function scriptIdeaToReferenceScript(idea: ScriptIdea): ScriptBriefPublished["referenceScripts"][number] {
  const body = formatReferenceScriptTranslation(idea);
  return {
    title: idea.title,
    original: body,
    translation: idea.translation ? formatReferenceScriptTranslation(idea.translation) : body,
  };
}

const cardActionClass =
  "inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 transition-colors hover:text-gray-800";

function ReferenceScriptTranslatorDialogBody({
  ideas,
  originIndex,
  onOpenChange,
  onConfirm,
}: {
  ideas: ScriptIdea[];
  originIndex: number;
  onOpenChange: (open: boolean) => void;
  onConfirm: (targetLanguage: string, indices: number[]) => void;
}) {
  const [targetLanguage, setTargetLanguage] = useState("");
  const [translateAll, setTranslateAll] = useState(false);

  const canConfirm = Boolean(targetLanguage);

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-[420px]" showCloseButton>
        <div className="border-b border-gray-100 bg-gradient-to-b from-gray-50/80 to-white px-6 pt-6 pb-5">
          <div className="flex items-start gap-3 pr-6">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand ring-1 ring-brand/10">
              <Languages size={18} strokeWidth={2} />
            </span>
            <div className="min-w-0 pt-0.5">
              <DialogTitle className="text-base font-semibold text-gray-900">Translator</DialogTitle>
              <DialogDescription className="mt-1 text-sm text-gray-500">
                Choose a target language to generate a reference translation.
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="space-y-3">
            <label className="block text-xs font-medium text-gray-700">Target language</label>
            <Select
              modal={false}
              value={targetLanguage || null}
              onValueChange={(value) => {
                if (value) setTargetLanguage(value);
              }}
            >
              <SelectTrigger
                size="default"
                className="h-10! w-full rounded-lg border-gray-200 bg-white px-3 py-0 text-sm shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
              >
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                {REFERENCE_SCRIPT_TARGET_LANGUAGES.map((language) => (
                  <SelectItem key={language} value={language} className="text-xs">
                    {language}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {ideas.length > 1 ? (
            <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2.5">
              <Checkbox
                checked={translateAll}
                onCheckedChange={(checked) => setTranslateAll(checked === true)}
                aria-label="Translate all script ideas"
              />
              <span className="text-[13px] text-gray-700">Translate all script ideas</span>
            </label>
          ) : null}
        </div>

        <div className="flex items-center justify-center gap-2 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="h-9 px-4 text-[13px]"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="brand"
            className="h-9 px-4 text-[13px]"
            disabled={!canConfirm}
            onClick={() => {
              if (!canConfirm) return;
              const indices = translateAll ? ideas.map((_, index) => index) : [originIndex];
              onConfirm(targetLanguage, indices);
              onOpenChange(false);
            }}
          >
            Translate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ReferenceScriptTranslatorDialog({
  open,
  onOpenChange,
  ideas,
  originIndex,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ideas: ScriptIdea[];
  originIndex: number;
  onConfirm: (targetLanguage: string, indices: number[]) => void;
}) {
  if (!open) return null;

  return (
    <ReferenceScriptTranslatorDialogBody
      key={originIndex}
      ideas={ideas}
      originIndex={originIndex}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
    />
  );
}

function ReferenceScriptIdeaCard({
  idea,
  selected,
  onToggleSelect,
  onEdit,
  onEditTranslation,
  onRemove,
  onOpenTranslator,
}: {
  idea: ScriptIdea;
  selected: boolean;
  onToggleSelect: () => void;
  onEdit: (patch: ScriptIdeaBody) => void;
  onEditTranslation: (patch: ScriptIdeaBody) => void;
  onRemove: () => void;
  onOpenTranslator: () => void;
}) {
  const [editingOriginal, setEditingOriginal] = useState(false);
  const [originalDraft, setOriginalDraft] = useState(() => formatIdeaBody(idea));
  const translationFromIdea = idea.translation ? formatIdeaBody(idea.translation) : "";
  const [translationEditDraft, setTranslationEditDraft] = useState<string | null>(null);
  const translationDraft = translationEditDraft ?? translationFromIdea;
  const translationFocused = translationEditDraft !== null;
  const [contentView, setContentView] = useState<"original" | "translation">("original");

  const hasTranslation = Boolean(idea.translation);
  const showingTranslation = contentView === "translation" && hasTranslation && Boolean(idea.translation);

  const startEditingOriginal = () => {
    setOriginalDraft(formatIdeaBody(idea));
    setEditingOriginal(true);
  };

  const cancelEditingOriginal = () => {
    setOriginalDraft(formatIdeaBody(idea));
    setEditingOriginal(false);
  };

  const saveEditingOriginal = () => {
    onEdit(parseIdeaBody(originalDraft, idea));
    setContentView("original");
    setEditingOriginal(false);
  };

  const saveTranslationDraft = () => {
    if (!idea.translation || translationEditDraft === null) return;
    onEditTranslation(parseIdeaBody(translationEditDraft, idea.translation));
  };

  return (
    <div
      className={cn(
        "group/card relative rounded-xl border bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors",
        selected ? "border-brand/40 ring-1 ring-brand/15" : "border-gray-100"
      )}
    >
      <Checkbox
        checked={selected}
        onCheckedChange={onToggleSelect}
        className="absolute top-4 right-4"
        aria-label={`Select ${idea.title}`}
      />
      <span className="inline-flex max-w-[calc(100%-2rem)] rounded-md bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
        {idea.title}
      </span>
      {idea.summary ? (
        <p className="mt-2 text-xs leading-relaxed text-gray-500">{idea.summary}</p>
      ) : null}

      {hasTranslation && !editingOriginal ? (
        <div className="mt-4 flex items-center gap-0.5 overflow-x-auto border-b border-gray-100">
          <button
            type="button"
            onClick={() => setContentView("original")}
            className={referenceScriptTabClass(contentView === "original")}
          >
            Original
          </button>
          <button
            type="button"
            onClick={() => setContentView("translation")}
            className={referenceScriptTabClass(contentView === "translation")}
          >
            Translation
            {idea.targetLanguage ? (
              <span className="ml-1.5 text-[11px] font-normal text-gray-400">({idea.targetLanguage})</span>
            ) : null}
          </button>
        </div>
      ) : null}

      {editingOriginal ? (
        <Textarea
          value={originalDraft}
          onChange={(e) => setOriginalDraft(e.target.value)}
          className="mt-4 min-h-[160px] resize-none border-brand/50 text-[13px] leading-relaxed ring-1 ring-brand/15 focus-visible:border-brand focus-visible:ring-brand/25"
          placeholder="Edit the original script…"
        />
      ) : showingTranslation ? (
        <div className="group/translation relative mt-3">
          <label className="block cursor-text">
            <Textarea
              value={translationDraft}
              onChange={(e) => setTranslationEditDraft(e.target.value)}
              onFocus={() => setTranslationEditDraft(translationFromIdea)}
              onBlur={() => {
                saveTranslationDraft();
                setTranslationEditDraft(null);
              }}
              className={cn(
                "min-h-[220px] resize-y text-[13px] leading-relaxed text-gray-700 transition-all duration-200",
                translationFocused
                  ? "border-brand/50 bg-white ring-1 ring-brand/15 focus-visible:border-brand focus-visible:ring-brand/25"
                  : "border-gray-100 bg-gray-50/60 shadow-none group-hover/translation:border-brand/30 group-hover/translation:bg-white group-hover/translation:ring-1 group-hover/translation:ring-brand/10"
              )}
            />
          </label>
          {!translationFocused ? (
            <div className="pointer-events-none absolute top-3 right-3 flex items-center gap-1 rounded-md bg-white/95 px-2 py-1 text-[11px] font-medium text-gray-500 opacity-0 shadow-sm ring-1 ring-gray-100 transition-opacity group-hover/translation:opacity-100">
              <Pencil size={11} strokeWidth={2} />
              Click to edit
            </div>
          ) : null}
          <ContentGuidelinesTranslationNote className="mt-3" />
        </div>
      ) : (
        <div className={cn(hasTranslation ? "mt-3" : "mt-4")}>
          <ReferenceScriptIdeaBodyView body={idea} />
        </div>
      )}

      <div
        className={cn(
          "mt-4 flex justify-end gap-4 transition-opacity duration-200",
          editingOriginal
            ? "opacity-100"
            : "pointer-events-none opacity-0 group-hover/card:pointer-events-auto group-hover/card:opacity-100 group-focus-within/card:pointer-events-auto group-focus-within/card:opacity-100"
        )}
      >
        {editingOriginal ? (
          <>
            <button
              type="button"
              onClick={saveEditingOriginal}
              className={cn(cardActionClass, "text-brand hover:text-brand/80")}
            >
              <Check size={13} strokeWidth={2} />
              Save
            </button>
            <button
              type="button"
              onClick={cancelEditingOriginal}
              className={cardActionClass}
            >
              <X size={13} strokeWidth={2} />
              Cancel
            </button>
          </>
        ) : (
          <>
            {!showingTranslation ? (
              <button
                type="button"
                className={cn(cardActionClass, "hover:text-brand")}
                onClick={onOpenTranslator}
              >
                <Languages size={13} className="text-brand" strokeWidth={2} />
                Translator
              </button>
            ) : null}
            {!showingTranslation ? (
              <button
                type="button"
                onClick={startEditingOriginal}
                className={cardActionClass}
              >
                <Pencil size={13} strokeWidth={2} />
                Edit
              </button>
            ) : null}
            <button
              type="button"
              onClick={onRemove}
              className={cn(cardActionClass, "hover:text-red-600")}
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

function ReferenceScriptsContinueControls({
  customPrompt,
  onCustomPromptChange,
  onGenerate,
  disabled,
  generationRuns,
  generationLimit = 3,
}: {
  customPrompt: string;
  onCustomPromptChange: (value: string) => void;
  onGenerate: (prompt?: string) => void;
  disabled: boolean;
  generationRuns: number;
  generationLimit?: number;
}) {
  const hasCustomPrompt = customPrompt.trim().length > 0;
  const canSubmitCustom = hasCustomPrompt && !disabled;

  return (
    <div className="rounded-xl border border-gray-100 bg-white/70 p-4">
      <p className="mb-3 text-[13px] leading-relaxed text-gray-500">
        Not satisfied? Try a custom style or instruction.
      </p>
      <div className="mb-3 flex flex-wrap gap-2">
        {GENERATION_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => onGenerate(tag)}
            disabled={disabled}
            className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-medium text-gray-600 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
          >
            {tag}
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="flex min-w-0 items-stretch">
          <Input
            value={customPrompt}
            onChange={(e) => onCustomPromptChange(e.target.value)}
            placeholder="Add your own style or generation instruction"
            className={formInputClass(
              "h-10 min-w-0 flex-1 rounded-none border-0 bg-transparent px-3 text-[13px] leading-normal font-normal text-gray-700 shadow-none placeholder:text-[13px] placeholder:font-normal placeholder:text-gray-400 focus-visible:ring-0"
            )}
            disabled={disabled}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canSubmitCustom) onGenerate();
            }}
          />
          <div className="w-px shrink-0 self-stretch bg-gray-200" aria-hidden />
          <button
            type="button"
            onClick={() => onGenerate()}
            disabled={!canSubmitCustom}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 px-4 text-[13px] font-medium transition-colors",
              canSubmitCustom
                ? "bg-amber-500 text-white hover:bg-amber-600"
                : "cursor-not-allowed bg-gray-50 text-gray-400"
            )}
          >
            <Sparkles size={13} strokeWidth={2} />
            Generate
          </button>
        </div>
      </div>
      <p className="mt-2 text-[11px] text-gray-400">
        Generations used:{" "}
        <span className="tabular-nums text-gray-500">
          {generationRuns}/{generationLimit}
        </span>
      </p>
    </div>
  );
}

function ReferenceScriptsGeneratePanel({
  kolName,
  onIdeasGenerated,
  figmaCapture = false,
}: {
  kolName: string;
  onIdeasGenerated?: (ideas: ScriptBriefPublished["referenceScripts"]) => void;
  figmaCapture?: boolean;
}) {
  const captureIdeas = useMemo(
    () => (figmaCapture ? buildMockScriptIdeas("Campaign brief", kolName) : []),
    [figmaCapture, kolName]
  );
  const [customPrompt, setCustomPrompt] = useState("");
  const [phase, setPhase] = useState<GenerateIdeasPhase>(
    figmaCapture ? "results" : "idle"
  );
  const [ideas, setIdeas] = useState<ScriptIdea[]>(() => captureIdeas);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(() =>
    figmaCapture && captureIdeas.length > 0
      ? new Set(captureIdeas.map((_, index) => index))
      : new Set()
  );
  const [generationRuns, setGenerationRuns] = useState(figmaCapture ? 1 : 0);
  const [translatorOpen, setTranslatorOpen] = useState(false);
  const [translatorOriginIndex, setTranslatorOriginIndex] = useState(0);
  const generationLimitReached = generationRuns >= 3;

  const publishSelectedIdeas = useCallback(
    (ideaList: ScriptIdea[], selected: Set<number>) => {
      onIdeasGenerated?.(
        [...selected]
          .sort((a, b) => a - b)
          .map((index) => ideaList[index])
          .filter(Boolean)
          .map(scriptIdeaToReferenceScript)
      );
    },
    [onIdeasGenerated]
  );

  const syncIdeas = (nextIdeas: ScriptIdea[], nextSelected = new Set<number>()) => {
    setIdeas(nextIdeas);
    setSelectedIndices(nextSelected);
  };

  const toggleSelect = (index: number) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else if (next.size < 3) next.add(index);
      return next;
    });
  };

  const handleGenerate = (prompt?: string) => {
    if (generationLimitReached || phase === "loading") return;
    const base = prompt?.trim() || customPrompt.trim() || "Campaign brief";
    setPhase("loading");
    window.setTimeout(() => {
      syncIdeas(buildMockScriptIdeas(base, kolName));
      setGenerationRuns((count) => count + 1);
      setPhase("results");
    }, GENERATION_LOADING_MS);
  };

  const updateIdea = (index: number, patch: Partial<ScriptIdea>) => {
    setIdeas((prev) =>
      prev.map((idea, ideaIndex) => (ideaIndex === index ? { ...idea, ...patch } : idea))
    );
  };

  const removeIdea = (index: number) => {
    const next = ideas.filter((_, ideaIndex) => ideaIndex !== index);
    const nextSelected = new Set<number>();
    [...selectedIndices]
      .sort((a, b) => a - b)
      .forEach((selectedIndex) => {
        if (selectedIndex < index) nextSelected.add(selectedIndex);
        else if (selectedIndex > index) nextSelected.add(selectedIndex - 1);
      });
    syncIdeas(next, nextSelected);
    if (next.length === 0) setPhase("idle");
  };

  const openTranslator = (index: number) => {
    setTranslatorOriginIndex(index);
    setTranslatorOpen(true);
  };

  const handleBatchTranslate = (targetLanguage: string, indices: number[]) => {
    setIdeas((prev) =>
      prev.map((idea, index) =>
        indices.includes(index)
          ? {
              ...idea,
              translation: translateScriptIdeaBody(idea, targetLanguage),
              targetLanguage,
            }
          : idea
      )
    );
  };

  useEffect(() => {
    publishSelectedIdeas(ideas, selectedIndices);
  }, [ideas, selectedIndices, publishSelectedIdeas]);

  const showPanelChrome = phase !== "loading";

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
      <div className="flex flex-col gap-4">
        {showPanelChrome ? (
          <div className="flex items-start gap-3 rounded-xl border border-sky-100 bg-sky-50/70 px-4 py-3.5">
            <Sparkles size={16} className="mt-0.5 shrink-0 text-amber-500" strokeWidth={2} />
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
        ) : null}

        {showPanelChrome ? (
          <ReferenceScriptsContinueControls
            customPrompt={customPrompt}
            onCustomPromptChange={setCustomPrompt}
            onGenerate={handleGenerate}
            disabled={generationLimitReached}
            generationRuns={generationRuns}
          />
        ) : null}

        {phase === "loading" ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span
              className="mb-4 inline-block size-10 animate-spin rounded-full border-[3px] border-brand/20 border-t-brand"
              aria-hidden
            />
            <p className="text-[13px] font-medium text-gray-800">Generating script ideas…</p>
            <p className="mt-1 text-xs text-gray-500">Analyzing the brief and {kolName}&apos;s style</p>
          </div>
        ) : null}

        {ideas.length > 0 && phase !== "loading" ? (
          <div className="space-y-3">
            {ideas.map((idea, index) => (
              <ReferenceScriptIdeaCard
                key={`${idea.title}-${index}`}
                idea={idea}
                selected={selectedIndices.has(index)}
                onToggleSelect={() => toggleSelect(index)}
                onEdit={(patch) =>
                  updateIdea(index, { ...patch, translation: undefined, targetLanguage: undefined })
                }
                onEditTranslation={(patch) => updateIdea(index, { translation: patch })}
                onRemove={() => removeIdea(index)}
                onOpenTranslator={() => openTranslator(index)}
              />
            ))}
            <p className="text-[13px] leading-relaxed text-gray-500">
              Selected:{" "}
              <span className="font-semibold tabular-nums text-gray-600">{selectedIndices.size}/3</span>
            </p>
          </div>
        ) : null}

        <ReferenceScriptTranslatorDialog
          open={translatorOpen}
          onOpenChange={setTranslatorOpen}
          ideas={ideas}
          originIndex={translatorOriginIndex}
          onConfirm={handleBatchTranslate}
        />
      </div>
    </div>
  );
}

const briefSectionTitleClass = "shrink-0 text-sm font-semibold text-gray-900";

function BriefSectionCollapseButton({
  expanded,
  onToggle,
  sectionLabel,
}: {
  expanded: boolean;
  onToggle: () => void;
  sectionLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={expanded ? `Collapse ${sectionLabel}` : `Expand ${sectionLabel}`}
      aria-expanded={expanded}
      className="ml-auto inline-flex size-7 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
    >
      {expanded ? <ChevronUp size={16} strokeWidth={2} /> : <ChevronDown size={16} strokeWidth={2} />}
    </button>
  );
}

function BriefSettingsSectionHeader({
  icon: Icon,
  title,
  trailing,
  description,
  expanded,
  onToggle,
  collapsible = false,
  withBottomSpacing = false,
}: {
  icon: typeof Calendar;
  title: string;
  trailing?: ReactNode;
  description?: ReactNode;
  expanded?: boolean;
  onToggle?: () => void;
  collapsible?: boolean;
  withBottomSpacing?: boolean;
}) {
  const hasBottomSpacing = (collapsible && expanded) || withBottomSpacing || description;

  if (description) {
    return (
      <div className={cn(hasBottomSpacing && "mb-3")}>
        <div className="flex gap-3">
          <div className="flex h-5 shrink-0 items-center text-brand">
            <Icon size={16} strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex min-h-5 flex-wrap items-center gap-x-3 gap-y-1">
              <h3 className={cn(briefSectionTitleClass, "leading-5")}>{title}</h3>
              {trailing}
              {collapsible && onToggle ? (
                <BriefSectionCollapseButton
                  expanded={expanded ?? false}
                  onToggle={onToggle}
                  sectionLabel={title}
                />
              ) : null}
            </div>
            {description}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", hasBottomSpacing && "mb-3")}>
      <Icon size={16} className="shrink-0 text-brand" strokeWidth={2} />
      <h3 className={cn(briefSectionTitleClass, "shrink-0")}>{title}</h3>
      {trailing}
      {collapsible && onToggle ? (
        <BriefSectionCollapseButton
          expanded={expanded ?? false}
          onToggle={onToggle}
          sectionLabel={title}
        />
      ) : null}
    </div>
  );
}

function ReferenceScriptsSectionHeader({
  expanded,
  onToggle,
}: {
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <BriefSettingsSectionHeader
      icon={Lightbulb}
      title="Reference Scripts"
      expanded={expanded}
      onToggle={onToggle}
      collapsible
      trailing={
        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-amber-600">
          <Sparkles size={13} className="shrink-0 text-amber-600" strokeWidth={2} />
          AI Generate Ideas
        </span>
      }
    />
  );
}

function ContentGuidelinesSectionHeader({
  expanded,
  referenceWebsiteUrl,
  onToggle,
  showTranslationNote = false,
}: {
  expanded: boolean;
  referenceWebsiteUrl: string;
  onToggle: () => void;
  showTranslationNote?: boolean;
}) {
  return (
    <BriefSettingsSectionHeader
      icon={FileText}
      title="Content Guidelines"
      expanded={expanded}
      onToggle={onToggle}
      collapsible
      description={
        showTranslationNote ? <ContentGuidelinesTranslationNote /> : undefined
      }
      trailing={
        <a
          href={referenceWebsiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={sectionActionLinkClass}
        >
          Reference Website
          <ExternalLink size={12} strokeWidth={2} />
        </a>
      }
    />
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDeadlineDateForDisplay(isoDate: string) {
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) return `${match[1]}/${match[2]}/${match[3]}`;
  return isoDate;
}

const submissionDeadlineInputClass =
  "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-[0_1px_2px_rgba(0,0,0,0.03)] outline-none transition-colors focus:border-brand/40 focus:ring-2 focus:ring-brand/10";

function SubmissionDeadlineFields({
  deadline,
  onChange,
  figmaCapture = false,
}: {
  deadline: SubmissionDeadline;
  onChange: (patch: Partial<SubmissionDeadline>) => void;
  figmaCapture?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="min-w-0">
        {figmaCapture ? (
          <div
            aria-label="Submission deadline date"
            className={cn(
              submissionDeadlineInputClass,
              "flex items-center",
              !deadline.date && "text-gray-400"
            )}
          >
            {deadline.date ? formatDeadlineDateForDisplay(deadline.date) : "Select date"}
          </div>
        ) : (
          <input
            type="date"
            value={deadline.date}
            onChange={(e) => onChange({ date: e.target.value })}
            aria-label="Submission deadline date"
            className={cn(submissionDeadlineInputClass, !deadline.date && "text-gray-400")}
          />
        )}
      </div>

      <div className="min-w-0">
        {figmaCapture ? (
          <div
            aria-label="Submission deadline time"
            className={cn(
              submissionDeadlineInputClass,
              "flex items-center",
              !deadline.time && "text-gray-400"
            )}
          >
            {deadline.time || "Select time"}
          </div>
        ) : (
          <input
            type="time"
            value={deadline.time}
            onChange={(e) => onChange({ time: e.target.value })}
            aria-label="Submission deadline time"
            className={cn(submissionDeadlineInputClass, !deadline.time && "text-gray-400")}
          />
        )}
      </div>

      <div className="min-w-0">
        <Select
          modal={false}
          value={deadline.timezone || null}
          onValueChange={(value) => {
            if (value) onChange({ timezone: value });
          }}
        >
          <SelectTrigger
            size="default"
            aria-label="Submission deadline time zone"
            className={cn(
              "h-10! w-full rounded-lg border-gray-200 bg-white px-3 py-0 text-sm shadow-[0_1px_2px_rgba(0,0,0,0.03)]",
              !deadline.timezone && "[&_[data-slot=select-value]]:text-gray-400"
            )}
          >
            <SelectValue placeholder="Select zone" />
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
    </div>
  );
}

function BriefSettingsPanel({
  kolName,
  briefContent,
  deadline,
  referenceWebsiteUrl,
  onDeadlineChange,
  onReferenceScriptsChange,
  showReferenceScripts = true,
  showSubmissionDeadline = true,
  figmaCapture = false,
}: {
  kolName: string;
  briefContent: Pick<
    ScriptBriefH5Data,
    "guidelines" | "mention" | "hashtag" | "attachments" | "referenceLinks"
  >;
  deadline: SubmissionDeadline;
  referenceWebsiteUrl: string;
  onDeadlineChange: (patch: Partial<SubmissionDeadline>) => void;
  onReferenceScriptsChange: (scripts: ScriptBriefPublished["referenceScripts"]) => void;
  showReferenceScripts?: boolean;
  showSubmissionDeadline?: boolean;
  figmaCapture?: boolean;
}) {
  const [referenceExpanded, setReferenceExpanded] = useState(true);
  const [guidelinesExpanded, setGuidelinesExpanded] = useState(true);
  const guidelinesVisible = figmaCapture || guidelinesExpanded;

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      {showSubmissionDeadline ? (
        <section>
          <BriefSettingsSectionHeader
            icon={Calendar}
            title="Submission Deadline"
            withBottomSpacing
          />
          <SubmissionDeadlineFields
            deadline={deadline}
            onChange={onDeadlineChange}
            figmaCapture={figmaCapture}
          />
        </section>
      ) : null}

      <section>
        <ContentGuidelinesSectionHeader
          expanded={guidelinesVisible}
          referenceWebsiteUrl={referenceWebsiteUrl}
          onToggle={() => setGuidelinesExpanded((prev) => !prev)}
          showTranslationNote={guidelinesVisible}
        />
        {guidelinesVisible ? (
          <ContentGuidelinesDisplayBlock
            guidelines={briefContent.guidelines}
            mention={briefContent.mention}
            hashtag={briefContent.hashtag}
            attachments={briefContent.attachments}
            referenceLinks={briefContent.referenceLinks}
          />
        ) : null}
      </section>

      {showReferenceScripts ? (
        <section>
          <ReferenceScriptsSectionHeader
            expanded={referenceExpanded}
            onToggle={() => setReferenceExpanded((prev) => !prev)}
          />
          {referenceExpanded ? (
            <ReferenceScriptsGeneratePanel
              kolName={kolName}
              onIdeasGenerated={onReferenceScriptsChange}
              figmaCapture={figmaCapture}
            />
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

function loadContentScriptBriefState(kolId: string) {
  ensureContentScriptReviewDemoData(kolId);

  const brief = getScriptBriefH5Data(kolId);
  const overrides = CONTENT_BRIEF_DEFAULTS[kolId];

  const parsed = scriptBriefDeadlineToSubmissionDeadline(brief.deadline);
  const deadline =
    overrides?.deadline?.date
      ? overrides.deadline
      : { date: parsed.date, time: parsed.time, timezone: parsed.timezone };

  return {
    guidelines: brief.guidelines,
    briefContent: {
      mention: brief.mention,
      hashtag: brief.hashtag,
      attachments: brief.attachments,
      referenceLinks: brief.referenceLinks,
    },
    deadline,
    referenceScripts: brief.referenceScripts,
    referenceWebsiteUrl: brief.referenceWebsiteUrl,
  };
}

function ContentScriptReviewSheetInner({
  kolId,
  kolName,
  platform,
  track,
  initialTab = "comments",
  onOpenChange,
  figmaCapture = false,
}: {
  kolId: string;
  kolName: string;
  platform: string;
  track: ContentReviewTrack;
  initialTab?: SheetTab;
  onOpenChange: (open: boolean) => void;
  figmaCapture?: boolean;
}) {
  const draftKolId = getContentReviewDraftKolId(kolId, track);
  const showReferenceScripts = track === "script";
  const showSubmissionDeadline = track !== "caption";
  const initialBrief = loadContentScriptBriefState(kolId);
  const [tab, setTab] = useState<SheetTab>(initialTab);
  const [guidelines, setGuidelines] = useState(initialBrief.guidelines);
  const [briefContent, setBriefContent] = useState(initialBrief.briefContent);
  const [deadline, setDeadline] = useState<SubmissionDeadline>(initialBrief.deadline);
  const [referenceScripts, setReferenceScripts] = useState(initialBrief.referenceScripts);
  const [referenceWebsiteUrl, setReferenceWebsiteUrl] = useState(initialBrief.referenceWebsiteUrl);

  const loadBrief = useCallback(() => {
    const loaded = loadContentScriptBriefState(kolId);
    setGuidelines(loaded.guidelines);
    setBriefContent(loaded.briefContent);
    setDeadline(loaded.deadline);
    setReferenceScripts(loaded.referenceScripts);
    setReferenceWebsiteUrl(loaded.referenceWebsiteUrl);
  }, [kolId]);

  useEffect(() => {
    ensureContentScriptReviewDemoData(draftKolId);
    const unsubGuide = subscribeCampaignExecutionGuideChanges(loadBrief);
    const unsubPublished = subscribeScriptBriefPublishedChanges(loadBrief);
    return () => {
      unsubGuide();
      unsubPublished();
    };
  }, [draftKolId, loadBrief]);

  const handleSave = () => {
    const brief = getScriptBriefH5Data(kolId);
    const existingPublished = getScriptBriefPublished(kolId);
    const defaults = getScriptBriefH5Defaults(kolId);
    saveScriptBriefPublished(kolId, {
      guidelines: existingPublished?.guidelines ?? defaults.guidelines,
      attachments: brief.attachments,
      referenceScripts,
      deadline: showSubmissionDeadline
        ? {
            date: deadline.date,
            time: deadline.time,
            timezone: deadline.timezone,
          }
        : {
            date: brief.deadline.date,
            time: brief.deadline.time,
            timezone: brief.deadline.timezone,
          },
    });
    onOpenChange(false);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex w-full shrink-0 items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2.5">
              <SheetTitle className="text-base font-semibold text-gray-900">
                {CONTENT_REVIEW_TRACK_LABEL[track]}
              </SheetTitle>
              <InfluencerAvatar
                src={getMockInfluencerAvatar(kolId)}
                alt={kolName}
                platform={platform}
                size="sm"
                fallback={initials(kolName)}
                fallbackClassName="bg-violet-100 text-violet-700"
              />
              <span className="truncate text-sm font-semibold text-gray-900">{kolName}</span>
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

        <div className="shrink-0 border-b border-gray-100 px-5 py-4">
          <div className="grid w-full grid-cols-2 rounded-lg border border-gray-200 bg-gray-50 p-0.5">
            <button
              type="button"
              onClick={() => setTab("comments")}
              className={cn(
                "min-w-0 rounded-md px-4 py-2 text-center text-xs font-semibold transition-colors",
                tab === "comments"
                  ? "bg-white text-brand shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              Comments & Approve
            </button>
            <button
              type="button"
              onClick={() => setTab("brief")}
              className={cn(
                "min-w-0 rounded-md px-4 py-2 text-center text-xs font-semibold transition-colors",
                tab === "brief"
                  ? "bg-white text-brand shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              Brief & Settings
            </button>
          </div>
        </div>

        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {tab === "comments" ? (
            track === "caption" ? (
              <CaptionCoverKolDraftPanel kolId={draftKolId} />
            ) : (
              <ScriptKolDraftPanel kolId={draftKolId} kolName={kolName} />
            )
          ) : (
            <BriefSettingsPanel
              kolName={kolName}
              briefContent={{ ...briefContent, guidelines }}
              deadline={deadline}
              referenceWebsiteUrl={referenceWebsiteUrl}
              onDeadlineChange={(patch) => setDeadline((prev) => ({ ...prev, ...patch }))}
              onReferenceScriptsChange={setReferenceScripts}
              showReferenceScripts={showReferenceScripts}
              showSubmissionDeadline={showSubmissionDeadline}
              figmaCapture={figmaCapture}
            />
          )}
        </div>

        {tab === "brief" ? (
          <div className="shrink-0 border-t border-gray-100 bg-white px-5 py-4">
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="text-[13px] font-medium text-gray-500 transition-colors hover:text-gray-800"
              >
                Cancel
              </button>
              <Button
                type="button"
                variant="brand"
                className="h-9 px-4 text-[13px]"
                onClick={handleSave}
              >
                Save & Update
              </Button>
            </div>
          </div>
        ) : null}
    </div>
  );
}

export function ContentScriptReviewSheet({
  open,
  onOpenChange,
  kolId,
  kolName,
  platform,
  track = "script",
  initialTab,
  figmaCapture,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kolId: string;
  kolName: string;
  platform: string;
  track?: ContentReviewTrack;
  initialTab?: SheetTab;
  figmaCapture?: boolean;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        data-figma-capture={figmaCapture ? "content-review-sheet" : undefined}
        className="flex h-full min-h-0 flex-col gap-0 border-l border-gray-100 bg-white p-0 data-[side=right]:w-full data-[side=right]:max-w-[720px] data-[side=right]:sm:max-w-[720px]"
      >
        {open ? (
          <ContentScriptReviewSheetInner
            kolId={kolId}
            kolName={kolName}
            platform={platform}
            track={track}
            initialTab={initialTab}
            onOpenChange={onOpenChange}
            figmaCapture={figmaCapture}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
