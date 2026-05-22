"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { FileUploadZone } from "@/components/FileUploadZone";
import { Button } from "@/components/ui/button";
import { IconDownload } from "@/lib/icons";

const ACCEPT_INPUT =
  ".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv";

export default function ImportLogisticsTemplateSheet({
  open,
  onOpenChange,
  onImport,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport?: (file: File) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setFile(null);
    setError(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleImport = () => {
    if (!file) return;
    onImport?.(file);
    console.log("Import logistics template:", file.name);
    handleOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full gap-0 p-0 data-[side=right]:w-full data-[side=right]:max-w-[480px] data-[side=right]:sm:max-w-[480px]"
      >
        <SheetHeader className="shrink-0 gap-1.5 border-b border-gray-100 px-6 py-5 text-left">
          <SheetTitle className="text-[18px] font-semibold text-gray-900">
            Import Logistics Template
          </SheetTitle>
          <SheetDescription className="text-[13px] leading-relaxed text-gray-500">
            Upload a completed logistics template to batch update shipping execution
            details.
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-[13px] text-gray-600">
                Step 1: Download the standard logistics template.
              </p>
              <Button
                type="button"
                variant="outline"
                className="h-9 gap-1.5 border-brand/30 bg-white text-[13px] font-medium text-brand hover:border-brand/50 hover:bg-brand-50/50 hover:text-brand"
                onClick={() => console.log("Download logistics template")}
              >
                <IconDownload size={15} />
                Download Template
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-[13px] text-gray-600">
                Step 2: Upload the completed template.
              </p>
              <FileUploadZone
                title="Upload File"
                hint="Drop file or click to upload — Supports .xlsx, .csv. Max 10MB."
                accept={ACCEPT_INPUT}
                acceptedExtensions={[".xlsx", ".csv"]}
                maxBytes={10 * 1024 * 1024}
                file={file}
                onFileChange={setFile}
                error={error}
                onErrorChange={setError}
                variant="amber"
              />
            </div>
          </div>
        </div>

        <SheetFooter className="shrink-0 flex-row justify-between gap-3 border-t border-gray-100 bg-white px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="h-9 min-w-[88px] text-[13px]"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="brand"
            className="h-9 min-w-[88px] text-[13px]"
            disabled={!file}
            onClick={handleImport}
          >
            Import
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
