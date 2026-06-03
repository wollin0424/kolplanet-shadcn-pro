"use client";

import { useEffect, useState } from "react";
import { InfluencerAvatar } from "@/components/InfluencerAvatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Copy,
  ExternalLink,
  FileText,
  Link as LinkIcon,
  Lightbulb,
  Lock,
  MessageSquare,
  ScrollText,
  Share2,
  TrendingUp,
} from "@/lib/icons";
import { getScriptBriefH5Data, getScriptBriefH5Defaults } from "@/lib/scriptBriefH5Mock";
import { subscribeScriptBriefPublishedChanges } from "@/lib/scriptBriefPublished";
import { cn } from "@/lib/utils";
import { H5ScriptSubmissionCard } from "@/components/ScriptKolDraftPanel";
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

function ReferenceScriptCard({
  title,
  original,
  translation,
}: {
  title: string;
  original: string;
  translation: string;
}) {
  const [view, setView] = useState<"original" | "translation">("original");
  const activeText = view === "original" ? original : translation;

  return (
    <div className="space-y-3">
      <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
        {title}
      </span>
      <div className="flex w-full min-w-0 items-center gap-0.5 overflow-x-auto border-b border-gray-100">
        <button
          type="button"
          onClick={() => setView("original")}
          className={scriptViewTabClass(view === "original")}
        >
          Original
        </button>
        <button
          type="button"
          onClick={() => setView("translation")}
          className={scriptViewTabClass(view === "translation")}
        >
          Translation
        </button>
      </div>
      <CopyableBlock text={activeText} />
    </div>
  );
}

function SectionHeading({
  icon: Icon,
  title,
}: {
  icon: typeof FileText;
  title: string;
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="inline-flex size-7 items-center justify-center rounded-lg bg-brand-50 text-brand">
        <Icon size={15} strokeWidth={2} />
      </span>
      <h2 className="text-[15px] font-semibold text-gray-900">{title}</h2>
    </div>
  );
}

export default function ScriptBriefH5View({ kolId }: { kolId: string }) {
  const [data, setData] = useState(() => getScriptBriefH5Defaults(kolId));
  const [draft, setDraft] = useState("");
  const [submissions, setSubmissions] = useState<ScriptDraftSubmission[]>([]);
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

  return (
    <div className="flex min-h-full flex-col bg-[#f4f6f9]">
      <header className="sticky top-0 z-20 border-b border-gray-100 bg-white px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex size-8 items-center justify-center rounded-full bg-brand text-white">
              <TrendingUp size={16} strokeWidth={2.2} />
            </span>
            <span className="text-[17px] font-bold tracking-tight text-brand">KOLPlanet</span>
          </div>
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-800"
            aria-label="Share"
          >
            <Share2 size={16} strokeWidth={2} />
          </button>
        </div>
      </header>

      <main className="flex-1 space-y-5 px-4 py-5 pb-8">
        <section>
          <p className="text-[11px] font-semibold tracking-wide text-gray-400 uppercase">
            {data.campaignSubtitle}
          </p>
          <h1 className="mt-1 text-[22px] leading-tight font-bold text-gray-900">
            {data.campaignTitle}
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-gray-500">{data.intro}</p>
        </section>

        <section className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-3 py-2.5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
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
        </section>

        <a
          href={data.referenceWebsiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-brand transition-colors hover:text-brand/80"
        >
          <LinkIcon size={14} strokeWidth={2} />
          Reference Website
          <ExternalLink size={12} strokeWidth={2} />
        </a>

        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <SectionHeading icon={FileText} title="Content Guidelines" />
          <div className="rounded-xl border border-gray-100 bg-gray-50/70 px-3.5 py-3">
            <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-gray-700">
              {data.guidelines || "No content guidelines yet."}
            </p>
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
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <SectionHeading icon={ScrollText} title="Reference Scripts" />
          <p className="mb-4 flex items-start gap-2 text-[12px] leading-relaxed text-gray-500">
            <Lightbulb size={14} className="mt-0.5 shrink-0 text-amber-500" strokeWidth={2} />
            These scripts are AI-generated. Use them as inspiration and adapt them into your own
            original content while meeting campaign requirements and your personal style.
          </p>

          {data.referenceScripts.length > 0 ? (
            <div className="space-y-4">
              {data.referenceScripts.map((script) => (
                <ReferenceScriptCard
                  key={script.title}
                  title={script.title}
                  original={script.original}
                  translation={script.translation}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/70 px-4 py-8 text-center text-xs text-gray-400">
              Reference scripts will appear here once published.
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <SectionHeading icon={Calendar} title="Submission Deadline" />
          <div className="rounded-xl border border-gray-100 bg-gray-50/70 px-3.5 py-3">
            <p className="text-[13px] font-medium text-gray-800">{data.deadlineLabel}</p>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <SectionHeading icon={MessageSquare} title="Script Submission & Feedback" />
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write your script, or share a document link here..."
            className="min-h-[120px] resize-none border-gray-200 bg-white text-[13px] focus-visible:border-brand focus-visible:ring-brand/25"
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
      </main>
    </div>
  );
}
