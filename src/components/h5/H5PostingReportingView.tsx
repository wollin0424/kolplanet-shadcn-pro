"use client";

import { useEffect, useState } from "react";
import { H5PageShell } from "@/components/h5/H5PageShell";
import {
  H5PendingImagesUploadField,
  H5SubmittedImagesPanel,
} from "@/components/h5/H5MultiImageUploadField";
import { H5SectionHeading, H5SectionNote } from "@/components/h5/H5SectionHeading";
import { H5InfluencerCard } from "@/components/h5/H5InfluencerCard";
import {
  H5_DASHED_ADD_BUTTON_CLASS,
  H5_INPUT_CLASS,
  H5_PRIMARY_BUTTON_CLASS,
} from "@/components/h5/h5ControlStyles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getScriptBriefH5Data,
  getScriptBriefH5Defaults,
  subscribeScriptBriefH5DataChanges,
} from "@/lib/scriptBriefH5Mock";
import {
  addInsightDraftFiles,
  addMasterPost,
  addMirroredPost,
  getDefaultH5PostingState,
  getFigmaCaptureH5PostingState,
  getFigmaCaptureH5InsightHoverCardId,
  getH5PostingState,
  hydratePostingStateInsightPreviews,
  H5_MIRRORED_MAX,
  refreshMasterLink,
  refreshMirroredLink,
  removeInsightDraftFile,
  submitInsightReport,
  submitMasterLink,
  submitMirroredLink,
  subscribeH5PostingChanges,
  updateMasterUrl,
  updateMirroredDraftUrl,
  type H5InsightFile,
  type H5MasterTaskGroup,
  type H5PostLinkEntry,
  type H5PostLinkHealth,
  type H5PostingState,
} from "@/lib/h5PostingSubmissions";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Images,
  Plus,
  RefreshCcw,
  Send,
} from "@/lib/icons";

const H5_LINK_INPUT_CLASS = H5_INPUT_CLASS;

function validateH5PostUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  try {
    new URL(trimmed);
    return undefined;
  } catch {
    return "Invalid URL format";
  }
}

function H5PostLinkStatusBadge({
  health,
  submitted = false,
}: {
  health: H5PostLinkHealth;
  submitted?: boolean;
}) {
  const badgeClass =
    "inline-flex h-[22px] shrink-0 items-center gap-1 rounded-full border px-2.5 text-[10px] font-semibold leading-none";

  if (health === "verifying") {
    return (
      <span className={cn(badgeClass, "border-gray-200 bg-gray-50 text-gray-600")}>
        <span
          className="inline-block size-2.5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"
          aria-hidden
        />
        Verifying
      </span>
    );
  }

  if (health === "verified" && submitted) {
    return (
      <span className={cn(badgeClass, "border-emerald-200 bg-emerald-50 text-emerald-700")}>
        <CheckCircle2 size={11} strokeWidth={2.2} />
        Verified
      </span>
    );
  }

  if (health !== "private" && health !== "issue") return null;

  const copy =
    health === "private"
      ? { label: "Private account", className: "border-amber-200 bg-amber-50 text-amber-700" }
      : {
          label: submitted ? "Data fetch failed" : "Link issue",
          className: "border-red-200 bg-red-50 text-red-700",
        };

  return (
    <span className={cn(badgeClass, copy.className)}>
      <AlertCircle size={11} strokeWidth={2.2} />
      {copy.label}
    </span>
  );
}

function H5PostLinkHealthNote({
  health,
  submitted = false,
}: {
  health: H5PostLinkHealth;
  submitted?: boolean;
}) {
  if (health === "private") {
    return (
      <p className="text-[11px] leading-relaxed text-amber-700">
        Private account. Refresh after the creator updates the post.
      </p>
    );
  }
  if (health === "issue") {
    return (
      <p className="text-[11px] leading-relaxed text-red-700">
        {submitted
          ? "Update your post and verify again."
          : "We could not access this link. Check that it is public and try again."}
      </p>
    );
  }
  return null;
}

function H5PostLinkRefreshButton({
  onClick,
  disabled = false,
  ariaLabel,
}: {
  onClick: () => void;
  disabled?: boolean;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        "inline-grid size-10 shrink-0 place-items-center rounded-full border p-0 transition-colors",
        disabled
          ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
          : "border-brand/25 bg-brand-50 text-brand hover:border-brand/40 hover:bg-brand-100/80 active:border-brand/45 active:bg-brand-100"
      )}
    >
      <RefreshCcw size={14} strokeWidth={2.2} />
    </button>
  );
}

