"use client";

import { useEffect, useMemo, useState } from "react";
import { FileUploadZone } from "@/components/FileUploadZone";
import { InsightReportImageGrid } from "@/components/InsightReportImageCard";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getH5PostingState, getAllH5InsightFiles, hydrateInsightFiles, removeH5InsightFile, subscribeH5PostingChanges, type H5InsightFile } from "@/lib/h5PostingSubmissions";
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
  openInsightReportSharePage,
  resolveInsightReportShareHref,
} from "@/lib/postingHubMock";
import {
  getWebInsightFiles,
  setWebInsightFiles as persistWebInsightFiles,
} from "@/lib/webInsightSubmissions";
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
  const displayUrl = resolveInsightReportShareHref(url);

  return (
    <button
      type="button"
      onClick={() => openInsightReportSharePage(url)}
      className="min-w-0 flex-1 truncate text-left text-[12px] font-medium text-brand underline decoration-brand/40 underline-offset-[3px] transition-colors hover:decoration-brand/60"
      title={displayUrl}
    >
      {displayUrl}
    </button>
  );
}

function buildInitialWebInsightFiles(
  initialFiles: string[] | undefined,
  h5Files: H5InsightFile[],
  rowId?: string
): WebInsightFileRecord[] {
  const stored = rowId ? getWebInsightFiles(rowId) : [];
  if (stored.length > 0) {
    const h5Names = new Set(
      h5Files.filter((file) => file.locked !== false).map((file) => file.name)
    );
    return stored.filter((file) => !h5Names.has(file.name));
  }

  return splitInitialWebInsightFileNames(initialFiles, h5Files).map((name) => ({
    name,
    previewUrl: getInsightReportPreviewUrl(rowId ?? "", name),
    sizeLabel: "2.1 KB",
  }));
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
    const h5Files = h5KolId ? getAllH5InsightFiles(getH5PostingState(h5KolId)) : [];
    return buildInitialWebInsightFiles(initialFiles, h5Files, rowId);
  });
  const [h5InsightFiles, setH5InsightFiles] = useState(() =>
    h5KolId && !figmaCapture ? getAllH5InsightFiles(getH5PostingState(h5KolId)) : []
  );
  const [pendingFiles, setPendingFiles] = useState<InsightReportImage[]>(() =>
    captureState?.pendingFile
      ? [
          {
            id: `pending-${captureState.pendingFile.name}`,
            name: captureState.pendingFile.name,
            previewUrl: captureState.pendingFile.previewUrl,
            sizeLabel: captureState.pendingFile.sizeLabel,
            source: captureState.pendingFile.source,
          },
        ]
      : []
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string | undefined>(
    captureState?.shareUrl ??
      resolveShareLink(submissionLink, rowId, initialFiles?.length ?? 0)
  );

  useEffect(() => {
    if (figmaCapture || !h5KolId) return;

    const syncH5InsightFiles = async () => {
      const files = getAllH5InsightFiles(getH5PostingState(h5KolId));
      setH5InsightFiles(await hydrateInsightFiles(files));
    };

    void syncH5InsightFiles();
    return subscribeH5PostingChanges(() => {
      void syncH5InsightFiles();
    });
  }, [figmaCapture, h5KolId]);

  const existingFiles = useMemo(() => {
    if (captureState) {
      return captureState.existingFiles.map((file, index) => ({
        id: `capture-${index}-${file.name}`,
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
      const nextH5Files = getAllH5InsightFiles(getH5PostingState(h5KolId));
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
    if (rowId) {
      persistWebInsightFiles(rowId, nextWebInsightFiles);
    }
    const nextNames = mergeInsightReportFileNames(
      nextWebInsightFiles.map((file) => file.name),
      h5InsightFiles
    );
    setShareLink(resolveShareLink(submissionLink, rowId, nextNames.length));
    onSubmit(nextNames);
  };

  const handleStageFiles = (files: File[]) => {
    if (!files.length) return;

    const pendingNames = new Set(pendingFiles.map((file) => file.name));
    const validFiles = files.filter(
      (file) => !existingFileNames.includes(file.name) && !pendingNames.has(file.name)
    );
    const skippedCount = files.length - validFiles.length;

    if (!validFiles.length) {
      setUploadError(
        skippedCount === 1
          ? "This image is already in the list."
          : "These images are already in the list."
      );
      return;
    }

    const readers = validFiles.map(
      (file) =>
        new Promise<InsightReportImage>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result !== "string") {
              reject(new Error("Failed to read file."));
              return;
            }
            resolve({
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
              name: file.name,
              previewUrl: reader.result,
              sizeLabel: formatBytes(file.size),
              source: "Web",
            });
          };
          reader.onerror = () => reject(new Error("Failed to read file."));
          reader.readAsDataURL(file);
        })
    );

    void Promise.all(readers)
      .then((nextPendingFiles) => {
        setPendingFiles((current) => [...current, ...nextPendingFiles]);
        if (skippedCount > 0) {
          setUploadError(
            skippedCount === 1
              ? "1 duplicate image was skipped."
              : `${skippedCount} duplicate images were skipped.`
          );
          return;
        }
        setUploadError(null);
      })
      .catch(() => {
        setUploadError("Failed to read one or more images. Please try again.");
      });
  };

  const handleRemovePending = (fileId: string) => {
    setPendingFiles((current) => current.filter((file) => file.id !== fileId));
  };

  const handleSave = () => {
    if (!pendingFiles.length) return;

    const nextWebInsightFiles = [
      ...webInsightFiles,
      ...pendingFiles.map(({ name, previewUrl, sizeLabel }) => ({
        name,
        previewUrl,
        sizeLabel,
      })),
    ];
    setWebInsightFiles(nextWebInsightFiles);
    if (rowId) {
      persistWebInsightFiles(rowId, nextWebInsightFiles);
    }
    setPendingFiles([]);
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
        <SheetTitle className="text-[18px] font-semibold text-gray-900">Insight Reports</SheetTitle>
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
              <p className="text-[13px] font-semibold text-gray-800">More Images</p>
              <FileUploadZone
                title="Upload images here."
                hint="PNG or JPG. Select or drop multiple files at once."
                accept={ACCEPT_INPUT}
                acceptedExtensions={ACCEPTED_EXTENSIONS}
                maxBytes={20 * 1024 * 1024}
                multiple
                onFilesChange={handleStageFiles}
                error={uploadError}
                onErrorChange={setUploadError}
                variant="brand"
              />
            </div>

            {pendingFiles.length ? (
              <div className="space-y-2">
                <p className="text-[13px] font-semibold text-gray-800">
                  Drafts
                  <span className="ml-1.5 text-[12px] font-medium tabular-nums text-gray-400">
                    ({pendingFiles.length})
                  </span>
                </p>
                <InsightReportImageGrid
                  files={pendingFiles}
                  variant="draft"
                  onRemoveFile={handleRemovePending}
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
            disabled={!pendingFiles.length && !figmaCapture}
            onClick={handleSave}
          >
            {pendingFiles.length > 1
              ? `Save & Upload (${pendingFiles.length})`
              : "Save & Upload"}
          </Button>
        </SheetFooter>
      </div>
    </SheetContent>
  );
}
