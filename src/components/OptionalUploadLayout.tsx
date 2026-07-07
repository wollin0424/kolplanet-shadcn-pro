import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type EntryMode = "manual" | "upload";

export function EntryModeSwitch({
  mode,
  onModeChange,
  manualLabel = "Fill manually",
  uploadLabel = "Upload document",
  className,
}: {
  mode: EntryMode;
  onModeChange: (mode: EntryMode) => void;
  manualLabel?: string;
  uploadLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-[12px] leading-relaxed text-gray-500">
        Choose how to provide this information — uploading is optional.
      </p>
      <div
        className="grid grid-cols-2 gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1"
        role="tablist"
        aria-label="Information entry method"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "manual"}
          onClick={() => onModeChange("manual")}
          className={cn(
            "rounded-md px-3 py-2.5 text-[13px] font-medium transition-colors",
            mode === "manual"
              ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200/80"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          {manualLabel}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "upload"}
          onClick={() => onModeChange("upload")}
          className={cn(
            "rounded-md px-3 py-2.5 text-[13px] font-medium transition-colors",
            mode === "upload"
              ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200/80"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          {uploadLabel}
        </button>
      </div>
    </div>
  );
}

export function OptionalUploadOrDivider() {
  return (
    <div
      className="flex items-center gap-3 py-1"
      role="separator"
      aria-label="or enter manually"
    >
      <div className="h-px flex-1 bg-gray-200" />
      <span className="shrink-0 text-[11px] font-medium uppercase tracking-wide text-gray-400">
        or enter manually
      </span>
      <div className="h-px flex-1 bg-gray-200" />
    </div>
  );
}

export function ManualEntrySection({
  children,
  description = "Complete the required fields below. Uploading a document is optional.",
}: {
  children: ReactNode;
  description?: string;
}) {
  return (
    <section className="space-y-5">
      <div>
        <p className="text-[13px] font-medium text-gray-900">Enter details manually</p>
        <p className="mt-1 text-[11px] leading-relaxed text-gray-500">{description}</p>
      </div>
      {children}
    </section>
  );
}
