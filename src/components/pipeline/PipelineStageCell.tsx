"use client";

import StageProgressIcon from "@/components/pipeline/StageProgressIcon";
import {
  getStageHoverPillClass,
  type StageBadgeConfig,
} from "@/lib/pipeline/stageStatuses";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

/**
 * Default: gray text + progress ring (in progress) or check (done).
 * Row hover: semantic-colored tag — padding/border always reserved to avoid column jump.
 */
export default function PipelineStageCell({ config }: { config: StageBadgeConfig }) {
  const isComplete = config.completed === true;

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-full border border-transparent px-2.5 py-0.5",
        "text-[12px] font-medium whitespace-nowrap transition-colors duration-150",
        "text-gray-500",
        getStageHoverPillClass(config.tone)
      )}
    >
      {isComplete ? (
        <Check
          size={13}
          strokeWidth={2.5}
          className="shrink-0 text-gray-400 group-hover:text-current"
          aria-hidden
        />
      ) : (
        <StageProgressIcon
          step={config.progressStep}
          className="shrink-0 text-gray-400 group-hover:text-current"
        />
      )}
      <span className="truncate">{config.label}</span>
    </span>
  );
}