function H5PostLinkSubmitButton({
  disabled,
  onClick,
  compact = false,
}: {
  disabled: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        compact
          ? "h-9 w-full rounded-lg text-[12px] font-semibold transition-colors"
          : H5_PRIMARY_BUTTON_CLASS,
        disabled
          ? "cursor-not-allowed border border-gray-200 bg-gray-50 text-gray-400"
          : compact
            ? "border border-brand/25 bg-white text-brand hover:border-brand/40 hover:bg-brand-50/60"
            : "bg-brand text-white hover:bg-brand/90"
      )}
    >
      Submit Link
    </button>
  );
}

function H5PostLinkRow({
  entry,
  label,
  labelSuffix,
  description,
  required = false,
  variant = "master",
  placeholder,
  onUrlChange,
  onRefresh,
  onSubmit,
}: {
  entry: H5PostLinkEntry;
  label: string;
  labelSuffix?: string;
  description?: string;
  required?: boolean;
  variant?: "master" | "mirrored";
  placeholder: string;
  onUrlChange: (url: string) => void;
  onRefresh: () => void;
  onSubmit: () => void;
}) {
  const readOnly = entry.submitted;
  const showRefresh = entry.submitted;
  const isVerifying = entry.health === "verifying";
  // Verified / verifying → refresh locked; private / issue (and other failures) → can retry
  const refreshDisabled =
    !entry.url.trim() || entry.health === "verified" || entry.health === "verifying";
  const [urlError, setUrlError] = useState<string | undefined>();

  const handleSubmit = () => {
    const error = validateH5PostUrl(entry.url);
    if (error) {
      setUrlError(error);
      return;
    }
    setUrlError(undefined);
    onSubmit();
  };

  return (
    <div
      className={cn(
        "space-y-2.5",
        variant === "master" &&
          "rounded-xl border-2 border-brand/30 bg-white p-3.5 shadow-[0_1px_2px_rgba(37,99,235,0.06)]",
        variant === "mirrored" && "rounded-lg border border-gray-200 bg-gray-50/80 p-3"
      )}
    >
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "min-w-0 leading-snug",
              variant === "master"
                ? "text-[14px] font-semibold text-gray-900"
                : "text-[12px] font-medium text-gray-700"
            )}
          >
            {label}
            {labelSuffix ? (
              <>
                {" "}
                <span className="font-normal text-gray-400">{labelSuffix}</span>
              </>
            ) : null}
            {required ? <span className="ml-0.5 text-red-500">*</span> : null}
          </p>
          <H5PostLinkStatusBadge health={entry.health} submitted={entry.submitted} />
        </div>
        {description ? (
          <p className="text-[11px] leading-relaxed text-gray-500">{description}</p>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="url"
          value={entry.url}
          onChange={(e) => {
            onUrlChange(e.target.value);
            setUrlError(
              e.target.value.trim() ? validateH5PostUrl(e.target.value) : undefined
            );
          }}
          onBlur={() =>
            setUrlError(entry.url.trim() ? validateH5PostUrl(entry.url) : undefined)
          }
          readOnly={readOnly}
          placeholder={placeholder}
          aria-invalid={Boolean(urlError)}
          className={cn(
            H5_LINK_INPUT_CLASS,
            readOnly && "border-gray-200 bg-gray-50/80 text-gray-700",
            variant === "master" &&
              !readOnly &&
              !urlError &&
              "border-brand/25 bg-white focus-visible:border-brand/45 focus-visible:ring-brand/15",
            variant === "mirrored" &&
              !readOnly &&
              !urlError &&
              "border-gray-200 bg-white focus-visible:border-gray-300",
            urlError && "border-red-300 focus-visible:border-red-400 focus-visible:ring-red-100"
          )}
        />
        {showRefresh ? (
          <H5PostLinkRefreshButton
            onClick={onRefresh}
            disabled={refreshDisabled}
            ariaLabel={`Refresh ${label}`}
          />
        ) : null}
      </div>
      {!entry.submitted ? (
        <>
          <H5PostLinkSubmitButton
            disabled={!entry.url.trim() || Boolean(urlError)}
            onClick={handleSubmit}
            compact={variant === "mirrored"}
          />
          {urlError ? (
            <p className="text-[11px] leading-relaxed text-red-600">{urlError}</p>
          ) : null}
        </>
      ) : isVerifying ? null : (
        <H5PostLinkHealthNote health={entry.health} submitted={entry.submitted} />
      )}
    </div>
  );
}

