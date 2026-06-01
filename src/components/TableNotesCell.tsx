"use client";

import { Pencil } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { MouseEvent } from "react";

export function TableNotesCell({
  value,
  ariaLabel,
  className,
  onEditClick,
}: {
  value: string;
  ariaLabel: string;
  className?: string;
  onEditClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  const display = value.trim().length > 0 ? value : "--";

  return (
    <div className={cn("flex min-w-0 items-center gap-1.5", className)}>
      <span className="min-w-0 flex-1 truncate text-[12px] text-gray-500">{display}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onEditClick?.(e);
        }}
        className="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-brand transition-colors hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25 focus-visible:ring-offset-1"
        aria-label={ariaLabel}
      >
        <Pencil size={14} strokeWidth={2} aria-hidden />
      </button>
    </div>
  );
}
