"use client";

import { useEffect, useState } from "react";
import { H5PageShell } from "@/components/h5/H5PageShell";
import {
  H5PendingImagesUploadField,
  H5SubmittedImagesPanel,
} from "@/components/h5/H5MultiImageUploadField";
import { H5SectionHeading, H5SectionNote } from "@/components/h5/H5SectionHeading";
import { H5InfluencerCard } from "@/components/h5/H5InfluencerCard";
import { InstagramRepostIcon } from "@/components/icons/InstagramUiIcons";
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
  hasSubmittedMasterPost,
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
  type H5PostLinkEntry,
  type H5PostLinkHealth,
  type H5PostingState,
} from "@/lib/h5PostingSubmissions";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
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
  if (health === "verifying") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-semibold leading-none text-gray-600">
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
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold leading-none text-emerald-700">
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
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold leading-none",
        copy.className
      )}
    >
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
      className="inline-grid size-10 shrink-0 place-items-center rounded-full border border-brand/25 bg-brand-50 p-0 text-brand transition-colors hover:border-brand/40 hover:bg-brand-100/80 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <RefreshCcw size={14} strokeWidth={2.2} />
    </button>
  );
}

function H5PostLinkSubmitButton({
  disabled,
  onClick,
}: {
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        H5_PRIMARY_BUTTON_CLASS,
        disabled
          ? "cursor-not-allowed border border-gray-200 bg-gray-50 text-gray-400"
          : "bg-brand text-white hover:bg-brand/90"
      )}
    >
      Submit Link
    </button>
  );
}

