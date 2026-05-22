"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { IconClose, IconMoreHorizontal, IconPaymentAction } from "@/lib/icons";

export function PipelineRowActionsMenu({
  onAddToPayment,
  onTerminate,
  className,
}: {
  onAddToPayment?: () => void;
  onTerminate?: () => void;
  className?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-full border border-transparent text-gray-500",
          "transition-colors hover:border-gray-200 hover:bg-gray-50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25 focus-visible:ring-offset-1",
          className
        )}
        aria-label="Row actions"
      >
        <IconMoreHorizontal size={16} strokeWidth={2} aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[168px] p-1 text-[13px]">
        <DropdownMenuItem
          onSelect={onAddToPayment}
          className="cursor-pointer gap-2 rounded-md px-2.5 py-2 text-gray-800"
        >
          <IconPaymentAction size={16} className="shrink-0 text-brand" strokeWidth={2} />
          Add to Payment
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={onTerminate}
          className="cursor-pointer gap-2 rounded-md px-2.5 py-2 text-red-600 focus:bg-red-50 focus:text-red-600"
        >
          <IconClose size={16} className="shrink-0 text-red-600" strokeWidth={2.25} />
          Terminate
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
