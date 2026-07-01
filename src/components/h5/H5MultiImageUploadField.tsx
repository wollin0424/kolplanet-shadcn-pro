"use client";

import { useRef } from "react";
import { Trash2, Upload } from "@/lib/icons";
import { FORM_FIELD_RADIUS } from "@/lib/formControls";
import { cn } from "@/lib/utils";

export type H5UploadedImage = {
  id: string;
  name: string;
  previewUrl: string;
  sizeLabel: string;
  locked?: boolean;
};

export function H5MultiImageUploadField({
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
            "flex w-full flex-col items-center justify-center gap-2 border border-dashed border-gray-200 bg-gray-50/70 px-4 py-8 text-center transition-colors",
            FORM_FIELD_RADIUS,
            !disabled && "hover:border-brand/35 hover:bg-brand-50/40"
          )}
        >
          <Upload size={18} strokeWidth={2} className={disabled ? "text-gray-300" : "text-brand"} />
          <span className={cn("text-[12px] font-medium", disabled ? "text-gray-400" : "text-brand")}>
            {dropLabel}
          </span>
          {hint ? <span className="text-[10px] text-gray-400">{hint}</span> : null}
        </button>
      ) : null}

      {files.length ? (
        <div className="grid grid-cols-2 gap-2">
          {files.map((file) => (
            <div
              key={file.id}
              className={cn("group/file relative overflow-hidden border border-gray-200 bg-white", FORM_FIELD_RADIUS)}
            >
              <img
                src={file.previewUrl}
                alt={file.name}
                className="aspect-[4/3] w-full object-cover"
              />
              {!disabled && !file.locked ? (
                <button
                  type="button"
                  onClick={() => onRemoveFile(file.id)}
                  className="absolute right-1.5 top-1.5 inline-grid size-6 place-items-center rounded-full bg-black/55 text-white"
                  aria-label={`Remove ${file.name}`}
                >
                  <Trash2 size={12} strokeWidth={2.2} />
                </button>
              ) : null}
              {file.locked ? (
                <span className="pointer-events-none absolute left-1.5 top-1.5 rounded-full bg-black/55 px-1.5 py-0.5 text-[9px] font-semibold leading-none text-white">
                  Submitted
                </span>
              ) : null}
              <div className="px-2 py-1.5">
                <p className="truncate text-[11px] font-medium text-gray-800">{file.name}</p>
                <p className="text-[10px] text-gray-400">{file.sizeLabel}</p>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
