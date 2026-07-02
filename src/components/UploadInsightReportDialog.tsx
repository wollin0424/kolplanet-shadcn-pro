"use client";

import { useState } from "react";
import { FileUploadZone } from "@/components/FileUploadZone";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, Paperclip, Trash2 } from "@/lib/icons";
import { buildInsightReportFilePreviewUrl, buildInsightReportShareUrl } from "@/lib/postingHubMock";

const ACCEPT_INPUT = ".pdf,.xlsx,.csv,.ppt,.pptx,image/*";

const ACCEPTED_EXTENSIONS = [
  ".pdf",
  ".xlsx",
  ".csv",
  ".ppt",
  ".pptx",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
];

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

export function UploadInsightReportDialog({
  open,
  onOpenChange,
  initialFiles,
  submissionLink,
  rowId,
  onSubmit,
  figmaCapture = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialFiles?: string[];
  submissionLink?: string;
  rowId?: string;
  onSubmit: (files: string[]) => void;
  figmaCapture?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <UploadInsightReportDialogPanel
          key={rowId ?? "insight-upload"}
          initialFiles={initialFiles}
          submissionLink={submissionLink}
          rowId={rowId}
          onSubmit={onSubmit}
          onOpenChange={onOpenChange}
          figmaCapture={figmaCapture}
        />
      ) : null}
    </Dialog>
  );
}

function UploadInsightReportDialogPanel({
  onOpenChange,
  initialFiles,
  submissionLink,
  rowId,
  onSubmit,
  figmaCapture = false,
}: {
  onOpenChange: (open: boolean) => void;
  initialFiles?: string[];
  submissionLink?: string;
  rowId?: string;
  onSubmit: (files: string[]) => void;
  figmaCapture?: boolean;
}) {
  const [existingFiles, setExistingFiles] = useState<string[]>(initialFiles ?? []);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string | undefined>(
    resolveShareLink(submissionLink, rowId, initialFiles?.length ?? 0)
  );

  const headerShareLink =
    shareLink ??
    (rowId && existingFiles.length > 0 ? buildInsightReportShareUrl(rowId) : undefined);

  const handleRemoveExisting = (fileName: string) => {
    const nextFiles = existingFiles.filter((name) => name !== fileName);
    setExistingFiles(nextFiles);
    setShareLink(resolveShareLink(submissionLink, rowId, nextFiles.length));
    onSubmit(nextFiles);
  };

  const handleStageFile = (file: File | null) => {
    if (!file) return;

    if (existingFiles.includes(file.name)) {
      setUploadError("This file is already in the list.");
      return;
    }

    setPendingFile(file);
    setUploadError(null);
  };

  const handleSave = () => {
    if (!pendingFile) return;

    const nextFiles = [...existingFiles, pendingFile.name];
    setExistingFiles(nextFiles);
    setPendingFile(null);
    onSubmit(nextFiles);
    if (rowId) {
      setShareLink(buildInsightReportShareUrl(rowId));
    }
  };

  return (
    <DialogContent
      className="min-w-0 gap-0 overflow-hidden p-0 sm:max-w-[520px]"
      showCloseButton
      data-figma-capture={figmaCapture ? "upload-insight-report-dialog" : undefined}
    >
      <DialogHeader className="gap-1.5 border-b border-gray-100 px-6 py-5 text-left">
        <DialogTitle className="text-[18px] font-semibold text-gray-900">
          Insight Reports Panel
        </DialogTitle>
        <DialogDescription className="text-[13px] leading-relaxed text-gray-500">
          Add files to append to the current insight report set.
        </DialogDescription>
      </DialogHeader>

      <div className="mt-[24px] mb-[24px] min-w-0 max-h-[min(52vh,420px)] overflow-y-auto px-6 py-2">
        <div className="min-w-0 space-y-6">
          {existingFiles.length ? (
            <div className="min-w-0 space-y-2">
              <div className="flex min-w-0 items-center gap-2 overflow-hidden">
                <p className="shrink-0 text-[13px] font-semibold text-gray-800">Existing files</p>
                {headerShareLink ? <InsightReportShareLink url={headerShareLink} /> : null}
              </div>
              <ul className="min-w-0 space-y-2 overflow-hidden rounded-lg border border-gray-100 bg-gray-50/40 px-3 py-2.5">
                {existingFiles.map((fileName) => (
                  <li key={fileName} className="flex min-w-0 items-center gap-2 overflow-hidden">
                    <Paperclip size={14} strokeWidth={2} className="shrink-0 text-gray-400" />
                    <span
                      className="min-w-0 flex-1 truncate text-[13px] font-medium text-gray-800"
                      title={fileName}
                    >
                      {fileName}
                    </span>
                    {rowId ? (
                      <button
                        type="button"
                        className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                        aria-label={`Preview ${fileName}`}
                        onClick={() =>
                          window.open(
                            buildInsightReportFilePreviewUrl(rowId, fileName),
                            "_blank",
                            "noopener,noreferrer"
                          )
                        }
                      >
                        <Eye size={14} strokeWidth={2} />
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50"
                      aria-label={`Remove ${fileName}`}
                      onClick={() => handleRemoveExisting(fileName)}
                    >
                      <Trash2 size={14} strokeWidth={2} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="space-y-2">
            <p className="text-[13px] font-semibold text-gray-800">Add more file</p>
            <FileUploadZone
              title="Upload File"
              hint="Drag and drop files here, or click to browse."
              subHint="Uploads append to the existing list. To replace a file, delete it first."
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
              <p className="text-[13px] font-semibold text-gray-800">Pending uploads</p>
              <ul className="min-w-0 overflow-hidden rounded-lg border border-gray-100 bg-white px-3 py-2.5">
                <li className="flex min-w-0 items-center gap-2 overflow-hidden">
                  <Paperclip size={14} strokeWidth={2} className="shrink-0 text-gray-400" />
                  <span
                    className="min-w-0 flex-1 truncate text-[13px] font-medium text-gray-800"
                    title={pendingFile.name}
                  >
                    {pendingFile.name}
                  </span>
                  <button
                    type="button"
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50"
                    aria-label={`Remove ${pendingFile.name}`}
                    onClick={() => setPendingFile(null)}
                  >
                    <Trash2 size={14} strokeWidth={2} />
                  </button>
                </li>
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      <DialogFooter className="-mx-0 -mb-0 rounded-none border-t border-gray-100 bg-white px-6 py-4">
        <div className="flex w-full flex-row items-center justify-end gap-3">
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
            disabled={!pendingFile}
            onClick={handleSave}
          >
            Save &amp; Upload
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  );
}
