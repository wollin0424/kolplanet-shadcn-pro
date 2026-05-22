"use client";

import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import AddInstallmentDialog from "@/components/AddInstallmentDialog";
import { FileUploadZone } from "@/components/FileUploadZone";
import {
  IconContractFile,
  IconInfo,
  IconPlus,
  IconSparkles,
  IconUndo,
} from "@/lib/icons";

const CURRENCY = "USD";
const CONTRACT_TOTAL = 10_000;
const REMAINING_CONTRACT = 5_000;

type InstallmentStatus = "processing" | "successful" | "pending" | "failed";

type Installment = {
  number: number;
  amount: number;
  dueDate: string;
  status: InstallmentStatus;
};

const INITIAL_SETTLED: Installment[] = [
  { number: 2, amount: 1000, dueDate: "May 27, 2026", status: "processing" },
];

const INITIAL_ACTIVE: Installment[] = [
  { number: 3, amount: 533, dueDate: "May 29, 2026", status: "failed" },
  { number: 4, amount: 2333, dueDate: "May 30, 2026", status: "pending" },
];

function sumInstallmentAmounts(installments: Installment[]) {
  return installments.reduce((total, inst) => total + inst.amount, 0);
}

function formatMoney(amount: number) {
  return `${CURRENCY} ${amount.toLocaleString("en-US")}`;
}

function InstallmentStatusBadge({ status }: { status: InstallmentStatus }) {
  const config = {
    processing: {
      label: "Processing",
      className: "border-sky-200 bg-sky-50 text-sky-700",
    },
    successful: {
      label: "Successful",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
    pending: {
      label: "Pending",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    },
    failed: {
      label: "Failed",
      className: "border-red-200 bg-red-50 text-red-700",
    },
  }[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
        config.className
      )}
    >
      {config.label}
      {status === "failed" ? <IconInfo size={12} className="opacity-80" /> : null}
    </span>
  );
}

