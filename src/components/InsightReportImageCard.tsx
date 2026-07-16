"use client";

import { InsightReportThumbnail } from "@/components/InsightReportThumbnail";
import { FORM_FIELD_RADIUS } from "@/lib/formControls";
import { Eye, Trash2 } from "@/lib/icons";
import type { InsightReportImage } from "@/lib/insightReportSync";
import { cn } from "@/lib/utils";

export function InsightReportImageCard({
  file,
  variant,
  onRemove,
  forceHover = false,
  showFilename = true,
}: {
  file: InsightReportImage;
  variant: "submitted" | "draft";
  onRemove?: () => void;
  forceHover?: boolean;
  showFilename?: boolean;
}) {
  const isSubmitted = variant === "submitted";
  const showRemove = Boolean(onRemove);

  const openPreview = () => {
    window.open(file.previewUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className={cn(
        "group/file overflow-hidden border border-gray-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
        FORM_FIELD_RADIUS,
        !isSubmitted && "border-brand/30",
        forceHover && "figma-capture-insight-card-hovered"
      )}
    >
      <div className="relative">
        <InsightReportThumbnail src={file.previewUrl} alt={file.name} />
        {file.source === "H5" ? (
          <span className="pointer-events-none absolute left-1 top-1 z-10 max-w-[calc(100%-0.5rem)] rounded bg-sky-600 px-1 py-px text-[8px] font-semibold leading-tight text-white shadow-sm">
            Submitted by KOL
          </span>
        ) : null}
        <div className="insight-card-preview-overlay absolute inset-0 z-10 flex items-center justify-center gap-1.5 bg-black/0 transition-colors group-hover/file:bg-black/35">
          <div className="insight-card-preview-actions flex items-center gap-1.5 opacity-0 transition-opacity group-hover/file:opacity-100">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                openPreview();
              }}
              className="inline-flex size-8 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
              aria-label={`View ${file.name}`}
            >
              <Eye size={14} strokeWidth={2} />
            </button>
            {showRemove ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onRemove?.();
                }}
                className="inline-flex size-8 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                aria-label={`Remove ${file.name}`}
              >
                <Trash2 size={14} strokeWidth={2} />
              </button>
            ) : null}
          </div>
        </div>
      </div>
      {showFilename ? (
        <div className="px-2 py-1">
          <p className="truncate text-[10px] font-medium text-gray-800">{file.name}</p>
          <p className="text-[9px] text-gray-400">{file.sizeLabel}</p>
        </div>
      ) : null}
    </div>
  );
}

export function InsightReportImageGrid({
  files,
  variant,
  onRemoveFile,
  hoverCardId,
  showFilename = true,
}: {
  files: InsightReportImage[];
  variant: "submitted" | "draft";
  onRemoveFile?: (fileId: string) => void;
  hoverCardId?: string;
  showFilename?: boolean;
}) {
  if (!files.length) return null;

  return (
    <div className="grid grid-cols-3 gap-2">
      {files.map((file) => (
        <InsightReportImageCard
          key={file.id}
          file={file}
          variant={variant}
          onRemove={onRemoveFile ? () => onRemoveFile(file.id) : undefined}
          forceHover={hoverCardId === file.id || hoverCardId === file.name}
          showFilename={showFilename}
        />
      ))}
    </div>
  );
}