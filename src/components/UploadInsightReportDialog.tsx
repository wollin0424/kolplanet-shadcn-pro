"use client";

import { useEffect, useMemo, useState } from "react";
import { FileUploadZone } from "@/components/FileUploadZone";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { FORM_FIELD_RADIUS } from "@/lib/formControls";
import { getH5PostingState, removeH5InsightFile, subscribeH5PostingChanges, type H5InsightFile } from "@/lib/h5PostingSubmissions";
import { Eye, Trash2 } from "@/lib/icons";
import {
  mergeInsightReportFileNames,
  mergeInsightReportImagesFromRecords,
  splitInitialWebInsightFileNames,
  type InsightReportImage,
  type WebInsightFileRecord,
} from "@/lib/insightReportSync";
import {
  buildInsightReportShareUrl,
  getFigmaCaptureInsightReportState,
  getInsightReportPreviewUrl,
} from "@/lib/postingHubMock";
import { cn } from "@/lib/utils";

const ACCEPT_INPUT = "image/png,image/jpeg,image/jpg,image/webp";

const ACCEPTED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function resolveShareLink(
  submissionLink: string | undefined,
  rowId: string | undefined,
  fileCount: number
) {
  if (!fileCount) return undefined;
  return submissionLink ?? (rowId ? buildInsightReportShareUrl(rowId) : undefined);
}

function InsightReportShareLink({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="min-w-0 flex-1 truncate text-[12px] font-medium text-brand underline-offset-[3px] transition-colors hover:underline hover:decoration-brand/40"
      title={url}
    >
      {url}
    </a>
  );
}

function buildInitialWebInsightFiles(
  initialFiles: string[] | undefined,
  h5Files: H5InsightFile[],
  rowId?: string
): WebInsightFileRecord[] {
  return splitInitialWebInsightFileNames(initialFiles, h5Files).map((name) => ({
    name,
    previewUrl: getInsightReportPreviewUrl(rowId ?? "", name),
    sizeLabel: "2.1 KB",
  }));
}

function InsightReportImageCard({
  file,
  variant,
  onRemove,
  forceHover = false,
}: {
  file: InsightReportImage;
  variant: "submitted" | "draft";
  onRemove?: () => void;
  forceHover?: boolean;
}) {
  const isSubmitted = variant === "submitted";
  const showRemove = Boolean(onRemove);

  return (
    <div
      className={cn(
        "group/file overflow-hidden border border-gray-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
        FORM_FIELD_RADIUS,
        !isSubmitted && "border-brand/30",
        forceHover && "figma-capture-insight-card-hovered"
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <img
          src={file.previewUrl}
          alt={file.name}
          className="size-full object-cover"
        />
        {file.source === "H5" ? (
          <span className="pointer-events-none absolute left-1.5 top-1.5 z-10 max-w-[calc(100%-0.75rem)] rounded-md bg-sky-600 px-1.5 py-0.5 text-[9px] font-semibold leading-tight text-white shadow-sm">
            Submitted by KOL
          </span>
        ) : null}
        <div className="insight-card-preview-overlay absolute inset-0 flex items-center justify-center gap-2 bg-black/0 transition-colors group-hover/file:bg-black/35">
          <div className="insight-card-preview-actions flex items-center gap-2 opacity-0 transition-opacity group-hover/file:opacity-100">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                window.open(file.previewUrl, "_blank", "noopener,noreferrer");
              }}
              className="inline-flex size-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
              aria-label={`Preview ${file.name}`}
            >
              <Eye size={16} strokeWidth={2} />
            </button>
            {showRemove ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onRemove?.();
                }}
                className="inline-flex size-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                aria-label={`Remove ${file.name}`}
              >
                <Trash2 size={16} strokeWidth={2} />
              </button>
            ) : null}
          </div>
        </div>
      </div>
      <div className="px-2 py-1.5">
        <p className="truncate text-[11px] font-medium text-gray-800">{file.name}</p>
        <p className="text-[10px] text-gray-400">{file.sizeLabel}</p>
      </div>
    </div>
  );
}

function InsightReportImageGrid({
  files,
  variant,
  onRemoveFile,
  hoverCardId,
}: {
  files: InsightReportImage[];
  variant: "submitted" | "draft";
  onRemoveFile?: (fileId: string) => void;
  hoverCardId?: string;
}) {
  if (!files.length) return null;

  return (
    <div className="grid grid-cols-3 gap-2">
      {files.map((file) => (
        <InsightReportImageCard
          key={file.id}
          file={file}
          variant={variant}
          onRemove={onRemoveFile ? () => onRemoveFile(file.id) : undefined}
          forceHover={hoverCardId === file.id}
        />
      ))}
    </div>
  );
}