function H5TaskGroupCard({
  group,
  groupIndex,
  kolId,
  insightHoverCardId,
  collapsible = false,
}: {
  group: H5MasterTaskGroup;
  groupIndex: number;
  kolId: string;
  insightHoverCardId?: string;
  collapsible?: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  const showMirroredSection = group.master.submitted || group.mirrored.length > 0;
  const allMirroredFilled = group.mirrored.every(
    (entry) => entry.submitted || entry.url.trim()
  );
  const canAddMirrored =
    group.master.submitted &&
    group.mirrored.length < H5_MIRRORED_MAX &&
    (group.mirrored.length === 0 || allMirroredFilled);

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/80 px-4 py-2.5">
        <h2 className="text-[15px] font-semibold tracking-tight text-gray-900">
          Task Group {groupIndex + 1}
        </h2>
        {collapsible ? (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            aria-label={expanded ? "Collapse task group" : "Expand task group"}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <ChevronDown
              size={16}
              strokeWidth={2.2}
              className={cn("transition-transform duration-200", expanded && "rotate-180")}
            />
          </button>
        ) : null}
      </div>

      {expanded ? (
      <div className="space-y-4 p-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-50/70 text-brand/80">
            <Send size={15} strokeWidth={2} />
          </span>
          <h2 className="text-[15px] font-semibold text-gray-900">Post Link</h2>
        </div>

        <H5PostLinkRow
          entry={group.master}
          label="Master Link"
          labelSuffix="(Original Posts)"
          description="Enter the primary URL of the content published on the main platform."
          required
          variant="master"
          placeholder="Paste original post link here..."
          onUrlChange={(url) => updateMasterUrl(kolId, group.id, url)}
          onRefresh={() => refreshMasterLink(kolId, group.id)}
          onSubmit={() => submitMasterLink(kolId, group.id)}
        />

        {showMirroredSection ? (
          <div className="space-y-3 border-t border-gray-100 pt-4">
            <div className="space-y-1">
              <p className="text-[12px] font-semibold text-gray-700">
                Mirrored Links{" "}
                <span className="font-normal text-gray-400">(Cross-platform Reposts)</span>
              </p>
              <p className="text-[11px] leading-relaxed text-gray-500">
                If you reposted this content to other platforms, submit the repost links here. If
                not, please skip.
              </p>
            </div>

            {group.mirrored.map((entry, index) => (
              <H5PostLinkRow
                key={entry.id}
                entry={entry}
                label={`Mirrored ${index + 1}`}
                variant="mirrored"
                placeholder="Paste repost link here..."
                onUrlChange={(url) => updateMirroredDraftUrl(kolId, group.id, entry.id, url)}
                onRefresh={() => refreshMirroredLink(kolId, group.id, entry.id)}
                onSubmit={() => submitMirroredLink(kolId, group.id, entry.id)}
              />
            ))}

            {canAddMirrored ? (
              <button
                type="button"
                onClick={() => addMirroredPost(kolId, group.id)}
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-brand transition-colors hover:text-brand/80"
              >
                <Plus size={13} strokeWidth={2.25} />
                Add Mirrored Link (Up to {H5_MIRRORED_MAX})
              </button>
            ) : null}
          </div>
        ) : null}

        {group.master.submitted ? (
          <div className="space-y-4 border-t border-gray-100 pt-4">
            <H5SectionHeading
              icon={Images}
              title="Insight Report"
              description={
                <>
                  <p>
                    Submit platform insight screenshots for this master link to unlock review and
                    payment.
                  </p>
                  <H5SectionNote>Note: Best captured 7 days after posting.</H5SectionNote>
                </>
              }
            />

            <H5InsightUploadSection
              files={group.insightDraftFiles}
              onAddFiles={(files) => void addInsightDraftFiles(kolId, group.id, files)}
              onRemoveFile={(fileId) => removeInsightDraftFile(kolId, group.id, fileId)}
              onSubmit={() => submitInsightReport(kolId, group.id)}
              hoverCardId={insightHoverCardId}
            />
          </div>
        ) : null}
      </div>
      ) : null}
    </section>
  );
}

