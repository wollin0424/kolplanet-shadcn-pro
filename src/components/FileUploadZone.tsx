"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { FileText, RefreshCcw, Upload, X } from "@/lib/icons";
import { cn } from "@/lib/utils";

export type FileUploadZoneVariant = "amber" | "brand";

const variantStyles: Record<
  FileUploadZoneVariant,
  {
    zone: string;
    zoneActive: string;
    iconBox: string;
    title: string;
    optionalZone: string;
    optionalZoneActive: string;
    optionalIconBox: string;
    optionalTitle: string;
  }
> = {
  amber: {
    zone: "border-amber-200/90 bg-amber-50/30 hover:border-amber-300 hover:bg-amber-50/50",
    zoneActive: "border-amber-300 bg-amber-50/80",
    iconBox: "border-amber-100 text-amber-600",
    title: "text-amber-800",
    optionalZone:
      "border-gray-200 bg-gray-50/60 hover:border-gray-300 hover:bg-gray-50",
    optionalZoneActive: "border-gray-300 bg-gray-50",
    optionalIconBox: "border-gray-200 text-gray-500",
    optionalTitle: "text-gray-700",
  },
  brand: {
    zone: "border-brand/25 bg-brand-50/35 hover:border-brand/35 hover:bg-brand-50/55",
    zoneActive: "border-brand/40 bg-brand-50/60",
    iconBox: "border-brand-100 text-brand",
    title: "text-brand",
    optionalZone:
      "border-gray-200 bg-gray-50/60 hover:border-gray-300 hover:bg-gray-50",
    optionalZoneActive: "border-gray-300 bg-gray-50",
    optionalIconBox: "border-gray-200 text-gray-500",
    optionalTitle: "text-gray-700",
  },
};

