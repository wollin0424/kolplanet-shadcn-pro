import { cn } from "@/lib/utils";
import { STAGE_PROGRESS_TOTAL } from "@/lib/pipeline/stageStatuses";

/** Ring fill on a fixed step scale (e.g. 3/5 ≈ 60%). */
export default function StageProgressIcon({
  step,
  total = STAGE_PROGRESS_TOTAL,
  className,
}: {
  step: number;
  total?: number;
  className?: string;
}) {
  const progress = Math.min(1, Math.max(0, step / total));
  const cx = 6;
  const cy = 6;
  const r = 4.25;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - progress);

  return (
    <svg
      viewBox="0 0 12 12"
      className={cn("h-3 w-3 shrink-0", className)}
      aria-hidden
    >
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        opacity={0.28}
      />
      {progress > 0 ? (
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      ) : null}
    </svg>
  );
}
