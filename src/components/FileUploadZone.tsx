"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { Upload } from "@/lib/icons";
import { cn } from "@/lib/utils";

export type FileUploadZoneVariant = "amber" | "brand";

const variantStyles: Record<
  FileUploadZoneVariant,
  {
    zone: string;
    zoneActive: string;
    iconBox: string;
    title: string;
  }
> = {
  amber: {
    zone: "border-amber-200/90 bg-amber-50/30 hover:border-amber-300 hover:bg-amber-50/50",
    zoneActive: "border-amber-300 bg-amber-50/80",
    iconBox: "border-amber-100 text-amber-600",
    title: "text-amber-800",
  },
  brand: {
    zone: "border-brand/25 bg-brand-50/35 hover:border-brand/35 hover:bg-brand-50/55",
    zoneActive: "border-brand/40 bg-brand-50/60",
    iconBox: "border-brand-100 text-brand",
    title: "text-brand",
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

export function FileUploadZone({
  title,
  hint,
  accept,
  acceptedExtensions = [],
  maxBytes = 10 * 1024 * 1024,
  file,
  onFileChange,
  error,
  onErrorChange,
  badge,
  variant = "amber",
  className,
  disabled = false,
}: {
  title: string;
  hint: string;
  accept?: string;
  acceptedExtensions?: string[];
  maxBytes?: number;
  file?: File | null;
  onFileChange?: (file: File | null) => void;
  error?: string | null;
  onErrorChange?: (error: string | null) => void;
  badge?: ReactNode;
  variant?: FileUploadZoneVariant;
  className?: string;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const styles = variantStyles[variant];

  const applyFile = useCallback(
    (next: File | null) => {
      if (!next) {
        onFileChange?.(null);
        onErrorChange?.(null);
        return;
      }
      const validationError = validateFile(next, acceptedExtensions, maxBytes);
      if (validationError) {
        onFileChange?.(null);
        onErrorChange?.(validationError);
        return;
      }
      onFileChange?.(next);
      onErrorChange?.(null);
    },
    [acceptedExtensions, maxBytes, onFileChange, onErrorChange]
  );

  return (
    <div className={cn("space-y-1.5", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => applyFile(e.target.files?.[0] ?? null)}
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
          if (!disabled) applyFile(e.dataTransfer.files?.[0] ?? null);
        }}
        className={cn(
          "w-full rounded-lg border-2 border-dashed p-4 text-left transition-colors",
          disabled && "cursor-not-allowed opacity-60",
          dragOver ? styles.zoneActive : styles.zone
        )}
      >
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-white",
              styles.iconBox
            )}
          >
            <Upload size={18} strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn("text-[13px] font-semibold", styles.title)}>
                {file?.name ?? title}
              </span>
              {badge}
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-gray-500">{hint}</p>
          </div>
        </div>
      </button>
      {error ? <p className="text-[12px] text-red-600">{error}</p> : null}
    </div>
  );
}
