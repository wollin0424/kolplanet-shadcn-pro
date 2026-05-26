"use client";

import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { InfluencerAvatar } from "@/components/InfluencerAvatar";
import { platformFromLabel } from "@/components/PlatformIcon";
import { Pencil } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { ClientSettlementStatus } from "@/lib/clientBilling";

const CONTRACT_TOTAL = 10_000;

function formatUsd(amount: number) {
  return `USD ${amount.toLocaleString("en-US")}`;
}

function BasisField({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-gray-100 py-3 last:border-b-0">
      <p className="text-[11px] font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-[13px] text-gray-900">{value}</p>
    </div>
  );
}

export default function ProcessPayoutSheet({
  open,
  onOpenChange,
  influencerName = "Amelia Stone",
  influencerHandle = "@instagram ins",
  approvedAmount = 4_100,
  amountPaid = 0,
  dueDate = "Feb 11, 2024",
  settlementStatus = "Waiting for Validation",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  influencerName?: string;
  influencerHandle?: string;
  approvedAmount?: number;
  amountPaid?: number;
  dueDate?: string;
  settlementStatus?: ClientSettlementStatus;
}) {
  const [paymentMode, setPaymentMode] = useState<"manual" | "api">("manual");
  const [selected, setSelected] = useState(true);
  const [paidAmount, setPaidAmount] = useState(String(approvedAmount));

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setPaymentMode("manual");
      setSelected(true);
      setPaidAmount(String(approvedAmount));
    }
    onOpenChange(next);
  };

  const balance = approvedAmount - amountPaid;
  const initials = influencerName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);

  const executionBadge =
    settlementStatus === "Validated"
      ? "bg-amber-50 text-amber-800 border-amber-200"
      : "bg-sky-50 text-sky-700 border-sky-200";

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        showCloseButton
        className="flex flex-col gap-0 p-0 data-[side=right]:w-[min(920px,96vw)] data-[side=right]:max-w-[96vw] data-[side=right]:sm:max-w-[920px]"
      >
        <div className="shrink-0 border-b border-gray-100 bg-white px-7 py-5">
          <div className="flex items-start justify-between gap-6 pr-8">
            <div className="min-w-0 flex-1">
              <h2 className="text-[17px] font-semibold tracking-tight text-gray-900">
                Process Payout
              </h2>
              <p className="mt-1 max-w-lg text-[12px] leading-relaxed text-gray-500">
                Review the approved payout details on the left and complete the payment execution
                on the right.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2.5 rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-2">
              <InfluencerAvatar
                alt={influencerName}
                platform={platformFromLabel(influencerHandle) ?? "IG"}
                fallback={initials}
                fallbackClassName="bg-violet-100 text-violet-700"
              />
              <div className="min-w-0 text-right">
                <p className="truncate text-[13px] font-semibold text-gray-900">
                  {influencerName}
                </p>
                <p className="truncate text-[11px] text-gray-400">{influencerHandle}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto bg-[var(--hub-snapshot-bg)] p-5 lg:min-w-0 lg:flex-[3.8]">
            <section>
              <h3 className="text-[15px] font-semibold text-gray-900">Payment Basis</h3>
              <p className="mt-1 text-[12px] text-gray-500">
                Locked data from approved payout data and contract reference.
              </p>

              <div className="mt-4 rounded-xl border border-gray-200 bg-white px-4 py-3">
                <p className="text-[11px] font-medium text-gray-500">Total Approved Amount</p>
                <p className="mt-1 text-[14px] font-semibold tabular-nums text-gray-900">
                  {formatUsd(approvedAmount)}{" "}
                  <span className="text-[12px] font-normal text-gray-400">
                    / {formatUsd(CONTRACT_TOTAL)} (Contract)
                  </span>
                </p>
              </div>

              <div className="mt-3 rounded-xl border border-red-200/80 bg-red-50/40 px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-semibold text-gray-900">
                      Installment 1: {formatUsd(approvedAmount)}
                    </p>
                    <p className="mt-0.5 text-[11px] text-red-600">Due: {dueDate}</p>
                  </div>
                  <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                    Pending
                  </span>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-gray-200 bg-white px-4">
                <BasisField label="Payment Remarks" value="—" />
                <BasisField label="Invoice Amount" value="—" />
                <BasisField label="Payment Method" value="50% Advance" />
                <BasisField label="Payment Term" value="45 Days" />
              </div>

              <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-[12px] font-semibold text-gray-900">Payment Details</p>
                <div className="mt-3 space-y-3">
                  <BasisField label="Beneficiary Name" value="Blue Orbit Media Pte. Ltd." />
                  <BasisField label="Beneficiary Bank" value="Bank of China" />
                  <BasisField label="Account Number" value="6222 8888 0000 1234" />
                  <BasisField label="Swift Code" value="BKCHCNBJ300" />
                </div>
              </div>
            </section>
          </div>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col border-t border-gray-100 bg-white lg:border-t-0 lg:border-l lg:flex-[6.2]">
            <div className="shrink-0 border-b border-gray-100 px-8 pb-5 pt-6">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-[15px] font-semibold text-gray-900">Payment Execution</h3>
                <span
                  className={cn(
                    "inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                    executionBadge
                  )}
                >
                  {settlementStatus}
                </span>
              </div>
              <p className="mt-1.5 text-[12px] text-gray-500">
                Review and execute the payment tasks for the selected installments.
              </p>
            </div>

            <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-8 py-6">
              <div className="flex flex-col gap-6">
                <div className="flex flex-wrap gap-6">
                  <label className="flex cursor-pointer items-center gap-2 text-[13px] text-gray-800">
                    <input
                      type="radio"
                      name="payment-mode"
                      checked={paymentMode === "manual"}
                      onChange={() => setPaymentMode("manual")}
                      className="size-4 accent-brand"
                    />
                    Manual Transfer
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-[13px] text-gray-500">
                    <input
                      type="radio"
                      name="payment-mode"
                      checked={paymentMode === "api"}
                      onChange={() => setPaymentMode("api")}
                      className="size-4 accent-brand"
                    />
                    Automated API Payout
                  </label>
                </div>

                <div>
                  <p className="text-[12px] font-medium text-gray-700">
                    Paid Amount{" "}
                    <span className="font-normal text-gray-500">
                      (Total: {formatUsd(amountPaid)})
                    </span>
                  </p>

                  <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50/50 p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <Checkbox
                        checked={selected}
                        onCheckedChange={(c) => setSelected(c === true)}
                      />
                      <span className="text-[13px] font-medium text-gray-900">Installment 1</span>
                      <div className="flex h-9 overflow-hidden rounded-lg border border-gray-200 bg-white">
                        <span className="flex items-center border-r border-gray-200 bg-gray-50 px-2.5 text-[12px] text-gray-500">
                          USD
                        </span>
                        <input
                          value={paidAmount}
                          onChange={(e) => setPaidAmount(e.target.value)}
                          className="w-24 min-w-0 bg-transparent px-2.5 text-[13px] tabular-nums text-gray-900 outline-none"
                        />
                      </div>
                      <input
                        readOnly
                        value={dueDate}
                        className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-[12px] text-gray-700"
                      />
                      <Button variant="outline" size="sm" className="h-9 gap-1.5 text-[12px]">
                        <Pencil size={13} strokeWidth={2} />
                        Update
                      </Button>
                    </div>
                    <p className="mt-2 pl-7 text-[11px] text-gray-500">
                      Balance after transfer: {formatUsd(balance)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-center gap-3 border-t border-gray-100 bg-white px-8 py-4">
              <Button
                variant="outline"
                className="h-10 min-w-[120px] border-gray-200 text-[13px]"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                variant="brand"
                className="h-10 min-w-[140px] text-[13px]"
                disabled={!selected}
                onClick={() => onOpenChange(false)}
              >
                Confirm Transfer
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
