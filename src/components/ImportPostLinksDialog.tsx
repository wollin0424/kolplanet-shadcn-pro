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
import { Check, Download, X } from "@/lib/icons";

const ACCEPT_INPUT =
  ".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv";

type ImportPhase = "upload" | "loading" | "result";

type ImportResult = {
  total: number;
  valid: number;
  invalid: number;
};

type ParseOutcome =
  | { kind: "empty" }
  | { kind: "result"; result: ImportResult };

const EMPTY_TEMPLATE_MESSAGE = "No records found in the uploaded template.";

/** Prototype delay — replace with real upload/validate API. */
function mockImportDelay() {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, 1600);
  });
}

/** Prototype parser — replace with real import API. */
function parseImport(file: File): ParseOutcome {
  if (file.size === 0 || file.name.toLowerCase().includes("empty")) {
    return { kind: "empty" };
  }
  return { kind: "result", result: { total: 1, valid: 0, invalid: 1 } };
}

function ImportLoadingPanel() {
  return (
    <div
      className="flex min-h-[280px] flex-col items-center justify-center px-4 py-10 text-center"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span
        className="mb-6 inline-block size-10 animate-spin rounded-full border-[3px] border-brand/20 border-t-brand"
        aria-hidden
      />
      <p className="text-base font-semibold text-gray-900">Uploading and validating data...</p>
      <p className="mt-2 text-[13px] text-gray-500">Please do not close this window.</p>
    </div>
  );
}

function ImportErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-[13px] font-medium text-red-700"
    >
      {message}
    </div>
  );
}

function ImportResultPanel({ result }: { result: ImportResult }) {
  const hasErrors = result.invalid > 0;

  return (
    <div className="flex flex-col items-center px-2 pt-1 pb-1 text-center">
      <h3 className="text-base font-semibold text-gray-900">Import Result</h3>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[13px] text-gray-700">
        <span>
          Total: <span className="font-semibold tabular-nums">{result.total}</span>
        </span>
        <span className="text-gray-300" aria-hidden>
          |
        </span>
        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
          <Check size={14} strokeWidth={2.5} />
          Valid: <span className="tabular-nums">{result.valid}</span>
        </span>
        <span className="text-gray-300" aria-hidden>
          |
        </span>
        <span className="inline-flex items-center gap-1 font-semibold text-red-600">
          <X size={14} strokeWidth={2.5} />
          Invalid: <span className="tabular-nums">{result.invalid}</span>
        </span>
      </div>
      <p className="mt-4 max-w-[360px] text-[13px] leading-relaxed text-gray-500">
        {hasErrors
          ? "Some rows contain errors. Please download the error report, fix the issues, and re-upload."
          : "All rows were imported successfully."}
      </p>
    </div>
  );
}

export function ImportPostLinksDialog({
  open,
  onOpenChange,
  onImport,
  figmaCapture = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport?: (file: File) => void;
  figmaCapture?: boolean;
}) {
  const [phase, setPhase] = useState<ImportPhase>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  const reset = () => {
    setPhase("upload");
    setFile(null);
    setError(null);
    setImportError(null);
    setResult(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next && phase === "loading") return;
    if (!next) reset();
    onOpenChange(next);
  };

  const handleFileChange = async (next: File | null) => {
    setFile(next);
    setImportError(null);
    if (!next) return;

    setPhase("loading");
    await mockImportDelay();

    const outcome = parseImport(next);
    if (outcome.kind === "empty") {
      setPhase("upload");
      setImportError(EMPTY_TEMPLATE_MESSAGE);
      return;
    }

    setResult(outcome.result);
    setPhase("result");
    if (outcome.result.invalid === 0) {
      onImport?.(next);
    }
  };

  const handleGotIt = () => {
    handleOpenChange(false);
  };

  const handleDownloadErrorReport = () => {
    console.log("Download post links import error report");
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="gap-0 overflow-hidden p-0 sm:max-w-[520px]"
        showCloseButton={phase !== "loading"}
        data-figma-capture={figmaCapture ? "import-post-links-dialog" : undefined}
      >
        <DialogHeader className="gap-1.5 border-b border-gray-100 px-6 py-5 text-left">
          <DialogTitle className="text-[18px] font-semibold text-gray-900">
            Import Post Links
          </DialogTitle>
          <DialogDescription className="text-[13px] leading-relaxed text-gray-500">
            Upload the completed file to batch import post links.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-[24px] mb-[24px] px-6 py-2">
          {phase === "loading" ? (
            <ImportLoadingPanel />
          ) : phase === "upload" ? (
            <div className="space-y-6">
              <div className="mt-[9px] space-y-2">
                <p className="text-[13px] font-semibold text-gray-800">
                  Step 1: Download the standard posting template.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 gap-1.5 border-brand/30 bg-white text-[13px] font-medium text-brand hover:border-brand/50 hover:bg-brand-50/50 hover:text-brand"
                  onClick={() => console.log("Download posting template")}
                >
                  <Download size={15} />
                  Download Template
                </Button>
              </div>

              <div className="space-y-2">
                <p className="text-[13px] font-semibold text-gray-800">
                  Step 2: Upload the completed file.
                </p>
                <FileUploadZone
                  title="Upload File"
                  hint="Drag and drop Excel/CSV file here"
                  accept={ACCEPT_INPUT}
                  acceptedExtensions={[".xlsx", ".csv"]}
                  maxBytes={10 * 1024 * 1024}
                  file={file}
                  onFileChange={(next) => {
                    void handleFileChange(next);
                  }}
                  error={error}
                  onErrorChange={(msg) => {
                    setError(msg);
                    if (msg) setImportError(null);
                  }}
                  variant="brand"
                />
                {importError ? <ImportErrorBanner message={importError} /> : null}
              </div>
            </div>
          ) : result ? (
            <ImportResultPanel result={result} />
          ) : null}
        </div>

        {phase === "result" ? (
          <DialogFooter className="-mx-0 -mb-0 rounded-none border-t border-gray-100 bg-white px-6 py-4">
            <div className="flex w-full flex-row items-center justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-9 min-w-[88px] border-gray-200 bg-white text-[13px] font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800"
                onClick={handleGotIt}
              >
                Got it
              </Button>
              {result && result.invalid > 0 ? (
                <Button
                  type="button"
                  variant="brand"
                  className="h-9 gap-1.5 text-[13px]"
                  onClick={handleDownloadErrorReport}
                >
                  <Download size={15} />
                  Download Error Report
                </Button>
              ) : null}
            </div>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
