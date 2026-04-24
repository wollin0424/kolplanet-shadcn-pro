"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { ChevronDown, X } from "lucide-react";

export type VettingStatus =
  | "Shortlisted"
  | "Contacted"
  | "Proposed"
  | "Pending"
  | "Approved"
  | "No Response"
  | "KOL Declined"
  | "Rejected: Over Budget"
  | "Rejected: Poor Content"
  | "Rejected: Not a Fit";

export const ALL_STATUSES: VettingStatus[] = [
  "Shortlisted",
  "Contacted",
  "Proposed",
  "Pending",
  "Approved",
  "No Response",
  "KOL Declined",
  "Rejected: Over Budget",
  "Rejected: Poor Content",
  "Rejected: Not a Fit",
];

const statusStyle: Record<VettingStatus, { bg: string; text: string }> = {
  Shortlisted:              { bg: "bg-emerald-50", text: "text-emerald-700" },
  Contacted:                { bg: "bg-blue-50",    text: "text-blue-700" },
  Proposed:                 { bg: "bg-violet-50",  text: "text-violet-700" },
  Pending:                  { bg: "bg-amber-50",   text: "text-amber-700" },
  Approved:                 { bg: "bg-brand-50",   text: "text-brand" },
  "No Response":            { bg: "bg-gray-100",   text: "text-gray-600" },
  "KOL Declined":           { bg: "bg-orange-50",  text: "text-orange-700" },
  "Rejected: Over Budget":  { bg: "bg-red-50",     text: "text-red-600" },
  "Rejected: Poor Content": { bg: "bg-red-50",     text: "text-red-600" },
  "Rejected: Not a Fit":    { bg: "bg-red-50",     text: "text-red-600" },
};

function StatusBadge({
  status,
  onRemove,
}: {
  status: VettingStatus;
  onRemove?: () => void;
}) {
  const s = statusStyle[status];
  return (
    <span
      className={cn(
        "group/sb inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
        s.bg,
        s.text
      )}
    >
      <span>{status}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="opacity-0 group-hover/sb:opacity-100 transition-opacity hover:text-gray-900"
          aria-label={`Remove ${status}`}
        >
          <X size={10} />
        </button>
      )}
    </span>
  );
}

export function VettingStatusSelect({
  value,
  onChange,
  maxVisible = 1,
}: {
  value: VettingStatus[];
  onChange: (next: VettingStatus[]) => void;
  /** Table cell: show this many full badges; the rest are folded into +N. */
  maxVisible?: number;
}) {
  const [open, setOpen] = useState(false);

  const toggle = (s: VettingStatus) => {
    if (value.includes(s)) onChange(value.filter((v) => v !== s));
    else onChange([...value, s]);
  };

  const visible = value.slice(0, maxVisible);
  const restCount = Math.max(0, value.length - maxVisible);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "w-full min-h-[32px] flex items-start gap-1.5 text-left rounded-md px-2 py-1 transition-colors cursor-pointer",
          "hover:bg-gray-50 border border-transparent hover:border-gray-200",
          open && "bg-gray-50 border-gray-200"
        )}
      >
        <div className="flex flex-wrap gap-1 flex-1 min-w-0 py-0.5">
          {value.length === 0 ? (
            <span className="text-[12px] text-gray-400 px-1 py-0.5">Select status…</span>
          ) : (
            <>
              {visible.map((s) => (
                <StatusBadge key={s} status={s} />
              ))}
              {restCount > 0 && (
                <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium bg-gray-100 text-gray-600 tabular-nums whitespace-nowrap">
                  +{restCount}
                </span>
              )}
            </>
          )}
        </div>
        <ChevronDown size={12} className="text-gray-400 mt-1.5 shrink-0" />
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-[260px] p-0 rounded-lg border-gray-200"
      >
        <div className="max-h-[320px] overflow-y-auto py-1">
          {ALL_STATUSES.map((s) => {
            const active = value.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggle(s)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
              >
                <Checkbox
                  checked={active}
                  className="pointer-events-none data-[state=checked]:bg-brand data-[state=checked]:border-brand border-gray-300"
                />
                <span className="text-[13px] text-gray-800 flex-1">{s}</span>
              </button>
            );
          })}
        </div>

        {value.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-3 py-2">
            <span className="text-[11px] text-gray-500 tabular-nums">
              {value.length} selected
            </span>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-[11px] text-gray-500 hover:text-gray-900 transition-colors"
            >
              Clear
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
