"use client";

import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { subscribeCaptionCoverChanges } from "@/lib/captionCoverSubmissions";
import {
  CONTENT_HUB_STAGE_ORDER,
  type ContentHubStageBreakdown,
  getContentHubOverviewStats,
  getContentHubRowsWithLiveStatus,
} from "@/lib/contentHubMock";
import { subscribeScriptDraftChanges } from "@/lib/scriptDraftSubmissions";
import {
  CONTENT_HUB_STAGE_BAR_FILL,
  CONTENT_HUB_STAGE_BAR_FILL_HOVER,
  CONTENT_HUB_STAGE_STATUS_CONFIG,
} from "@/lib/pipeline/stageStatuses";
import { getStageToneDotClass } from "@/lib/pipeline/stageStatuses";
import type { ContentHubStageStatus } from "@/lib/pipeline/stageStatuses";
import { cn } from "@/lib/utils";

const TRACKS = [
  { key: "script", label: "Script" },
  { key: "visual", label: "Visual Draft" },
  { key: "caption", label: "Caption & Cover" },
] as const;

type TrackKey = (typeof TRACKS)[number]["key"];
type ContentStats = ReturnType<typeof getContentHubOverviewStats>;

const SEGMENT_BAR_HEIGHT = "h-2";

function buildSegments(breakdown: ContentHubStageBreakdown) {
  return CONTENT_HUB_STAGE_ORDER.map((status) => ({
    status,
    count: breakdown.counts[status],
  })).filter((segment) => segment.count > 0);
}

function SegmentTooltipContent({
  status,
  count,
}: {
  status: ContentHubStageStatus;
  count: number;
}) {
  const config = CONTENT_HUB_STAGE_STATUS_CONFIG[status];

  return (
    <div className="flex items-center gap-2 leading-none">
      <span
        className={cn("size-2 shrink-0 rounded-full", getStageToneDotClass(config.tone))}
        aria-hidden
      />
      <span className="font-medium text-gray-900">{config.label}</span>
      <span className="tabular-nums text-gray-500">{count}</span>
    </div>
  );
}

function StageSegmentBar({ breakdown }: { breakdown: ContentHubStageBreakdown }) {
  const segments = buildSegments(breakdown);

  return (
    <div
      className={cn(
        "flex min-w-0 overflow-hidden rounded-full bg-gray-200",
        SEGMENT_BAR_HEIGHT
      )}
      role="group"
      aria-label="Status breakdown"
    >
      {segments.length > 0
        ? segments.map((segment, index) => {
            const config = CONTENT_HUB_STAGE_STATUS_CONFIG[segment.status];
            const isFirst = index === 0;
            const isLast = index === segments.length - 1;

            return (
              <Tooltip key={segment.status}>
                <TooltipTrigger
                  render={
                    <span
                      className="group/segment relative flex h-full min-w-[4px] cursor-pointer"
                      style={{ flex: segment.count }}
                      aria-label={`${config.label}: ${segment.count}`}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <span
                        className={cn(
                          "block h-full w-full transition-colors duration-150 ease-out",
                          isFirst && "rounded-l-full",
                          isLast && "rounded-r-full",
                          "group-focus-visible/segment:ring-2 group-focus-visible/segment:ring-brand/40 group-focus-visible/segment:ring-inset",
                          CONTENT_HUB_STAGE_BAR_FILL[segment.status],
                          CONTENT_HUB_STAGE_BAR_FILL_HOVER[segment.status]
                        )}
                      />
                    </span>
                  }
                />
                <TooltipContent
                  variant="light"
                  side="top"
                  sideOffset={8}
                  className="px-2.5 py-1.5 duration-75 data-open:duration-75 data-closed:duration-75"
                >
                  <SegmentTooltipContent status={segment.status} count={segment.count} />
                </TooltipContent>
              </Tooltip>
            );
          })
        : null}
    </div>
  );
}

export function ContentHubOverview({ className }: { className?: string }) {
  const [stats, setStats] = useState(() => getContentHubOverviewStats());

  useEffect(() => {
    const refresh = () => setStats(getContentHubOverviewStats(getContentHubRowsWithLiveStatus()));
    refresh();
    const unsubScript = subscribeScriptDraftChanges(refresh);
    const unsubCaption = subscribeCaptionCoverChanges(refresh);
    return () => {
      unsubScript();
      unsubCaption();
    };
  }, []);

  return (
    <TooltipProvider delay={0}>
      <div className={cn("w-full space-y-4", className)}>
        {TRACKS.map((track) => {
          const breakdown = stats[track.key];
          const approved = breakdown.counts.Approved;

          return (
            <div key={track.key} className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[12px] font-medium leading-none text-gray-700">{track.label}</p>
                <p className="shrink-0 tabular-nums leading-none text-gray-400">
                  <span className="text-[15px] font-bold text-brand">{approved}</span>
                  <span className="text-[12px] font-semibold text-gray-400"> / {breakdown.total}</span>
                  <span className="text-[11px]"> approved</span>
                </p>
              </div>
              <StageSegmentBar breakdown={breakdown} />
            </div>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

export { getContentHubOverviewStats };
