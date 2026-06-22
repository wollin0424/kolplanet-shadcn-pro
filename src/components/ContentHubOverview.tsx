import {
  CONTENT_HUB_STAGE_ORDER,
  type ContentHubStageBreakdown,
  getContentHubOverviewStats,
} from "@/lib/contentHubMock";
import {
  CONTENT_HUB_STAGE_BAR_FILL,
  CONTENT_HUB_STAGE_STATUS_CONFIG,
} from "@/lib/pipeline/stageStatuses";
import { cn } from "@/lib/utils";

const TRACKS = [
  { key: "script", label: "Script" },
  { key: "visual", label: "Visual Draft" },
  { key: "caption", label: "Caption & Cover" },
] as const;

type TrackKey = (typeof TRACKS)[number]["key"];
type ContentStats = ReturnType<typeof getContentHubOverviewStats>;

function buildSegments(breakdown: ContentHubStageBreakdown) {
  return CONTENT_HUB_STAGE_ORDER.map((status) => ({
    status,
    count: breakdown.counts[status],
  })).filter((segment) => segment.count > 0);
}

function StageSegmentBar({ breakdown }: { breakdown: ContentHubStageBreakdown }) {
  const segments = buildSegments(breakdown);

  return (
    <div
      className="flex h-1.5 min-w-0 overflow-hidden rounded-full"
      role="img"
      aria-hidden
    >
      {segments.length > 0 ? (
        segments.map((segment) => (
          <span
            key={segment.status}
            className={cn("h-full min-w-[4px]", CONTENT_HUB_STAGE_BAR_FILL[segment.status])}
            style={{ flex: segment.count }}
            title={`${CONTENT_HUB_STAGE_STATUS_CONFIG[segment.status].label}: ${segment.count}`}
          />
        ))
      ) : (
        <span className="h-full w-full bg-gray-100" />
      )}
    </div>
  );
}

export function ContentHubOverview({ className }: { className?: string }) {
  const stats = getContentHubOverviewStats();

  return (
    <div className={cn("w-full space-y-6", className)}>
      {TRACKS.map((track) => {
        const breakdown = stats[track.key];
        const approved = breakdown.counts.Approved;

        return (
          <div key={track.key} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-[12px] font-medium leading-none text-gray-700">{track.label}</p>
              <p className="shrink-0 text-[11px] tabular-nums leading-none text-gray-400">
                <span className="text-[13px] font-semibold text-emerald-700">{approved}</span>
                <span className="text-[13px] font-semibold text-gray-500"> / {breakdown.total}</span>
                <span> approved</span>
              </p>
            </div>
            <StageSegmentBar breakdown={breakdown} />
          </div>
        );
      })}
    </div>
  );
}

export { getContentHubOverviewStats };
