"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle } from "@/lib/icons";

export function UpdatePostStatusDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-[460px]"
        showCloseButton
      >
        <div className="border-b border-gray-100 bg-gradient-to-b from-gray-50/80 to-white px-6 pt-6 pb-5 text-center">
          <span className="mx-auto inline-flex size-11 items-center justify-center rounded-full bg-red-50 text-red-600 ring-1 ring-red-100">
            <AlertCircle size={22} strokeWidth={2} />
          </span>
          <DialogTitle className="mt-4 text-base font-semibold text-gray-900">
            Update Post Status
          </DialogTitle>
          <DialogDescription className="mx-auto mt-3 max-w-[380px] text-[13px] leading-relaxed text-gray-500">
            Please ensure the video, caption, and cover fully meet the client&apos;s requirements
            before proceeding. This will override system validation and mark the post as
            &quot;Post Approved&quot;. This action cannot be undone.
          </DialogDescription>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="h-9 px-4 text-[13px]"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="brand"
            className="h-9 px-4 text-[13px]"
            onClick={handleConfirm}
          >
            Mark as Post Approved
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
