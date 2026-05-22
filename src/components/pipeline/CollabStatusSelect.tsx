"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  COLLAB_STATUS_CONFIG,
  COLLAB_STATUS_OPTIONS,
  getStageBadgeClass,
  type CollabStatus,
} from "@/lib/pipeline/stageStatuses";
import { cn } from "@/lib/utils";
import { ChevronDown, Check } from "@/lib/icons";

function CollabStatusPill({ status }: { status: CollabStatus }) {
  const config = COLLAB_STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap",
        getStageBadgeClass(config.tone)
      )}
    >
      {config.showCheck ? <Check size={12} strokeWidth={2.6} /> : null}
      {config.label}
    </span>
  );
}

export default function CollabStatusSelect({
  status,
  onChange,
}: {
  status: CollabStatus;
  onChange: (next: CollabStatus) => void;
}) {
  const config = COLLAB_STATUS_CONFIG[status];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex max-w-full items-center gap-0.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap cursor-pointer transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-1",
          getStageBadgeClass(config.tone)
        )}
      >
        {config.showCheck ? (
          <Check size={12} strokeWidth={2.6} className="shrink-0" />
        ) : null}
        <span className="truncate">{config.label}</span>
        <ChevronDown size={12} className="opacity-65 shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[200px] p-1">
        {COLLAB_STATUS_OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt}
            onSelect={() => onChange(opt)}
            className={cn(
              "cursor-pointer rounded-md px-2 py-1.5",
              opt === status && "bg-gray-50"
            )}
          >
            <CollabStatusPill status={opt} />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
