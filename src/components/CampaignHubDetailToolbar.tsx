"use client";

import { CampaignHubSelectionBar } from "@/components/CampaignHubSelectionBar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ChevronLeft, Search } from "lucide-react";
import type { ReactNode } from "react";

export function CampaignHubToolbarActionButton({
  children,
  onClick,
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1 rounded-lg border px-2.5 text-[12px] font-medium transition-colors",
        disabled
          ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      )}
    >
      {children}
    </button>
  );
}

export function CampaignHubDetailHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-x-2.5 gap-y-1">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex h-7 shrink-0 items-center gap-0.5 rounded-md px-1 text-[12px] font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
      >
        <ChevronLeft size={16} strokeWidth={2.25} />
        Back
      </button>

      <span className="hidden h-3.5 w-px shrink-0 bg-gray-200 sm:block" aria-hidden />

      <h2 className="shrink-0 text-[15px] font-semibold leading-none text-gray-900">
        {title}
      </h2>
    </div>
  );
}

/** When `batchSelection` is omitted (e.g. Contract view), optionally pass `influencerCount` for a plain count label (no checkbox). */
export function CampaignHubDetailToolbar({
  batchSelection,
  influencerCount,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search Influencer or Legal Name",
  filters,
  actions,
}: {
  batchSelection?: {
    selectedCount: number;
    totalCount: number;
    onSelectAll: () => void;
    onClear: () => void;
  };
  /** Plain "Influencers: n" when not using batch selection (no checkbox). */
  influencerCount?: number;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters: ReactNode;
  actions?: ReactNode;
}) {
  const bs = batchSelection;
  const showBatch = Boolean(bs && bs.totalCount > 0);
  const showCountOnly =
    !showBatch && influencerCount !== undefined;

  return (
    <div className="shrink-0 px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        {showBatch && bs ? (
          <>
            <CampaignHubSelectionBar
              selectedCount={bs.selectedCount}
              totalCount={bs.totalCount}
              onSelectAll={bs.onSelectAll}
              onClear={bs.onClear}
            />
            <span className="hidden h-5 w-px shrink-0 bg-gray-200 sm:block" aria-hidden />
          </>
        ) : showCountOnly ? (
          <>
            <span className="shrink-0 text-[12px] font-medium text-gray-500">
              Influencers:{" "}
              <span className="tabular-nums font-medium text-gray-900">{influencerCount}</span>
            </span>
            <span className="hidden h-5 w-px shrink-0 bg-gray-200 sm:block" aria-hidden />
          </>
        ) : null}
        {filters}
        <div className="relative min-w-[200px] flex-1 sm:max-w-[260px]">
          <Search
            size={12}
            className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-gray-400"
          />
          <Input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-8 border-gray-200 bg-gray-50/80 py-0 pl-8 text-[12px] leading-8 placeholder:text-[12px] focus:bg-white md:text-[12px]"
          />
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-1.5 sm:ml-auto">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
}
