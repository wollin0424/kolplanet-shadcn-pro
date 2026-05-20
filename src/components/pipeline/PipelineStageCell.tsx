"use client";

import type { StageBadgeConfig } from "@/lib/pipeline/stageStatuses";
import { cn } from "@/lib/utils";

/**
 * Status dot + label; hover only on this control (group/stage, not table row).
 * Brand link-style hover — no dropdown chevron.
 */
export default function PipelineStageCell({ config }: { config: StageBadgeConfig }) {
  const isComplete = config.completed === true;

  return (
    <button
      type="button"
      className={cn(
        "group/stage inline-flex max-w-full min-w-0 items-center gap-1.5 p-0",
        "text-left text-[12px] font-medium whitespace-nowrap text-gray-500",
        "cursor-pointer transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-1"
      )}
    >
      <span
        className={cn(
          "h-2 w-2 shrink-0 rounded-full",
          isComplete ? "bg-emerald-500" : "bg-amber-400"
        )}
        aria-hidden
      />
      <span
        className={cn(
          "min-w-0 truncate transition-colors",
          "group-hover/stage:text-brand group-hover/stage:underline group-hover/stage:underline-offset-[3px] group-hover/stage:decoration-brand/40"
        )}
      >
        {config.label}
      </span>
    </button>
  );
}
