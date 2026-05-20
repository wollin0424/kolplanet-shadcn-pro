"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ScrollText } from "lucide-react";
import { useCallback, useRef, useState } from "react";

export type CommercialScopeSummary = {
  deliverables: { primary: string; secondary?: string };
  financials: {
    clientPrice: string;
    influencerCost: string;
    margin: string;
  };
  source: string;
  footerNote: string;
};

const DEFAULT_SUMMARY: CommercialScopeSummary = {
  deliverables: {
    primary: "IG Reel*1",
    secondary: "Content Usage (Digital) 30 Days",
  },
  financials: {
    clientPrice: "$30,000.00",
    influencerCost: "$30,000.00",
    margin: "34%",
  },
  source: "Plan (Quote Matrix)",
  footerNote: "Please verify if the scope matches the signed contract.",
};

/** Document icon + hover card for Pipeline “Commercial” column. */
export function CommercialScopePopover({
  summary = DEFAULT_SUMMARY,
  className,
}: {
  summary?: CommercialScopeSummary;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    clearClose();
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  }, [clearClose]);

  const handleOpen = useCallback(() => {
    clearClose();
    setOpen(true);
  }, [clearClose]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        onMouseEnter={handleOpen}
        onMouseLeave={scheduleClose}
        className={cn(
          "inline-flex size-8 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors",
          "hover:text-brand hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30",
          open && "text-brand bg-brand-50",
          className
        )}
        aria-label="View commercial scope and financials"
      >
        <ScrollText className="size-[18px]" strokeWidth={1.75} aria-hidden />
      </PopoverTrigger>

      <PopoverContent
        side="right"
        align="start"
        sideOffset={8}
        onMouseEnter={handleOpen}
        onMouseLeave={scheduleClose}
        className="z-50 w-80 rounded-2xl border border-gray-100 bg-white p-0 text-[13px] leading-normal shadow-[0_8px_30px_rgba(0,0,0,0.08)] ring-0"
      >
        <div className="space-y-5 p-5">
          <section>
            <p className="text-[13px] font-bold text-gray-900">Deliverables (Scope):</p>
            <p className="mt-1.5 text-[13px] font-normal text-gray-600">
              {summary.deliverables.primary}
            </p>
            {summary.deliverables.secondary ? (
              <p className="mt-1 text-[13px] font-normal text-gray-600">
                {summary.deliverables.secondary}
              </p>
            ) : null}
          </section>

          <section>
            <p className="text-[13px] font-bold text-gray-900">Financials:</p>
            <p className="mt-1.5 text-[13px] font-normal text-gray-600">
              Client Price:{" "}
              <span className="tabular-nums">{summary.financials.clientPrice}</span>
            </p>
            <p className="mt-1 text-[13px] font-normal text-gray-600">
              Influencer Cost:{" "}
              <span className="tabular-nums">{summary.financials.influencerCost}</span>
            </p>
            <p className="mt-1 text-[13px] font-normal text-gray-600">
              Margin: <span className="tabular-nums">{summary.financials.margin}</span>
            </p>
          </section>
        </div>

        <div className="border-t border-gray-100 px-5 py-3.5">
          <p className="text-[13px] font-normal text-gray-600">
            <span className="font-bold text-gray-900">Source:</span>{" "}
            <span>{summary.source}</span>
          </p>
          <p className="mt-2 text-[12px] font-normal leading-snug text-gray-400">
            {summary.footerNote}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
