"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { InfluencerAvatar } from "@/components/InfluencerAvatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Copy,
  ExternalLink,
  Eye,
  FileText,
  Link as LinkIcon,
  Lightbulb,
  Lock,
  MessageSquare,
  Share2,
  TrendingUp,
  Trash2,
  Upload,
} from "@/lib/icons";
import {
  addCaptionCoverSubmission,
  formatCaptionCoverFileSize,
  getCaptionCoverSubmissionLimit,
  getCaptionCoverSubmissions,
  subscribeCaptionCoverChanges,
  type CaptionCoverFile,
  type CaptionCoverSubmission,
} from "@/lib/captionCoverSubmissions";
import { getStageBadgeClass, STAGE_STATUS_PILL_CLASS } from "@/lib/pipeline/stageStatuses";
import { getScriptBriefH5Data, getScriptBriefH5Defaults } from "@/lib/scriptBriefH5Mock";
import { hasScriptBriefDeadline, type ScriptBriefDeadline } from "@/lib/scriptBriefDeadline";
import { subscribeScriptBriefPublishedChanges } from "@/lib/scriptBriefPublished";
import { cn } from "@/lib/utils";
import { H5ScriptSubmissionCard, ScriptAiAutoCheckAlert } from "@/components/ScriptKolDraftPanel";
import {
  addScriptDraftSubmission,
  getScriptDraftSubmissionLimit,
  getScriptDraftSubmissions,
  subscribeScriptDraftChanges,
  type ScriptDraftSubmission,
} from "@/lib/scriptDraftSubmissions";

function ScriptBriefAttachmentPill({
  name,
  locked = false,
}: {
  name: string;
  locked?: boolean;
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
          title="Synced from campaign settings"
          aria-label={`${name} is synced from campaign settings`}
        >
          <Lock size={14} strokeWidth={1.75} />
        </span>
      ) : null}
    </div>
  );
}

function CopyableBlock({ text }: { text: string }) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative rounded-xl border border-gray-100 bg-white p-3.5">
      <button
        type="button"
        onClick={handleCopy}
        className="absolute top-3 right-3 inline-flex size-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-50 hover:text-brand"
        aria-label="Copy script"
      >
        <Copy size={14} strokeWidth={2} />
      </button>
      <p className="pr-8 whitespace-pre-wrap text-[13px] leading-relaxed text-gray-700">{text}</p>
    </div>
  );
}

const SCRIPT_VIEW_TAB_CLASS =
  "inline-flex h-10 shrink-0 items-center border-b-2 px-2.5 text-[13px] font-medium leading-none transition-colors";

function scriptViewTabClass(active: boolean) {
  return cn(
    SCRIPT_VIEW_TAB_CLASS,
    active
      ? "border-brand text-gray-900"
      : "border-transparent text-gray-500 hover:text-gray-800"
  );
}

function BilingualTabPanel({
  original,
  translation,
  view,
  onViewChange,
  emptyLabel = "No content available.",
}: {
  original: string;
  translation: string;
  view: "original" | "translation";
  onViewChange: (view: "original" | "translation") => void;
  emptyLabel?: string;
}) {
  const activeText = (view === "original" ? original : translation).trim() || emptyLabel;

  return (
    <>
      <div className="flex w-full min-w-0 items-center gap-0.5 overflow-x-auto border-b border-gray-100">
        <button
          type="button"
          onClick={() => onViewChange("original")}
          className={scriptViewTabClass(view === "original")}
        >
          Original
        </button>
        <button
          type="button"
          onClick={() => onViewChange("translation")}
          className={scriptViewTabClass(view === "translation")}
        >
          Translation
        </button>
      </div>
      <CopyableBlock text={activeText} />
    </>
  );
}

function ReferenceScriptCard({
  title,
  original,
  translation,
  view,
  onViewChange,
}: {
  title: string;
  original: string;
  translation: string;
  view: "original" | "translation";
  onViewChange: (view: "original" | "translation") => void;
}) {
  return (
    <div className="space-y-3">
      <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
        {title}
      </span>
      <BilingualTabPanel
        original={original}
        translation={translation}
        view={view}
        onViewChange={onViewChange}
        emptyLabel="No script content available."
      />
    </div>
  );
}

