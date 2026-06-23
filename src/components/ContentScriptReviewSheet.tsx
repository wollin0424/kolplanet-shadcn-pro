"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { CaptionCoverKolDraftPanel } from "@/components/CaptionCoverKolDraftPanel";
import { ContentGuidelinesDisplayBlock, ContentGuidelinesTranslationNote } from "@/components/ContentGuidelinesDisplayBlock";
import { InfluencerAvatar } from "@/components/InfluencerAvatar";
import { ScriptKolDraftPanel } from "@/components/ScriptKolDraftPanel";
import { Button } from "@/components/ui/button";
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
  ArrowRight,
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

type ScriptIdea = {
  title: string;
  summary: string;
  hook: string;
  coreFlow: string;
  executionNotes: string;
  cta: string;
};

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

function scriptIdeaToReferenceScript(idea: ScriptIdea): ScriptBriefPublished["referenceScripts"][number] {
  const body = `Hook: ${idea.hook}\n\nCore flow: ${idea.coreFlow}\n\nExecution notes: ${idea.executionNotes}\n\nCTA: ${idea.cta}`;
  return {
    title: idea.title,
    original: body,
    translation: body,
  };
}

const cardActionClass =
  "inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 transition-colors hover:text-gray-800";

function ReferenceScriptIdeaCard({
  idea,
  onEdit,
  onRemove,
}: {
  idea: ScriptIdea;
  onEdit: (patch: Pick<ScriptIdea, "hook" | "coreFlow" | "executionNotes" | "cta">) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draftBody, setDraftBody] = useState(() => formatIdeaBody(idea));

  return (
    <div className="group/card relative rounded-xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <span className="inline-flex rounded-md bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
        {idea.title}
      </span>
      {idea.summary ? (
        <p className="mt-2 text-xs leading-relaxed text-gray-500">{idea.summary}</p>
      ) : null}

      {editing ? (
        <Textarea
          value={draftBody}
          onChange={(e) => setDraftBody(e.target.value)}
          className="mt-4 min-h-[160px] resize-none border-brand/50 text-[13px] leading-relaxed ring-1 ring-brand/15 focus-visible:border-brand focus-visible:ring-brand/25"
        />
      ) : (
        <div className="mt-4 space-y-2.5 text-[13px] font-normal leading-relaxed text-gray-600">
          <p>
            <span className="font-semibold text-gray-800">Hook:</span> {idea.hook}
          </p>
          <p>
            <span className="font-semibold text-gray-800">Core flow:</span> {idea.coreFlow}
          </p>
          <p>
            <span className="font-semibold text-gray-800">Execution notes:</span> {idea.executionNotes}
          </p>
          <p>
            <span className="font-semibold text-gray-800">CTA:</span> {idea.cta}
          </p>
        </div>
      )}

      <div
        className={cn(
          "mt-4 flex justify-end gap-4 transition-opacity",
          editing ? "opacity-100" : "opacity-0 group-hover/card:opacity-100"
        )}
      >
        {editing ? (
          <>
            <button
              type="button"
              onClick={() => {
                onEdit(parseIdeaBody(draftBody, idea));
                setEditing(false);
              }}
              className={cn(cardActionClass, "text-brand hover:text-brand/80")}
            >
              <Check size={13} strokeWidth={2} />
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setDraftBody(formatIdeaBody(idea));
                setEditing(false);
              }}
              className={cardActionClass}
            >
              <X size={13} strokeWidth={2} />
              Cancel
            </button>
          </>
        ) : (
          <>
            <button type="button" className={cn(cardActionClass, "hover:text-brand")}>
              <Languages size={13} className="text-brand" strokeWidth={2} />
              Translator
            </button>
            <button
              type="button"
              onClick={() => {
                setDraftBody(formatIdeaBody(idea));
                setEditing(true);
              }}
              className={cardActionClass}
            >
              <Pencil size={13} strokeWidth={2} />
              Edit
            </button>
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
}: {
  customPrompt: string;
  onCustomPromptChange: (value: string) => void;
  onGenerate: (prompt?: string) => void;
  disabled: boolean;
}) {
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
      <div className="relative">
        <Input
          value={customPrompt}
          onChange={(e) => onCustomPromptChange(e.target.value)}
          placeholder="Add your own style or generation instruction."
          className={formInputClass(
            "h-9 pr-10 text-[13px] leading-normal font-normal text-gray-600 placeholder:text-[13px] placeholder:font-normal placeholder:text-gray-400"
          )}
          disabled={disabled}
          onKeyDown={(e) => {
            if (e.key === "Enter") onGenerate();
          }}
        />
        <button
          type="button"
          onClick={() => onGenerate()}
          disabled={disabled}
          className="absolute top-1/2 right-2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-brand-50 text-brand transition-colors hover:bg-brand hover:text-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-brand-50 disabled:hover:text-brand"
          aria-label="Generate with custom prompt"
        >
          <ArrowRight size={14} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

function ReferenceScriptsGeneratePanel({
  kolName,
  onIdeasGenerated,
}: {
  kolName: string;
  onIdeasGenerated?: (ideas: ScriptBriefPublished["referenceScripts"]) => void;
}) {
  const [customPrompt, setCustomPrompt] = useState("");
  const [phase, setPhase] = useState<GenerateIdeasPhase>("idle");
  const [ideas, setIdeas] = useState<ScriptIdea[]>([]);
  const [generationRuns, setGenerationRuns] = useState(0);
  const generationLimitReached = generationRuns >= 3;

  const syncIdeas = (nextIdeas: ScriptIdea[]) => {
    setIdeas(nextIdeas);
    onIdeasGenerated?.(nextIdeas.map(scriptIdeaToReferenceScript));
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

  const updateIdea = (
    index: number,
    patch: Pick<ScriptIdea, "hook" | "coreFlow" | "executionNotes" | "cta">
  ) => {
    syncIdeas(ideas.map((idea, ideaIndex) => (ideaIndex === index ? { ...idea, ...patch } : idea)));
  };

  const removeIdea = (index: number) => {
    const next = ideas.filter((_, ideaIndex) => ideaIndex !== index);
    syncIdeas(next);
    if (next.length === 0) setPhase("idle");
  };

  const showInitialPrompt = phase === "idle";
  const showContinueControls = phase !== "loading";

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
      <div className="flex flex-col gap-4">
        {showInitialPrompt ? (
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
                onEdit={(patch) => updateIdea(index, patch)}
                onRemove={() => removeIdea(index)}
              />
            ))}
          </div>
        ) : null}

        {showContinueControls ? (
          <ReferenceScriptsContinueControls
            customPrompt={customPrompt}
            onCustomPromptChange={setCustomPrompt}
            onGenerate={handleGenerate}
            disabled={generationLimitReached}
          />
        ) : null}

        {showContinueControls ? (
          <div className="text-[13px] leading-relaxed text-gray-500">
            <p>
              Selected:{" "}
              <span className="font-semibold tabular-nums text-gray-600">0/3</span>
            </p>
            <p className="mt-0.5">
              Generation limit (
              <span className="font-semibold tabular-nums text-gray-600">
                {generationRuns}/3
              </span>
              ) reached.
            </p>
          </div>
        ) : null}
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
      <div className={cn("flex gap-3", hasBottomSpacing && "mb-3")}>
        <Icon size={16} className="mt-0.5 shrink-0 text-brand self-start" strokeWidth={2} />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h3 className={briefSectionTitleClass}>{title}</h3>
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
    );
  }

  return (
    <div className={cn("flex items-center gap-3", hasBottomSpacing && "mb-3")}>
      <Icon size={16} className="shrink-0 text-brand" strokeWidth={2} />
      <h3 className={briefSectionTitleClass}>{title}</h3>
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
        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
          <Sparkles size={13} className="text-amber-600" strokeWidth={2} />
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

function SubmissionDeadlineFields({
  deadline,
  onChange,
}: {
  deadline: SubmissionDeadline;
  onChange: (patch: Partial<SubmissionDeadline>) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="min-w-0">
        <input
          type="date"
          value={deadline.date}
          onChange={(e) => onChange({ date: e.target.value })}
          aria-label="Submission deadline date"
          className={cn(
            "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-[0_1px_2px_rgba(0,0,0,0.03)] outline-none transition-colors focus:border-brand/40 focus:ring-2 focus:ring-brand/10",
            !deadline.date && "text-gray-400"
          )}
        />
      </div>

      <div className="min-w-0">
        <input
          type="time"
          value={deadline.time}
          onChange={(e) => onChange({ time: e.target.value })}
          aria-label="Submission deadline time"
          className={cn(
            "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-[0_1px_2px_rgba(0,0,0,0.03)] outline-none transition-colors focus:border-brand/40 focus:ring-2 focus:ring-brand/10",
            !deadline.time && "text-gray-400"
          )}
        />
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
}) {
  const [referenceExpanded, setReferenceExpanded] = useState(true);
  const [guidelinesExpanded, setGuidelinesExpanded] = useState(true);

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      {showSubmissionDeadline ? (
        <section>
          <BriefSettingsSectionHeader
            icon={Calendar}
            title="Submission Deadline"
            withBottomSpacing
          />
          <SubmissionDeadlineFields deadline={deadline} onChange={onDeadlineChange} />
        </section>
      ) : null}

      <section>
        <ContentGuidelinesSectionHeader
          expanded={guidelinesExpanded}
          referenceWebsiteUrl={referenceWebsiteUrl}
          onToggle={() => setGuidelinesExpanded((prev) => !prev)}
          showTranslationNote={guidelinesExpanded}
        />
        {guidelinesExpanded ? (
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
  onOpenChange,
}: {
  kolId: string;
  kolName: string;
  platform: string;
  track: ContentReviewTrack;
  onOpenChange: (open: boolean) => void;
}) {
  const draftKolId = getContentReviewDraftKolId(kolId, track);
  const showReferenceScripts = track === "script";
  const showSubmissionDeadline = track !== "caption";
  const initialBrief = loadContentScriptBriefState(kolId);
  const [tab, setTab] = useState<SheetTab>("comments");
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
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
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
            />
          )}
        </div>

        <div className="shrink-0 border-t border-gray-100 bg-white px-5 py-4">
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="text-[13px] font-medium text-gray-500 transition-colors hover:text-gray-800"
            >
              Cancel
            </button>
            {tab === "brief" ? (
              <Button type="button" variant="brand" className="h-9 px-4 text-[13px]" onClick={handleSave}>
                Save & Update
              </Button>
            ) : null}
          </div>
        </div>
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
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kolId: string;
  kolName: string;
  platform: string;
  track?: ContentReviewTrack;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex h-full min-h-0 flex-col gap-0 border-l border-gray-100 bg-white p-0 data-[side=right]:w-full data-[side=right]:max-w-[720px] data-[side=right]:sm:max-w-[720px]"
      >
        {open ? (
          <ContentScriptReviewSheetInner
            kolId={kolId}
            kolName={kolName}
            platform={platform}
            track={track}
            onOpenChange={onOpenChange}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