function H5MasterPostRow({
  entry,
  label,
  onUrlChange,
  onRefresh,
  onSubmit,
}: {
  entry: H5PostLinkEntry;
  label: string;
  onUrlChange: (url: string) => void;
  onRefresh: () => void;
  onSubmit: () => void;
}) {
  const readOnly = entry.submitted;
  const showRefresh = entry.submitted;
  const isVerifying = entry.health === "verifying";
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
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12px] font-medium text-gray-500">{label}</p>
        <H5PostLinkStatusBadge health={entry.health} submitted={entry.submitted} />
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
          placeholder="Paste original post link here..."
          aria-invalid={Boolean(urlError)}
          className={cn(
            H5_LINK_INPUT_CLASS,
            readOnly && "bg-gray-50 text-gray-700",
            urlError && "border-red-300 focus-visible:border-red-400 focus-visible:ring-red-100"
          )}
        />
        {showRefresh ? (
          <H5PostLinkRefreshButton
            onClick={onRefresh}
            disabled={!entry.url.trim()}
            ariaLabel={`Refresh ${label}`}
          />
        ) : null}
      </div>
      {!entry.submitted ? (
        <>
          <H5PostLinkSubmitButton
            disabled={!entry.url.trim() || Boolean(urlError)}
            onClick={handleSubmit}
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

function H5MirroredPostRow({
  entry,
  label,
  onUrlChange,
  onRefresh,
  onSubmit,
}: {
  entry: H5PostLinkEntry;
  label: string;
  onUrlChange: (url: string) => void;
  onRefresh: () => void;
  onSubmit: () => void;
}) {
  const readOnly = entry.submitted;
  const showRefresh = entry.submitted;
  const isVerifying = entry.health === "verifying";
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
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12px] font-medium text-gray-500">{label}</p>
        <H5PostLinkStatusBadge health={entry.health} submitted={entry.submitted} />
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
          placeholder="Paste repost link here..."
          aria-invalid={Boolean(urlError)}
          className={cn(
            H5_LINK_INPUT_CLASS,
            readOnly && "bg-gray-50 text-gray-700",
            urlError && "border-red-300 focus-visible:border-red-400 focus-visible:ring-red-100"
          )}
        />
        {showRefresh ? (
          <H5PostLinkRefreshButton
            onClick={onRefresh}
            disabled={!entry.url.trim()}
            ariaLabel={`Refresh ${label}`}
          />
        ) : null}
      </div>
      {!entry.submitted ? (
        <>
          <H5PostLinkSubmitButton
            disabled={!entry.url.trim() || Boolean(urlError)}
            onClick={handleSubmit}
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

      <section
        className={cn(
          "space-y-3",
          hasSubmittedFiles &&
            "rounded-xl border border-dashed border-brand/25 bg-brand-50/20 p-3"
        )}
      >
        {hasSubmittedFiles ? (
          <h3 className="text-[12px] font-semibold text-brand">Add more screenshots</h3>
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
      </section>
    </div>
  );
}

function getMasterLabel(index: number) {
  return `Master ${index + 1}`;
}

function getMirroredLabel(index: number) {
  return `Mirrored ${index + 1}`;
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
    const syncPosting = () => setPosting(getH5PostingState(kolId));
    syncPosting();
    return subscribeH5PostingChanges(syncPosting);
  }, [figmaCapture, kolId]);

  const showInsightSection = hasSubmittedMasterPost(posting);
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
      pageIntro="Submit your original post links first. Once verified, you can upload insight reports for final review and payment."
    >
      <H5InfluencerCard
        name={brief.influencer.name}
        handle={brief.influencer.handle}
        avatar={brief.influencer.avatar}
      />

      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <H5SectionHeading
          icon={FileText}
          title="Posting Submission & Reporting"
          description="Paste the public post URL to verify your publication. Please submit performance insights report later."
          className="mb-0"
        />
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <div className="mb-4 flex items-start gap-2">
          <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand">
            <Send size={15} strokeWidth={2} />
          </span>
          <div>
            <h2 className="text-[15px] font-semibold text-gray-900">
              Master Link (Original Posts)
              <span className="ml-0.5 text-red-500">*</span>
            </h2>
            <p className="mt-1.5 text-[12px] leading-relaxed text-gray-500">
              Submit your main campaign content links here.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {posting.masters.map((entry, index) => (
            <H5MasterPostRow
              key={entry.id}
              entry={entry}
              label={getMasterLabel(index)}
              onUrlChange={(url) => updateMasterUrl(kolId, entry.id, url)}
              onRefresh={() => refreshMasterLink(kolId, entry.id)}
              onSubmit={() => submitMasterLink(kolId, entry.id)}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => addMasterPost(kolId)}
          className={cn(H5_DASHED_ADD_BUTTON_CLASS, "mt-4")}
        >
          <Plus size={14} strokeWidth={2.2} />
          Add another post
        </button>
        <p className="mt-3 text-[11px] leading-relaxed text-gray-400">
          Ensure all links are set to public.
        </p>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <div className="mb-4 flex items-start gap-2">
          <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand">
            <InstagramRepostIcon size={15} strokeWidth={2} />
          </span>
          <div>
            <h2 className="text-[15px] font-semibold text-gray-900">
              Mirrored Link (Cross-platform Reposts)
            </h2>
            <p className="mt-1.5 text-[12px] leading-relaxed text-gray-500">
              If you mirrored the content to other social platform, submit Link here.{" "}
              <span className="font-semibold text-gray-600">If not, please skip.</span>
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {posting.mirrored.map((entry, index) => (
            <H5MirroredPostRow
              key={entry.id}
              entry={entry}
              label={getMirroredLabel(index)}
              onUrlChange={(url) => updateMirroredDraftUrl(kolId, entry.id, url)}
              onRefresh={() => refreshMirroredLink(kolId, entry.id)}
              onSubmit={() => submitMirroredLink(kolId, entry.id)}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => addMirroredPost(kolId)}
          className={cn(H5_DASHED_ADD_BUTTON_CLASS, "mt-3")}
        >
          <Plus size={14} strokeWidth={2.2} />
          Add another repost
        </button>
        <p className="mt-3 text-[11px] leading-relaxed text-gray-400">
          Ensure all links are set to public.
        </p>
      </section>

      {showInsightSection ? (
        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <H5SectionHeading
            icon={Images}
            title="Insight Report"
            description={
              <>
                <p>
                  Submit platform insight screenshots for final review and payment release.
                </p>
                <H5SectionNote>Note: Best captured 7 days after posting.</H5SectionNote>
              </>
            }
          />

          <H5InsightUploadSection
            files={posting.insightDraftFiles}
            onAddFiles={(files) => addInsightDraftFiles(kolId, files)}
            onRemoveFile={(fileId) => removeInsightDraftFile(kolId, fileId)}
            onSubmit={() => submitInsightReport(kolId)}
            hoverCardId={insightHoverCardId}
          />
        </section>
      ) : null}
    </H5PageShell>
    </div>
  );
}