function InstallmentSection({
  title,
  subtitle,
  installments,
  showActions = false,
  headerAction,
}: {
  title: string;
  subtitle: string;
  installments: Installment[];
  showActions?: boolean;
  headerAction?: React.ReactNode;
}) {
  if (installments.length === 0 && !headerAction) return null;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          <span className="text-[12px] font-semibold text-gray-800">{title}</span>
          <span className="text-[11px] text-gray-400">{subtitle}</span>
        </div>
        {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
      </div>
      {installments.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-gray-100 divide-y divide-gray-100">
          {installments.map((inst) => (
            <InstallmentRow key={inst.number} inst={inst} showActions={showActions} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

const INSTALLMENT_ACCENT: Record<InstallmentStatus, string> = {
  processing: "border-l-sky-400",
  successful: "border-l-emerald-400",
  pending: "border-l-amber-400",
  failed: "border-l-red-400",
};

function InstallmentRow({
  inst,
  showActions = false,
}: {
  inst: Installment;
  showActions?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex gap-3 border-l-[3px] bg-white px-3 py-3.5 transition-colors hover:bg-gray-50/80",
        INSTALLMENT_ACCENT[inst.status],
        showActions ? "items-start" : "items-center"
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="text-[13px] font-medium text-gray-900">
            Installment {inst.number}
          </p>
          <InstallmentStatusBadge status={inst.status} />
        </div>
        <p className="mt-0.5 text-[11px] text-gray-500">Due {inst.dueDate}</p>
      </div>
      <div
        className={cn(
          "shrink-0 flex flex-col items-end pl-2",
          showActions ? "gap-1 self-start" : "self-center justify-center"
        )}
      >
        <p className="text-[14px] font-semibold text-gray-900 tabular-nums leading-none">
          {formatMoney(inst.amount)}
        </p>
        {showActions ? (
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded px-1 py-0.5 text-[11px] text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
          >
            <IconUndo size={12} />
            Void
          </button>
        ) : null}
      </div>
    </div>
  );
}

function SummarySection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("pt-6 mt-6 border-t border-gray-100", className)}>
      <h4 className="text-[11px] font-semibold text-gray-500 mb-3">
        {title}
      </h4>
      {children}
    </section>
  );
}

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
    <div className="py-2.5">
      <p className="text-[11px] font-medium text-gray-400 mb-1">
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
  const [settledInstallments] = useState<Installment[]>(INITIAL_SETTLED);
  const [activeInstallments, setActiveInstallments] =
    useState<Installment[]>(INITIAL_ACTIVE);
  const [addInstallmentOpen, setAddInstallmentOpen] = useState(false);

  const initials = influencerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const payoutInstallments = [...settledInstallments, ...activeInstallments];
  const payoutAmount = sumInstallmentAmounts(payoutInstallments);
  const remainingToAllocate = Math.max(0, REMAINING_CONTRACT - payoutAmount);

  const handleAddInstallment = ({
    amount,
    dueDate,
  }: {
    amount: number;
    dueDate: string;
  }) => {
    const maxNumber = payoutInstallments.reduce(
      (max, inst) => Math.max(max, inst.number),
      0
    );
    setActiveInstallments((prev) => [
      ...prev,
      {
        number: maxNumber + 1,
        amount,
        dueDate,
        status: "pending",
      },
    ]);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton
        className="p-0 gap-0 flex flex-col data-[side=right]:w-[min(840px,94vw)] data-[side=right]:max-w-[94vw] data-[side=right]:sm:max-w-[840px]"
      >
        {/* Header */}
        <div className="shrink-0 px-7 py-5 border-b border-gray-100 bg-white">
          <div className="flex items-center justify-between gap-6 pr-8">
            <div className="min-w-0 flex-1">
              <h2 className="text-[17px] font-semibold text-gray-900 tracking-tight">
                Approve Payout
              </h2>
              <p className="mt-1 text-[12px] text-gray-500 whitespace-nowrap">
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
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3.8fr)_minmax(0,6.2fr)] gap-5 p-5">
            {/* 左侧 — Agreement Summary 整块 */}
            <div className="min-w-0">
              <div className="mb-3">
                <h3 className="text-[14px] font-semibold text-gray-900">Agreement Summary</h3>
                <p className="mt-0.5 text-[11px] text-gray-400">Data captured at: May07.2026</p>
              </div>

              <PanelCard className="p-6">
                <SummarySection title="Contract" className="mt-0 border-t-0 pt-0">
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
                </SummarySection>

                <SummarySection title="Payment Details">
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
                </SummarySection>

                <SummarySection title="Agreement">
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 py-2 text-left transition-colors hover:text-brand"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gray-50 text-gray-500">
                      <IconContractFile size={15} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[11px] text-gray-400">
                        Updated Attachment
                      </span>
                      <span className="block text-[13px] font-medium text-gray-800 truncate">
                        Signed_IO_V1_Original.pdf
                      </span>
                    </span>
                  </button>
                </SummarySection>
              </PanelCard>
            </div>

            {/* 右侧 — Payout Details（对齐截图标注） */}
            <div className="min-w-0 space-y-6">
              <PanelCard className="p-6 flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[14px] font-semibold text-gray-900">Payout Details</h3>
                    <span className="inline-flex shrink-0 items-center rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700">
                      Waiting for Validation
                    </span>
                  </div>
                    <p className="mt-0.5 text-[11px] text-gray-400 whitespace-nowrap">
                      Submission will freeze this data snapshot for finance.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 divide-x divide-gray-200/80 rounded-lg border border-gray-100 bg-gray-50/60 overflow-hidden">
                  <div className="px-3.5 py-3.5">
                    <p className="text-[11px] text-gray-500">
                      Payout Amount <span className="text-red-500">*</span>
                    </p>
                    <p className="mt-2 text-[16px] font-semibold text-gray-900 tabular-nums leading-tight">
                      {formatMoney(payoutAmount)}
                    </p>
                  </div>
                  <div className="px-3.5 py-3.5">
                    <p className="text-[11px] text-gray-500">Total Payable</p>
                    <p className="mt-2 text-[16px] font-semibold text-gray-900 tabular-nums leading-tight">
                      {formatMoney(CONTRACT_TOTAL)}
                    </p>
                  </div>
                  <div className="px-3.5 py-3.5">
                    <p className="text-[11px] text-gray-500">Remaining to Allocate</p>
                    <p
                      className={cn(
                        "mt-2 text-[16px] font-semibold tabular-nums leading-tight",
                        remainingToAllocate > 0 ? "text-gray-900" : "text-gray-500"
                      )}
                    >
                      {formatMoney(remainingToAllocate)}
                    </p>
                  </div>
                  </div>
                </div>

                <InstallmentSection
                  title="Settled Requests"
                  subtitle="Processing Or Success"
                  installments={settledInstallments}
                />
                <InstallmentSection
                  title="Active Requests"
                  subtitle="Pending Or Failed"
                  installments={activeInstallments}
                  showActions
                />
                <button
                  type="button"
                  onClick={() => setAddInstallmentOpen(true)}
                  className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 bg-white text-[13px] font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50"
                >
                  <IconPlus size={14} className="text-gray-600" />
                  Add Installment
                </button>
              </PanelCard>

              <AddInstallmentDialog
                open={addInstallmentOpen}
                onOpenChange={setAddInstallmentOpen}
                onAdd={handleAddInstallment}
              />

              <PanelCard className="p-6 flex flex-col gap-6">
                <FileUploadZone
                  title="Upload Invoice"
                  hint="Drop file or click to upload — fields below will auto-fill when ready."
                  variant="amber"
                  badge={
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100/80 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                      <IconSparkles size={10} />
                      AI Fast Fill Enabled
                    </span>
                  }
                />

                <div className="pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-gray-700">
                      Invoice Amount
                    </label>
                    <Input
                      value={invoiceAmount}
                      onChange={(e) => setInvoiceAmount(e.target.value)}
                      placeholder="Enter invoice amount"
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
                      placeholder="Enter invoice number"
                      className="h-9 text-[13px] border-rose-100 bg-white focus-visible:border-rose-200 focus-visible:ring-rose-100/50"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <p className="text-[11px] font-semibold text-gray-500 mb-4">
                    Bank Details
                  </p>
                  <div className="space-y-4">
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
                </div>

                <div className="pt-6 border-t border-gray-100 space-y-2">
                  <label className="text-[12px] font-medium text-gray-700">
                    Payment Remarks
                  </label>
                  <Textarea
                    value={paymentRemarks}
                    onChange={(e) => setPaymentRemarks(e.target.value)}
                    placeholder="Add remarks for this payout request"
                    className="min-h-[88px] text-[13px] border-gray-200 bg-white resize-none"
                  />
                </div>
              </PanelCard>
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
            variant="brand"
            className="h-10 min-w-[160px] text-[13px]"
            onClick={() => onOpenChange(false)}
          >
            Confirm & Lock
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
