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
import { ChevronDown, ChevronUp, Eye } from "@/lib/icons";

function VerticalCoverPreview({
  cover,
  className,
}: {
  cover: CaptionCoverFile;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group/cover relative aspect-[9/16] w-full max-w-[132px] shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-100",
        className
      )}
    >
      <img src={cover.previewUrl} alt={cover.name} className="size-full object-cover" />
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover/cover:bg-black/35">
        <button
          type="button"
          onClick={() => window.open(cover.previewUrl, "_blank", "noopener,noreferrer")}
          className="inline-flex size-9 items-center justify-center rounded-full bg-black/55 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover/cover:opacity-100 hover:bg-black/70"
          aria-label="Preview cover image"
        >
          <Eye size={16} strokeWidth={2} />
        </button>
      </div>
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

  const header = (
    <div className="flex flex-1 items-start justify-between gap-3">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <p className="text-sm font-semibold text-gray-900">Version {submission.version}</p>
        <p className="text-xs text-gray-500">{submission.submittedAt}</p>
      </div>
      <div className="flex items-center gap-2">
        <ContentReviewStatusBadge
          status={submission.status === "Approved" ? "Approved" : "Under Review"}
        />
        {collapsible ? (
          expanded ? (
            <ChevronUp size={16} className="text-gray-400" strokeWidth={2} />
          ) : (
            <ChevronDown size={16} className="text-gray-400" strokeWidth={2} />
          )
        ) : null}
      </div>
    </div>
  );

  return (
    <div className="rounded-xl border border-brand/15 bg-brand-50/20 p-4">
      {collapsible ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="flex w-full items-start text-left"
        >
          {header}
        </button>
      ) : (
        <div className="mb-4">{header}</div>
      )}

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

          {isLatest && !isApproved ? (
            <div className="-mx-4 mt-4 flex shrink-0 justify-end border-t border-gray-100 px-4 pt-3">
              <Button
                type="button"
                variant="brand"
                className="h-9 px-5 text-[13px]"
                onClick={() => {
                  approveCaptionCover(kolId, submission.version);
                  onApproved?.();
                }}
              >
                Approve
              </Button>
            </div>
          ) : null}
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
          collapsible={index > 0}
          isLatest={index === 0}
          discussionLocked={discussionLocked}
          onApproved={onApproved}
        />
      ))}
    </div>
  );
}
