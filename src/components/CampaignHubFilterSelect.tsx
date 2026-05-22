"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ChevronDown } from "@/lib/icons";

export function CampaignHubFilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const isAll = value === "All";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex h-8 max-w-[140px] min-w-0 items-center justify-between gap-1 rounded-lg border border-gray-200 bg-white px-2.5",
          "text-[12px] text-gray-700 transition-colors hover:bg-gray-50"
        )}
      >
        <span className="truncate">
          <span className="text-gray-500">{label}</span>
          {!isAll ? (
            <>
              <span className="text-gray-400">: </span>
              <span className="font-medium text-gray-800">{value}</span>
            </>
          ) : null}
        </span>
        <ChevronDown size={13} className="shrink-0 text-gray-400" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="text-[13px]">
        {options.map((opt) => (
          <DropdownMenuItem key={opt} onClick={() => onChange(opt)}>
            {opt}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
