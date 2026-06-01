"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

function StaffInitialBadge({
  initial,
  variant,
}: {
  initial: string;
  variant: "sales" | "pm";
}) {
  return (
    <span
      className={cn(
        "inline-flex size-5 items-center justify-center rounded-full border text-[10px] font-semibold ring-2 ring-white",
        variant === "sales"
          ? "border-sky-200 bg-sky-50 text-sky-600"
          : "border-emerald-200 bg-emerald-50 text-emerald-600"
      )}
      aria-hidden
    >
      {initial}
    </span>
  );
}

function HoverField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-gray-400">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}

export function CampaignStaffIcons({ sales, pm }: { sales: string; pm: string }) {
  const salesInitial = sales.charAt(0).toUpperCase();
  const pmInitial = pm.charAt(0).toUpperCase();

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span
            className="group inline-flex shrink-0 items-center rounded-full outline-none transition-shadow hover:shadow-[0_0_0_3px_rgba(0,0,0,0.04)] focus-visible:ring-2 focus-visible:ring-brand/25"
            aria-label={`Sales: ${sales}, PM: ${pm}`}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          />
        }
      >
        <span className="inline-flex items-center -space-x-1">
          <StaffInitialBadge initial={salesInitial} variant="sales" />
          <StaffInitialBadge initial={pmInitial} variant="pm" />
        </span>
      </TooltipTrigger>
      <TooltipContent variant="light" side="bottom" align="start" className="gap-2">
        <HoverField label="Sales: " value={sales} />
        <HoverField label="PM: " value={pm} />
      </TooltipContent>
    </Tooltip>
  );
}
