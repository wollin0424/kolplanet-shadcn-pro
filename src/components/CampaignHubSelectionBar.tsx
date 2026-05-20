"use client";

import { Checkbox } from "@/components/ui/checkbox";
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

  const allSelected = selectedCount === totalCount;
  const someSelected = selectedCount > 0 && !allSelected;

  const handleToggleAll = () => {
    if (allSelected) onClear();
    else onSelectAll();
  };

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[12px]">
      <label className="inline-flex cursor-pointer items-center gap-2">
        <Checkbox
          checked={allSelected}
          onCheckedChange={handleToggleAll}
          className="border-gray-300 data-[state=indeterminate]:border-brand data-[state=indeterminate]:bg-brand data-[state=checked]:border-brand data-[state=checked]:bg-brand"
          data-state={
            someSelected ? "indeterminate" : allSelected ? "checked" : "unchecked"
          }
          aria-label={allSelected ? "Clear selection" : "Select all influencers"}
        />
        <span className="font-medium text-gray-500">
          Influencers:{" "}
          <span className="tabular-nums text-gray-900">
            <span className={selectedCount > 0 ? "font-semibold" : "font-medium"}>
              {selectedCount}
            </span>
            /{totalCount}
          </span>
        </span>
      </label>

      {selectedCount > 0 ? (
        <>
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
    </div>
  );
}
