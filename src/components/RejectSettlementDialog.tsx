"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const REJECT_CATEGORIES = [
  "Deliverables Incomplete/Missing",
  "Breach of Branding Guidelines",
  "Severe Delay in Delivery",
  "Failure to Provide Performance Data",
  "Unauthorized Content Removal",
  "Data or Content Fraud",
  "Copyright or Compliance Issues",
  "Competitive Brand Appearance",
  "Negative Brand Association",
  "Other (follow remarks)",
] as const;

export default function RejectSettlementDialog({
  open,
  onOpenChange,
  influencerName = "Amelia Stone",
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  influencerName?: string;
  onConfirm?: () => void;
}) {
  const [category, setCategory] = useState<string>("");
  const [detail, setDetail] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSave = () => {
    setConfirmOpen(true);
  };

  const handleReject = () => {
    setConfirmOpen(false);
    onConfirm?.();
    onOpenChange(false);
    setCategory("");
    setDetail("");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[16px]">Reject Settlement</DialogTitle>
            <DialogDescription className="text-[13px]">
              Reject payout for <span className="font-medium text-gray-800">{influencerName}</span>.
              Select a category and optionally add details.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-gray-700">Category *</label>
              <Select value={category} onValueChange={(v) => setCategory(v ?? "")}>
                <SelectTrigger className="h-9 w-full text-[13px]">
                  <SelectValue placeholder="Select reject reason" />
                </SelectTrigger>
                <SelectContent>
                  {REJECT_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-gray-700">Detail Description</label>
              <Textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder='e.g. "You deleted the post on Day 30, but the contract required 60 days."'
                className="min-h-[88px] text-[13px] resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!category}
              onClick={handleSave}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[16px]">Reject Settlement?</DialogTitle>
            <DialogDescription className="text-[13px] leading-relaxed">
              This action is irreversible. Once rejected, the creator will be notified immediately,
              and no further payment submissions can be made for this project. Are you sure you
              want to proceed?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
