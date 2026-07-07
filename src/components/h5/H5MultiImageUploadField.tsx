"use client";

import { useRef } from "react";
import { Upload, X } from "@/lib/icons";
import { FORM_FIELD_RADIUS } from "@/lib/formControls";
import { cn } from "@/lib/utils";

export type H5UploadedImage = {
  id: string;
  name: string;
  previewUrl: string;
  sizeLabel: string;
  locked?: boolean;
};

type H5InsightImageCardProps = {
  file: H5UploadedImage;
  variant: "submitted" | "draft";
  disabled?: boolean;
  onRemoveFile?: (fileId: string) => void;
};

function H5InsightImageCard({
  file,
  variant,
  disabled,
  onRemoveFile,
  forceHover = false,
}: H5InsightImageCardProps & { forceHover?: boolean }) {
  const isSubmitted = variant === "submitted";
  const showRemove = !isSubmitted && !disabled && Boolean(onRemoveFile);

  const openPreview = () => {
    window.open(file.previewUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className={cn(
        "overflow-hidden border border-gray-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
        FORM_FIELD_RADIUS,
        !isSubmitted && "border-brand/30",
        forceHover && "ring-2 ring-brand/35"
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <button
          type="button"
          onClick={openPreview}
          className="block size-full"
          aria-label={`Preview ${file.name}`}
        >
          <img src={file.previewUrl} alt="" className="size-full object-cover" />
        </button>
        {showRemove ? (
          <button
            type="button"
            onClick={() => onRemoveFile?.(file.id)}
            className="absolute right-1.5 top-1.5 inline-flex size-7 items-center justify-center rounded-full bg-black/60 text-white shadow-sm backdrop-blur-sm transition-colors active:bg-black/75"
            aria-label={`Remove ${file.name}`}
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        ) : null}
      </div>
      <div className="px-2 py-1.5">
        <p className="truncate text-[11px] font-medium text-gray-800">{file.name}</p>
        <p className="text-[10px] text-gray-400">{file.sizeLabel}</p>
      </div>
    </div>
  );
}

function H5InsightImageGrid({
  files,
  variant,
  disabled,
  onRemoveFile,
  hoverCardId,
}: {
  files: H5UploadedImage[];
  variant: "submitted" | "draft";
  disabled?: boolean;
  onRemoveFile?: (fileId: string) => void;
  hoverCardId?: string;
}) {
  if (!files.length) return null;

  return (
    <div className="grid grid-cols-3 gap-2">
      {files.map((file) => (
        <H5InsightImageCard
          key={file.id}
          file={file}
          variant={variant}
          disabled={disabled}
          onRemoveFile={onRemoveFile}
          forceHover={hoverCardId === file.id || hoverCardId === file.name}
        />
      ))}
    </div>
  );
}

export function H5SubmittedImagesPanel({
  files,
  hoverCardId,
}: {
  files: H5UploadedImage[];
  hoverCardId?: string;
}) {
  if (!files.length) return null;

  return (
    <section className="space-y-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-[12px] font-semibold text-gray-700">Submitted</h3>
        <span className="text-[11px] font-medium tabular-nums text-gray-400">{files.length}</span>
      </div>
      <H5InsightImageGrid files={files} variant="submitted" hoverCardId={hoverCardId} />
    </section>
  );
}

export function H5PendingImagesUploadField({
  files,
  onAddFiles,
  onRemoveFile,
  disabled = false,
  showDropzone = true,
  dropLabel = "Upload image here.",
  hint = "Only PNG or JPG supported.",
  hoverCardId,
}: {
  files: H5UploadedImage[];
  onAddFiles: (files: H5UploadedImage[]) => void;
  onRemoveFile: (fileId: string) => void;
  disabled?: boolean;
  showDropzone?: boolean;
  dropLabel?: string;
  hint?: string;
  hoverCardId?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList?.length || disabled) return;

    const readers = Array.from(fileList).map(
      (file) =>
        new Promise<H5UploadedImage | null>((resolve) => {
          if (!file.type.startsWith("image/")) {
            resolve(null);
            return;
          }
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result !== "string") {
              resolve(null);
              return;
            }
            resolve({
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
              name: file.name,
              previewUrl: reader.result,
              sizeLabel: formatBytes(file.size),
            });
          };
          reader.readAsDataURL(file);
        })
    );

    void Promise.all(readers).then((results) => {
      const next = results.filter((item): item is H5UploadedImage => item != null);
      if (next.length) onAddFiles(next);
    });
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        multiple
        className="sr-only"
        disabled={disabled}
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      {showDropzone ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "w-full border-2 border-dashed border-brand/25 bg-brand-50/35 px-4 py-4 text-left transition-colors",
            FORM_FIELD_RADIUS,
            disabled && "cursor-not-allowed opacity-60",
            !disabled && "hover:border-brand/35 hover:bg-brand-50/55 active:border-brand/40 active:bg-brand-50/65"
          )}
        >
          <div className="flex items-start gap-3">
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-lg border border-brand-100 bg-white",
                disabled ? "text-gray-300" : "text-brand"
              )}
            >
              <Upload size={18} strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <p
                className={cn(
                  "text-[13px] font-semibold",
                  disabled ? "text-gray-400" : "text-brand"
                )}
              >
                {dropLabel}
              </p>
              {hint ? (
                <p className="mt-1 text-[11px] leading-relaxed text-gray-500">{hint}</p>
              ) : null}
            </div>
          </div>
        </button>
      ) : null}

      <H5InsightImageGrid
        files={files}
        variant="draft"
        disabled={disabled}
        onRemoveFile={onRemoveFile}
        hoverCardId={hoverCardId}
      />
    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