export function UploadInsightReportDialog({
  open,
  onOpenChange,
  initialFiles,
  submissionLink,
  rowId,
  h5KolId,
  onSubmit,
  figmaCapture = false,
  figmaInsightReportState,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialFiles?: string[];
  submissionLink?: string;
  rowId?: string;
  h5KolId?: string;
  onSubmit: (files: string[]) => void;
  figmaCapture?: boolean;
  figmaInsightReportState?: string;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {open ? (
        <UploadInsightReportSheetPanel
          key={rowId ?? "insight-upload"}
          initialFiles={initialFiles}
          submissionLink={submissionLink}
          rowId={rowId}
          h5KolId={h5KolId}
          onSubmit={onSubmit}
          onOpenChange={onOpenChange}
          figmaCapture={figmaCapture}
          figmaInsightReportState={figmaInsightReportState}
        />
      ) : null}
    </Sheet>
  );
}

function UploadInsightReportSheetPanel({
  onOpenChange,
  initialFiles,
  submissionLink,
  rowId,
  h5KolId,
  onSubmit,
  figmaCapture = false,
  figmaInsightReportState,
}: {
  onOpenChange: (open: boolean) => void;
  initialFiles?: string[];
  submissionLink?: string;
  rowId?: string;
  h5KolId?: string;
  onSubmit: (files: string[]) => void;
  figmaCapture?: boolean;
  figmaInsightReportState?: string;
}) {
  const captureState = figmaCapture
    ? getFigmaCaptureInsightReportState(figmaInsightReportState)
    : null;

  const [webInsightFiles, setWebInsightFiles] = useState<WebInsightFileRecord[]>(() => {
    if (captureState) {
      return captureState.existingFiles.map((file) => ({
        name: file.name,
        previewUrl: file.previewUrl,
        sizeLabel: file.sizeLabel,
      }));
    }
    const h5Files = h5KolId ? getH5PostingState(h5KolId).insightDraftFiles : [];
    return buildInitialWebInsightFiles(initialFiles, h5Files, rowId);
  });
  const [h5InsightFiles, setH5InsightFiles] = useState(() =>
    h5KolId && !figmaCapture ? getH5PostingState(h5KolId).insightDraftFiles : []
  );
  const [pendingFile, setPendingFile] = useState<InsightReportImage | null>(() =>
    captureState?.pendingFile
      ? {
          id: `pending-${captureState.pendingFile.name}`,
          name: captureState.pendingFile.name,
          previewUrl: captureState.pendingFile.previewUrl,
          sizeLabel: captureState.pendingFile.sizeLabel,
          source: captureState.pendingFile.source,
        }
      : null
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string | undefined>(
    captureState?.shareUrl ??
      resolveShareLink(submissionLink, rowId, initialFiles?.length ?? 0)
  );

  useEffect(() => {
    if (figmaCapture || !h5KolId) return;

    return subscribeH5PostingChanges(() => {
      setH5InsightFiles(getH5PostingState(h5KolId).insightDraftFiles);
    });
  }, [figmaCapture, h5KolId]);

  const existingFiles = useMemo(() => {
    if (captureState) {
      return captureState.existingFiles.map((file) => ({
        id: file.name,
        name: file.name,
        previewUrl: file.previewUrl,
        sizeLabel: file.sizeLabel,
        source: file.source,
      }));
    }

    return mergeInsightReportImagesFromRecords(webInsightFiles, h5InsightFiles);
  }, [captureState, h5InsightFiles, webInsightFiles]);

  const existingFileNames = useMemo(
    () =>
      captureState
        ? captureState.existingFiles.map((file) => file.name)
        : mergeInsightReportFileNames(
            webInsightFiles.map((file) => file.name),
            h5InsightFiles
          ),
    [captureState, h5InsightFiles, webInsightFiles]
  );

  const headerShareLink =
    shareLink ??
    (rowId && existingFiles.length > 0 ? buildInsightReportShareUrl(rowId) : undefined);

  const handleRemoveExisting = (fileId: string) => {
    const target = existingFiles.find((file) => file.id === fileId);
    if (!target) return;

    if (target.source === "H5") {
      if (!h5KolId) return;
      const h5FileId = target.id.startsWith("h5-") ? target.id.slice(3) : target.id;
      removeH5InsightFile(h5KolId, h5FileId);
      const nextH5Files = getH5PostingState(h5KolId).insightDraftFiles;
      setH5InsightFiles(nextH5Files);
      const nextNames = mergeInsightReportFileNames(
        webInsightFiles.map((file) => file.name),
        nextH5Files
      );
      setShareLink(resolveShareLink(submissionLink, rowId, nextNames.length));
      onSubmit(nextNames);
      return;
    }

    const nextWebInsightFiles = webInsightFiles.filter((file) => file.name !== target.name);
    setWebInsightFiles(nextWebInsightFiles);
    const nextNames = mergeInsightReportFileNames(
      nextWebInsightFiles.map((file) => file.name),
      h5InsightFiles
    );
    setShareLink(resolveShareLink(submissionLink, rowId, nextNames.length));
    onSubmit(nextNames);
  };

  const handleStageFile = (file: File | null) => {
    if (!file) return;

    if (existingFileNames.includes(file.name) || pendingFile?.name === file.name) {
      setUploadError("This image is already in the list.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      setPendingFile({
        id: `pending-${file.name}`,
        name: file.name,
        previewUrl: reader.result,
        sizeLabel: formatBytes(file.size),
        source: "Web",
      });
      setUploadError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!pendingFile) return;

    const nextWebInsightFiles = [
      ...webInsightFiles,
      {
        name: pendingFile.name,
        previewUrl: pendingFile.previewUrl,
        sizeLabel: pendingFile.sizeLabel,
      },
    ];
    setWebInsightFiles(nextWebInsightFiles);
    setPendingFile(null);
    const nextNames = mergeInsightReportFileNames(
      nextWebInsightFiles.map((file) => file.name),
      h5InsightFiles
    );
    onSubmit(nextNames);
    if (rowId) {
      setShareLink(buildInsightReportShareUrl(rowId));
    }
  };

  return (
    <SheetContent
      side="right"
      className={cn(
        "flex h-full gap-0 bg-white p-0 data-[side=right]:w-full data-[side=right]:max-w-[520px] data-[side=right]:sm:max-w-[520px]",
        figmaCapture && "figma-capture-upload-insight-report-sheet"
      )}
      data-figma-capture={figmaCapture ? "upload-insight-report-dialog" : undefined}
    >
      <SheetHeader className="shrink-0 gap-1.5 border-b border-gray-100 bg-white px-6 py-5 text-left">
        <SheetTitle className="text-[18px] font-semibold text-gray-900">
          Insight Reports
        </SheetTitle>
        <SheetDescription className="text-[13px] leading-relaxed text-gray-500">
          Upload screenshots of your social media posts for this report.
        </SheetDescription>
      </SheetHeader>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="min-w-0 space-y-6">
            {existingFiles.length ? (
              <div className="min-w-0 space-y-2">
                <div className="flex min-w-0 items-center gap-2 overflow-hidden">
                  <p className="shrink-0 text-[13px] font-semibold text-gray-800">Submitted Reports</p>
                  {headerShareLink ? <InsightReportShareLink url={headerShareLink} /> : null}
                </div>
                <InsightReportImageGrid
                  files={existingFiles}
                  variant="submitted"
                  onRemoveFile={handleRemoveExisting}
                  hoverCardId={captureState?.hoverCardId}
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand/80">
                + Add more images
              </p>
              <FileUploadZone
                title="Upload image here."
                hint="Only PNG or JPG supported."
                accept={ACCEPT_INPUT}
                acceptedExtensions={ACCEPTED_EXTENSIONS}
                maxBytes={20 * 1024 * 1024}
                onFileChange={handleStageFile}
                error={uploadError}
                onErrorChange={setUploadError}
                variant="brand"
              />
            </div>

            {pendingFile ? (
              <div className="space-y-2">
                <p className="text-[13px] font-semibold text-gray-800">Drafts</p>
                <InsightReportImageGrid
                  files={[pendingFile]}
                  variant="draft"
                  onRemoveFile={() => setPendingFile(null)}
                />
              </div>
            ) : null}
          </div>
        </div>

        <SheetFooter className="shrink-0 flex-row justify-end gap-2 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="h-9 min-w-[88px] border-gray-200 bg-white text-[13px] font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="brand"
            className="h-9 min-w-[88px] text-[13px]"
            disabled={!pendingFile && !figmaCapture}
            onClick={handleSave}
          >
            Save &amp; Upload
          </Button>
        </SheetFooter>
      </div>
    </SheetContent>
  );
}
