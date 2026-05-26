"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "@/lib/icons";
import { cn } from "@/lib/utils";

function StatusPill<T extends string>({
  status,
  styles,
}: {
  status: T;
  styles: Record<T, string>;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap",
        styles[status]
      )}
    >
      <span className="truncate">{status}</span>
    </span>
  );
}

export default function BillingStatusSelect<T extends string>({
  status,
  options,
  styles,
  onChange,
}: {
  status: T;
  options: readonly T[];
  styles: Record<T, string>;
  onChange: (next: T) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        type="button"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        className={cn(
          "inline-flex max-w-full cursor-pointer items-center gap-0.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-1",
          styles[status]
        )}
      >
        <span className="truncate">{status}</span>
        <ChevronDown size={12} className="shrink-0 opacity-65" strokeWidth={2} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className="z-[100] w-max min-w-[220px] max-w-none overflow-visible p-1.5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-0.5">
          {options.map((option) => (
            <DropdownMenuItem
              key={option}
              onSelect={() => onChange(option)}
              className={cn(
                "w-full cursor-pointer rounded-md px-2 py-1.5",
                option === status && "bg-gray-50"
              )}
            >
              <StatusPill status={option} styles={styles} />
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
