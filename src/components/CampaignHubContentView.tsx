"use client";

import { useEffect, useMemo, useState, type ReactElement, type ReactNode } from "react";
import { CampaignHubDetailHeader } from "@/components/CampaignHubDetailToolbar";
import { CampaignHubFilterSelect } from "@/components/CampaignHubFilterSelect";
import { InfluencerMetaIcons } from "@/components/InfluencerMetaIcons";
import { InfluencerAvatar } from "@/components/InfluencerAvatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ContentScriptReviewSheet,
  type ContentReviewTrack,
} from "@/components/ContentScriptReviewSheet";
import PipelineStageCell from "@/components/pipeline/PipelineStageCell";
import { getMockInfluencerAvatar } from "@/lib/mockInfluencerAvatars";
import { subscribeCaptionCoverChanges } from "@/lib/captionCoverSubmissions";
import { CONTENT_HUB_MOCK_ROWS, getContentHubRowsWithLiveStatus, type ContentHubRow } from "@/lib/contentHubMock";
import { subscribeScriptDraftChanges } from "@/lib/scriptDraftSubmissions";
import {
  CONTENT_HUB_STAGE_STATUS_CONFIG,
  type ContentHubStageStatus,
} from "@/lib/pipeline/stageStatuses";
import { cn } from "@/lib/utils";
import { ChevronDown, Copy, Search, SlidersHorizontal } from "@/lib/icons";

type StageFilter = "All" | ContentHubStageStatus;

const STAGE_FILTER_OPTIONS: StageFilter[] = [
  "All",
  "Approved",
  "Under Review",
  "Pending",
];

const TOOLBAR_CONTROL =
  "h-8 rounded-lg border border-gray-200 bg-white text-[12.5px] shadow-none";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-medium text-gray-500">{label}</p>
      {children}
    </div>
  );
}

const STAGE_CELL_WRAPPER = "flex min-w-[140px] flex-col items-start gap-1 py-0.5";
const STAGE_CELL_CLICKABLE =
  "group/stage-cell cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-1";

function TooltipDetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-medium text-gray-700">{label}</span>
      <span className="font-normal tabular-nums text-gray-500">{value}</span>
    </div>
  );
}

function StageDeadlineTooltip({
  deadline,
  children,
}: {
  deadline: string;
  children: ReactElement;
}) {
  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent variant="light" side="bottom" align="start" sideOffset={6}>
        <TooltipDetailField label="Deadline" value={deadline} />
      </TooltipContent>
    </Tooltip>
  );
}

function OverdueDeadline({ deadline }: { deadline: string }) {
  return (
    <p className="text-[11px] leading-tight">
      <span className="font-medium text-red-700">Overdue </span>
      <span className="font-normal tabular-nums text-red-700">{deadline}</span>
    </p>
  );
}

function ContentStageCell({
  status,
  deadline,
  showDeadline = true,
  overdue = false,
  onClick,
}: {
  status: ContentHubStageStatus;
  deadline?: string;
  showDeadline?: boolean;
  overdue?: boolean;
  onClick?: () => void;
}) {
  const hasDeadline = Boolean(deadline && deadline !== "—");
  const stageCell = (
    <PipelineStageCell
      config={CONTENT_HUB_STAGE_STATUS_CONFIG[status]}
      static={Boolean(onClick)}
      variant="pill"
      interactive={Boolean(onClick)}
    />
  );
  const showOverdueInline = showDeadline && hasDeadline && overdue;
  const showDeadlineTooltip = showDeadline && hasDeadline && !overdue;

  const statusBlock =
    showDeadlineTooltip ? (
      <StageDeadlineTooltip deadline={deadline!}>
        <span className="inline-flex max-w-full">{stageCell}</span>
      </StageDeadlineTooltip>
    ) : (
      stageCell
    );

  if (!showDeadline) {
    if (onClick) {
      return (
        <button type="button" onClick={onClick} className={cn(STAGE_CELL_WRAPPER, STAGE_CELL_CLICKABLE)}>
          {stageCell}
        </button>
      );
    }
    return stageCell;
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(STAGE_CELL_WRAPPER, STAGE_CELL_CLICKABLE)}>
        {statusBlock}
        {showOverdueInline ? <OverdueDeadline deadline={deadline!} /> : null}
      </button>
    );
  }

  return (
    <div className={STAGE_CELL_WRAPPER}>
      {statusBlock}
      {showOverdueInline ? <OverdueDeadline deadline={deadline!} /> : null}
    </div>
  );
}