function H5CampaignBriefSection({
  data,
  intro,
}: {
  data: ReturnType<typeof getScriptBriefH5Defaults>;
  intro?: string;
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <p className="text-[11px] font-semibold tracking-wide text-gray-400 uppercase">
        {data.campaignSubtitle}
      </p>
      <h1 className="mt-1 text-[22px] leading-tight font-bold text-gray-900">{data.campaignTitle}</h1>
      <p className="mt-2 text-[13px] leading-relaxed text-gray-500">{intro ?? data.intro}</p>

      <div className="mt-4 flex items-center gap-3 rounded-2xl bg-gray-50 px-3 py-2.5">
        <InfluencerAvatar
          src={data.influencer.avatar}
          alt={data.influencer.name}
          platform="Instagram"
          size="md"
          fallback={data.influencer.name.slice(0, 2)}
          fallbackClassName="bg-violet-100 text-violet-700"
        />
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-gray-900">{data.influencer.handle}</p>
          <p className="truncate text-[11px] text-gray-500">{data.influencer.platform}</p>
        </div>
      </div>
    </section>
  );
}

function ContentGuidelinesSection({
  data,
  guidelinesView,
  onGuidelinesViewChange,
}: {
  data: ReturnType<typeof getScriptBriefH5Defaults>;
  guidelinesView: "original" | "translation";
  onGuidelinesViewChange: (view: "original" | "translation") => void;
}) {
  return (
    <>
      <SectionHeading
        icon={FileText}
        title="Content Guidelines"
        trailing={
          <a
            href={data.referenceWebsiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-medium text-brand transition-colors hover:text-brand/80"
          >
            <LinkIcon size={14} strokeWidth={2} />
            Reference Website
            <ExternalLink size={12} strokeWidth={2} />
          </a>
        }
      />
      <div className="space-y-3">
        <BilingualTabPanel
          original={data.guidelines.original}
          translation={data.guidelines.translation}
          view={guidelinesView}
          onViewChange={onGuidelinesViewChange}
          emptyLabel="No content guidelines yet."
        />
      </div>
      {data.attachments.length > 0 ? (
        <div className="mt-3 flex w-full flex-wrap gap-2">
          {data.attachments.map((attachment) => (
            <ScriptBriefAttachmentPill
              key={attachment.name}
              name={attachment.name}
              locked={attachment.locked}
            />
          ))}
        </div>
      ) : null}
    </>
  );
}

function SectionHeading({
  icon: Icon,
  title,
  trailing,
  className,
}: {
  icon: typeof FileText;
  title: string;
  trailing?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-3 flex items-center justify-between gap-3", className)}>
      <div className="flex min-w-0 items-center gap-2">
        <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand">
          <Icon size={15} strokeWidth={2} />
        </span>
        <h2 className="text-[15px] font-semibold text-gray-900">{title}</h2>
      </div>
      {trailing}
    </div>
  );
}

export default function ScriptBriefH5View({
  kolId,
  view = "overview",
}: {
  kolId: string;
  view?: "overview" | "script" | "guidelines" | "video" | "caption" | "posting";
}) {
  return <ScriptBriefH5ViewInner kolId={kolId} view={view} />;
}

function H5PageShell({
  backHref,
  pageTitle,
  children,
}: {
  backHref?: string;
  pageTitle?: string;
  children: ReactNode;
}) {
  const brand = (
    <>
      <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-white">
        <TrendingUp size={16} strokeWidth={2.2} />
      </span>
      <span className="truncate text-[17px] font-bold tracking-tight text-brand">KOLPlanet</span>
    </>
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#f4f6f9]">
      <header className="shrink-0 border-b border-gray-100 bg-white px-4 py-3">
        {backHref && pageTitle ? (
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
            <Link
              href={backHref}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition-colors hover:border-gray-300 hover:text-gray-900"
              aria-label="Back to Hub"
            >
              <ChevronLeft size={16} strokeWidth={2} />
            </Link>
            <h1 className="min-w-0 truncate text-center text-[17px] font-bold leading-snug text-gray-950">
              {pageTitle}
            </h1>
            <span className="inline-flex size-9 shrink-0 opacity-0" aria-hidden />
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              {backHref ? (
                <Link href={backHref} className="flex min-w-0 items-center gap-2">
                  {brand}
                </Link>
              ) : (
                <div className="flex min-w-0 items-center gap-2">{brand}</div>
              )}
            </div>
            <button
              type="button"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-800"
              aria-label="Share"
            >
              <Share2 size={16} strokeWidth={2} />
            </button>
          </div>
        )}
      </header>

      <main className="no-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-5 pb-8">
        {children}
      </main>
    </div>
  );
}

function H5OverviewDeadline({
  deadline,
  locked = false,
}: {
  deadline: ScriptBriefDeadline;
  locked?: boolean;
}) {
  if (!hasScriptBriefDeadline(deadline)) return null;

  const dateTime = [deadline.date, deadline.time].filter(Boolean).join(" ");

  return (
    <p
      className={cn(
        "mt-2 flex flex-wrap items-center gap-1.5 text-[11px] font-medium",
        locked ? "text-gray-400" : "text-gray-500"
      )}
    >
      <span>Deadline: {dateTime}</span>
      {deadline.timezone ? (
        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium leading-none text-gray-400">
          {deadline.timezone}
        </span>
      ) : null}
    </p>
  );
}

function H5OverviewCard({
  title,
  description,
  active = false,
  completed = false,
  locked = false,
  step,
  href,
  deadline,
}: {
  title: string;
  description: string;
  active?: boolean;
  completed?: boolean;
  locked?: boolean;
  step: number;
  href?: string;
  deadline?: ScriptBriefDeadline | null;
}) {
  const statusNode = completed ? (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
      <CheckCircle2 size={18} strokeWidth={2.5} />
    </span>
  ) : active ? (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
      {step}
    </span>
  ) : (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white text-sm font-semibold text-gray-300">
      {step}
    </span>
  );

  const isInteractive = Boolean(href);

  const card = (
    <div
      className={cn(
        "rounded-2xl border px-4 py-4 text-left shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-colors",
        completed
          ? "border-emerald-200/70 bg-emerald-50/25 text-gray-900"
          : active
            ? "border-brand/30 bg-brand-50/30 text-gray-900"
            : locked
              ? "border-gray-200 bg-white text-gray-500"
              : "border-gray-200 bg-white text-gray-700",
        isInteractive && "cursor-pointer",
        isInteractive &&
          completed &&
          "hover:border-emerald-200 hover:bg-emerald-50/35 active:bg-emerald-50/45",
        isInteractive &&
          active &&
          "hover:border-brand/35 hover:bg-brand-50/40 active:bg-brand-50/50",
        isInteractive &&
          !completed &&
          !active &&
          "hover:border-brand/35 hover:bg-brand-50/25 active:bg-brand-50/35"
      )}
    >
      <div className="flex w-full items-start gap-3">
        {statusNode}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="min-w-0 text-[14px] font-semibold leading-snug text-gray-950">
              Step {step}: {title}
            </p>
            {isInteractive ? (
              <ChevronRight size={16} strokeWidth={2} className="mt-0.5 shrink-0 text-gray-400" />
            ) : null}
          </div>
          <p className="mt-1 text-[12px] leading-relaxed text-gray-400">{description}</p>
          {deadline ? <H5OverviewDeadline deadline={deadline} locked={locked} /> : null}
        </div>
      </div>
    </div>
  );

  if (!isInteractive) return card;

  return (
    <a href={href} className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30">
      {card}
    </a>
  );
}

function ScriptBriefH5Overview({
  kolId,
  completed,
}: {
  kolId: string;
  completed: boolean;
}) {
  const data = getScriptBriefH5Defaults(kolId);
  const baseHref = `/h5/kol-info/${encodeURIComponent(kolId)}`;
  const guidelinesHref = `${baseHref}?view=guidelines`;
  const scriptHref = `${baseHref}?view=script`;
  const videoHref = `${baseHref}?view=video`;
  const captionHref = `${baseHref}?view=caption`;
  const postingHref = `${baseHref}?view=posting`;

  return (
    <H5PageShell>
          <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <div className="flex flex-col gap-2">
              <span className="inline-flex w-fit rounded-full bg-brand-50 px-3 py-1 text-[12px] font-semibold text-brand">
                H5 Hub
              </span>
              <h1 className="text-[23px] font-bold leading-tight text-gray-950">
                Budweiser 2024 Sales Drive
              </h1>
            </div>

            <p className="mt-2 text-[14px] leading-relaxed text-gray-500">
              Open each H5 step to review, submit, and continue the workflow.
            </p>

            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-gray-50 px-3 py-2.5">
              <InfluencerAvatar
                src={data.influencer.avatar}
                alt={data.influencer.name}
                platform="Instagram"
                size="md"
                fallback={data.influencer.name.slice(0, 2)}
                fallbackClassName="bg-violet-100 text-violet-700"
              />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-gray-900">
                  {data.influencer.handle}
                </p>
                <p className="truncate text-[11px] text-gray-500">{data.influencer.platform}</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <SectionHeading
            icon={FileText}
            title="Content Guidelines"
            trailing={
              <a
                href={guidelinesHref}
                className="inline-flex shrink-0 items-center gap-0.5 text-[13px] font-medium text-brand transition-colors hover:text-brand/80"
              >
                View
                <ChevronRight size={14} strokeWidth={2} />
              </a>
            }
          />

          <p className="text-[13px] leading-relaxed text-gray-500">
            Review campaign guidelines, attachments, and reference materials.
          </p>

          <div className="mt-5 space-y-4">
            <H5OverviewCard
              title="Script"
              description="Review the brief, submit script drafts, and leave feedback."
              active={!completed}
              href={scriptHref}
              completed={completed}
              step={1}
              deadline={data.deadline}
            />
            <H5OverviewCard
              title="Video Draft"
              description="Review the draft script and progress the workflow."
              active={completed}
              locked={!completed}
              href={videoHref}
              step={2}
              deadline={data.deadline}
            />
            <H5OverviewCard
              title="Caption & Cover"
              description="Review caption and cover submissions."
              locked
              href={captionHref}
              step={3}
            />
            <H5OverviewCard
              title="Posting"
              description="Open the final publishing step."
              locked
              href={postingHref}
              step={4}
              deadline={data.deadline}
            />
          </div>
          </section>
    </H5PageShell>
  );
}

function ScriptBriefH5Guidelines({ kolId }: { kolId: string }) {
  const [data, setData] = useState(() => getScriptBriefH5Defaults(kolId));
  const [guidelinesView, setGuidelinesView] = useState<"original" | "translation">("original");
  const overviewHref = `/h5/kol-info/${encodeURIComponent(kolId)}`;

  useEffect(() => {
    const sync = () => setData(getScriptBriefH5Data(kolId));
    sync();
    return subscribeScriptBriefPublishedChanges(sync);
  }, [kolId]);

  return (
    <H5PageShell backHref={overviewHref} pageTitle="Content Guidelines">
      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <ContentGuidelinesSection
          data={data}
          guidelinesView={guidelinesView}
          onGuidelinesViewChange={setGuidelinesView}
        />
      </section>
    </H5PageShell>
  );
}

function formatCaptionCoverStatus(status: CaptionCoverSubmission["status"]) {
  if (status === "Under Review") return "Under review";
  return status;
}

function H5CaptionCoverSubmissionCard({ submission }: { submission: CaptionCoverSubmission }) {
  return (
    <div className="mt-4 rounded-2xl border border-brand/20 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[15px] font-semibold text-gray-900">Version {submission.version}</p>
          <p className="mt-0.5 text-[12px] text-gray-500">{submission.submittedAt}</p>
        </div>
        <span
          className={cn(
            STAGE_STATUS_PILL_CLASS,
            submission.status === "Approved"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : getStageBadgeClass("sky")
          )}
        >
          {formatCaptionCoverStatus(submission.status)}
        </span>
      </div>

      <p className="mt-4 text-[11px] font-semibold tracking-wide text-gray-400 uppercase">Caption</p>
      <p className="mt-1 whitespace-pre-wrap text-[14px] leading-relaxed text-gray-900">
        {submission.caption}
      </p>

      <div className="mt-3">
        <ScriptAiAutoCheckAlert />
      </div>

      {submission.cover ? (
        <>
          <p className="mt-4 text-[11px] font-semibold tracking-wide text-gray-400 uppercase">Cover</p>
          <div className="mt-2 flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-2.5">
            <img
              src={submission.cover.previewUrl}
              alt={submission.cover.name}
              className="size-14 shrink-0 rounded-lg border border-gray-200 object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-gray-900">{submission.cover.name}</p>
              <p className="text-[11px] text-gray-500">{submission.cover.sizeLabel}</p>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function CoverImageUploadField({
  value,
  onChange,
  disabled = false,
}: {
  value: CaptionCoverFile | null;
  onChange: (value: CaptionCoverFile | null) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (files: FileList | null) => {
    const file = files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      onChange({
        name: file.name,
        previewUrl: reader.result,
        sizeLabel: formatCaptionCoverFileSize(file.size),
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <p className="text-[12px] font-medium text-gray-500">Cover Image</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="sr-only"
        disabled={disabled}
        onChange={(e) => {
          handleFileChange(e.target.files);
          e.target.value = "";
        }}
      />
      {value ? (
        <div className="flex items-start gap-3">
          <div className="group/cover relative aspect-[9/16] w-full max-w-[132px] shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
            <img
              src={value.previewUrl}
              alt={value.name}
              className="size-full object-cover"
            />
            {!disabled ? (
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 transition-colors group-hover/cover:bg-black/35">
                <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover/cover:opacity-100">
                  <button
                    type="button"
                    onClick={() => window.open(value.previewUrl, "_blank", "noopener,noreferrer")}
                    className="inline-flex size-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                    aria-label="Preview cover image"
                  >
                    <Eye size={16} strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange(null)}
                    className="inline-flex size-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                    aria-label="Remove cover image"
                  >
                    <Trash2 size={16} strokeWidth={2} />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
          <div className="min-w-0 pt-1">
            <p className="truncate text-[13px] font-medium text-gray-900">{value.name}</p>
            <p className="mt-0.5 text-[11px] text-gray-500">{value.sizeLabel}</p>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex aspect-[9/16] w-full max-w-[132px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 bg-gray-50/70 px-3 py-4 text-center transition-colors",
            !disabled && "hover:border-brand/35 hover:bg-brand-50/40"
          )}
        >
          <Upload size={18} strokeWidth={2} className="text-brand" />
          <span className="text-[12px] font-medium text-brand">+ Upload Cover</span>
          <span className="text-[10px] text-gray-400">9:16 PNG/JPG</span>
        </button>
      )}
    </div>
  );
}

const CAPTION_MAX_LENGTH = 2000;

function ScriptBriefH5CaptionCover({ kolId }: { kolId: string }) {
  const captionKolId = `${kolId}-caption`;
  const videoKolId = `${kolId}-video`;
  const [data, setData] = useState(() => getScriptBriefH5Defaults(kolId));
  const [caption, setCaption] = useState("");
  const [cover, setCover] = useState<CaptionCoverFile | null>(null);
  const [submissions, setSubmissions] = useState<CaptionCoverSubmission[]>([]);
  const [canInsertFromVersion1, setCanInsertFromVersion1] = useState(false);
  const submissionLimit = getCaptionCoverSubmissionLimit();
  const overviewHref = `/h5/kol-info/${encodeURIComponent(kolId)}`;

  useEffect(() => {
    const sync = () => setData(getScriptBriefH5Data(kolId));
    sync();
    return subscribeScriptBriefPublishedChanges(sync);
  }, [kolId]);

  useEffect(() => {
    const sync = () => {
      const captionSubmissions = getCaptionCoverSubmissions(captionKolId);
      const videoSubmissions = getScriptDraftSubmissions(videoKolId);
      setSubmissions(captionSubmissions);
      setCanInsertFromVersion1(
        Boolean(
          captionSubmissions.find((item) => item.version === 1) ||
            videoSubmissions.find((item) => item.version === 1)
        )
      );
    };
    sync();
    const unsubscribeCaption = subscribeCaptionCoverChanges(sync);
    const unsubscribeVideo = subscribeScriptDraftChanges(sync);
    return () => {
      unsubscribeCaption();
      unsubscribeVideo();
    };
  }, [captionKolId, videoKolId]);

  const handleSubmit = () => {
    if (!cover) return;
    const created = addCaptionCoverSubmission(captionKolId, caption, cover);
    if (!created) return;
    setCaption("");
    setCover(null);
  };

  const handleInsertFromVersion1 = () => {
    const captionVersion1 = getCaptionCoverSubmissions(captionKolId).find(
      (item) => item.version === 1
    );
    const videoVersion1 = getScriptDraftSubmissions(videoKolId).find((item) => item.version === 1);

    if (captionVersion1) {
      setCaption(captionVersion1.caption);
      setCover(captionVersion1.cover ?? null);
      return;
    }

    if (videoVersion1) {
      setCaption(videoVersion1.content);
    }
  };

  const submissionCount = submissions.length;
  const submissionLocked = submissions[submissions.length - 1]?.status === "Approved";

  return (
    <H5PageShell backHref={overviewHref} pageTitle="Caption & Cover">
      <H5CampaignBriefSection
        data={data}
        intro="Review the video draft and submit the caption and cover before the deadline."
      />

      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <SectionHeading icon={FileText} title="Caption & Cover Submission" />
        <div className="mb-4 space-y-2 text-[12px] leading-relaxed text-gray-500">
          <p>
            Please provide the final caption and cover image for publishing.
          </p>
          <p className="font-semibold text-gray-700">
            Note: The feedback section is for client use only.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[12px] font-medium text-gray-500">Caption</p>
            {canInsertFromVersion1 && !submissionLocked ? (
              <button
                type="button"
                onClick={handleInsertFromVersion1}
                className="inline-flex shrink-0 items-center gap-1 text-[12px] font-medium text-brand transition-colors hover:text-brand/80"
              >
                <Copy size={12} strokeWidth={2} />
                Copy from v1
              </button>
            ) : null}
          </div>
          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value.slice(0, CAPTION_MAX_LENGTH))}
            disabled={submissionLocked}
            placeholder="Enter your caption here, including @mentions and #hashtags..."
            className={cn(
              "min-h-[120px] resize-none border-gray-200 text-[13px] focus-visible:border-brand focus-visible:ring-1 focus-visible:ring-brand/15",
              submissionLocked ? "bg-gray-50 text-gray-400" : "bg-white"
            )}
          />
          <p className="text-right text-[11px] text-gray-400">
            {caption.length} / {CAPTION_MAX_LENGTH}
          </p>
        </div>

        <div className="mt-4">
          <CoverImageUploadField value={cover} onChange={setCover} disabled={submissionLocked} />
        </div>

        <p className="mt-3 text-right text-[11px] text-gray-400">
          Submissions: {submissionCount}/{submissionLimit}
        </p>
        <Button
          type="button"
          variant="brand"
          className="mt-3 h-11 w-full text-[14px]"
          disabled={
            submissionLocked ||
            !caption.trim() ||
            !cover ||
            submissionCount >= submissionLimit
          }
          onClick={handleSubmit}
        >
          Submit Caption & Cover
        </Button>

        {[...submissions].reverse().map((submission) => (
          <H5CaptionCoverSubmissionCard key={submission.version} submission={submission} />
        ))}
      </section>
    </H5PageShell>
  );
}

function ScriptBriefH5Posting({ kolId }: { kolId: string }) {
  const [data, setData] = useState(() => getScriptBriefH5Defaults(kolId));
  const overviewHref = `/h5/kol-info/${encodeURIComponent(kolId)}`;

  useEffect(() => {
    const sync = () => setData(getScriptBriefH5Data(kolId));
    sync();
    return subscribeScriptBriefPublishedChanges(sync);
  }, [kolId]);

  return (
    <H5PageShell backHref={overviewHref} pageTitle="Posting">
      <H5CampaignBriefSection
        data={data}
        intro="Final posting workflow for the selected creator."
      />

      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <div className="inline-flex items-center gap-1.5 text-[13px] font-medium text-brand">
          <span>Posting</span>
          <ExternalLink size={14} strokeWidth={2} />
        </div>

        <div className="mt-3 rounded-xl border border-brand/10 bg-brand-50/40 px-3.5 py-3 text-[13px] leading-relaxed text-gray-600">
          Posting content is not configured yet. This page is ready for the final posting workflow.
        </div>
      </section>
    </H5PageShell>
  );
}

function ScriptBriefH5VideoDraft({ kolId }: { kolId: string }) {
  const videoKolId = `${kolId}-video`;
  const [data, setData] = useState(() => getScriptBriefH5Defaults(kolId));
  const [draft, setDraft] = useState("");
  const [submissions, setSubmissions] = useState<ScriptDraftSubmission[]>([]);
  const submissionLimit = getScriptDraftSubmissionLimit();
  const overviewHref = `/h5/kol-info/${encodeURIComponent(kolId)}`;

  useEffect(() => {
    const sync = () => setData(getScriptBriefH5Data(kolId));
    sync();
    return subscribeScriptBriefPublishedChanges(sync);
  }, [kolId]);

  useEffect(() => {
    const sync = () => setSubmissions(getScriptDraftSubmissions(videoKolId));
    sync();
    return subscribeScriptDraftChanges(sync);
  }, [videoKolId]);

  const handleSubmit = () => {
    const created = addScriptDraftSubmission(videoKolId, draft);
    if (!created) return;
    setDraft("");
  };

  const submissionCount = submissions.length;
  const submissionLocked = submissions[submissions.length - 1]?.status === "Approved";
  const discussionLocked = submissionLocked;

  return (
    <H5PageShell backHref={overviewHref} pageTitle="Visual Draft">
      <H5CampaignBriefSection
        data={data}
        intro="Review the approved script, shoot your video, and submit the draft before the deadline."
      />

      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <SectionHeading icon={MessageSquare} title="Draft Submission & Feedback" />
        <div className="mb-4 space-y-2 text-[12px] leading-relaxed text-gray-500">
          <p>
            Upload your video to a cloud drive (e.g., Google Drive) and paste the link below. Ensure
            access is set to{" "}
            <span className="font-semibold text-gray-700">'Anyone with the link'</span>.
          </p>
          <p className="font-semibold text-gray-700">
            Note: The feedback section is for client use only.
          </p>
        </div>
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={submissionLocked}
          placeholder={
            submissionLocked
              ? "This script has been approved. Submission is locked."
              : "Paste your video draft link here..."
          }
          className={cn(
            "min-h-[120px] resize-none border-gray-200 text-[13px] focus-visible:border-brand focus-visible:ring-1 focus-visible:ring-brand/15",
            submissionLocked ? "bg-gray-50 text-gray-400" : "bg-white"
          )}
        />
        <p className="mt-2 text-right text-[11px] text-gray-400">
          Submissions: {submissionCount}/{submissionLimit}
        </p>
        <Button
          type="button"
          variant="brand"
          className="mt-3 h-11 w-full text-[14px]"
          disabled={submissionLocked || !draft.trim() || submissionCount >= submissionLimit}
          onClick={handleSubmit}
        >
          Submit Draft
        </Button>

        {[...submissions].reverse().map((submission) => (
          <H5ScriptSubmissionCard
            key={submission.version}
            kolId={videoKolId}
            kolName={data.influencer.name}
            submission={submission}
            discussionLocked={discussionLocked}
          />
        ))}
      </section>
    </H5PageShell>
  );
}

function ScriptBriefH5ViewInner({
  kolId,
  view,
}: {
  kolId: string;
  view: "overview" | "script" | "guidelines" | "video" | "caption" | "posting";
}) {
  const [data, setData] = useState(() => getScriptBriefH5Defaults(kolId));
  const [draft, setDraft] = useState("");
  const [submissions, setSubmissions] = useState<ScriptDraftSubmission[]>([]);
  const [referenceScriptViews, setReferenceScriptViews] = useState<
    Record<number, "original" | "translation">
  >({});
  const [referenceScriptsExpanded, setReferenceScriptsExpanded] = useState(true);
  const submissionLimit = getScriptDraftSubmissionLimit();

  useEffect(() => {
    const sync = () => setData(getScriptBriefH5Data(kolId));
    sync();
    return subscribeScriptBriefPublishedChanges(sync);
  }, [kolId]);

  useEffect(() => {
    const sync = () => setSubmissions(getScriptDraftSubmissions(kolId));
    sync();
    return subscribeScriptDraftChanges(sync);
  }, [kolId]);

  const handleSubmit = () => {
    const created = addScriptDraftSubmission(kolId, draft);
    if (!created) return;
    setDraft("");
  };

  const submissionCount = submissions.length;
  const discussionLocked = submissions[submissions.length - 1]?.status === "Approved";
  const scriptCompleted = submissions.some((submission) => submission.status === "Approved");

  if (view === "overview") {
    return <ScriptBriefH5Overview kolId={kolId} completed={scriptCompleted} />;
  }

  if (view === "guidelines") {
    return <ScriptBriefH5Guidelines kolId={kolId} />;
  }

  if (view === "video") {
    return <ScriptBriefH5VideoDraft kolId={kolId} />;
  }

  if (view === "caption") {
    return <ScriptBriefH5CaptionCover kolId={kolId} />;
  }

  if (view === "posting") {
    return <ScriptBriefH5Posting kolId={kolId} />;
  }

  const overviewHref = `/h5/kol-info/${encodeURIComponent(kolId)}`;

  return (
    <H5PageShell backHref={overviewHref} pageTitle="Script">
        <H5CampaignBriefSection data={data} />

        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <SectionHeading
            icon={Lightbulb}
            title="Reference Scripts"
            className={referenceScriptsExpanded ? undefined : "mb-0"}
            trailing={
              <button
                type="button"
                onClick={() => setReferenceScriptsExpanded((expanded) => !expanded)}
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-800"
                aria-expanded={referenceScriptsExpanded}
                aria-label={
                  referenceScriptsExpanded
                    ? "Collapse reference scripts"
                    : "Expand reference scripts"
                }
              >
                <ChevronUp
                  size={16}
                  strokeWidth={2}
                  className={cn(
                    "transition-transform duration-200",
                    !referenceScriptsExpanded && "rotate-180"
                  )}
                />
              </button>
            }
          />
          {referenceScriptsExpanded ? (
            <>
              <p className="mb-4 text-[12px] leading-relaxed text-gray-500">
                These scripts are AI-generated. Use them as inspiration and adapt them into your own
                original content while meeting campaign requirements and your personal style.
              </p>

              {data.referenceScripts.length > 0 ? (
                <div className="space-y-4">
                  {data.referenceScripts.map((script, index) => (
                    <ReferenceScriptCard
                      key={`${script.title}-${index}`}
                      title={script.title}
                      original={script.original}
                      translation={script.translation}
                      view={referenceScriptViews[index] ?? "original"}
                      onViewChange={(view) =>
                        setReferenceScriptViews((prev) => ({ ...prev, [index]: view }))
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/70 px-4 py-8 text-center text-xs text-gray-400">
                  Reference scripts will appear here once published.
                </div>
              )}
            </>
          ) : null}
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <SectionHeading icon={MessageSquare} title="Script Submission & Feedback" />
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write your script, or share a document link here..."
            className="min-h-[120px] resize-none border-gray-200 bg-white text-[13px] focus-visible:border-brand focus-visible:ring-1 focus-visible:ring-brand/15"
          />
          <p className="mt-2 text-right text-[11px] text-gray-400">
            Submissions: {submissionCount}/{submissionLimit}
          </p>
          <Button
            type="button"
            variant="brand"
            className="mt-3 h-11 w-full text-[14px]"
            disabled={!draft.trim() || submissionCount >= submissionLimit}
            onClick={handleSubmit}
          >
            Submit Script
          </Button>

          {[...submissions].reverse().map((submission) => (
            <H5ScriptSubmissionCard
              key={submission.version}
              kolId={kolId}
              kolName={data.influencer.name}
              submission={submission}
              discussionLocked={discussionLocked}
            />
          ))}
        </section>
    </H5PageShell>
  );
}

export function ScriptBriefH5DetailView({ kolId }: { kolId: string }) {
  return <ScriptBriefH5ViewInner kolId={kolId} view="script" />;
}