function H5InsightUploadSection({
  files,
  onAddFiles,
  onRemoveFile,
  onSubmit,
  hoverCardId,
}: {
  files: H5InsightFile[];
  onAddFiles: (files: H5InsightFile[]) => void;
  onRemoveFile: (fileId: string) => void;
  onSubmit: () => void;
  hoverCardId?: string;
}) {
  const submittedFiles = files.filter((file) => file.locked);
  const pendingFiles = files.filter((file) => !file.locked);
  const hasSubmittedFiles = submittedFiles.length > 0;
  const canSubmit = pendingFiles.length > 0;

  return (
    <div className="space-y-4">
      {hasSubmittedFiles ? (
        <H5SubmittedImagesPanel files={submittedFiles} hoverCardId={hoverCardId} />
      ) : null}

      <div className="space-y-3">
        {hasSubmittedFiles ? (
          <h3 className="text-[12px] font-semibold text-gray-700">Add more screenshots</h3>
        ) : null}

        <H5PendingImagesUploadField
          files={pendingFiles}
          onAddFiles={onAddFiles}
          onRemoveFile={onRemoveFile}
          showDropzone
          hoverCardId={hoverCardId}
        />

        <Button
          type="button"
          variant="brand"
          className={H5_PRIMARY_BUTTON_CLASS}
          disabled={!canSubmit}
          onClick={onSubmit}
        >
          Submit Image
        </Button>
      </div>
    </div>
  );
}

type H5PostingReportingViewProps = {
  kolId: string;
  overviewHref: string;
  figmaCapture?: boolean;
  figmaPostingState?: string;
};

export function H5PostingReportingView({
  kolId,
  overviewHref,
  figmaCapture = false,
  figmaPostingState,
}: H5PostingReportingViewProps) {
  const [brief, setBrief] = useState(() => getScriptBriefH5Defaults(kolId));
  const [posting, setPosting] = useState<H5PostingState>(() =>
    figmaCapture
      ? getFigmaCaptureH5PostingState(kolId, figmaPostingState)
      : getDefaultH5PostingState(kolId)
  );

  useEffect(() => {
    const syncBrief = () => setBrief(getScriptBriefH5Data(kolId));
    syncBrief();
    return subscribeScriptBriefH5DataChanges(syncBrief);
  }, [kolId]);

  useEffect(() => {
    if (figmaCapture) return;
    let cancelled = false;

    const syncPosting = async () => {
      const next = getH5PostingState(kolId);
      const hydrated = await hydratePostingStateInsightPreviews(next);
      if (!cancelled) setPosting(hydrated);
    };

    void syncPosting();
    return subscribeH5PostingChanges(() => {
      void syncPosting();
    });
  }, [figmaCapture, kolId]);

  const insightHoverCardId = figmaCapture
    ? getFigmaCaptureH5InsightHoverCardId(figmaPostingState)
    : undefined;

  return (
    <div
      className={cn(figmaCapture && "figma-capture-h5-posting-page")}
      data-figma-capture={figmaCapture ? "h5-posting-page" : undefined}
    >
    <H5PageShell
      backHref={overviewHref}
      pageTitle="Posting & Reporting"
      pageIntro="Create a Master Link for each original post, followed by its Mirrored Links and Insight Report screenshot for settlement. Each unique original post counts as one task."
    >
      <H5InfluencerCard
        name={brief.influencer.name}
        handle={brief.influencer.handle}
        avatar={brief.influencer.avatar}
      />

      <div className="space-y-4">
        {(posting.taskGroups ?? []).map((group, index) => (
          <H5TaskGroupCard
            key={group.id}
            group={group}
            groupIndex={index}
            kolId={kolId}
            collapsible={(posting.taskGroups ?? []).length > 1}
            insightHoverCardId={index === 0 ? insightHoverCardId : undefined}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => addMasterPost(kolId)}
        className={cn(H5_DASHED_ADD_BUTTON_CLASS, "shadow-[0_1px_2px_rgba(15,23,42,0.03)]")}
      >
        <Plus size={14} strokeWidth={2.2} />
        Add Task Group
      </button>
    </H5PageShell>
    </div>
  );
}
