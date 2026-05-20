"use client";

import { Checkbox } from "@/components/ui/checkbox";

export function CampaignHubSelectionBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onClear,
}: {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClear: () => void;
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
          indeterminate={someSelected}
          onCheckedChange={handleToggleAll}
          className="border-gray-300"
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
    </div>
  );
}
