"use client";

import { useEffect, useState } from "react";
import { H5PageShell } from "@/components/h5/H5PageShell";
import { H5MultiImageUploadField } from "@/components/h5/H5MultiImageUploadField";
import { H5SectionHeading } from "@/components/h5/H5SectionHeading";
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
  getH5PostingState,
  hasVerifiedMasterPost,
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
  ArrowLeftRight,
  Image,
  Plus,
  RefreshCcw,
  Star,
  Upload,
} from "@/lib/icons";

const H5_LINK_INPUT_CLASS = H5_INPUT_CLASS;

function H5PostLinkStatusBadge({
  health,
  submitted = false,
}: {
  health: H5PostLinkHealth;
  submitted?: boolean;
}) {
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
  const readOnly = entry.submitted && entry.health === "verified";
  const showRefresh = entry.submitted;

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
          onChange={(e) => onUrlChange(e.target.value)}
          readOnly={readOnly}
          placeholder="Paste your live post link here..."
          className={cn(H5_LINK_INPUT_CLASS, readOnly && "bg-gray-50 text-gray-700")}
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
          <H5PostLinkSubmitButton disabled={!entry.url.trim()} onClick={onSubmit} />
          <p className="text-[11px] leading-relaxed text-gray-400">
            Make sure the link is public and accessible.
          </p>
        </>
      ) : (
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
  const readOnly = entry.submitted && entry.health === "verified";
  const showRefresh = entry.submitted;

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
          onChange={(e) => onUrlChange(e.target.value)}
          readOnly={readOnly}
          placeholder="Paste repost link here..."
          className={cn(H5_LINK_INPUT_CLASS, readOnly && "bg-gray-50 text-gray-700")}
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
          <H5PostLinkSubmitButton disabled={!entry.url.trim()} onClick={onSubmit} />
          <p className="text-[11px] leading-relaxed text-gray-400">
            Make sure the link is public and accessible.
          </p>
        </>
      ) : (
        <H5PostLinkHealthNote health={entry.health} submitted={entry.submitted} />
      )}
    </div>
  );
}

function H5InsightUploadSection({
  files,
  locked,
  submitted,
  onAddFiles,
  onRemoveFile,
  onSubmit,
}: {
  files: H5InsightFile[];
  locked: boolean;
  submitted: boolean;
  onAddFiles: (files: H5InsightFile[]) => void;
  onRemoveFile: (fileId: string) => void;
  onSubmit: () => void;
}) {
  if (submitted) {
    return (
      <>
        <div className="flex items-center gap-2 text-[12px] font-medium text-gray-600">
          <Upload size={14} strokeWidth={2} className="shrink-0 text-brand" />
          Insight report submitted
        </div>
        <H5MultiImageUploadField
          files={files}
          onAddFiles={() => undefined}
          onRemoveFile={() => undefined}
          disabled
          showDropzone={false}
          dropLabel="Drop screenshots here"
        />
        <p className="text-[11px] font-medium text-emerald-700">
          Insight report submitted successfully. Files are now locked.
        </p>
      </>
    );
  }

  return (
    <>
      {locked ? (
        <p className="mb-3 rounded-lg border border-amber-100 bg-amber-50/70 px-3 py-2 text-[12px] leading-relaxed text-amber-800">
          Unlock this section after your first original post link is verified.
        </p>
      ) : null}

      <H5MultiImageUploadField
        files={files}
        onAddFiles={onAddFiles}
        onRemoveFile={onRemoveFile}
        disabled={locked}
        dropLabel="Drop screenshots here"
        hint="PNG / JPG screenshots"
      />

      <p className="mt-3 text-[11px] leading-relaxed text-gray-400">
        Upload completes the draft only. Click Submit to finalize the report.
      </p>
      <Button
        type="button"
        variant="brand"
        className={cn(H5_PRIMARY_BUTTON_CLASS, "mt-3")}
        disabled={locked || files.length === 0}
        onClick={onSubmit}
      >
        Submit
      </Button>
    </>
  );
}

function getMasterLabel(index: number, total: number) {
  return total === 1 ? "Master 1" : `Master ${index + 1}`;
}

function getMirroredLabel(index: number, total: number) {
  return total === 1 ? "Mirrored 1" : `Mirrored ${index + 1}`;
}

type H5PostingReportingViewProps = {
  kolId: string;
  overviewHref: string;
};

export function H5PostingReportingView({ kolId, overviewHref }: H5PostingReportingViewProps) {
  const [brief, setBrief] = useState(() => getScriptBriefH5Defaults(kolId));
  const [posting, setPosting] = useState<H5PostingState>(() => getDefaultH5PostingState(kolId));

  useEffect(() => {
    const syncBrief = () => setBrief(getScriptBriefH5Data(kolId));
    syncBrief();
    return subscribeScriptBriefH5DataChanges(syncBrief);
  }, [kolId]);

  useEffect(() => {
    const syncPosting = () => setPosting(getH5PostingState(kolId));
    syncPosting();
    return subscribeH5PostingChanges(syncPosting);
  }, [kolId]);

  const insightUnlocked = hasVerifiedMasterPost(posting);

  return (
    <H5PageShell
      backHref={overviewHref}
      pageTitle="Posting & Reporting"
      pageIntro="Submit each live post link first. After the first original post is verified, the insight upload area unlocks for final review and payment release."
    >
      <H5InfluencerCard
        name={brief.influencer.name}
        handle={brief.influencer.handle}
        avatar={brief.influencer.avatar}
      />

      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <div className="mb-4 flex items-start gap-2">
          <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand">
            <Star size={15} strokeWidth={2} />
          </span>
          <div>
            <h2 className="text-[15px] font-semibold text-gray-900">Original Posts (Primary)</h2>
          </div>
        </div>

        <div className="space-y-4">
          {posting.masters.map((entry, index) => (
            <H5MasterPostRow
              key={entry.id}
              entry={entry}
              label={getMasterLabel(index, posting.masters.length)}
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
          Add another original post
        </button>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <div className="mb-4 flex items-start gap-2">
          <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand">
            <ArrowLeftRight size={15} strokeWidth={2} />
          </span>
          <div>
            <h2 className="text-[15px] font-semibold text-gray-900">Cross-Platform Reposts (Optional)</h2>
            <p className="mt-1.5 text-[12px] leading-relaxed text-gray-500">
              If you mirrored the content to other social platform, submit link here. If not, please
              skip.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {posting.mirrored.map((entry, index) => (
            <H5MirroredPostRow
              key={entry.id}
              entry={entry}
              label={getMirroredLabel(index, posting.mirrored.length)}
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
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <H5SectionHeading
          icon={Image}
          title="Insight Report Uploads"
          description={
            <>
              <p>
                Submit platform insight screenshots for final review and payment release.
              </p>
              <p>
                <span className="font-semibold text-gray-600">Note:</span> Best captured 7 days after
                posting.
              </p>
            </>
          }
        />

        <H5InsightUploadSection
          files={posting.insightDraftFiles}
          locked={!insightUnlocked}
          submitted={posting.insightSubmitted}
          onAddFiles={(files) => addInsightDraftFiles(kolId, files)}
          onRemoveFile={(fileId) => removeInsightDraftFile(kolId, fileId)}
          onSubmit={() => submitInsightReport(kolId)}
        />
      </section>
    </H5PageShell>
  );
}