function H5LinkCell({ path }: { path: string }) {
  const handleCopy = async () => {
    const copyValue =
      typeof window !== "undefined" ? `${window.location.origin}${path}` : path;
    try {
      await navigator.clipboard.writeText(copyValue);
    } catch {
      // Clipboard may be unavailable outside secure context.
    }
  };

  return (
    <div className="flex min-w-[160px] items-center gap-2">
      <a
        href={path}
        target="_blank"
        rel="noopener noreferrer"
        className="truncate text-[12px] font-medium text-gray-700 transition-colors hover:text-brand hover:underline hover:underline-offset-[3px] hover:decoration-brand/40"
      >
        {path}
      </a>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-brand transition-colors hover:bg-brand-50"
        aria-label="Copy H5 link"
      >
        <Copy size={14} strokeWidth={2} />
      </button>
    </div>
  );
}

function CampaignHubContentTable({ campaignId }: { campaignId: string }) {
  const [rows, setRows] = useState<ContentHubRow[]>(CONTENT_HUB_MOCK_ROWS);
  const [query, setQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState("All");
  const [managerFilter, setManagerFilter] = useState("All");
  const [scriptStatusFilter, setScriptStatusFilter] = useState<StageFilter>("All");
  const [visualStatusFilter, setVisualStatusFilter] = useState<StageFilter>("All");
  const [captionStatusFilter, setCaptionStatusFilter] = useState<StageFilter>("All");
  const [scriptOverdueOnly, setScriptOverdueOnly] = useState(false);
  const [visualOverdueOnly, setVisualOverdueOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [contentReview, setContentReview] = useState<{
    row: ContentHubRow;
    track: ContentReviewTrack;
  } | null>(null);

  useEffect(() => {
    const refresh = () => setRows(getContentHubRowsWithLiveStatus());
    refresh();
    const unsubScript = subscribeScriptDraftChanges(refresh);
    const unsubCaption = subscribeCaptionCoverChanges(refresh);
    return () => {
      unsubScript();
      unsubCaption();
    };
  }, []);

  const activeFilterCount =
    [scriptStatusFilter, visualStatusFilter, captionStatusFilter].filter(
      (value) => value !== "All"
    ).length +
    (scriptOverdueOnly ? 1 : 0) +
    (visualOverdueOnly ? 1 : 0);

  const resetAllFilters = () => {
    setScriptStatusFilter("All");
    setVisualStatusFilter("All");
    setCaptionStatusFilter("All");
    setScriptOverdueOnly(false);
    setVisualOverdueOnly(false);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (platformFilter !== "All" && row.platform !== platformFilter) return false;
      if (managerFilter !== "All" && row.manager !== managerFilter) return false;
      if (scriptStatusFilter !== "All" && row.script.status !== scriptStatusFilter) return false;
      if (visualStatusFilter !== "All" && row.visual.status !== visualStatusFilter) return false;
      if (captionStatusFilter !== "All" && row.caption.status !== captionStatusFilter) return false;
      if (scriptOverdueOnly && !row.scriptOverdue) return false;
      if (visualOverdueOnly && !row.visualOverdue) return false;
      if (!q) return true;
      return (
        row.name.toLowerCase().includes(q) ||
        row.handle.toLowerCase().includes(q)
      );
    });
  }, [
    query,
    platformFilter,
    managerFilter,
    scriptStatusFilter,
    visualStatusFilter,
    captionStatusFilter,
    scriptOverdueOnly,
    visualOverdueOnly,
    rows,
  ]);

  const allSelected = filtered.length > 0 && filtered.every((row) => selectedIds.has(row.id));
  const someSelected = filtered.some((row) => selectedIds.has(row.id));

  const toggleAll = (checked: boolean) => {
    if (!checked) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(filtered.map((row) => row.id)));
  };

  const toggleRow = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  return (
    <TooltipProvider delay={0}>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
      <span className="sr-only">{campaignId}</span>

      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-gray-100 px-5 py-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <Popover>
            <PopoverTrigger
              type="button"
              className={cn(
                TOOLBAR_CONTROL,
                "inline-flex shrink-0 items-center gap-1.5 px-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
              )}
            >
              <SlidersHorizontal size={13} className="text-gray-500" strokeWidth={2} />
              Filters
              {activeFilterCount > 0 ? (
                <span className="flex size-4 items-center justify-center rounded-full bg-brand text-[9px] font-bold text-white">
                  {activeFilterCount}
                </span>
              ) : null}
            </PopoverTrigger>
            <PopoverContent align="start" sideOffset={8} className="w-[300px] gap-0 p-0">
              <div className="border-b border-gray-100 px-4 py-3">
                <p className="text-[13px] font-semibold text-gray-900">Filters</p>
              </div>
              <div className="space-y-3 p-4">
                <FilterField label="Script Status">
                  <Select
                    value={scriptStatusFilter}
                    onValueChange={(value) => setScriptStatusFilter((value ?? "All") as StageFilter)}
                  >
                    <SelectTrigger className="h-8 w-full border-gray-200 bg-white text-[12.5px]">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      {STAGE_FILTER_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FilterField>

                <FilterField label="Visual Status">
                  <Select
                    value={visualStatusFilter}
                    onValueChange={(value) => setVisualStatusFilter((value ?? "All") as StageFilter)}
                  >
                    <SelectTrigger className="h-8 w-full border-gray-200 bg-white text-[12.5px]">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      {STAGE_FILTER_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FilterField>

                <FilterField label="Caption Status">
                  <Select
                    value={captionStatusFilter}
                    onValueChange={(value) => setCaptionStatusFilter((value ?? "All") as StageFilter)}
                  >
                    <SelectTrigger className="h-8 w-full border-gray-200 bg-white text-[12.5px]">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      {STAGE_FILTER_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FilterField>

                <div className="space-y-2 border-t border-gray-100 pt-3">
                  <label className="flex items-center justify-between gap-3 text-[12px] font-medium text-gray-700">
                    Script Overdue
                    <Switch
                      checked={scriptOverdueOnly}
                      onCheckedChange={(checked) => setScriptOverdueOnly(checked === true)}
                      className="h-4 w-7 [&_[data-slot=switch-thumb]]:size-3 [&_[data-slot=switch-thumb]]:translate-x-0.5 [&_[data-slot=switch-thumb]]:data-checked:translate-x-3.5"
                    />
                  </label>
                  <label className="flex items-center justify-between gap-3 text-[12px] font-medium text-gray-700">
                    Visual Overdue
                    <Switch
                      checked={visualOverdueOnly}
                      onCheckedChange={(checked) => setVisualOverdueOnly(checked === true)}
                      className="h-4 w-7 [&_[data-slot=switch-thumb]]:size-3 [&_[data-slot=switch-thumb]]:translate-x-0.5 [&_[data-slot=switch-thumb]]:data-checked:translate-x-3.5"
                    />
                  </label>
                </div>
              </div>
              <div className="border-t border-gray-100 px-4 py-3">
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="text-[12.5px] font-medium text-brand hover:text-brand/80"
                >
                  Reset all filters
                </button>
              </div>
            </PopoverContent>
          </Popover>
          <CampaignHubFilterSelect
            label="Platform"
            value={platformFilter}
            options={["All", "Instagram", "TikTok", "YouTube"]}
            onChange={setPlatformFilter}
          />
          <CampaignHubFilterSelect
            label="KOL Manager"
            value={managerFilter}
            options={["All", "Wollin", "Chris", "Moca"]}
            onChange={setManagerFilter}
          />
          <div className="relative min-w-[220px] flex-1 sm:max-w-[280px]">
            <Search
              size={12}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search influencer name..."
              className="h-8 border-gray-200 bg-gray-50/80 py-0 pl-8 text-xs leading-8 placeholder:text-xs focus:bg-white"
            />
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/60 px-5 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="text-[12px] font-medium text-gray-500">
            Influencers{" "}
            <span className="tabular-nums text-gray-900">
              ({selectedIds.size}/{rows.length})
            </span>
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "inline-flex shrink-0 items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-[12px] transition-colors hover:bg-gray-50",
                someSelected || allSelected ? "text-gray-700" : "text-gray-400"
              )}
            >
              Bulk Actions
              <ChevronDown size={11} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[220px] w-auto text-[13px]">
              <DropdownMenuItem disabled={!someSelected} className="whitespace-nowrap">
                Set Script Deadline
              </DropdownMenuItem>
              <DropdownMenuItem disabled={!someSelected} className="whitespace-nowrap">
                Set Visual Deadline
              </DropdownMenuItem>
              <DropdownMenuItem disabled={!someSelected} className="whitespace-nowrap">
                Bulk Download
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
        <Table className="w-full table-auto border-separate border-spacing-0 text-[13px] [&_tbody_td]:border-b [&_tbody_td]:border-gray-100 [&_td]:px-5 [&_td]:align-middle [&_th]:border-b [&_th]:border-gray-100 [&_th]:px-5 [&_th]:align-middle">
          <TableHeader>
            <TableRow className="bg-gray-50/70 hover:bg-gray-50/70">
              <TableHead className="w-10 py-3 !pl-5">
                <div className="flex items-center">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected && !allSelected}
                    onCheckedChange={(checked) => toggleAll(checked === true)}
                    aria-label="Select all influencers"
                  />
                </div>
              </TableHead>
              <TableHead className="py-3 font-semibold text-gray-800">Influencer</TableHead>
              <TableHead className="py-3 font-semibold text-gray-800">H5 Link</TableHead>
              <TableHead className="py-3 font-semibold text-gray-800">Script</TableHead>
              <TableHead className="py-3 font-semibold text-gray-800">Visual</TableHead>
              <TableHead className="py-3 !pr-5 font-semibold text-gray-800">Caption</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((row) => (
              <TableRow
                key={row.id}
                className="group/row bg-white transition-colors hover:bg-brand-row-hover"
              >
                <TableCell className="py-4 !pl-5">
                  <div className="flex items-center">
                    <Checkbox
                      checked={selectedIds.has(row.id)}
                      onCheckedChange={(checked) => toggleRow(row.id, checked === true)}
                      aria-label={`Select ${row.name}`}
                    />
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex min-w-[220px] items-center gap-3">
                    <InfluencerAvatar
                      src={getMockInfluencerAvatar(row.id)}
                      alt={row.name}
                      platform={row.platform}
                      size="md"
                      fallback={initials(row.name)}
                      fallbackClassName="bg-violet-100 text-violet-700"
                    />
                    <div className="min-w-0">
                      <div className="flex min-w-0 items-center gap-1">
                        <span className="truncate text-sm font-semibold text-gray-900">
                          {row.name}
                        </span>
                        <InfluencerMetaIcons
                          kolManager={row.manager}
                          relationship={row.relationship}
                        />
                      </div>
                      <p className="mt-1 truncate text-xs text-gray-500">{row.handle}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <H5LinkCell path={row.h5Path} />
                </TableCell>
                <TableCell className="py-4">
                  <ContentStageCell
                    status={row.script.status}
                    deadline={row.script.updatedAt}
                    overdue={row.scriptOverdue}
                    onClick={() => setContentReview({ row, track: "script" })}
                  />
                </TableCell>
                <TableCell className="py-4">
                  <ContentStageCell
                    status={row.visual.status}
                    deadline={row.visual.updatedAt}
                    overdue={row.visualOverdue}
                    onClick={() => setContentReview({ row, track: "visual" })}
                  />
                </TableCell>
                <TableCell className="py-4 !pr-5">
                  <ContentStageCell
                    status={row.caption.status}
                    showDeadline={false}
                    onClick={() => setContentReview({ row, track: "caption" })}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {contentReview ? (
        <ContentScriptReviewSheet
          open={Boolean(contentReview)}
          onOpenChange={(open) => {
            if (!open) setContentReview(null);
          }}
          kolId={contentReview.row.id}
          kolName={contentReview.row.name}
          platform={contentReview.row.platform}
          track={contentReview.track}
        />
      ) : null}
      </div>
    </TooltipProvider>
  );
}

export default function CampaignHubContentView({
  campaignId,
  onBack,
}: {
  campaignId: string;
  onBack: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
      <CampaignHubDetailHeader title="Content" onBack={onBack} />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <CampaignHubContentTable campaignId={campaignId} />
      </div>
    </div>
  );
}
