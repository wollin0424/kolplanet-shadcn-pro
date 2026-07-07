"use client";

import { useEffect, useState } from "react";
import { InsightReportThumbnail } from "@/components/InsightReportThumbnail";
import { Images, X } from "@/lib/icons";
import { FORM_FIELD_RADIUS } from "@/lib/formControls";
import {
  getInsightReportSharePayload,
  subscribeInsightReportShareChanges,
  type InsightReportSharePayload,
} from "@/lib/insightReportShare";
import type { InsightReportImage } from "@/lib/insightReportSync";
import { cn } from "@/lib/utils";

function InsightReportShareImageCard({
  file,
  onPreview,
}: {
  file: InsightReportImage;
  onPreview: (file: InsightReportImage) => void;
}) {
  return (
    <article
      className={cn(
        "overflow-hidden border border-gray-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
        FORM_FIELD_RADIUS
      )}
    >
      <div className="relative">
        <button
          type="button"
          onClick={() => onPreview(file)}
          className="block w-full cursor-zoom-in"
          aria-label={`Preview ${file.name}`}
        >
          <InsightReportThumbnail src={file.previewUrl} alt={file.name} />
        </button>
        {file.source === "H5" ? (
          <span className="pointer-events-none absolute left-2 top-2 z-10 rounded-md bg-sky-600 px-1.5 py-0.5 text-[10px] font-semibold leading-tight text-white shadow-sm">
            Submitted by KOL
          </span>
        ) : null}
      </div>
      <div className="px-3 py-2">
        <p className="truncate text-[12px] font-medium text-gray-800">{file.name}</p>
        <p className="text-[11px] text-gray-400">{file.sizeLabel}</p>
      </div>
    </article>
  );
}

function InsightReportImageLightbox({
  file,
  onClose,
}: {
  file: InsightReportImage;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 sm:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Preview ${file.name}`}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 inline-flex size-10 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
        aria-label="Close preview"
      >
        <X size={20} strokeWidth={2.5} />
      </button>
      <div
        className="flex max-h-full w-full max-w-5xl flex-col items-center gap-3"
        onClick={(event) => event.stopPropagation()}
      >
        <img
          src={file.previewUrl}
          alt={file.name}
          className="max-h-[calc(100dvh-8rem)] w-auto max-w-full rounded-lg object-contain shadow-2xl"
        />
        <p className="max-w-full truncate px-2 text-center text-[13px] font-medium text-white/90">
          {file.name}
        </p>
      </div>
    </div>
  );
}

export function InsightReportShareView({ rowId }: { rowId: string }) {
  const [payload, setPayload] = useState<InsightReportSharePayload | null | undefined>(undefined);
  const [previewFile, setPreviewFile] = useState<InsightReportImage | null>(null);

  useEffect(() => {
    const sync = () => setPayload(getInsightReportSharePayload(rowId));
    sync();
    return subscribeInsightReportShareChanges(rowId, sync);
  }, [rowId]);

  if (payload === undefined) {
    return (
      <div className="min-h-dvh bg-[#f4f6f9] px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto w-full max-w-4xl animate-pulse space-y-5">
          <div className="h-28 rounded-2xl bg-white" />
          <div className="h-64 rounded-2xl bg-white" />
        </div>
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white px-6 py-10 text-center shadow-sm">
          <p className="text-[16px] font-semibold text-gray-900">Report not found</p>
          <p className="mt-2 text-[13px] leading-relaxed text-gray-500">
            This insight report link is invalid or has expired.
          </p>
        </div>
      </div>
    );
  }

  const { influencerName, influencerHandle, platform, files } = payload;

  return (
    <>
      <div className="min-h-dvh bg-[#f4f6f9] px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto w-full max-w-4xl">
          <header className="rounded-2xl border border-gray-100 bg-white px-5 py-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] sm:px-6">
            <div className="flex items-start gap-3">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand">
                <Images size={18} strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <h1 className="text-[20px] font-semibold text-gray-900">Insight Reports</h1>
                <p className="mt-1 text-[13px] text-gray-500">
                  {influencerName}{" "}
                  <span className="text-gray-400">
                    {influencerHandle} · {platform}
                  </span>
                </p>
                <p className="mt-2 text-[12px] leading-relaxed text-gray-400">
                  Performance screenshots submitted for campaign review.
                </p>
              </div>
            </div>
          </header>

          <section className="mt-5 rounded-2xl border border-gray-100 bg-white px-5 py-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] sm:px-6">
            {files.length > 0 ? (
              <>
                <div className="mb-4 flex items-baseline justify-between gap-2">
                  <h2 className="text-[14px] font-semibold text-gray-800">Submitted Images</h2>
                  <span className="text-[12px] font-medium tabular-nums text-gray-400">
                    {files.length}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4">
                  {files.map((file) => (
                    <InsightReportShareImageCard
                      key={file.id}
                      file={file}
                      onPreview={setPreviewFile}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/70 px-4 py-12 text-center">
                <p className="text-[14px] font-medium text-gray-600">No images yet</p>
                <p className="mt-1 text-[12px] leading-relaxed text-gray-400">
                  Insight screenshots will appear here once they are submitted.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>

      {previewFile ? (
        <InsightReportImageLightbox file={previewFile} onClose={() => setPreviewFile(null)} />
      ) : null}
    </>
  );
}
