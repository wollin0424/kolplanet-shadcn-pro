"use client";

import { useCallback, useEffect, useRef, useState, type DragEvent, type ReactNode } from "react";
import { FileText, RefreshCcw, Sparkles, Upload, X } from "@/lib/icons";
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

/** AI auto-fill affordances — amber across the product (Sparkles, AI Fast Fill). */
const compactAiIconClass = "border-amber-100/80 bg-amber-50/90 text-amber-600";
const compactAiShellActiveClass = "border-amber-200/80 bg-amber-50/40";

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
  dense = false,
  variant = "amber",
}: {
  file: File;
  previewUrl: string | null;
  disabled?: boolean;
  onReplace: () => void;
  onRemove: () => void;
  dense?: boolean;
  variant?: FileUploadZoneVariant;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-lg border border-gray-100 bg-white",
        dense ? "px-2.5 py-2" : "gap-2.5 px-3 py-2.5 shadow-sm"
      )}
    >
      {previewUrl ? (
        <img
          src={previewUrl}
          alt={file.name}
          className={cn(
            "shrink-0 rounded-md border border-gray-100 object-cover",
            dense ? "size-8" : "size-10"
          )}
        />
      ) : (
        <span
          className={cn(
            "flex shrink-0 items-center justify-center rounded-md border",
            dense ? "size-8" : "size-10",
            dense ? compactAiIconClass : variantStyles[variant].iconBox
          )}
        >
          <FileText size={dense ? 14 : 16} strokeWidth={2} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className={cn("truncate font-medium text-gray-800", dense ? "text-[12px]" : "text-[13px]")}>
          {file.name}
        </p>
        <p className={cn("text-gray-400", dense ? "text-[10px]" : "mt-0.5 text-[11px]")}>
          {formatFileSize(file.size)}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          disabled={disabled}
          onClick={onReplace}
          className={cn(
            "inline-flex items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 disabled:opacity-50",
            dense ? "size-7" : "size-8"
          )}
          aria-label="Replace file"
        >
          <RefreshCcw size={dense ? 12 : 14} strokeWidth={2} />
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onRemove}
          className={cn(
            "inline-flex items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 disabled:opacity-50",
            dense ? "size-7" : "size-8"
          )}
          aria-label="Remove file"
        >
          <X size={dense ? 12 : 14} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

function CompactUploadHeaderAction({
  title,
  disabled,
  hasFile,
  onOpen,
  actionLabel = "Upload",
  replaceLabel = "Replace",
}: {
  title: string;
  disabled?: boolean;
  hasFile?: boolean;
  onOpen: () => void;
  actionLabel?: string;
  replaceLabel?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onOpen}
      aria-label={hasFile ? `${replaceLabel} ${title}` : `${actionLabel} ${title}`}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-amber-200/80 bg-amber-50/60 px-2.5 py-1.5 text-[11px] font-medium text-amber-800 transition-colors hover:bg-amber-50 disabled:opacity-50"
    >
      <Sparkles size={12} strokeWidth={2} />
      {hasFile ? replaceLabel : actionLabel}
    </button>
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
  compactPart = "assist-bar",
  headerActionLabel,
  headerActionReplaceLabel,
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
  compactPart?: "assist-bar" | "header-action" | "preview";
  headerActionLabel?: string;
  headerActionReplaceLabel?: string;
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

  const fileInput = (
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
  );

  if (optional && compact && compactPart === "header-action") {
    return (
      <>
        {fileInput}
        <CompactUploadHeaderAction
          title={title}
          disabled={disabled}
          hasFile={Boolean(resolvedFile)}
          onOpen={() => inputRef.current?.click()}
          actionLabel={headerActionLabel}
          replaceLabel={headerActionReplaceLabel}
        />
      </>
    );
  }

  if (optional && compact && compactPart === "preview") {
    if (!resolvedFile) return null;
    return (
      <div className={cn("mb-3 space-y-1", className)}>
        {fileInput}
        <CompactUploadedFileCard
          dense
          variant={variant}
          file={resolvedFile}
          previewUrl={previewUrl}
          disabled={disabled}
          onReplace={() => inputRef.current?.click()}
          onRemove={() => {
            setResolvedFile(null);
            onErrorChange?.(null);
          }}
        />
        {error ? <p className="text-[12px] text-red-600">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className={cn(compact && optional ? "space-y-1" : "space-y-1.5", className)}>
      {optional && compact ? (
        <>
          {fileInput}
          {resolvedFile ? (
            <CompactUploadedFileCard
              dense
              variant={variant}
              file={resolvedFile}
              previewUrl={previewUrl}
              disabled={disabled}
              onReplace={() => inputRef.current?.click()}
              onRemove={() => {
                setResolvedFile(null);
                onErrorChange?.(null);
              }}
            />
          ) : (
            <div
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
                "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5",
                dragOver
                  ? compactAiShellActiveClass
                  : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/80"
              )}
            >
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg border",
                  compactAiIconClass
                )}
              >
                <Sparkles size={16} strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1 leading-tight">
                <div className="flex min-w-0 items-center gap-1.5">
                  <span className="truncate text-[12px] font-medium text-gray-800">
                    Upload {title}
                  </span>
                  <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-gray-600">
                    Optional
                  </span>
                </div>
                <p className="mt-1 truncate text-[11px] leading-snug text-gray-400">
                  {hint} · auto-fills below
                </p>
              </div>
              <CompactUploadHeaderAction
                title={title}
                disabled={disabled}
                hasFile={false}
                onOpen={() => inputRef.current?.click()}
                actionLabel={headerActionLabel}
                replaceLabel={headerActionReplaceLabel}
              />
            </div>
          )}
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
