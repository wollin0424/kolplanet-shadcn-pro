"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { POSTING_TIMEZONE_OPTIONS } from "@/lib/postingHubMock";
import { cn } from "@/lib/utils";

export type PostingDateDraft = {
  date: string;
  timezone: string;
};

export function SetPostingDateDialog({
  open,
  onOpenChange,
  influencerLabel,
  initialDate = "",
  initialTimezone = "",
  onConfirm,
  figmaCapture = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  influencerLabel: string;
  initialDate?: string;
  initialTimezone?: string;
  onConfirm: (draft: PostingDateDraft) => void;
  figmaCapture?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <SetPostingDateDialogPanel
          key={`${initialDate}|${initialTimezone}|${influencerLabel}`}
          influencerLabel={influencerLabel}
          initialDate={initialDate}
          initialTimezone={initialTimezone}
          onConfirm={onConfirm}
          onOpenChange={onOpenChange}
          figmaCapture={figmaCapture}
        />
      ) : null}
    </Dialog>
  );
}

function SetPostingDateDialogPanel({
  onOpenChange,
  influencerLabel,
  initialDate,
  initialTimezone,
  onConfirm,
  figmaCapture = false,
}: {
  onOpenChange: (open: boolean) => void;
  influencerLabel: string;
  initialDate: string;
  initialTimezone: string;
  onConfirm: (draft: PostingDateDraft) => void;
  figmaCapture?: boolean;
}) {
  const captureDate = figmaCapture && !initialDate ? "2026-06-30" : initialDate;
  const captureTimezone = figmaCapture && !initialTimezone ? "UTC+08:00" : initialTimezone;
  const [date, setDate] = useState(captureDate);
  const [timezone, setTimezone] = useState(captureTimezone);

  const canConfirm = Boolean(date && timezone);

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm({ date, timezone });
    onOpenChange(false);
  };

  return (
    <DialogContent
        className="gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-[420px]"
        showCloseButton
        data-figma-capture={figmaCapture ? "set-posting-date-dialog" : undefined}
      >
        <div className="border-b border-gray-100 bg-gradient-to-b from-gray-50/80 to-white px-6 pt-6 pb-5">
          <div className="pr-6">
            <DialogTitle className="text-base font-semibold text-gray-900">
              Set Posting Date
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm text-gray-500">
              Set the posting date and time zone for {influencerLabel}.
            </DialogDescription>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={cn(
                  "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-[0_1px_2px_rgba(0,0,0,0.03)] outline-none transition-colors focus:border-brand/40 focus:ring-2 focus:ring-brand/10",
                  !date && "text-gray-400"
                )}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700">Time Zone</label>
              <Select
                modal={false}
                value={timezone || null}
                onValueChange={(value) => {
                  if (value) setTimezone(value);
                }}
              >
                <SelectTrigger
                  size="default"
                  className={cn(
                    "h-10! w-full rounded-lg border-gray-200 bg-white px-3 py-0 text-sm shadow-[0_1px_2px_rgba(0,0,0,0.03)]",
                    !timezone && "[&_[data-slot=select-value]]:text-gray-400"
                  )}
                >
                  <SelectValue placeholder="Time Zone" />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  {POSTING_TIMEZONE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-xs">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
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
            disabled={!canConfirm}
            onClick={handleConfirm}
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
  );
}
