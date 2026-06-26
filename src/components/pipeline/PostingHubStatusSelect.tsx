"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  POSTING_HUB_STATUS_CONFIG,
  POSTING_HUB_STATUS_OPTIONS,
  type PostingHubStatus,
} from "@/lib/postingHubMock";
import { getStageBadgeClass } from "@/lib/pipeline/stageStatuses";
import { cn } from "@/lib/utils";
import { ChevronDown } from "@/lib/icons";

function PostingHubStatusPill({ status }: { status: PostingHubStatus }) {
  const config = POSTING_HUB_STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap",
        getStageBadgeClass(config.tone)
      )}
    >
      {config.label}
    </span>
  );
}

export default function PostingHubStatusSelect({
  status,
  onChange,
}: {
  status: PostingHubStatus;
  onChange: (next: PostingHubStatus) => void;
}) {
  const config = POSTING_HUB_STATUS_CONFIG[status];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        type="button"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        className={cn(
          "inline-flex max-w-full min-w-0 cursor-pointer items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-1",
          getStageBadgeClass(config.tone)
        )}
      >
        <span className="min-w-0 truncate">{config.label}</span>
        <ChevronDown size={12} className="shrink-0 opacity-65" strokeWidth={2} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[220px] p-1">
        {POSTING_HUB_STATUS_OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt}
            onSelect={() => onChange(opt)}
            className={cn(
              "cursor-pointer rounded-md px-2 py-1.5",
              opt === status && "bg-gray-50"
            )}
          >
            <PostingHubStatusPill status={opt} />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
