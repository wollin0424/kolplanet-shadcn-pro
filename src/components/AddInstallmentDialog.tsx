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
import { Input } from "@/components/ui/input";

export type NewInstallmentInput = {
  amount: number;
  dueDate: string;
};

export default function AddInstallmentDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (installment: NewInstallmentInput) => void;
}) {
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  const reset = () => {
    setAmount("");
    setDueDate("");
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleAdd = () => {
    const parsed = Number.parseFloat(amount.replace(/,/g, ""));
    if (!parsed || parsed <= 0 || !dueDate.trim()) return;

    onAdd({ amount: parsed, dueDate: dueDate.trim() });
    handleOpenChange(false);
  };

  const canSubmit = amount.trim() !== "" && dueDate.trim() !== "";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[16px]">Add Installment</DialogTitle>
          <DialogDescription className="text-[13px]">
            Create a new payment request for this payout submission.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-gray-700">Amount *</label>
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 2,000"
              className="h-9 text-[13px]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-gray-700">Due Date *</label>
            <Input
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              placeholder="e.g. Jun 15, 2026"
              className="h-9 text-[13px]"
            />
          </div>
        </div>

        <DialogFooter className="border-t-0 bg-transparent p-0 pt-2 sm:justify-end">
          <Button
            variant="outline"
            className="h-9 text-[13px]"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="h-9 text-[13px] text-white"
            style={{ backgroundColor: "#023E8A" }}
            disabled={!canSubmit}
            onClick={handleAdd}
          >
            Add Installment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
