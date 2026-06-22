"use client";

import { useState, type ReactNode } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InfluencerAvatar } from "@/components/InfluencerAvatar";
import { getMockInfluencerAvatar } from "@/lib/mockInfluencerAvatars";
import { FileUploadZone } from "@/components/FileUploadZone";
import AddInstallmentDialog, { type InstallmentDraft } from "@/components/AddInstallmentDialog";
import { Check, Eye, FileLock, FileText, Flag, Info, Plus, RotateCcw, Sparkles, Trash2 } from "@/lib/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formInputClass, formTextareaClass } from "@/lib/formControls";
import { cn } from "@/lib/utils";

const PAYOUT_STEPS = ["Invoice", "Account Pool", "Approved Amount"] as const;
type InvoicePhase = "empty" | "parsed" | "confirmed";

const AGREEMENT_SNAPSHOT = {
  legalName: "Kaushal Media House",
  currency: "USD",
  contractTotal: 10_000,
  paymentMethod: "100% Postpaid",
  paymentMethodPrev: "50% Advance",
  paymentTerm: "45 Days",
  invoiceNumber: "INV-20250706-12343-91234-001",
  bank: {
    beneficiaryName: "Kaushal Media House",
    beneficiaryBank: "DBS Singapore",
    accountNumber: "1234567890",
    swiftCode: "DBSSSGSG",
    ifscCode: "",
    bankAddress: "12 Marina Boulevard, Singapore 018982",
  },
} as const;

const ACCOUNT_POOL_ENTRIES = [
  {
    id: "contract-primary",
    title: "Account 1",
    tag: "Contract Bank Details",
    ...AGREEMENT_SNAPSHOT.bank,
  },
] as const;

type InstallmentStatus = "Processing" | "Failed" | "Pending";

type Installment = {
  id: string;
  title: string;
  status: InstallmentStatus;
  dueDate: string;
  amount: number;
  canVoid?: boolean;
};

/** Installments already settled outside the current request cards (mock). */
const PRIOR_SETTLED_OUTSIDE_LIST = 5_000;

const SETTLED_INSTALLMENTS: Installment[] = [
  {
    id: "inst-2",
    title: "Installment 2",
    status: "Processing",
    dueDate: "May 27, 2026",
    amount: 1_000,
  },
];

const ACTIVE_INSTALLMENTS: Installment[] = [
  {
    id: "inst-3",
    title: "Installment 3",
    status: "Failed",
    dueDate: "May 29, 2026",
    amount: 533,
    canVoid: true,
  },
  {
    id: "inst-4",
    title: "Installment 4",
    status: "Pending",
    dueDate: "May 30, 2026",
    amount: 2_333,
    canVoid: true,
  },
];

const INSTALLMENT_STATUS_STYLES: Record<
  InstallmentStatus,
  { badge: string; border: string }
> = {
  Processing: {
    badge: "border-sky-200 bg-sky-50 text-sky-700",
    border: "border-l-brand",
  },
  Failed: {
    badge: "border-red-200 bg-red-50 text-red-700",
    border: "border-l-red-500",
  },
  Pending: {
    badge: "border-gray-200 bg-gray-50 text-gray-600",
    border: "border-l-gray-400",
  },
};

const REMOVED_INSTALLMENT_STYLES = {
  badge: "border-gray-200 bg-gray-100 text-gray-500",
} as const;

const VOIDED_INSTALLMENT_STYLES = {
  badge: "border-red-200 bg-red-50 text-red-700",
} as const;

type InstallmentInactiveState = "removed" | "voided";

function formatMoney(currency: string, amount: number) {
  return `${currency} ${amount.toLocaleString("en-US")}`;
}

function formatAmountInput(amount: number) {
  return amount.toLocaleString("en-US");
}

