"use client";

import { useRef } from "react";
import { Eye, Trash2, Upload } from "@/lib/icons";
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

function H5InsightImageCard({ file, variant, disabled, onRemoveFile }: H5InsightImageCardProps) {
  const isSubmitted = variant === "submitted";
  const showRemove = !isSubmitted && !disabled && Boolean(onRemoveFile);

  return (
    <div
      className={cn(
        "group/file overflow-hidden border border-gray-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
        FORM_FIELD_RADIUS,
        !isSubmitted && "border-brand/30"
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <img
          src={file.previewUrl}
          alt={file.name}
          className="size-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 transition-colors group-hover/file:bg-black/35">
          <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover/file:opacity-100">
            <button
              type="button"
              onClick={() => window.open(file.previewUrl, "_blank", "noopener,noreferrer")}
              className="inline-flex size-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
              aria-label={`Preview ${file.name}`}
            >
              <Eye size={16} strokeWidth={2} />
            </button>
            {showRemove ? (
              <button
                type="button"
                onClick={() => onRemoveFile?.(file.id)}
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

function H5InsightImageGrid({
  files,
  variant,
  disabled,
  onRemoveFile,
}: {
  files: H5UploadedImage[];
  variant: "submitted" | "draft";
  disabled?: boolean;
  onRemoveFile?: (fileId: string) => void;
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
        />
      ))}
    </div>
  );
}

export function H5SubmittedImagesPanel({ files }: { files: H5UploadedImage[] }) {
  if (!files.length) return null;

  return (
    <section className="space-y-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-[12px] font-semibold text-gray-700">Submitted</h3>
        <span className="text-[11px] font-medium tabular-nums text-gray-400">{files.length}</span>
      </div>
      <H5InsightImageGrid files={files} variant="submitted" />
    </section>
  );
}

export function H5PendingImagesUploadField({
  files,
  onAddFiles,
  onRemoveFile,
  disabled = false,
  showDropzone = true,
  dropLabel = "Drop screenshots here",
  hint,
}: {
  files: H5UploadedImage[];
  onAddFiles: (files: H5UploadedImage[]) => void;
  onRemoveFile: (fileId: string) => void;
  disabled?: boolean;
  showDropzone?: boolean;
  dropLabel?: string;
  hint?: string;
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
            "flex w-full flex-col items-center justify-center gap-2 border border-dashed border-brand/30 bg-white px-4 py-7 text-center transition-colors",
            FORM_FIELD_RADIUS,
            !disabled && "hover:border-brand/45 hover:bg-brand-50/50"
          )}
        >
          <Upload size={18} strokeWidth={2} className={disabled ? "text-gray-300" : "text-brand"} />
          <span className={cn("text-[12px] font-medium", disabled ? "text-gray-400" : "text-brand")}>
            {dropLabel}
          </span>
          {hint ? <span className="text-[10px] text-gray-400">{hint}</span> : null}
        </button>
      ) : null}

      <H5InsightImageGrid
        files={files}
        variant="draft"
        disabled={disabled}
        onRemoveFile={onRemoveFile}
      />
    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
