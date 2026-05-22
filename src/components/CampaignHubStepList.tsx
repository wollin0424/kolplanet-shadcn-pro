"use client";

import { cn } from "@/lib/utils";
import {
  IconHubStepActive,
  IconHubStepCompleted,
  IconHubStepScheduled,
} from "@/lib/icons";

type CampaignHubStepListProps = {
  steps: readonly string[];
  completedSteps: number;
  stepTimestamps: (string | null)[];
  activeStepIndex?: number;
  /** When omitted, active step is inferred as `completedSteps` if still in progress */
  inferActiveStep?: boolean;
  activeIcon?: "clock" | "hourglass";
};

function resolveActiveIndex(
  completedSteps: number,
  stepCount: number,
  activeStepIndex?: number,
  inferActiveStep = false
) {
  if (activeStepIndex !== undefined) return activeStepIndex;
  if (inferActiveStep && completedSteps < stepCount) return completedSteps;
  return -1;
}

export function CampaignHubStepList({
  steps,
  completedSteps,
  stepTimestamps,
  activeStepIndex,
  inferActiveStep = false,
  activeIcon = "clock",
}: CampaignHubStepListProps) {
  const resolvedActiveIndex = resolveActiveIndex(
    completedSteps,
    steps.length,
    activeStepIndex,
    inferActiveStep
  );
  const ActiveIcon =
    activeIcon === "hourglass" ? IconHubStepActive : IconHubStepScheduled;

  return (
    <ul className="flex flex-col">
      {steps.map((step, index) => {
        const done = index < completedSteps;
        const active = index === resolvedActiveIndex;
        const isLast = index === steps.length - 1;
        const connectorDone = index < completedSteps;
        const timestamp = stepTimestamps[index];

        return (
          <li
            key={step}
            className={cn(
              "relative flex items-start gap-2.5 text-[13px]",
              !isLast && "pb-5"
            )}
          >
            {!isLast ? (
              <span
                className={cn(
                  "absolute top-5 left-[10px] w-px -translate-x-1/2",
                  connectorDone ? "bg-brand-100" : "bg-gray-200",
                  "h-[calc(100%-4px)]"
                )}
                aria-hidden
              />
            ) : null}
            <span
              className={cn(
                "relative z-10 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border bg-white",
                done
                  ? "border-brand bg-brand-50 text-brand"
                  : active
                    ? "border-brand bg-white text-brand"
                    : "border-gray-200"
              )}
            >
              {done ? (
                <IconHubStepCompleted size={12} strokeWidth={2.5} />
              ) : active ? (
                <ActiveIcon size={11} strokeWidth={2.5} />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
              )}
            </span>
            <div className="relative z-10 flex min-w-0 flex-1 items-start justify-between gap-2 pt-0.5">
              <span
                className={cn(
                  "leading-snug",
                  done || active ? "font-medium text-gray-900" : "text-gray-500"
                )}
              >
                {step}
              </span>
              <span
                className={cn(
                  "shrink-0 text-right text-[11px] leading-snug tabular-nums",
                  timestamp ? "text-gray-400" : "text-gray-300"
                )}
              >
                {timestamp ?? "--"}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
