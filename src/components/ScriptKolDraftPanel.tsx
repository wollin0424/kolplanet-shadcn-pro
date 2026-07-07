"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  addScriptDraftMessage,
  approveScriptDraft,
  getScriptDraftSubmissions,
  subscribeScriptDraftChanges,
  type ScriptDraftMessageAuthor,
  type ScriptDraftSubmission,
} from "@/lib/scriptDraftSubmissions";
import {
  CONTENT_HUB_STAGE_STATUS_CONFIG,
  getStageBadgeClass,
  STAGE_STATUS_PILL_CLASS,
  type ContentHubStageStatus,
} from "@/lib/pipeline/stageStatuses";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  MessageSquare,
  Plus,
  UserRound,
  X,
} from "@/lib/icons";

type KolScriptStatus = "Under Review" | "Approved";

function draftStatusToHubStatus(status: ScriptDraftSubmission["status"]): ContentHubStageStatus {
  if (status === "Approved") return "Approved";
  return "Under Review";
}

export function ContentReviewStatusBadge({ status }: { status: ContentHubStageStatus }) {
  const config = CONTENT_HUB_STAGE_STATUS_CONFIG[status];
  return (
    <span className={cn(STAGE_STATUS_PILL_CLASS, getStageBadgeClass(config.tone))}>
      {config.label}
    </span>
  );
}

function draftStatusToKolStatus(status: ScriptDraftSubmission["status"]): KolScriptStatus {
  if (status === "Approved") return "Approved";
  return "Under Review";
}

export function ReviewSectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-5 items-center gap-2">
      <p className="text-xs font-semibold text-gray-800">{children}</p>
    </div>
  );
}

export function KolScriptPanel({
  content,
  showLabel = true,
  label = "KOL Script",
}: {
  content: string;
  showLabel?: boolean;
  label?: string;
}) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col space-y-2">
      {showLabel ? <ReviewSectionTitle>{label}</ReviewSectionTitle> : null}
      <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-gray-700">{content}</p>
      <ScriptAiAutoCheckAlert />
    </div>
  );
}

function buildH5FeedbackThreadItems(messages: ScriptDraftSubmission["messages"]) {
  let itemNumber = 0;
  return messages.map((message) => {
    const lines = message.content
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const numberedLines = lines.map((line) => {
      itemNumber += 1;
      return { line, number: itemNumber };
    });
    return { message, numberedLines };
  });
}

