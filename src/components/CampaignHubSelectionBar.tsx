"use client";

import { Download } from "lucide-react";

export function CampaignHubSelectionBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onClear,
  onExport,
}: {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClear: () => void;
  onExport: () => void;
}) {
  if (totalCount === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]">
      {selectedCount > 0 ? (
        <>
          <span className="font-medium text-gray-700">
            Selected{" "}
            <span className="tabular-nums text-gray-900">{selectedCount}</span>
          </span>
          <button
            type="button"
            onClick={onClear}
            className="font-medium text-gray-500 transition-colors hover:text-gray-800"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onExport}
            className="inline-flex items-center gap-1 font-semibold text-brand transition-colors hover:text-brand/80"
          >
            <Download size={13} />
            Export
          </button>
        </>
      ) : null}
      {selectedCount < totalCount ? (
        <button
          type="button"
          onClick={onSelectAll}
          className="font-medium text-brand transition-colors hover:text-brand/80"
        >
          Select all ({totalCount})
        </button>
      ) : selectedCount > 0 ? (
        <span className="text-gray-400">All selected</span>
      ) : null}
    </div>
  );
}
