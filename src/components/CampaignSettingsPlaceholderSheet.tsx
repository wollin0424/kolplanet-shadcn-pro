"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent } from "@/components/ui/sheet";
import { X } from "@/lib/icons";

export function CampaignSettingsPlaceholderSheet({
  open,
  onOpenChange,
  title,
  description,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex h-full w-full flex-col gap-0 border-l border-gray-100 bg-white p-0 data-[side=right]:max-w-[540px] data-[side=right]:sm:max-w-[540px]"
      >
        <div className="flex shrink-0 items-center gap-3 border-b border-gray-100 px-6 py-5">
          <SheetClose
            render={
              <button
                type="button"
                className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close"
              />
            }
          >
            <X size={18} strokeWidth={2} />
          </SheetClose>
          <h2 className="text-[18px] font-semibold text-gray-900">{title}</h2>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center bg-gray-50/80 px-6 py-10">
          <p className="max-w-sm text-center text-[14px] leading-relaxed text-gray-500">{description}</p>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-gray-100 px-8 py-5">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-xl border-gray-300 px-4 text-[14px] text-gray-600"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="brand"
            className="h-10 rounded-xl px-6 text-[14px]"
            onClick={() => onOpenChange(false)}
          >
            Save
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