function validateFile(
  file: File,
  acceptedExtensions: string[],
  maxBytes: number
): string | null {
  const name = file.name.toLowerCase();
  if (!acceptedExtensions.some((ext) => name.endsWith(ext.toLowerCase()))) {
    return `Only ${acceptedExtensions.join(", ")} files are supported.`;
  }
  if (file.size > maxBytes) {
    const mb = Math.round(maxBytes / (1024 * 1024));
    return `File must be ${mb}MB or smaller.`;
  }
  return null;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageFile(file: File) {
  return file.type.startsWith("image/") || /\.(png|jpe?g|gif|webp)$/i.test(file.name);
}

function CompactUploadedFileCard({
  file,
  previewUrl,
  disabled,
  onReplace,
  onRemove,
}: {
  file: File;
  previewUrl: string | null;
  disabled?: boolean;
  onReplace: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-dashed border-gray-200 bg-white px-3 py-2.5">
      {previewUrl ? (
        <img
          src={previewUrl}
          alt={file.name}
          className="size-10 shrink-0 rounded-md border border-gray-100 object-cover"
        />
      ) : (
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-gray-100 bg-gray-50 text-gray-500">
          <FileText size={16} strokeWidth={2} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] text-gray-800">{file.name}</p>
        <p className="mt-0.5 text-[11px] text-gray-400">{formatFileSize(file.size)}</p>
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          disabled={disabled}
          onClick={onReplace}
          className="inline-flex size-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
          aria-label="Replace file"
        >
          <RefreshCcw size={14} strokeWidth={2} />
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onRemove}
          className="inline-flex size-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
          aria-label="Remove file"
        >
          <X size={14} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

export function FileUploadZone({
  title,
  hint,
  subHint,
  accept,
  acceptedExtensions = [],
  maxBytes = 10 * 1024 * 1024,
  file,
  onFileChange,
  multiple = false,
  onFilesChange,
  error,
  onErrorChange,
  badge,
  variant = "amber",
  optional = false,
  optionalHint = "Upload to auto-fill the fields below, or enter them manually.",
  compact = false,
  compactEmphasis = "deemphasized",
  className,
  disabled = false,
}: {
  title: string;
  hint: string;
  subHint?: string;
  accept?: string;
  acceptedExtensions?: string[];
  maxBytes?: number;
  file?: File | null;
  onFileChange?: (file: File | null) => void;
  multiple?: boolean;
  onFilesChange?: (files: File[]) => void;
  error?: string | null;
  onErrorChange?: (error: string | null) => void;
  badge?: ReactNode;
  variant?: FileUploadZoneVariant;
  optional?: boolean;
  optionalHint?: string;
  compact?: boolean;
  compactEmphasis?: "deemphasized" | "selected";
  className?: string;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [internalFile, setInternalFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const styles = variantStyles[variant];
  const resolvedFile = file !== undefined ? file : internalFile;

  const setResolvedFile = useCallback(
    (next: File | null) => {
      if (file === undefined) setInternalFile(next);
      onFileChange?.(next);
    },
    [file, onFileChange]
  );

  useEffect(() => {
    if (!resolvedFile || !isImageFile(resolvedFile)) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(resolvedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [resolvedFile]);

  const applyFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList?.length) {
        if (!multiple) {
          setResolvedFile(null);
          onErrorChange?.(null);
        }
        return;
      }

      if (multiple && onFilesChange) {
        const valid: File[] = [];
        let firstError: string | null = null;
        for (const next of Array.from(fileList)) {
          const validationError = validateFile(next, acceptedExtensions, maxBytes);
          if (validationError) {
            if (!firstError) firstError = validationError;
            continue;
          }
          valid.push(next);
        }
        if (valid.length) {
          onFilesChange(valid);
          onErrorChange?.(firstError);
          return;
        }
        onErrorChange?.(firstError ?? "No valid files selected.");
        return;
      }

      const next = fileList[0] ?? null;
      if (!next) {
        setResolvedFile(null);
        onErrorChange?.(null);
        return;
      }
      const validationError = validateFile(next, acceptedExtensions, maxBytes);
      if (validationError) {
        setResolvedFile(null);
        onErrorChange?.(validationError);
        return;
      }
      setResolvedFile(next);
      onErrorChange?.(null);
    },
    [
      acceptedExtensions,
      maxBytes,
      multiple,
      onFilesChange,
      onErrorChange,
      setResolvedFile,
    ]
  );

  return (
    <div className={cn("space-y-1.5", className)}>
      {optional && compact ? (
        <>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            className="sr-only"
            onChange={(e) => {
              applyFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <div
            className={cn(
              "rounded-lg border border-dashed px-3 py-3",
              compactEmphasis === "selected"
                ? "border-brand/25 bg-brand-50/30"
                : "border-gray-200/90 bg-gray-50/40"
            )}
          >
            {compactEmphasis === "deemphasized" ? (
              <span className="inline-flex rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                Optional shortcut
              </span>
            ) : (
              <span className="inline-flex rounded-md bg-brand/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand">
                Auto-fill
              </span>
            )}
            <p className="mt-2 text-[12px] leading-relaxed text-gray-600">
              {compactEmphasis === "selected" ? (
                <>
                  Upload your document and we&apos;ll auto-fill the fields below.{" "}
                  <span className="font-medium text-gray-700">Review and complete any missing info.</span>
                </>
              ) : (
                <>
                  Upload a document to auto-fill fields below.{" "}
                  <span className="font-medium text-gray-700">You can skip this and type manually.</span>
                </>
              )}
            </p>
            {resolvedFile ? (
              <div className="mt-3">
                <CompactUploadedFileCard
                  file={resolvedFile}
                  previewUrl={previewUrl}
                  disabled={disabled}
                  onReplace={() => inputRef.current?.click()}
                  onRemove={() => {
                    setResolvedFile(null);
                    onErrorChange?.(null);
                  }}
                />
              </div>
            ) : (
              <button
                type="button"
                disabled={disabled}
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (!disabled) setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  if (!disabled) applyFiles(e.dataTransfer.files);
                }}
                className={cn(
                  "mt-3 inline-flex max-w-full items-center gap-1.5 rounded-md text-[13px] font-medium text-brand transition-colors hover:text-brand/80 disabled:opacity-50",
                  dragOver && "underline"
                )}
              >
                <Upload size={14} strokeWidth={2} />
                <span className="truncate">Upload {title}</span>
              </button>
            )}
            <p className="mt-1.5 text-[11px] text-gray-400">{hint}</p>
          </div>
          {error ? <p className="text-[12px] text-red-600">{error}</p> : null}
        </>
      ) : (
        <>
      {optional ? (
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-[13px] font-medium text-gray-800">{title}</span>
            <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-500">
              Optional
            </span>
          </div>
          <p className="text-[11px] leading-relaxed text-gray-400">{optionalHint}</p>
        </div>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => {
          applyFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (!disabled) applyFiles(e.dataTransfer.files);
        }}
        className={cn(
          "w-full rounded-lg border border-dashed p-4 text-left transition-colors",
          disabled && "cursor-not-allowed opacity-60",
          dragOver
            ? optional
              ? styles.optionalZoneActive
              : styles.zoneActive
            : optional
              ? styles.optionalZone
              : styles.zone
        )}
      >
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-white",
              optional ? styles.optionalIconBox : styles.iconBox
            )}
          >
            <Upload size={18} strokeWidth={2} />
          </span>
            <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "text-[13px]",
                  optional ? "font-medium" : "font-semibold",
                  optional ? styles.optionalTitle : styles.title,
                  resolvedFile && "min-w-0 truncate"
                )}
              >
                {resolvedFile?.name ?? (optional ? "Choose file to upload" : title)}
              </span>
              {badge}
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-gray-500">{hint}</p>
            {subHint ? (
              <p className="mt-1 text-[11px] leading-relaxed text-gray-400">{subHint}</p>
            ) : null}
          </div>
        </div>
      </button>
      {error ? <p className="text-[12px] text-red-600">{error}</p> : null}
        </>
      )}
    </div>
  );
}