function getInstallmentNumber(title: string) {
  const match = title.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function getNextInstallmentNumber(installments: Installment[]) {
  const numbers = installments.map((item) => getInstallmentNumber(item.title));
  return (numbers.length ? Math.max(...numbers) : 0) + 1;
}

function sumInstallmentAmounts(
  settled: Installment[],
  active: Installment[],
  excludedIds: string[],
  added: Installment[]
) {
  const settledSum = settled.reduce((sum, item) => sum + item.amount, 0);
  const activeSum = active
    .filter((item) => !excludedIds.includes(item.id))
    .reduce((sum, item) => sum + item.amount, 0);
  const addedSum = added
    .filter((item) => !excludedIds.includes(item.id))
    .reduce((sum, item) => sum + item.amount, 0);
  return settledSum + activeSum + addedSum;
}

function computeApprovedAmountSummaryFromPayout(payoutAmount: number) {
  const remainingToAllocate = Math.max(
    0,
    AGREEMENT_SNAPSHOT.contractTotal - payoutAmount - PRIOR_SETTLED_OUTSIDE_LIST
  );
  const totalPayable = payoutAmount + remainingToAllocate;

  return { payoutAmount, totalPayable, remainingToAllocate };
}

const ACCOUNT_OPTIONS = ACCOUNT_POOL_ENTRIES.map((account) => ({
  id: account.id,
  label: `${account.title} - ${account.tag}`,
}));

function formatUploadedAt(date: Date) {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function parseInvoiceFromAgreement() {
  return {
    issuedParty: AGREEMENT_SNAPSHOT.legalName,
    currency: AGREEMENT_SNAPSHOT.currency,
    amount: formatAmountInput(AGREEMENT_SNAPSHOT.contractTotal),
    invoiceNumber: AGREEMENT_SNAPSHOT.invoiceNumber,
    bank: { ...AGREEMENT_SNAPSHOT.bank },
  };
}

const invoiceMoneyCurrencyTrigger =
  "!h-10 w-[108px] shrink-0 border-gray-200 bg-white px-3 text-[13px] shadow-none data-[size=default]:!h-10";

function MatchedBadge() {
  return (
    <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
      Matched
    </span>
  );
}

function DiffersBadge() {
  return (
    <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
      Differs from Contract
    </span>
  );
}

function NoDetectedBadge() {
  return (
    <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
      No Detected
    </span>
  );
}

type FieldValidationStatus = "matched" | "differs" | "missing";

function normalizeComparableValue(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

function getFieldValidationStatus(parsedValue: string, contractValue: string): FieldValidationStatus {
  if (!parsedValue.trim()) {
    return "missing";
  }
  return normalizeComparableValue(parsedValue) === normalizeComparableValue(contractValue)
    ? "matched"
    : "differs";
}

function SummaryRow({
  label,
  value,
  valueClassName,
  prev,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  prev?: string;
}) {
  return (
    <div className="border-b border-[#e2e8f0] py-4 last:border-b-0">
      <p className="text-[11px] font-medium text-gray-500">{label}</p>
      <p className={cn("mt-1 text-[14px] font-medium text-gray-900", valueClassName)}>
        {value}
      </p>
      {prev ? <p className="mt-0.5 text-[11px] text-gray-400">Prev: {prev}</p> : null}
    </div>
  );
}

function BankDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-gray-400">
        {label}
      </p>
      <p className="mt-1 text-[13px] font-medium text-gray-800">{value}</p>
    </div>
  );
}

function PayoutStepper({
  current,
  onStepChange,
}: {
  current: number;
  onStepChange: (index: number) => void;
}) {
  return (
    <div className="flex items-stretch rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-2.5">
      <div className="flex w-full items-center">
      {PAYOUT_STEPS.map((label, index) => {
        const active = index === current;
        const done = index < current;
        const isLast = index === PAYOUT_STEPS.length - 1;

        return (
          <div key={label} className="flex min-w-0 flex-1 items-center">
            <button
              type="button"
              onClick={() => onStepChange(index)}
              className={cn(
                "flex min-w-0 items-center gap-2 rounded-lg px-1 py-1 transition-colors",
                active && "text-brand"
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold tabular-nums",
                  active
                    ? "border-brand bg-brand-50 text-brand"
                    : done
                      ? "border-brand/40 bg-brand-50/60 text-brand"
                      : "border-gray-200 bg-white text-gray-400"
                )}
              >
                {index + 1}
              </span>
              <span
                className={cn(
                  "truncate text-[12px] font-medium",
                  active ? "text-brand" : "text-gray-500"
                )}
              >
                {label}
              </span>
            </button>
            {!isLast ? (
              <span
                className="mx-2 h-px min-w-[12px] flex-1 bg-gray-200"
                aria-hidden
              />
            ) : null}
          </div>
        );
      })}
      </div>
    </div>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2.5">
      <label className="block text-[12px] font-medium leading-none text-gray-700">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>
      {children}
    </div>
  );
}

function NoMorePayoutRequestsField({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
}) {
  return (
    <label className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg border border-amber-200/90 bg-amber-50/70 px-3.5 py-2.5">
      <Checkbox
        checked={checked}
        onCheckedChange={(c) => onCheckedChange(c === true)}
      />
      <Flag size={15} className="shrink-0 text-red-500" strokeWidth={2} />
      <span className="text-[12px] font-medium text-gray-800">
        Mark as final installment
      </span>
    </label>
  );
}

function PayoutDetailsFooter({
  step,
  invoicePhase,
  selectedAccountId,
  onCancel,
  onNext,
  isLastStep,
}: {
  step: number;
  invoicePhase: InvoicePhase;
  selectedAccountId: string;
  onCancel: () => void;
  onNext: () => void;
  isLastStep: boolean;
}) {
  const invoiceComplete = invoicePhase === "confirmed";
  const nextDisabled =
    (step === 0 && !invoiceComplete) || (step === 1 && !selectedAccountId);

  return (
    <div className="flex shrink-0 items-center justify-end gap-3 border-t border-gray-100 bg-white px-7 py-4">
      <Button
        variant="outline"
        className="h-10 min-w-[100px] border-gray-200 text-[13px]"
        onClick={onCancel}
      >
        {step > 0 ? "Back" : "Cancel"}
      </Button>
      <Button
        variant="brand"
        className="h-10 min-w-[100px] text-[13px]"
        onClick={onNext}
        disabled={nextDisabled}
      >
        {isLastStep ? "Confirm & Lock" : "Next"}
      </Button>
    </div>
  );
}

function PayoutDetailsPanel({
  step,
  onStepChange,
  currency,
  onCurrencyChange,
  amount,
  onAmountChange,
  invoicePhase,
  uploadedFileName,
  confirmedAt,
  selectedAccountId,
  onSelectAccount,
  onInvoiceFileChange,
  onInvoiceConfirm,
  paymentRemarks,
  onPaymentRemarksChange,
  noMorePayoutRequests,
  onNoMorePayoutRequestsChange,
}: {
  step: number;
  onStepChange: (index: number) => void;
  currency: string;
  onCurrencyChange: (v: string) => void;
  amount: string;
  onAmountChange: (v: string) => void;
  invoicePhase: InvoicePhase;
  uploadedFileName: string | null;
  confirmedAt: Date | null;
  selectedAccountId: string;
  onSelectAccount: (id: string) => void;
  onInvoiceFileChange: (file: File | null) => void;
  onInvoiceConfirm: () => void;
  paymentRemarks: string;
  onPaymentRemarksChange: (value: string) => void;
  noMorePayoutRequests: boolean;
  onNoMorePayoutRequestsChange: (value: boolean) => void;
}) {
  const invoiceComplete = invoicePhase === "confirmed";

  const handleStepChange = (index: number) => {
    if (index === 0) {
      onStepChange(0);
      return;
    }
    if (index === 1 && invoiceComplete) {
      onStepChange(1);
      return;
    }
    if (index === 2 && invoiceComplete && step >= 1) {
      onStepChange(2);
    }
  };

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col border-t border-gray-100 bg-white lg:border-t-0 lg:border-l lg:flex-[6.2]">
      <div className="shrink-0 border-b border-gray-100 bg-white px-8 pt-6 pb-5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-[15px] font-semibold text-gray-900">Payout Details</h3>
          <span
            className={cn(
              "inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
              invoicePhase === "parsed" || invoicePhase === "confirmed"
                ? "border-sky-200/80 bg-sky-50 text-sky-700"
                : "border-amber-200/80 bg-amber-50 text-amber-800"
            )}
          >
            {invoicePhase === "parsed" || invoicePhase === "confirmed"
              ? "Waiting for Validation"
              : "Partially Paid"}
          </span>
        </div>
        <p className="mt-1.5 max-w-lg text-[12px] leading-relaxed text-gray-500">
          Submission will freeze this data snapshot for finance.
        </p>
        <div className="mt-5">
          <PayoutStepper current={step} onStepChange={handleStepChange} />
        </div>
      </div>

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
        <div className="px-8 py-7">
          <div className="w-full max-w-2xl">
            {step === 0 ? (
              <InvoiceStepPanel
                currency={currency}
                onCurrencyChange={onCurrencyChange}
                amount={amount}
                onAmountChange={onAmountChange}
                invoicePhase={invoicePhase}
                uploadedFileName={uploadedFileName}
                confirmedAt={confirmedAt}
                onInvoiceFileChange={onInvoiceFileChange}
                onInvoiceConfirm={onInvoiceConfirm}
              />
            ) : step === 1 ? (
              <AccountPoolStepPanel
                selectedAccountId={selectedAccountId}
                onSelectAccount={onSelectAccount}
              />
            ) : (
              <ApprovedAmountStepPanel
                currency={currency}
                paymentRemarks={paymentRemarks}
                onPaymentRemarksChange={onPaymentRemarksChange}
                noMorePayoutRequests={noMorePayoutRequests}
                onNoMorePayoutRequestsChange={onNoMorePayoutRequestsChange}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AgreementSummaryPanel() {
  return (
    <section className="flex flex-col">
      <div className="mb-4">
        <h3 className="text-[15px] font-semibold text-gray-900">Agreement Summary</h3>
        <p className="mt-1 text-[12px] leading-relaxed text-gray-500">
          Data captured at: May07.2026
        </p>
      </div>

      <div className="rounded-xl border border-[#e2e8f0] bg-white px-5 py-1 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <SummaryRow label="Legal Name" value={AGREEMENT_SNAPSHOT.legalName} />
        <SummaryRow
          label="Contract Value"
          value={formatMoney(AGREEMENT_SNAPSHOT.currency, AGREEMENT_SNAPSHOT.contractTotal)}
        />
        <SummaryRow
          label="Payment Method"
          value={AGREEMENT_SNAPSHOT.paymentMethod}
          valueClassName="text-red-600"
          prev={AGREEMENT_SNAPSHOT.paymentMethodPrev}
        />
        <SummaryRow label="Payment Term" value={AGREEMENT_SNAPSHOT.paymentTerm} />
      </div>

      <div className="mt-5">
        <p className="text-[11px] font-semibold text-gray-500">Payment Details</p>
        <div className="mt-3 rounded-xl border border-[#e2e8f0] bg-white px-5 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <BankDetailRow
            label="Beneficiary Name"
            value={AGREEMENT_SNAPSHOT.bank.beneficiaryName}
          />
          <BankDetailRow
            label="Beneficiary Bank"
            value={AGREEMENT_SNAPSHOT.bank.beneficiaryBank}
          />
          <BankDetailRow
            label="Account Number"
            value={AGREEMENT_SNAPSHOT.bank.accountNumber}
          />
          <BankDetailRow label="Swift Code" value={AGREEMENT_SNAPSHOT.bank.swiftCode} />
          <BankDetailRow
            label="IFSC Code"
            value={AGREEMENT_SNAPSHOT.bank.ifscCode || "—"}
          />
          <BankDetailRow
            label="Bank Address"
            value={AGREEMENT_SNAPSHOT.bank.bankAddress}
          />
        </div>
      </div>

      <div className="mt-6">
        <p className="text-[11px] font-semibold text-gray-500">Agreement</p>
        <button
          type="button"
          className="mt-3 flex w-full items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 text-left shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-colors hover:border-gray-200"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-100 bg-gray-50 text-gray-500">
            <FileText size={16} strokeWidth={2} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium text-gray-900">
              Signed_Contract_V2.pdf
            </span>
            <span className="mt-0.5 block text-[11px] text-gray-400">
              Uploaded May 05, 2026
            </span>
          </span>
        </button>
        <p className="mt-2 truncate text-[11px] text-gray-400">Prev: Signed_Contract_V1.pdf</p>
      </div>
    </section>
  );
}

const invoiceFieldClass = formInputClass(
  "text-[13px] text-gray-800 read-only:bg-white read-only:text-gray-800"
);

function ConfirmFieldRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-[132px_minmax(0,1fr)] sm:items-start sm:gap-x-5">
      <p className="pt-2.5 text-[12px] font-medium text-gray-600">{label}</p>
      <div>{children}</div>
    </div>
  );
}

function InvoicePoolCard({
  fileName,
  invoiceNumber,
  issuedParty,
  invoiceAmount,
  beneficiary,
  uploadedAt,
}: {
  fileName: string;
  invoiceNumber: string;
  issuedParty: string;
  invoiceAmount: string;
  beneficiary: string;
  uploadedAt: Date;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/40 px-4 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center rounded-md bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand">
          Invoice A
        </span>
        <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
          Verified
        </span>
      </div>

      <p className="mt-3 truncate text-[14px] font-semibold text-gray-900">{fileName}</p>
      <p className="mt-0.5 truncate text-[11px] text-gray-400">{invoiceNumber}</p>

      <div className="mt-4 grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-gray-400">
            Issued Party
          </p>
          <p className="mt-1.5 text-[12px] font-medium leading-snug text-gray-800">{issuedParty}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-gray-400">
            Invoice Amount
          </p>
          <p className="mt-1.5 text-[12px] font-medium tabular-nums text-gray-800">
            {invoiceAmount}
          </p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-gray-400">
            Beneficiary
          </p>
          <p className="mt-1.5 text-[12px] font-medium leading-snug text-gray-800">{beneficiary}</p>
        </div>
      </div>

      <p className="mt-4 text-[11px] text-gray-400">
        Uploaded at {formatUploadedAt(uploadedAt)}
      </p>
    </div>
  );
}

function InvoicePoolSection({
  fileName,
  invoiceNumber,
  issuedParty,
  invoiceAmount,
  beneficiary,
  uploadedAt,
}: {
  fileName: string;
  invoiceNumber: string;
  issuedParty: string;
  invoiceAmount: string;
  beneficiary: string;
  uploadedAt: Date;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-gray-500">Invoice Pool (1)</p>
      <div className="mt-3">
        <InvoicePoolCard
          fileName={fileName}
          invoiceNumber={invoiceNumber}
          issuedParty={issuedParty}
          invoiceAmount={invoiceAmount}
          beneficiary={beneficiary}
          uploadedAt={uploadedAt}
        />
      </div>
    </div>
  );
}

function InvoicePendingConfirmation({
  parsed,
  fileName,
  onConfirm,
}: {
  parsed: ReturnType<typeof parseInvoiceFromAgreement>;
  fileName: string | null;
  onConfirm: () => void;
}) {
  const bankFields = [
    {
      label: "Beneficiary Name",
      value: parsed.bank.beneficiaryName,
      contractValue: AGREEMENT_SNAPSHOT.bank.beneficiaryName,
      weak: false,
    },
    {
      label: "Beneficiary Bank",
      value: parsed.bank.beneficiaryBank,
      contractValue: AGREEMENT_SNAPSHOT.bank.beneficiaryBank,
      weak: true,
    },
    {
      label: "Account Number",
      value: parsed.bank.accountNumber,
      contractValue: AGREEMENT_SNAPSHOT.bank.accountNumber,
      weak: true,
    },
    {
      label: "Swift Code",
      value: parsed.bank.swiftCode,
      contractValue: AGREEMENT_SNAPSHOT.bank.swiftCode,
      weak: true,
    },
    {
      label: "IFSC Code",
      value: parsed.bank.ifscCode,
      contractValue: AGREEMENT_SNAPSHOT.bank.ifscCode,
      weak: true,
    },
  ] as const;

  return (
    <div className="space-y-3">
    <div className="rounded-xl border border-sky-200/90 bg-sky-50/45 px-5 py-5">
      <div>
        <div className="flex items-center justify-between gap-3">
          <h4 className="shrink-0 text-[14px] font-semibold text-gray-900">
            Invoice Pending Confirmation
          </h4>
          {fileName ? (
            <span
              className="inline-flex min-w-0 max-w-[50%] items-center gap-1 text-[11px] text-gray-500"
              title={fileName}
            >
              <FileText size={12} strokeWidth={2} className="shrink-0 text-gray-400" />
              <span className="truncate">{fileName}</span>
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-[12px] leading-relaxed text-gray-500">
          Review the parsed invoice details, then verify to add it into the Invoice Pool.
        </p>
      </div>

      <div className="mt-5 space-y-5">
        <ConfirmFieldRow label="Invoice Issued Party">
          <Input readOnly value={parsed.issuedParty} className={invoiceFieldClass} />
        </ConfirmFieldRow>

        <ConfirmFieldRow label="Invoice Amount">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <Select value={parsed.currency} disabled>
                <SelectTrigger
                  className={cn(
                    invoiceMoneyCurrencyTrigger,
                    "disabled:cursor-default disabled:opacity-100"
                  )}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="SGD">SGD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
              <Input
                readOnly
                value={parsed.amount}
                className={cn(invoiceFieldClass, "min-w-0 flex-1 tabular-nums")}
              />
            </div>
            <MatchedBadge />
          </div>
        </ConfirmFieldRow>

        <ConfirmFieldRow label="Invoice Number">
          <Input readOnly value={parsed.invoiceNumber} className={invoiceFieldClass} />
        </ConfirmFieldRow>

        <ConfirmFieldRow label="Bank Details">
          <div className="space-y-4 rounded-xl border border-sky-100 bg-white px-4 py-4">
            {bankFields.map((field) => {
              const status = getFieldValidationStatus(field.value, field.contractValue);
              return (
                <div key={field.label} className="space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-sky-600/80">
                    {field.label}
                  </p>
                  <Input readOnly value={field.value || "—"} className={invoiceFieldClass} />
                  {field.weak ? (
                    status === "missing" ? (
                      <NoDetectedBadge />
                    ) : status === "differs" ? (
                      <DiffersBadge />
                    ) : (
                      <MatchedBadge />
                    )
                  ) : (
                    <MatchedBadge />
                  )}
                </div>
              );
            })}
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-sky-600/80">
                Bank Address
              </p>
              <Textarea
                readOnly
                value={parsed.bank.bankAddress}
                className={formTextareaClass("min-h-[72px] resize-none text-[13px] text-gray-800")}
              />
              <MatchedBadge />
            </div>
          </div>
        </ConfirmFieldRow>
      </div>

      <div className="mt-5 flex justify-end">
        <Button
          variant="outline"
          className="h-9 min-w-[96px] border-gray-200 bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          onClick={onConfirm}
        >
          <Check size={14} strokeWidth={2.5} className="text-emerald-600" />
          Verify
        </Button>
      </div>
    </div>

      <p className="rounded-lg border border-amber-200/90 bg-amber-50/75 px-4 py-3 text-[12px] leading-relaxed text-amber-900">
        New bank account detected in Invoice. It will be added to the Account Pool in Step 2.
      </p>
    </div>
  );
}

function InvoiceStepPanel({
  currency,
  onCurrencyChange,
  amount,
  onAmountChange,
  invoicePhase,
  uploadedFileName,
  confirmedAt,
  onInvoiceFileChange,
  onInvoiceConfirm,
}: {
  currency: string;
  onCurrencyChange: (v: string) => void;
  amount: string;
  onAmountChange: (v: string) => void;
  invoicePhase: InvoicePhase;
  uploadedFileName: string | null;
  confirmedAt: Date | null;
  onInvoiceFileChange: (file: File | null) => void;
  onInvoiceConfirm: () => void;
}) {
  const parsed = parseInvoiceFromAgreement();
  const showPrefillBanner = invoicePhase === "parsed";

  return (
    <div className="flex flex-col gap-7">
      <FormField label="Legal Name">
        <Input
          readOnly
          value={AGREEMENT_SNAPSHOT.legalName}
          className={formInputClass("h-10 border-gray-200 bg-gray-50/90 text-[13px] text-gray-700")}
        />
      </FormField>

      <div className="space-y-3">
        <p className="text-[13px] font-semibold text-gray-900">
          Contract Amount:{" "}
          <span className="tabular-nums">
            {formatMoney(AGREEMENT_SNAPSHOT.currency, AGREEMENT_SNAPSHOT.contractTotal)}
          </span>
        </p>
        <div className="flex items-center gap-2.5">
          <Select value={currency} onValueChange={(v) => v && onCurrencyChange(v)}>
            <SelectTrigger className={invoiceMoneyCurrencyTrigger}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="SGD">SGD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
            </SelectContent>
          </Select>
          <Input
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="10,000"
            className={cn(invoiceFieldClass, "min-w-0 flex-1 tabular-nums")}
          />
        </div>
      </div>

      <div className="space-y-3">
        <FileUploadZone
          title="Upload Invoice"
          hint="Drop file or click to upload — fields will auto-fill when ready."
          accept=".pdf,.png,.jpg,.jpeg"
          acceptedExtensions={[".pdf", ".png", ".jpg", ".jpeg"]}
          onFileChange={onInvoiceFileChange}
          variant="amber"
          badge={
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100/80 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
              <Sparkles size={10} />
              AI Fast Fill Enabled
            </span>
          }
        />

        {showPrefillBanner ? (
          <div className="flex items-start gap-2 rounded-lg border border-emerald-200/80 bg-emerald-50/70 px-3.5 py-2.5">
            <Check size={14} className="mt-0.5 shrink-0 text-emerald-600" strokeWidth={2.5} />
            <p className="text-[12px] leading-relaxed text-emerald-800">
              Invoice Amount, Invoice Number and Bank Details prefilled.
            </p>
          </div>
        ) : null}

        {invoicePhase === "parsed" ? (
          <InvoicePendingConfirmation
            parsed={parsed}
            fileName={uploadedFileName}
            onConfirm={onInvoiceConfirm}
          />
        ) : null}

        {invoicePhase === "confirmed" && uploadedFileName && confirmedAt ? (
          <InvoicePoolSection
            fileName={uploadedFileName}
            invoiceNumber={parsed.invoiceNumber}
            issuedParty={parsed.issuedParty}
            invoiceAmount={formatMoney(currency, AGREEMENT_SNAPSHOT.contractTotal)}
            beneficiary={parsed.bank.beneficiaryName}
            uploadedAt={confirmedAt}
          />
        ) : null}
      </div>
    </div>
  );
}

function AccountPoolField({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-[11px] text-gray-500">{label}</p>
      <p className={cn("mt-1 text-[13px] font-semibold leading-snug text-gray-900", className)}>
        {value}
      </p>
    </div>
  );
}

function AccountPoolStepPanel({
  selectedAccountId,
  onSelectAccount,
}: {
  selectedAccountId: string;
  onSelectAccount: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h4 className="text-[15px] font-semibold text-gray-900">Account Pool</h4>
        <p className="mt-1.5 text-[12px] leading-relaxed text-gray-500">
          Select a compliant account as the default payout account for Step 3.
        </p>
      </div>

      <div className="space-y-3">
        {ACCOUNT_POOL_ENTRIES.map((account) => {
          const selected = selectedAccountId === account.id;
          return (
            <button
              key={account.id}
              type="button"
              onClick={() => onSelectAccount(selected ? "" : account.id)}
              aria-pressed={selected}
              className={cn(
                "relative w-full rounded-xl border-2 px-5 py-5 text-left transition-colors",
                selected
                  ? "border-brand/35 bg-sky-50/70"
                  : "border-gray-200 bg-white hover:border-gray-300"
              )}
            >
              {selected ? (
                <span className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white">
                  <Check size={12} strokeWidth={3} />
                </span>
              ) : null}

              <div className="flex flex-wrap items-center gap-2 pr-8">
                <span className="text-[14px] font-semibold text-gray-900">{account.title}</span>
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-[10px] font-medium text-gray-600">
                  {account.tag}
                </span>
              </div>

              <div className="mt-4 space-y-4">
                <AccountPoolField label="Beneficiary Name" value={account.beneficiaryName} />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-8">
                  <AccountPoolField label="Beneficiary Bank" value={account.beneficiaryBank} />
                  <AccountPoolField
                    label="Account Number"
                    value={account.accountNumber}
                    className="tabular-nums"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-8">
                  <AccountPoolField label="Swift Code" value={account.swiftCode} />
                  <AccountPoolField
                    label="IFSC Code"
                    value={account.ifscCode || "—"}
                  />
                </div>
                <AccountPoolField label="Bank Address" value={account.bankAddress} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function InstallmentViewButton({ title }: { title: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 text-[11px] font-medium text-brand transition-colors hover:text-brand/80"
      aria-label={`Preview ${title}`}
    >
      <Eye size={14} strokeWidth={2} />
      View
    </button>
  );
}

function InstallmentIconAction({
  label,
  icon: Icon,
  onClick,
}: {
  label: string;
  icon: typeof Trash2;
  onClick?: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
        aria-label={label}
        onClick={onClick}
      >
        <Icon size={14} strokeWidth={2} />
      </TooltipTrigger>
      <TooltipContent side="left">{label}</TooltipContent>
    </Tooltip>
  );
}

function InstallmentCard({
  installment,
  currency,
  inactiveState = null,
  onRemove,
  onVoid,
}: {
  installment: Installment;
  currency: string;
  inactiveState?: InstallmentInactiveState | null;
  onRemove?: () => void;
  onVoid?: () => void;
}) {
  const isInactive = inactiveState !== null;
  const statusStyles = INSTALLMENT_STATUS_STYLES[installment.status];
  const badgeStyles =
    inactiveState === "voided"
      ? VOIDED_INSTALLMENT_STYLES.badge
      : inactiveState === "removed"
        ? REMOVED_INSTALLMENT_STYLES.badge
        : statusStyles.badge;
  const statusLabel =
    inactiveState === "voided"
      ? "Voided"
      : inactiveState === "removed"
        ? "Removed"
        : installment.status;
  const showView =
    inactiveState === "removed" ||
    (!isInactive && (installment.status === "Pending" || installment.status === "Failed"));

  const showRemove = !isInactive && installment.status === "Pending";
  const showVoid = !isInactive && installment.status === "Failed" && installment.canVoid;

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3",
          isInactive
            ? "bg-gray-50"
            : "bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <p
            className={cn(
              "min-w-0 flex-1 truncate text-[13px] font-semibold text-gray-900",
              isInactive && "text-gray-400 line-through"
            )}
          >
            {installment.title}
          </p>
          <p
            className={cn(
              "shrink-0 text-[13px] font-semibold leading-tight tabular-nums text-gray-900 sm:text-[14px]",
              isInactive && "text-gray-400 line-through"
            )}
          >
            {formatMoney(currency, installment.amount)}
          </p>
        </div>
        <div className="mt-1 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-x-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                badgeStyles
              )}
            >
              {statusLabel}
              {!isInactive && installment.status === "Failed" ? (
                <Info size={11} strokeWidth={2} className="opacity-80" />
              ) : null}
            </span>
            {showView ? <InstallmentViewButton title={installment.title} /> : null}
          </div>
          <span
            className={cn(
              "shrink-0 text-[11px] leading-snug text-gray-500",
              isInactive && "line-through"
            )}
          >
            Due: {installment.dueDate}
          </span>
        </div>
      </div>
      {showRemove ? (
        <InstallmentIconAction label="Remove" icon={Trash2} onClick={onRemove} />
      ) : null}
      {showVoid ? (
        <InstallmentIconAction label="Void" icon={RotateCcw} onClick={onVoid} />
      ) : null}
    </div>
  );
}

function InstallmentSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="flex flex-wrap items-baseline gap-x-2">
        <h5 className="text-[13px] font-semibold text-gray-900">{title}</h5>
        <span className="text-[11px] text-gray-400">{subtitle}</span>
      </div>
      <TooltipProvider>
        <div className="mt-3 space-y-3">{children}</div>
      </TooltipProvider>
    </section>
  );
}

function ApprovedAmountStepPanel({
  currency,
  paymentRemarks,
  onPaymentRemarksChange,
  noMorePayoutRequests,
  onNoMorePayoutRequestsChange,
}: {
  currency: string;
  paymentRemarks: string;
  onPaymentRemarksChange: (value: string) => void;
  noMorePayoutRequests: boolean;
  onNoMorePayoutRequestsChange: (value: boolean) => void;
}) {
  const [removedInstallmentIds, setRemovedInstallmentIds] = useState<string[]>([]);
  const [voidedInstallmentIds, setVoidedInstallmentIds] = useState<string[]>([]);
  const [addedInstallments, setAddedInstallments] = useState<Installment[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const excludedInstallmentIds = [...removedInstallmentIds, ...voidedInstallmentIds];
  const allInstallments = [
    ...SETTLED_INSTALLMENTS,
    ...ACTIVE_INSTALLMENTS,
    ...addedInstallments,
  ];
  const payoutAmount = sumInstallmentAmounts(
    SETTLED_INSTALLMENTS,
    ACTIVE_INSTALLMENTS,
    excludedInstallmentIds,
    addedInstallments
  );
  const { totalPayable, remainingToAllocate } =
    computeApprovedAmountSummaryFromPayout(payoutAmount);
  const nextInstallmentNumber = getNextInstallmentNumber(allInstallments);
  const canAddInstallment = remainingToAllocate > 0;

  const handleRemoveInstallment = (id: string) => {
    setRemovedInstallmentIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const handleVoidInstallment = (id: string) => {
    setVoidedInstallmentIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const getInactiveState = (id: string): InstallmentInactiveState | null => {
    if (voidedInstallmentIds.includes(id)) return "voided";
    if (removedInstallmentIds.includes(id)) return "removed";
    return null;
  };

  const handleValidateInstallments = (drafts: InstallmentDraft[]) => {
    const startNumber = nextInstallmentNumber;
    const newInstallments = drafts.map((draft, index) => ({
      id: `inst-added-${Date.now()}-${index}`,
      title: `Installment ${startNumber + index}`,
      status: "Pending" as const,
      dueDate: draft.dueDate,
      amount: draft.amount,
    }));
    setAddedInstallments((prev) => [...prev, ...newInstallments]);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="grid grid-cols-1 divide-y divide-gray-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <div className="px-4 py-3.5">
            <p className="text-[11px] font-medium text-gray-500">
              Contract Value <span className="text-red-500">*</span>
            </p>
            <p className="mt-1 text-[16px] font-semibold tabular-nums text-gray-900">
              {formatMoney(currency, payoutAmount)}
            </p>
          </div>
          <div className="px-4 py-3.5">
            <p className="text-[11px] font-medium text-gray-500">Total Approved Amount</p>
            <p className="mt-1 text-[16px] font-semibold tabular-nums text-gray-900">
              {formatMoney(currency, totalPayable)}
            </p>
          </div>
        </div>
      </div>

      <InstallmentSection title="Settled Requests" subtitle="Processing Or Success">
        {SETTLED_INSTALLMENTS.map((item) => (
          <InstallmentCard key={item.id} installment={item} currency={currency} />
        ))}
      </InstallmentSection>

      <InstallmentSection title="Active Requests" subtitle="Pending Or Failed">
        {ACTIVE_INSTALLMENTS.map((item) => (
          <InstallmentCard
            key={item.id}
            installment={item}
            currency={currency}
            inactiveState={getInactiveState(item.id)}
            onRemove={() => handleRemoveInstallment(item.id)}
            onVoid={() => handleVoidInstallment(item.id)}
          />
        ))}
        {addedInstallments.map((item) => (
          <InstallmentCard
            key={item.id}
            installment={item}
            currency={currency}
            inactiveState={getInactiveState(item.id)}
            onRemove={() => handleRemoveInstallment(item.id)}
          />
        ))}
        <NoMorePayoutRequestsField
          checked={noMorePayoutRequests}
          onCheckedChange={onNoMorePayoutRequestsChange}
        />
      </InstallmentSection>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <h5 className="text-[13px] font-semibold text-gray-900">New Request Draft</h5>
          <p className="text-[12px] tabular-nums">
            <span className="text-gray-500">Remaining to Allocate: </span>
            <span
              className={cn(
                "font-semibold",
                remainingToAllocate > 0 ? "text-gray-900" : "text-red-600"
              )}
            >
              {formatMoney(currency, remainingToAllocate)}
            </span>
          </p>
        </div>

        <button
          type="button"
          disabled={!canAddInstallment}
          onClick={() => setAddDialogOpen(true)}
          className={cn(
            "mt-2.5 inline-flex items-center gap-1 text-[13px] font-medium transition-colors",
            canAddInstallment
              ? "text-brand hover:text-brand/80"
              : "cursor-not-allowed text-gray-400"
          )}
        >
          <Plus size={14} strokeWidth={2} />
          Add New Installment
        </button>
      </section>

      <AddInstallmentDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        currency={currency}
        remainingToAllocate={remainingToAllocate}
        startingInstallmentNumber={nextInstallmentNumber}
        accountOptions={ACCOUNT_OPTIONS}
        onValidate={handleValidateInstallments}
      />

      <FormField label="Payment Remarks">
        <Textarea
          value={paymentRemarks}
          onChange={(e) => onPaymentRemarksChange(e.target.value)}
          placeholder="Add remarks for this payout request"
          className={formTextareaClass(
            "min-h-[88px] resize-none text-[13px] text-gray-800 placeholder:text-gray-400"
          )}
        />
      </FormField>
    </div>
  );
}

export default function ApprovePayoutSheet({
  open,
  onOpenChange,
  influencerHandle = "@instagram ins",
  influencerName = "Ava Collins",
  influencerAvatarUrl,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  influencerHandle?: string;
  influencerName?: string;
  influencerAvatarUrl?: string;
}) {
  const [step, setStep] = useState(0);
  const [currency, setCurrency] = useState<string>(AGREEMENT_SNAPSHOT.currency);
  const [amount, setAmount] = useState(formatAmountInput(AGREEMENT_SNAPSHOT.contractTotal));
  const [invoicePhase, setInvoicePhase] = useState<InvoicePhase>("empty");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [confirmedAt, setConfirmedAt] = useState<Date | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(ACCOUNT_POOL_ENTRIES[0].id);
  const [paymentRemarks, setPaymentRemarks] = useState("");
  const [noMorePayoutRequests, setNoMorePayoutRequests] = useState(false);
  const [confirmLockOpen, setConfirmLockOpen] = useState(false);

  const handleSheetOpenChange = (next: boolean) => {
    if (!next) {
      setConfirmLockOpen(false);
      setStep(0);
      setCurrency(AGREEMENT_SNAPSHOT.currency);
      setAmount(formatAmountInput(AGREEMENT_SNAPSHOT.contractTotal));
      setInvoicePhase("empty");
      setUploadedFileName(null);
      setConfirmedAt(null);
      setSelectedAccountId(ACCOUNT_POOL_ENTRIES[0].id);
      setPaymentRemarks("");
      setNoMorePayoutRequests(false);
    }
    onOpenChange(next);
  };

  const initials = influencerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isLastStep = step === PAYOUT_STEPS.length - 1;
  const parsedAmount = Number(amount.replace(/,/g, ""));
  const confirmAmount = Number.isFinite(parsedAmount) && parsedAmount > 0 ? parsedAmount : 0;

  const handleNext = () => {
    if (step < PAYOUT_STEPS.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    setConfirmLockOpen(true);
  };

  const handleConfirmLock = () => {
    setConfirmLockOpen(false);
    onOpenChange(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={handleSheetOpenChange}>
      <SheetContent
        side="right"
        showCloseButton
        className="flex flex-col gap-0 p-0 data-[side=right]:w-[min(920px,96vw)] data-[side=right]:max-w-[96vw] data-[side=right]:sm:max-w-[920px]"
      >
        <div className="shrink-0 border-b border-gray-100 bg-white px-7 py-5">
          <div className="min-w-0 pr-8">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-[17px] font-semibold tracking-tight text-gray-900">
                Approve Payout
              </h2>
              <div className="inline-flex min-w-0 items-center gap-2">
                <InfluencerAvatar
                  src={influencerAvatarUrl ?? getMockInfluencerAvatar(influencerHandle)}
                  alt={influencerName}
                  fallback={initials}
                  fallbackClassName="bg-violet-100 text-violet-700"
                  size="sm"
                />
                <p className="truncate text-[13px] font-semibold text-gray-900">{influencerName}</p>
              </div>
            </div>
            <p className="mt-1 text-[12px] text-gray-500">
              Review contract data and submit to lock the payout snapshot for finance.
            </p>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
            <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto bg-[var(--hub-snapshot-bg)] p-5 lg:min-w-0 lg:flex-[3.8]">
              <AgreementSummaryPanel />
            </div>

            <PayoutDetailsPanel
              step={step}
              onStepChange={setStep}
              currency={currency}
              onCurrencyChange={setCurrency}
              amount={amount}
              onAmountChange={setAmount}
              invoicePhase={invoicePhase}
              uploadedFileName={uploadedFileName}
              confirmedAt={confirmedAt}
              selectedAccountId={selectedAccountId}
              onSelectAccount={setSelectedAccountId}
              onInvoiceFileChange={(file) => {
                if (file) {
                  setUploadedFileName(file.name);
                  setInvoicePhase("parsed");
                  setConfirmedAt(null);
                } else {
                  setUploadedFileName(null);
                  setInvoicePhase("empty");
                  setConfirmedAt(null);
                }
              }}
              onInvoiceConfirm={() => {
                setInvoicePhase("confirmed");
                setConfirmedAt(new Date());
              }}
              paymentRemarks={paymentRemarks}
              onPaymentRemarksChange={setPaymentRemarks}
              noMorePayoutRequests={noMorePayoutRequests}
              onNoMorePayoutRequestsChange={setNoMorePayoutRequests}
            />
          </div>

          <PayoutDetailsFooter
            step={step}
            invoicePhase={invoicePhase}
            selectedAccountId={selectedAccountId}
            onCancel={() => {
              if (step > 0) setStep((s) => s - 1);
              else onOpenChange(false);
            }}
            onNext={handleNext}
            isLastStep={isLastStep}
          />
        </div>
      </SheetContent>
      </Sheet>

      <Dialog open={confirmLockOpen} onOpenChange={setConfirmLockOpen}>
        <DialogContent className="gap-6 px-6 py-6 sm:max-w-md">
          <DialogHeader className="space-y-4 text-center">
            <DialogTitle className="text-base font-semibold">Confirm Payout Amount</DialogTitle>
            <p className="text-[15px] font-semibold tabular-nums text-brand">
              Total Amount: {formatMoney(currency, confirmAmount)}
            </p>
            <DialogDescription className="px-2 text-[13px] leading-relaxed text-gray-500">
              This action will lock the payment details and sync them to Finance. You cannot modify
              it after confirmation.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="-mx-6 -mb-6 justify-center gap-3 border-0 bg-transparent px-6 pb-6 pt-1 sm:justify-center">
            <Button variant="outline" className="min-w-[110px]" onClick={() => setConfirmLockOpen(false)}>
              Cancel
            </Button>
            <Button variant="brand" className="min-w-[130px]" onClick={handleConfirmLock}>
              <FileLock size={16} />
              Confirm & Lock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
