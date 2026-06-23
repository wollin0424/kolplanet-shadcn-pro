"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DiscussionComposer,
  H5FeedbackThread,
  ScriptAiAutoCheckAlert,
} from "@/components/ScriptKolDraftPanel";
import {
  addCaptionCoverMessage,
  approveCaptionCover,
  getCaptionCoverSubmissions,
  subscribeCaptionCoverChanges,
  type CaptionCoverFile,
  type CaptionCoverSubmission,
} from "@/lib/captionCoverSubmissions";
import { getStageBadgeClass, STAGE_STATUS_PILL_CLASS } from "@/lib/pipeline/stageStatuses";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Eye, MessageSquare } from "@/lib/icons";

function formatCaptionCoverStatus(status: CaptionCoverSubmission["status"]) {
  if (status === "Under Review") return "Under review";
  return status;
}

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
  const showFeedbackSection = submission.messages.length > 0 || !feedbackReadOnly;

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
          <div className="mt-2 flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-2.5">
            <VerticalCoverPreview cover={submission.cover} />
            <div className="min-w-0 pt-1">
              <p className="truncate text-[13px] font-medium text-gray-900">{submission.cover.name}</p>
              <p className="text-[11px] text-gray-500">{submission.cover.sizeLabel}</p>
            </div>
          </div>
        </>
      ) : null}

      {showFeedbackSection ? (
        <div className="mt-4 rounded-xl bg-gray-50 p-3">
          {submission.messages.length > 0 ? (
            <H5FeedbackThread messages={submission.messages} />
          ) : null}
          {!feedbackReadOnly ? (
            <div className={submission.messages.length > 0 ? "mt-3" : undefined}>
              <DiscussionComposer
                kolId={kolId}
                version={submission.version}
                author="kol"
                authorLabel={kolName}
                placeholder="Write feedback..."
                onSendMessage={(payload) => addCaptionCoverMessage(kolId, submission.version, payload)}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function CaptionCoverContentPanel({ submission }: { submission: CaptionCoverSubmission }) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col space-y-3">
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-800">Caption</p>
        <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-gray-700">
          {submission.caption}
        </p>
        <ScriptAiAutoCheckAlert />
      </div>
      {submission.cover ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-800">Cover</p>
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

function CaptionCoverDiscussionSection({
  kolId,
  submission,
  readOnly = false,
}: {
  kolId: string;
  submission: CaptionCoverSubmission;
  readOnly?: boolean;
}) {
  const replyCount = submission.messages.length;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col space-y-2">
      <div className="flex min-h-5 items-center gap-2">
        <MessageSquare size={14} className="text-brand" strokeWidth={2} />
        <p className="text-xs font-semibold text-gray-800">Client Feedback</p>
        <span className="text-[11px] text-gray-400">
          {replyCount} {replyCount === 1 ? "reply" : "replies"}
        </span>
      </div>

      <div className="flex min-h-[200px] min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-gray-100 bg-gray-50/90">
        <div className="flex min-h-0 flex-1 flex-col p-3">
          {submission.messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
              <p className="max-w-[260px] whitespace-pre-line text-[12px] leading-snug text-gray-400">
                No replies yet.
                {"\n"}Share feedback or questions about this caption and cover.
              </p>
            </div>
          ) : (
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-0.5">
              {submission.messages.map((message) => (
                <div key={message.id} className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="text-[11px] font-semibold text-brand">From **</span>
                    <span className="text-[11px] text-gray-400">{message.sentAt}</span>
                  </div>
                  <div className="rounded-lg bg-white/70 px-3 py-2.5">
                    {message.content ? (
                      <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-gray-800">
                        {message.content}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {!readOnly ? (
          <div className="shrink-0 px-3 pb-3 pt-0">
            <DiscussionComposer
              kolId={kolId}
              version={submission.version}
              author="client"
              authorLabel="Client"
              placeholder="Write feedback..."
              onSendMessage={(payload) => addCaptionCoverMessage(kolId, submission.version, payload)}
            />
          </div>
        ) : null}
      </div>
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
        <div className={cn(collapsible && "mt-4")}>
          <div className="grid grid-cols-2 gap-4">
            <CaptionCoverContentPanel submission={submission} />
            <CaptionCoverDiscussionSection
              kolId={kolId}
              submission={submission}
              readOnly={feedbackReadOnly}
            />
          </div>

          {isLatest && !isApproved ? (
            <div className="mt-3 flex justify-end">
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
