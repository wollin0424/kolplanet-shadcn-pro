"use client";

import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { FileText, Plus, RotateCcw, Sparkles, Upload } from "lucide-react";

function SummaryField({
  label,
  current,
  previous,
}: {
  label: string;
  current: string;
  previous: string;
}) {
  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1.5">
        {label}
      </p>
      <p className="text-[13px] font-medium text-red-600">{current}</p>
      <p className="text-[12px] text-gray-400 line-through mt-0.5">{previous}</p>
    </div>
  );
}

function PanelCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export default function ApprovePayoutSheet({
  open,
  onOpenChange,
  influencerHandle = "@instagram ins",
  influencerName = "Amelia Stone",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  influencerHandle?: string;
  influencerName?: string;
}) {
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [beneficiaryName, setBeneficiaryName] = useState("Blue Orbit Media Pte. Ltd.");
  const [bank, setBank] = useState("Bank of China");
  const [accountNumber, setAccountNumber] = useState("1234 5678 9012");
  const [swiftCode, setSwiftCode] = useState("BKCHSGSG");
  const [bankAddress, setBankAddress] = useState(
    "88 Century Avenue, Pudong New Area, Shanghai, China"
  );
  const [paymentRemarks, setPaymentRemarks] = useState("");

  const initials = influencerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton
        className="p-0 gap-0 flex flex-col data-[side=right]:w-[min(920px,92vw)] data-[side=right]:max-w-[92vw] data-[side=right]:sm:max-w-[92vw]"
      >
        {/* Header */}
        <div className="shrink-0 px-7 py-5 border-b border-gray-100 bg-white">
          <div className="flex items-start justify-between gap-4 pr-8">
            <div className="min-w-0">
              <h2 className="text-[17px] font-semibold text-gray-900 tracking-tight">
                Approve Payout
              </h2>
              <p className="mt-1.5 text-[12px] text-gray-500 leading-relaxed max-w-[52ch]">
                Review contract data and submit to lock the payout snapshot for finance.
              </p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0 rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src="" />
                <AvatarFallback className="text-[10px] font-semibold bg-violet-100 text-violet-700">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 text-right">
                <p className="text-[13px] font-semibold text-gray-900 truncate">
                  {influencerName}
                </p>
                <p className="text-[11px] text-gray-400 truncate">{influencerHandle}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Body — 左依据、右操作（对齐截图双栏） */}
        <div className="flex-1 min-h-0 overflow-y-auto bg-[#f8fafc]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-5">
            {/* 左侧 — Agreement Summary 整块 */}
            <div className="min-w-0">
              <div className="mb-3">
                <h3 className="text-[14px] font-semibold text-gray-900">Agreement Summary</h3>
                <p className="mt-0.5 text-[11px] text-gray-400">Data captured at: May07.2026</p>
              </div>

              <PanelCard className="p-5">
                <SummaryField
                  label="Legal Name"
                  current="Blue Orbit Media Pte. Ltd."
                  previous="Blue Orbit Media Ltd."
                />
                <SummaryField
                  label="Contract Value"
                  current="USD 10,000"
                  previous="USD 9,500"
                />
                <SummaryField
                  label="Payment Method"
                  current="50% Advance"
                  previous="30% Advance"
                />
                <SummaryField
                  label="Payment Term"
                  current="45 Days"
                  previous="30 Days"
                />

                <div className="mt-5 pt-5 border-t border-gray-100 rounded-xl bg-slate-50/80 -mx-1 px-4 pb-1">
                  <h4 className="text-[12px] font-semibold text-gray-800 mb-3">Payment Details</h4>
                  <SummaryField
                    label="Beneficiary Name"
                    current="Blue Orbit Media Pte. Ltd."
                    previous="Blue Orbit Media Ltd."
                  />
                  <SummaryField
                    label="Bank"
                    current="Bank of China"
                    previous="Bank of China (HK)"
                  />
                  <SummaryField
                    label="Account Number"
                    current="1234 5678 9012"
                    previous="1234 5678 0000"
                  />
                  <SummaryField
                    label="Swift Code"
                    current="BKCHSGSG"
                    previous="BKCHHKHH"
                  />
                  <SummaryField
                    label="Bank Address"
                    current="88 Century Avenue, Pudong New Area, Shanghai, China"
                    previous="1 Garden Road, Central, Hong Kong"
                  />
                </div>

                <div className="mt-5 pt-5 border-t border-gray-100">
                  <h4 className="text-[12px] font-semibold text-gray-800 mb-3">Agreement</h4>
                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-2">
                    Updated Attachments
                  </p>
                  <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/60 px-3.5 py-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-gray-100 text-gray-500">
                      <FileText size={16} />
                    </span>
                    <span className="text-[13px] font-medium text-gray-800 truncate">
                      Signed_IO_V1_Original.pdf
                    </span>
                  </div>
                </div>
              </PanelCard>
            </div>

            {/* 右侧 — Payout Details（对齐截图） */}
            <div className="min-w-0 space-y-4">
              <PanelCard className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-[14px] font-semibold text-gray-900">Payout Details</h3>
                    <p className="mt-1 text-[12px] text-gray-500 leading-relaxed">
                      Submission will freeze this data snapshot for finance.
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700">
                    Waiting for Validation
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-gray-50/80 border border-gray-100 p-3.5">
                  <div>
                    <p className="text-[11px] text-gray-400">Approved Amount</p>
                    <p className="mt-0.5 text-[13px] font-semibold text-gray-900 tabular-nums">
                      USD 10,000{" "}
                      <span className="font-normal text-gray-400">/ USD 10,000</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400">Active Requests</p>
                    <p className="mt-0.5 text-[13px] font-medium text-gray-700">
                      Pending/Failed
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-gray-100 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[12px] font-semibold text-gray-800">Installment 1</p>
                      <p className="mt-1 text-[13px] font-semibold text-gray-900 tabular-nums">
                        USD 10,000
                      </p>
                      <p className="mt-0.5 text-[11px] text-gray-400 tabular-nums">
                        Due Jan01.2024
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
                        Pending
                      </span>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-[12px] text-gray-500 hover:text-gray-800 transition-colors"
                      >
                        <RotateCcw size={13} />
                        Void
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-brand hover:underline"
                >
                  <Plus size={14} />
                  Add Installment
                </button>
                <p className="mt-2 text-[12px] font-medium text-red-500 tabular-nums">
                  Remaining to Allocate: USD 0
                </p>
              </PanelCard>

              <button
                type="button"
                className="w-full rounded-xl border-2 border-dashed border-amber-200/90 bg-gradient-to-br from-amber-50/50 to-white p-5 text-left transition-colors hover:border-amber-300 hover:bg-amber-50/40"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-amber-100 text-amber-600 shadow-sm">
                    <Upload size={18} />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-amber-800">
                        Upload Invoice
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100/80 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                        <Sparkles size={10} />
                        AI Fast Fill Enabled
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-gray-500">
                      Drop file or click to upload — fields below will auto-fill when ready.
                    </p>
                  </div>
                </div>
              </button>

              <PanelCard className="p-5 bg-blue-50/30 border-blue-100/80">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-gray-700">
                      Invoice Amount
                    </label>
                    <Input
                      value={invoiceAmount}
                      onChange={(e) => setInvoiceAmount(e.target.value)}
                      className="h-9 text-[13px] border-rose-100 bg-white focus-visible:border-rose-200 focus-visible:ring-rose-100/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-gray-700">
                      Invoice Number
                    </label>
                    <Input
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="h-9 text-[13px] border-rose-100 bg-white focus-visible:border-rose-200 focus-visible:ring-rose-100/50"
                    />
                  </div>
                </div>

                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Bank Details
                </p>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-gray-700">
                      Beneficiary Name
                    </label>
                    <Input
                      value={beneficiaryName}
                      onChange={(e) => setBeneficiaryName(e.target.value)}
                      className="h-9 text-[13px] border-rose-100 bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-gray-700">Bank</label>
                    <Input
                      value={bank}
                      onChange={(e) => setBank(e.target.value)}
                      className="h-9 text-[13px] border-rose-100 bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-gray-700">
                        Account Number
                      </label>
                      <Input
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="h-9 text-[13px] border-rose-100 bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-gray-700">
                        Swift Code
                      </label>
                      <Input
                        value={swiftCode}
                        onChange={(e) => setSwiftCode(e.target.value)}
                        className="h-9 text-[13px] border-rose-100 bg-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-gray-700">
                      Bank Address
                    </label>
                    <Textarea
                      value={bankAddress}
                      onChange={(e) => setBankAddress(e.target.value)}
                      className="min-h-[72px] text-[13px] border-rose-100 bg-white resize-none"
                    />
                  </div>
                </div>
              </PanelCard>

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-gray-700">Payment Remarks</label>
                <Textarea
                  value={paymentRemarks}
                  onChange={(e) => setPaymentRemarks(e.target.value)}
                  placeholder="Add remarks for this payout request"
                  className="min-h-[88px] text-[13px] border-gray-200 bg-white resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-end gap-3 px-7 py-4 border-t border-gray-100 bg-white">
          <Button
            variant="outline"
            className="h-10 min-w-[120px] text-[13px] border-gray-200"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="h-10 min-w-[160px] text-[13px] text-white"
            style={{ backgroundColor: "#023E8A" }}
            onClick={() => onOpenChange(false)}
          >
            Confirm & Lock
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
