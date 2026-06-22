"use client";

import {
  STAGE_PROGRESS_TOTAL,
  type StageBadgeConfig,
} from "@/lib/pipeline/stageStatuses";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle2,
  CircleDashed,
} from "@/lib/icons";

const STAGE_ICON_BOX =
  "inline-flex size-3.5 shrink-0 flex-none items-center justify-center overflow-visible leading-none";
const STAGE_ICON_STROKE = 2.25;
const STAGE_RING_CENTER = 12;
const STAGE_RING_RADIUS = 10;

function StageProgressRing({ step }: { step: number }) {
  const circumference = 2 * Math.PI * STAGE_RING_RADIUS;
  const fill = Math.min(1, Math.max(0, step / STAGE_PROGRESS_TOTAL));
  const offset = circumference * (1 - fill);

  return (
    <span className={STAGE_ICON_BOX} aria-hidden>
      <svg
        viewBox="0 0 24 24"
        className="block size-full shrink-0 -rotate-90 overflow-visible"
        aria-hidden
      >
        <circle
          cx={STAGE_RING_CENTER}
          cy={STAGE_RING_CENTER}
          r={STAGE_RING_RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth={STAGE_ICON_STROKE}
          className="text-gray-200"
        />
        <circle
          cx={STAGE_RING_CENTER}
          cy={STAGE_RING_CENTER}
          r={STAGE_RING_RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth={STAGE_ICON_STROKE}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-brand"
        />
      </svg>
    </span>
  );
}

/**
 * Not started (step 1): gray dashed ring. In progress (step 2–4): brand arc ring.
 * Done: green check. Failed (rose tone): alert icon. Label hover matches across states.
 */
export default function PipelineStageCell({
  config,
  static: isStatic = false,
}: {
  config: StageBadgeConfig;
  /** Render as non-interactive content (e.g. inside a parent button). */
  static?: boolean;
}) {
  const isComplete = config.completed === true;
  const isFailed = config.tone === "rose";
  const isInProgress = !isComplete && !isFailed && config.progressStep > 1;

  const iconClass = STAGE_ICON_BOX;
  const stroke = STAGE_ICON_STROKE;

  const Wrapper = isStatic ? "span" : "button";

  return (
    <Wrapper
      {...(!isStatic ? { type: "button" as const } : {})}
      className={cn(
        "group/stage inline-flex max-w-full min-w-0 items-center gap-2 p-0",
        "text-left text-[12px] font-medium whitespace-nowrap",
        !isStatic && "cursor-pointer transition-colors duration-150",
        !isStatic &&
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-1"
      )}
    >
      {isComplete ? (
        <CheckCircle2
          className={cn(iconClass, "text-emerald-600")}
          strokeWidth={stroke}
          aria-hidden
        />
      ) : isFailed ? (
        <AlertCircle
          className={cn(iconClass, "text-red-600")}
          strokeWidth={stroke}
          aria-hidden
        />
      ) : isInProgress ? (
        <StageProgressRing step={config.progressStep} />
      ) : (
        <CircleDashed
          className={cn(iconClass, "text-gray-400")}
          strokeWidth={stroke}
          aria-hidden
        />
      )}
      <span
        className={cn(
          "min-w-0 truncate transition-colors",
          "text-gray-700 group-hover/stage:text-brand group-hover/stage:underline group-hover/stage:underline-offset-[3px] group-hover/stage:decoration-brand/40"
        )}
      >
        {config.label}
      </span>
    </Wrapper>
  );
}
