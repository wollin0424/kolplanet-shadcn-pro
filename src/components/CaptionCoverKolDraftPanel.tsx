"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ContentReviewStatusBadge,
  DiscussionComposer,
  H5FeedbackThread,
  KolScriptPanel,
  ReviewSectionTitle,
  ScriptAiAutoCheckAlert,
  VersionDiscussionSection,
} from "@/components/ScriptKolDraftPanel";
import {
  addCaptionCoverMessage,
  approveCaptionCover,
  getCaptionCoverSubmissions,
  subscribeCaptionCoverChanges,
  type CaptionCoverFile,
  type CaptionCoverSubmission,
} from "@/lib/captionCoverSubmissions";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "@/lib/icons";

function VerticalCoverPreview({
  cover,
  className,
}: {
  cover: CaptionCoverFile;
  className?: string;
}) {
  const openPreview = () => {
    window.open(cover.previewUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className={cn(
        "relative aspect-[9/16] w-full max-w-[132px] shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-100",
        className
      )}
    >
      <button
        type="button"
        onClick={openPreview}
        className="block size-full"
        aria-label={`Preview ${cover.name}`}
      >
        <img src={cover.previewUrl} alt="" className="size-full object-cover" />
      </button>
    </div>
  );
}

export function H5CaptionCoverSubmissionCard({
  submission,
  kolId,
  kolName,
  discussionLocked = false,
}: {
  submission: CaptionCoverSubmission;
  kolId: string;
  kolName: string;
  discussionLocked?: boolean;
}) {
  const isApproved = submission.status === "Approved";
  const feedbackReadOnly = isApproved || discussionLocked;

  return (
    <div className="mt-4 rounded-2xl border border-brand/20 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[15px] font-semibold text-gray-900">Version {submission.version}</p>
          <p className="mt-0.5 text-[12px] text-gray-500">{submission.submittedAt}</p>
        </div>
        <ContentReviewStatusBadge
          status={submission.status === "Approved" ? "Approved" : "Under Review"}
        />
      </div>

      <p className="mt-3 whitespace-pre-wrap text-[14px] leading-relaxed text-gray-900">
        {submission.caption}
      </p>

      <ScriptAiAutoCheckAlert />

      {submission.cover ? (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-2.5">
          <VerticalCoverPreview cover={submission.cover} />
          <div className="min-w-0 pt-1">
            <p className="truncate text-[13px] font-medium text-gray-900">{submission.cover.name}</p>
            <p className="text-[11px] text-gray-500">{submission.cover.sizeLabel}</p>
          </div>
        </div>
      ) : null}

      <div className="mt-4 rounded-xl bg-gray-50 p-3">
        {submission.messages.length > 0 ? (
          <H5FeedbackThread messages={submission.messages} />
        ) : null}
        <div className={submission.messages.length > 0 ? "mt-3" : undefined}>
          <DiscussionComposer
            kolId={kolId}
            version={submission.version}
            author="kol"
            authorLabel={kolName}
            readOnly={feedbackReadOnly}
            placeholder="Write feedback..."
            onSendMessage={(payload) => addCaptionCoverMessage(kolId, submission.version, payload)}
          />
        </div>
      </div>
    </div>
  );
}

function CaptionCoverContentPanel({ submission }: { submission: CaptionCoverSubmission }) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col space-y-3">
      <KolScriptPanel content={submission.caption} label="Caption" />
      {submission.cover ? (
        <div className="space-y-2">
          <ReviewSectionTitle>Cover</ReviewSectionTitle>
          <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50/70 p-2.5">
            <VerticalCoverPreview cover={submission.cover} />
            <div className="min-w-0 pt-1">
              <p className="truncate text-[13px] font-medium text-gray-900">{submission.cover.name}</p>
              <p className="text-[11px] text-gray-500">{submission.cover.sizeLabel}</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CaptionCoverReviewCard({
  kolId,
  submission,
  defaultExpanded = true,
  collapsible = false,
  isLatest = false,
  discussionLocked = false,
  onApproved,
}: {
  kolId: string;
  submission: CaptionCoverSubmission;
  defaultExpanded?: boolean;
  collapsible?: boolean;
  isLatest?: boolean;
  discussionLocked?: boolean;
  onApproved?: () => void;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const isApproved = submission.status === "Approved";
  const feedbackReadOnly = isApproved || discussionLocked;

  const showApprove = isLatest && !isApproved;
  const displayStatus = submission.status === "Approved" ? "Approved" : "Under Review";

  const headerTitle = (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <p className="text-sm font-semibold text-gray-900">Version {submission.version}</p>
      <p className="text-xs text-gray-500">{submission.submittedAt}</p>
      <ContentReviewStatusBadge status={displayStatus} />
    </div>
  );

  return (
    <div className="rounded-xl border border-brand/15 bg-brand-50/20 p-4">
      <div className={cn("flex items-start justify-between gap-3", !collapsible && "mb-4")}>
        {collapsible ? (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="min-w-0 flex-1 text-left"
          >
            {headerTitle}
          </button>
        ) : (
          <div className="min-w-0 flex-1">{headerTitle}</div>
        )}
        <div className="flex shrink-0 items-center gap-2">
          {showApprove ? (
            <Button
              type="button"
              variant="outline"
              className="h-7 shrink-0 border-brand/20 bg-brand-50/40 px-3.5 text-[12px] font-medium text-brand shadow-none hover:border-brand/30 hover:bg-brand-50 hover:text-brand"
              onClick={() => {
                approveCaptionCover(kolId, submission.version);
                onApproved?.();
              }}
            >
              Approve
            </Button>
          ) : null}
          {collapsible ? (
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              aria-label={expanded ? "Collapse version" : "Expand version"}
            >
              {expanded ? (
                <ChevronUp size={16} strokeWidth={2} />
              ) : (
                <ChevronDown size={16} strokeWidth={2} />
              )}
            </button>
          ) : null}
        </div>
      </div>

      {expanded ? (
        <div className={cn(collapsible && "mt-4", "flex flex-col")}>
          <div className="grid grid-cols-2 items-stretch gap-4">
            <CaptionCoverContentPanel submission={submission} />
            <VersionDiscussionSection
              kolId={kolId}
              submission={submission}
              composerAuthor="client"
              composerLabel="Client"
              readOnly={feedbackReadOnly}
              placeholder="Write feedback..."
              onSendMessage={(payload) => addCaptionCoverMessage(kolId, submission.version, payload)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function CaptionCoverKolDraftPanel({
  kolId,
  onApproved,
  onNeedsRevision,
}: {
  kolId: string;
  onApproved?: () => void;
  onNeedsRevision?: () => void;
}) {
  const [submissions, setSubmissions] = useState<CaptionCoverSubmission[]>([]);
  const syncedStatusRef = useRef("");

  useEffect(() => {
    syncedStatusRef.current = "";
    const sync = () => setSubmissions(getCaptionCoverSubmissions(kolId));
    sync();
    return subscribeCaptionCoverChanges(sync);
  }, [kolId]);

  useEffect(() => {
    if (!submissions.length) return;
    const latest = submissions[submissions.length - 1];
    const syncKey = `${latest.version}:${latest.status}`;
    if (syncKey === syncedStatusRef.current) return;
    syncedStatusRef.current = syncKey;

    if (latest.status === "Approved") {
      onApproved?.();
      return;
    }
    if (latest.status === "Revision Needed") {
      onNeedsRevision?.();
    }
  }, [submissions, onApproved, onNeedsRevision]);

  if (submissions.length === 0) {
    return (
      <div className="flex w-full min-w-0 flex-col gap-4">
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-4 py-12 text-center text-xs text-gray-400">
          Submitted caption and cover versions will appear here once the creator sends the first
          draft from the H5 page.
        </div>
      </div>
    );
  }

  const reversed = [...submissions].reverse();
  const discussionLocked = submissions[submissions.length - 1]?.status === "Approved";

  return (
    <div className="flex w-full min-w-0 flex-col gap-3">
      {reversed.map((submission, index) => (
        <CaptionCoverReviewCard
          key={submission.version}
          kolId={kolId}
          submission={submission}
          defaultExpanded={index === 0}
          collapsible
          isLatest={index === 0}
          discussionLocked={discussionLocked}
          onApproved={onApproved}
        />
      ))}
    </div>
  );
}