export function H5FeedbackThread({
  messages,
}: {
  messages: ScriptDraftSubmission["messages"];
}) {
  const threadItems = buildH5FeedbackThreadItems(messages);

  return (
    <>
      <div className="mb-3 flex items-center gap-1.5">
        <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-gray-200/80 text-gray-500">
          <UserRound size={11} strokeWidth={2} />
        </span>
        <span className="text-[12px] font-medium text-gray-600">Client Feedback</span>
      </div>
      <div className="space-y-3">
        {threadItems.map(({ message, numberedLines }) => (
          <div key={message.id} className="space-y-1">
            <p className="text-[11px] text-gray-400">{message.sentAt}</p>
            {numberedLines.length > 0 ? (
              <div className="space-y-0.5 text-[13px] leading-relaxed text-gray-800">
                {numberedLines.map(({ line, number }, index) => (
                  <p key={`${message.id}-line-${index}`}>
                    {number}. {line}
                  </p>
                ))}
              </div>
            ) : null}
            {message.images?.length ? (
              <div className="flex flex-wrap gap-2 pt-0.5">
                {message.images.map((src, imageIndex) => (
                  <button
                    key={`${message.id}-img-${imageIndex}`}
                    type="button"
                    onClick={() => window.open(src, "_blank", "noopener,noreferrer")}
                    className="block shrink-0"
                    aria-label={`Preview attachment ${imageIndex + 1}`}
                  >
                    <img
                      src={src}
                      alt=""
                      className="size-14 rounded-md border border-gray-200 object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </>
  );
}

function ChatMessage({ message }: { message: ScriptDraftSubmission["messages"][number] }) {
  const isClient = message.author === "client";

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
        <span
          className={cn(
            "text-[11px] font-semibold",
            isClient ? "text-brand" : "text-gray-600"
          )}
        >
          {isClient ? "From **" : "From H5"}
        </span>
        <span className="text-[11px] text-gray-400">{message.sentAt}</span>
      </div>
      <div className="rounded-lg bg-white/70 px-3 py-2.5">
        {message.content ? (
          <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-gray-800">
            {message.content}
          </p>
        ) : null}
        {message.images?.length ? (
          <div className={cn("flex flex-wrap gap-2", message.content && "mt-2")}>
            {message.images.map((src, imageIndex) => (
              <img
                key={`${message.id}-img-${imageIndex}`}
                src={src}
                alt={`Attachment ${imageIndex + 1}`}
                className="size-14 rounded-md border border-gray-200 object-cover"
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function DiscussionThread({ messages }: { messages: ScriptDraftSubmission["messages"] }) {
  if (messages.length === 0) return null;

  return (
    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-0.5">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
    </div>
  );
}

export function DiscussionComposer({
  kolId,
  version,
  author,
  authorLabel,
  readOnly = false,
  placeholder = "Write feedback...",
  onSendMessage,
}: {
  kolId: string;
  version: number;
  author: ScriptDraftMessageAuthor;
  authorLabel: string;
  readOnly?: boolean;
  placeholder?: string;
  onSendMessage?: (payload: {
    author: ScriptDraftMessageAuthor;
    authorLabel: string;
    content: string;
    images?: string[];
  }) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState("");
  const [pendingImages, setPendingImages] = useState<string[]>([]);

  const canCompose = !readOnly;
  const canSend = draft.trim().length > 0 || pendingImages.length > 0;

  const handleImagePick = (files: FileList | null) => {
    if (!files?.length || !canCompose) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setPendingImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSend = () => {
    if (!canCompose || !canSend) return;
    const payload = {
      author,
      authorLabel,
      content: draft,
      images: pendingImages,
    };
    if (onSendMessage) {
      onSendMessage(payload);
    } else {
      addScriptDraftMessage(kolId, version, payload);
    }
    setDraft("");
    setPendingImages([]);
  };

  if (!canCompose) {
    return (
      <div className="flex h-10 items-center rounded-lg border border-gray-200 bg-gray-50 px-2">
        <div className="flex w-full items-center gap-0.5">
          <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-gray-300">
            <Plus size={17} strokeWidth={1.75} />
          </span>
          <input
            disabled
            placeholder={placeholder}
            className="h-8 min-w-0 flex-1 cursor-not-allowed border-0 bg-transparent px-1 text-[13px] text-gray-400 outline-none placeholder:text-gray-400"
          />
          <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-brand-50/60 text-brand/40">
            <ArrowRight size={15} strokeWidth={2} />
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(e) => {
          handleImagePick(e.target.files);
          e.target.value = "";
        }}
      />

      {pendingImages.length > 0 ? (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {pendingImages.map((src, index) => (
            <div key={`pending-${index}`} className="relative">
              <button
                type="button"
                onClick={() => window.open(src, "_blank", "noopener,noreferrer")}
                className="block"
                aria-label={`Preview pending attachment ${index + 1}`}
              >
                <img
                  src={src}
                  alt=""
                  className="size-9 rounded-md border border-gray-200 object-cover"
                />
              </button>
              <button
                type="button"
                onClick={() =>
                  setPendingImages((prev) => prev.filter((_, imageIndex) => imageIndex !== index))
                }
                className="absolute -top-1 -right-1 inline-flex size-3.5 items-center justify-center rounded-full bg-gray-800 text-white"
                aria-label="Remove image"
              >
                <X size={8} strokeWidth={2.5} />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex h-10 items-center rounded-lg border border-gray-200 bg-white px-2">
        <div className="flex w-full items-center gap-0.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
            aria-label="Add image"
          >
            <Plus size={17} strokeWidth={1.75} />
          </button>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canSend) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={placeholder}
            className="h-8 min-w-0 flex-1 border-0 bg-transparent px-1 text-[13px] outline-none placeholder:text-gray-400"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            className={cn(
              "inline-flex size-7 shrink-0 items-center justify-center rounded-md transition-colors",
              canSend
                ? "bg-brand-50 text-brand hover:bg-brand hover:text-white"
                : "bg-brand-50/60 text-brand/40"
            )}
            aria-label="Send message"
          >
            <ArrowRight size={15} strokeWidth={2} />
          </button>
        </div>
      </div>
    </>
  );
}

export function VersionDiscussionSection({
  kolId,
  submission,
  composerAuthor,
  composerLabel,
  readOnly = false,
  placeholder,
  onSendMessage,
}: {
  kolId: string;
  submission: Pick<ScriptDraftSubmission, "version" | "messages">;
  composerAuthor: ScriptDraftMessageAuthor;
  composerLabel: string;
  readOnly?: boolean;
  placeholder?: string;
  onSendMessage?: (payload: {
    author: ScriptDraftMessageAuthor;
    authorLabel: string;
    content: string;
    images?: string[];
  }) => void;
}) {
  const replyCount = submission.messages.length;
  const hasMessages = replyCount > 0;
  const composerProps = {
    kolId,
    version: submission.version,
    author: composerAuthor,
    authorLabel: composerLabel,
    placeholder,
    readOnly,
  };

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col space-y-2">
      <div className="flex min-h-5 items-center gap-2">
        <MessageSquare size={14} className="text-brand" strokeWidth={2} />
        <p className="text-xs font-semibold text-gray-800">Client Feedback</p>
        <span className="text-[11px] text-gray-400">
          {replyCount} {replyCount === 1 ? "reply" : "replies"}
        </span>
      </div>

      <div className="flex min-h-[200px] min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-gray-100 bg-gray-50/90">
        <div className="flex min-h-0 flex-1 flex-col p-3">
          {hasMessages ? <DiscussionThread messages={submission.messages} /> : null}
        </div>
        <div className="shrink-0 px-3 pb-3 pt-0">
          <DiscussionComposer {...composerProps} onSendMessage={onSendMessage} />
        </div>
      </div>
    </div>
  );
}

function VersionReviewSplit({
  kolId,
  submission,
  composerAuthor,
  composerLabel,
  readOnly = false,
  placeholder,
}: {
  kolId: string;
  submission: ScriptDraftSubmission;
  composerAuthor: ScriptDraftMessageAuthor;
  composerLabel: string;
  readOnly?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="grid grid-cols-2 items-stretch gap-4">
      <KolScriptPanel content={submission.content} />
      <VersionDiscussionSection
        kolId={kolId}
        submission={submission}
        composerAuthor={composerAuthor}
        composerLabel={composerLabel}
        readOnly={readOnly}
        placeholder={placeholder}
      />
    </div>
  );
}

export function ScriptAiAutoCheckAlert({
  message = "No obvious mismatch found, but please still review tone, CTA, and brand accuracy carefully.",
}: {
  message?: string;
}) {
  return (
    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3">
      <div className="flex items-center gap-1.5">
        <Lightbulb size={14} className="shrink-0 text-amber-600" strokeWidth={2} />
        <p className="text-[13px] font-semibold text-amber-900">AI Auto-check</p>
      </div>
      <div className="mt-2 flex gap-2 pl-0.5">
        <span className="mt-2 size-1 shrink-0 rounded-full bg-amber-700" aria-hidden />
        <p className="text-[13px] leading-relaxed text-amber-900/90">{message}</p>
      </div>
    </div>
  );
}

export function H5ScriptSubmissionCard({
  submission,
  kolId,
  kolName,
  discussionLocked = false,
}: {
  submission: ScriptDraftSubmission;
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
        <ContentReviewStatusBadge status={draftStatusToHubStatus(submission.status)} />
      </div>

      <p className="mt-3 whitespace-pre-wrap text-[14px] leading-relaxed text-gray-900">
        {submission.content}
      </p>

      <ScriptAiAutoCheckAlert />

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
            onSendMessage={(payload) => addScriptDraftMessage(kolId, submission.version, payload)}
          />
        </div>
      </div>
    </div>
  );
}

function ScriptApprovalConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  alreadyApproved = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  alreadyApproved?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[520px]" showCloseButton>
        <div className="border-b border-gray-100 px-6 py-5">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Confirm Script Approval
          </DialogTitle>
        </div>

        <div className="space-y-4 px-6 py-6">
          <DialogDescription className="text-left text-[13px] leading-relaxed text-gray-600">
            Are you sure you want to approve this script?
          </DialogDescription>
          <p className="text-left text-[13px] leading-relaxed text-gray-600">
            Once approved, the status{" "}
            <span className="font-semibold text-gray-900">
              will be locked and CANNOT be modified
            </span>
            . The influencer will proceed with video shooting based strictly on this version.
          </p>
          <p className="text-left text-[13px] leading-relaxed text-gray-500">
            Please review the content carefully before proceeding.
          </p>
          {alreadyApproved ? (
            <p className="text-left text-[13px] font-medium text-emerald-700">
              This script has already been approved.
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="h-9 min-w-[88px] border-gray-200 bg-white px-4 text-[13px] font-medium text-gray-600"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="brand"
            className="h-9 px-4 text-[13px]"
            disabled={alreadyApproved}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Confirm &amp; Approve
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function KolDraftReviewCard({
  kolId,
  kolName,
  submission,
  displayStatus,
  defaultExpanded = true,
  collapsible = false,
  isLatest = false,
  discussionLocked = false,
  onApproved,
}: {
  kolId: string;
  kolName: string;
  submission: ScriptDraftSubmission;
  displayStatus: KolScriptStatus;
  defaultExpanded?: boolean;
  collapsible?: boolean;
  isLatest?: boolean;
  discussionLocked?: boolean;
  onApproved?: () => void;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const isApproved = submission.status === "Approved";
  const feedbackReadOnly = isApproved || discussionLocked;

  const handleConfirmApprove = () => {
    if (isApproved) return;
    approveScriptDraft(kolId, submission.version);
    onApproved?.();
  };

  const showApprove = isLatest && !isApproved;

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
              onClick={() => setApproveDialogOpen(true)}
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
          <VersionReviewSplit
            kolId={kolId}
            submission={submission}
            composerAuthor="client"
            composerLabel="Client"
            readOnly={feedbackReadOnly}
            placeholder="Write feedback..."
          />
        </div>
      ) : null}

      {isLatest && !isApproved ? (
        <ScriptApprovalConfirmDialog
          open={approveDialogOpen}
          onOpenChange={setApproveDialogOpen}
          alreadyApproved={false}
          onConfirm={handleConfirmApprove}
        />
      ) : null}
    </div>
  );
}

export function ScriptKolDraftPanel({
  kolId,
  kolName,
  onApproved,
  onNeedsRevision,
}: {
  kolId: string;
  kolName: string;
  onApproved?: () => void;
  onNeedsRevision?: () => void;
}) {
  const [submissions, setSubmissions] = useState<ScriptDraftSubmission[]>([]);
  const syncedStatusRef = useRef("");

  useEffect(() => {
    syncedStatusRef.current = "";
    const sync = () => setSubmissions(getScriptDraftSubmissions(kolId));
    sync();
    return subscribeScriptDraftChanges(sync);
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
          Submitted script versions will appear here once the creator sends the first draft from the H5 page.
        </div>
      </div>
    );
  }

  const reversed = [...submissions].reverse();
  const discussionLocked = submissions[submissions.length - 1]?.status === "Approved";

  return (
    <div className="flex w-full min-w-0 flex-col gap-3">
      {reversed.map((submission, index) => (
        <KolDraftReviewCard
          key={submission.version}
          kolId={kolId}
          kolName={kolName}
          submission={submission}
          displayStatus={draftStatusToKolStatus(submission.status)}
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
