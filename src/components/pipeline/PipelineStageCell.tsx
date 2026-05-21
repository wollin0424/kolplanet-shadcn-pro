"use client";

import type { StageBadgeConfig } from "@/lib/pipeline/stageStatuses";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, CircleDashed } from "lucide-react";

/**
 * Incomplete: orange dashed ring. Done: green check icon + gray label (same hover as others);
 * failed (rose tone): alert icon + gray label, brand link hover on label.
 */
export default function PipelineStageCell({ config }: { config: StageBadgeConfig }) {
  const isComplete = config.completed === true;
  const isFailed = config.tone === "rose";

  const iconClass = "size-3.5 shrink-0";
  const stroke = 2.25;

  return (
    <button
      type="button"
      className={cn(
        "group/stage inline-flex max-w-full min-w-0 items-center gap-2 p-0",
        "text-left text-[12px] font-medium whitespace-nowrap",
        "cursor-pointer transition-colors duration-150",
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
      ) : (
        <CircleDashed
          className={cn(iconClass, "text-orange-500")}
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
    </button>
  );
}
