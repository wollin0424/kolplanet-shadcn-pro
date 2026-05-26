"use client";

import { useState, type ReactNode } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { platformFromLabel } from "@/components/PlatformIcon";
import { FileUploadZone } from "@/components/FileUploadZone";
import AddInstallmentDialog, { type InstallmentDraft } from "@/components/AddInstallmentDialog";
import { Check, Eye, FileText, Flag, Info, Plus, RotateCcw, Sparkles, Trash2 } from "@/lib/icons";
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
    badge: "border-amber-200 bg-amber-50 text-amber-800",
    border: "border-l-amber-400",
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
    amount: formatAmountInput(AGREEMENT_SNAPSHOT.contractTotal),
    invoiceNumber: AGREEMENT_SNAPSHOT.invoiceNumber,
    bank: { ...AGREEMENT_SNAPSHOT.bank },
  };
}

function MatchedBadge() {
  return (
    <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
      Matched
    </span>
  );
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

function PayoutDetailsFooter({
  step,
  invoicePhase,
  selectedAccountId,
  noMorePayoutRequests,
  onNoMorePayoutRequestsChange,
  onCancel,
  onNext,
  isLastStep,
}: {
  step: number;
  invoicePhase: InvoicePhase;
  selectedAccountId: string;
  noMorePayoutRequests: boolean;
  onNoMorePayoutRequestsChange: (value: boolean) => void;
  onCancel: () => void;
  onNext: () => void;
  isLastStep: boolean;
}) {
  const invoiceComplete = invoicePhase === "confirmed";
  const nextDisabled =
    (step === 0 && !invoiceComplete) || (step === 1 && !selectedAccountId);

  return (
    <div className="flex shrink-0 items-center gap-4 border-t border-gray-100 bg-white px-7 py-4">
      {step === 2 ? (
        <label className="flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-amber-200/90 bg-amber-50/70 px-3 py-2.5">
          <Checkbox
            checked={noMorePayoutRequests}
            onCheckedChange={(checked) => onNoMorePayoutRequestsChange(checked === true)}
          />
          <Flag size={15} className="shrink-0 text-red-500" strokeWidth={2} />
          <span className="whitespace-nowrap text-[12px] font-medium text-gray-800">
            No more payout requests after this.
          </span>
        </label>
      ) : null}
      <div className="ml-auto flex shrink-0 items-center gap-3">
        <Button
          variant="outline"
          className="h-10 min-w-[100px] border-gray-200 text-[13px]"
          onClick={onCancel}
        >
          Cancel
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
            label="Bank Address"
            value={AGREEMENT_SNAPSHOT.bank.bankAddress}
          />
        </div>
      </div>

      <div className="mt-6">
        <p className="text-[11px] font-semibold text-gray-500">Agreement</p>
        <p className="mt-3 text-[12px] font-semibold text-gray-800">Updated Attachments</p>
        <p className="mt-0.5 text-[11px] text-gray-400 truncate">
          Prev: Signed_Contract_V1.pdf
        </p>
        <button
          type="button"
          className="mt-3 flex w-full items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 text-left shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-colors hover:border-gray-200"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-100 bg-gray-50 text-gray-500">
            <FileText size={16} strokeWidth={2} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-medium text-gray-900 truncate">
              Signed_Contract_V2.pdf
            </span>
            <span className="mt-0.5 block text-[11px] text-gray-400">
              Uploaded May 05, 2026
            </span>
          </span>
        </button>
      </div>
    </section>
  );
}

const invoiceFieldClass =
  "h-10 border-gray-200 bg-white text-[13px] text-gray-800 shadow-none read-only:bg-white read-only:text-gray-800";

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
          Confirmed
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
  onConfirm,
}: {
  parsed: ReturnType<typeof parseInvoiceFromAgreement>;
  onConfirm: () => void;
}) {
  return (
    <div className="rounded-xl border border-sky-200/90 bg-sky-50/45 px-5 py-5">
      <h4 className="text-[14px] font-semibold text-gray-900">Invoice Pending Confirmation</h4>
      <p className="mt-1 text-[12px] leading-relaxed text-gray-500">
        Review the parsed invoice details, then confirm to add it into the Invoice Pool.
      </p>

      <div className="mt-5 space-y-5">
        <ConfirmFieldRow label="Invoice Issued Party">
          <Input readOnly value={parsed.issuedParty} className={invoiceFieldClass} />
        </ConfirmFieldRow>

        <ConfirmFieldRow label="Invoice Amount">
          <div className="space-y-2">
            <Input readOnly value={parsed.amount} className={cn(invoiceFieldClass, "tabular-nums")} />
            <MatchedBadge />
          </div>
        </ConfirmFieldRow>

        <ConfirmFieldRow label="Invoice Number">
          <Input readOnly value={parsed.invoiceNumber} className={invoiceFieldClass} />
        </ConfirmFieldRow>

        <ConfirmFieldRow label="Bank Details">
          <div className="space-y-4 rounded-xl border border-sky-100 bg-white px-4 py-4">
            {(
              [
                ["Beneficiary Name", parsed.bank.beneficiaryName, true],
                ["Beneficiary Bank", parsed.bank.beneficiaryBank, true],
                ["Account Number", parsed.bank.accountNumber, true],
                ["Swift Code", parsed.bank.swiftCode, true],
              ] as const
            ).map(([label, value, matched]) => (
              <div key={label} className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-sky-600/80">
                  {label}
                </p>
                <Input readOnly value={value} className={invoiceFieldClass} />
                {matched ? <MatchedBadge /> : null}
              </div>
            ))}
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-sky-600/80">
                Bank Address
              </p>
              <Textarea
                readOnly
                value={parsed.bank.bankAddress}
                className="min-h-[72px] resize-none border-gray-200 bg-white text-[13px] text-gray-800 shadow-none"
              />
              <MatchedBadge />
            </div>
          </div>
        </ConfirmFieldRow>
      </div>

      <div className="mt-5 flex justify-end">
        <Button variant="brand" className="h-9 min-w-[96px] text-[13px]" onClick={onConfirm}>
          Confirm
        </Button>
      </div>
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
          className="h-10 border-gray-200 bg-gray-50/90 text-[13px] text-gray-700 shadow-none"
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
            <SelectTrigger className="!h-10 w-[108px] shrink-0 border-gray-200 bg-white px-3 text-[13px] shadow-none data-[size=default]:!h-10">
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
            className="h-10 flex-1 border-gray-200 bg-white text-[13px] tabular-nums shadow-none"
          />
        </div>
      </div>

      <div className="space-y-3">
        <FileUploadZone
          title="Upload New Invoice"
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
          <InvoicePendingConfirmation parsed={parsed} onConfirm={onInvoiceConfirm} />
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
          Choose one compliant receiving account as the default payout account for this batch. The
          selected account will be used as the default in Step 3.
        </p>
      </div>

      <div className="space-y-3">
        {ACCOUNT_POOL_ENTRIES.map((account) => {
          const selected = selectedAccountId === account.id;
          return (
            <button
              key={account.id}
              type="button"
              onClick={() => onSelectAccount(account.id)}
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
                <AccountPoolField label="Swift / IFSC Code" value={account.swiftCode} />
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

  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 px-4 py-2.5",
        isInactive
          ? "bg-gray-50"
          : cn(
              "border-l-4 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]",
              statusStyles.border
            )
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p
              className={cn(
                "text-[13px] font-semibold text-gray-900",
                isInactive && "text-gray-400 line-through"
              )}
            >
              {installment.title}
            </p>
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
          <p
            className={cn(
              "mt-1 text-[11px] text-gray-400",
              isInactive && "line-through"
            )}
          >
            Due {installment.dueDate}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p
            className={cn(
              "text-[14px] font-semibold tabular-nums text-gray-900",
              isInactive && "text-gray-400 line-through"
            )}
          >
            {formatMoney(currency, installment.amount)}
          </p>
          {!isInactive && installment.status === "Pending" ? (
            <button
              type="button"
              className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-red-500 transition-colors hover:text-red-600"
              onClick={onRemove}
            >
              <Trash2 size={12} strokeWidth={2} />
              Remove
            </button>
          ) : null}
          {!isInactive && installment.status === "Failed" && installment.canVoid ? (
            <button
              type="button"
              className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-red-500 transition-colors hover:text-red-600"
              onClick={onVoid}
            >
              <RotateCcw size={12} strokeWidth={2} />
              Void
            </button>
          ) : null}
        </div>
      </div>
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
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

function ApprovedAmountStepPanel({
  currency,
  paymentRemarks,
  onPaymentRemarksChange,
}: {
  currency: string;
  paymentRemarks: string;
  onPaymentRemarksChange: (value: string) => void;
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
        <div className="grid grid-cols-1 divide-y divide-gray-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="px-4 py-3.5">
            <p className="text-[11px] font-medium text-gray-500">
              Payout Amount <span className="text-red-500">*</span>
            </p>
            <p className="mt-1 text-[16px] font-semibold tabular-nums text-gray-900">
              {formatMoney(currency, payoutAmount)}
            </p>
          </div>
          <div className="px-4 py-3.5">
            <p className="text-[11px] font-medium text-gray-500">Total Payable</p>
            <p className="mt-1 text-[16px] font-semibold tabular-nums text-gray-900">
              {formatMoney(currency, totalPayable)}
            </p>
          </div>
          <div className="px-4 py-3.5">
            <p className="text-[11px] font-medium text-gray-500">Remaining to Allocate</p>
            <p className="mt-1 text-[16px] font-semibold tabular-nums text-red-600">
              {formatMoney(currency, remainingToAllocate)}
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
      </InstallmentSection>

      {canAddInstallment ? (
        <button
          type="button"
          onClick={() => setAddDialogOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-white py-3.5 text-[13px] font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50/80"
        >
          <Plus size={16} strokeWidth={2} />
          Add Installment
        </button>
      ) : null}

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
          className="min-h-[88px] resize-none border-gray-200 bg-white text-[13px] text-gray-800 shadow-none placeholder:text-gray-400"
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
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  influencerHandle?: string;
  influencerName?: string;
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

  const handleSheetOpenChange = (next: boolean) => {
    if (!next) {
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

  const handleNext = () => {
    if (step < PAYOUT_STEPS.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleSheetOpenChange}>
      <SheetContent
        side="right"
        showCloseButton
        className="flex flex-col gap-0 p-0 data-[side=right]:w-[min(920px,96vw)] data-[side=right]:max-w-[96vw] data-[side=right]:sm:max-w-[920px]"
      >
        <div className="shrink-0 border-b border-gray-100 bg-white px-7 py-5">
          <div className="flex items-center justify-between gap-6 pr-8">
            <div className="min-w-0 flex-1">
              <h2 className="text-[17px] font-semibold tracking-tight text-gray-900">
                Approve Payout
              </h2>
              <p className="mt-1 text-[12px] text-gray-500">
                Review contract data and submit to lock the payout snapshot for finance.
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
            />
          </div>

          <PayoutDetailsFooter
            step={step}
            invoicePhase={invoicePhase}
            selectedAccountId={selectedAccountId}
            noMorePayoutRequests={noMorePayoutRequests}
            onNoMorePayoutRequestsChange={setNoMorePayoutRequests}
            onCancel={() => onOpenChange(false)}
            onNext={handleNext}
            isLastStep={isLastStep}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
