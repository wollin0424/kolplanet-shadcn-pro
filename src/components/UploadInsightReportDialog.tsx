"use client";

import { useState } from "react";
import { FileUploadZone } from "@/components/FileUploadZone";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { FileText, Paperclip, Trash2 } from "@/lib/icons";

const ACCEPT_INPUT = ".pdf,.xlsx,.csv,.ppt,.pptx,image/*";

export function UploadInsightReportDialog({
  open,
  onOpenChange,
  initialFiles,
  onSubmit,
  figmaCapture = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialFiles?: string[];
  onSubmit: (files: string[]) => void;
  figmaCapture?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <UploadInsightReportDialogPanel
          key={JSON.stringify(initialFiles ?? [])}
          initialFiles={initialFiles}
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
  onSubmit,
  figmaCapture = false,
}: {
  onOpenChange: (open: boolean) => void;
  initialFiles?: string[];
  onSubmit: (files: string[]) => void;
  figmaCapture?: boolean;
}) {
  const [existingFiles, setExistingFiles] = useState<string[]>(initialFiles ?? []);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [stagedFile, setStagedFile] = useState<File | null>(null);

  const initialKey = JSON.stringify(initialFiles ?? []);
  const currentKey = JSON.stringify([
    ...existingFiles,
    ...pendingFiles.map((file) => file.name),
  ]);
  const hasChanges = currentKey !== initialKey;

  const handleStageFile = (file: File | null) => {
    setStagedFile(file);
    if (!file) return;

    const nextName = file.name;
    const alreadyListed =
      existingFiles.includes(nextName) || pendingFiles.some((item) => item.name === nextName);

    if (alreadyListed) {
      setUploadError("This file is already in the list.");
      setStagedFile(null);
      return;
    }

    setPendingFiles((prev) => [...prev, file]);
    setStagedFile(null);
    setUploadError(null);
  };

  const handleSave = () => {
    if (!hasChanges) return;
    onSubmit([...existingFiles, ...pendingFiles.map((file) => file.name)]);
    onOpenChange(false);
  };

  return (
    <DialogContent
        className="gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-[520px]"
        showCloseButton
        data-figma-capture={figmaCapture ? "upload-insight-report-dialog" : undefined}
      >
        <div className="border-b border-gray-100 bg-gradient-to-b from-gray-50/80 to-white px-6 pt-6 pb-5">
          <div className="flex items-start gap-3 pr-6">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand ring-1 ring-brand/10">
              <FileText size={18} strokeWidth={2} />
            </span>
            <div className="min-w-0 pt-0.5">
              <DialogTitle className="text-base font-semibold text-gray-900">
                Insight Reports Panel
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm text-gray-500">
                Add files to append to the current insight report set.
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="max-h-[min(56vh,460px)] space-y-5 overflow-y-auto px-6 py-5">
          <section className="space-y-2.5">
            <h3 className="text-[11px] font-semibold tracking-wide text-brand uppercase">
              Existing Files
            </h3>
            <div
              className={cn(
                "rounded-lg border border-dashed border-gray-200 bg-gray-50/40 px-3 py-3",
                existingFiles.length === 0 && "py-6 text-center"
              )}
            >
              {existingFiles.length ? (
                <ul className="space-y-2">
                  {existingFiles.map((fileName) => (
                    <li key={fileName} className="flex items-center gap-2">
                      <Paperclip size={14} strokeWidth={2} className="shrink-0 text-gray-400" />
                      <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-gray-800">
                        {fileName}
                      </span>
                      <button
                        type="button"
                        className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50"
                        aria-label={`Remove ${fileName}`}
                        onClick={() =>
                          setExistingFiles((prev) => prev.filter((name) => name !== fileName))
                        }
                      >
                        <Trash2 size={14} strokeWidth={2} />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[13px] text-gray-400">No insight files uploaded yet.</p>
              )}
            </div>
          </section>

          <section className="space-y-2.5">
            <h3 className="text-[11px] font-semibold tracking-wide text-brand uppercase">
              + Add More File
            </h3>
            <FileUploadZone
              title="Drag and drop files here, or click to browse."
              hint="Uploads append to the existing list. To replace a file, delete it first."
              accept={ACCEPT_INPUT}
              acceptedExtensions={[".pdf", ".xlsx", ".csv", ".ppt", ".pptx", ".png", ".jpg", ".jpeg"]}
              maxBytes={20 * 1024 * 1024}
              file={stagedFile}
              onFileChange={handleStageFile}
              error={uploadError}
              onErrorChange={setUploadError}
              variant="brand"
            />

            {pendingFiles.length ? (
              <ul className="space-y-2 rounded-lg border border-gray-100 bg-white px-3 py-2.5">
                {pendingFiles.map((file) => (
                  <li key={file.name} className="flex items-center gap-2">
                    <Paperclip size={14} strokeWidth={2} className="shrink-0 text-gray-400" />
                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-gray-800">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50"
                      aria-label={`Remove ${file.name}`}
                      onClick={() =>
                        setPendingFiles((prev) => prev.filter((item) => item.name !== file.name))
                      }
                    >
                      <Trash2 size={14} strokeWidth={2} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="h-9 px-4 text-[13px]"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="brand"
            className="h-9 px-4 text-[13px]"
            disabled={!hasChanges}
            onClick={handleSave}
          >
            Save &amp; Upload
          </Button>
        </div>
      </DialogContent>
  );
}
