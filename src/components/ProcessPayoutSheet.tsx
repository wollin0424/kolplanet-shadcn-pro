"use client";

import { useMemo, useState } from "react";
import { FileUploadZone } from "@/components/FileUploadZone";
import { InfluencerAvatar } from "@/components/InfluencerAvatar";
import { platformFromLabel } from "@/components/PlatformIcon";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  API_PAYOUT_PROVIDERS,
  DEFAULT_BASIS_INSTALLMENTS,
  PROCESS_PAYOUT_SNAPSHOT,
  createExecutionDrafts,
  formatPaidAtLabel,
  isExecutableBasisInstallment,
  mapExecutionToBasisStatus,
  parseAmountInput,
  type PaymentExecutionDraft,
  type PaymentExecutionStatus,
  type PayoutBasisInstallment,
} from "@/lib/processPayout";
import type { ClientSettlementStatus } from "@/lib/clientBilling";
import { CheckCircle2, Eye, FileText } from "@/lib/icons";
import { cn } from "@/lib/utils";

const PAYMENT_STATUS_OPTIONS: PaymentExecutionStatus[] = [
  "Successful",
  "Failed",
  "Pending",
];

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

function BasisInstallmentCard({ installment }: { installment: PayoutBasisInstallment }) {
  const isVoided = installment.status === "Voided";
  const isSuccessful = installment.status === "Successful";
  const badgeClass = isVoided
    ? "border-red-200 bg-red-50 text-red-700"
    : isSuccessful
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : installment.status === "Failed"
        ? "border-rose-200 bg-rose-50 text-rose-700"
        : "border-amber-200 bg-amber-50 text-amber-800";

  const metaLine = isSuccessful && installment.paidAt
    ? `Successful paid: ${installment.paidAt}`
    : `Due: ${installment.dueDate}`;

  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3",
        isVoided ? "border-red-200/80 bg-red-50/40" : "border-gray-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
      )}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-2">
        <p
          className={cn(
            "truncate text-[13px] font-semibold text-gray-900",
            isVoided && "text-gray-500 line-through"
          )}
        >
          {installment.title}
        </p>
        <p
          className={cn(
            "text-right text-[13px] font-semibold leading-tight tabular-nums text-gray-900 sm:text-[14px]",
            isVoided && "text-gray-400 line-through"
          )}
        >
          {formatUsd(installment.amount)}
        </p>
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <span
            className={cn(
              "inline-flex shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
              badgeClass
            )}
          >
            {installment.status}
          </span>
          {!isVoided ? (
            <button
              type="button"
              className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-brand hover:text-brand/80"
            >
              <Eye size={14} strokeWidth={2} />
              View
            </button>
          ) : null}
        </div>
        <p
          className={cn(
            "col-span-2 text-[11px] leading-snug",
            isSuccessful ? "text-emerald-700" : "text-gray-500",
            isVoided && "line-through text-gray-500"
          )}
        >
          {metaLine}
        </p>
      </div>
    </div>
  );
}

const PAYMENT_PROOF_HINT =
  "Upload payment proof to enable Confirm Transfer below.";
const PAYMENT_PROOF_REQUIRED_HINT =
  "Please upload payment proof before confirming this transfer.";

const PAYMENT_MODE_OPTIONS = [
  {
    id: "manual" as const,
    title: "Manual Transfer",
    description: "Upload proof after your bank transfer",
  },
  {
    id: "api" as const,
    title: "Automated API Payout",
    description: "Send via a connected payout provider",
  },
];

function PaymentMethodSection({
  paymentMode,
  apiProvider,
  onModeChange,
  onProviderChange,
}: {
  paymentMode: "manual" | "api";
  apiProvider: string;
  onModeChange: (mode: "manual" | "api") => void;
  onProviderChange: (provider: string) => void;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
      <p className="text-[12px] font-medium text-gray-700">Payment Method</p>
      <div
        className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2"
        role="radiogroup"
        aria-label="Payment method"
      >
        {PAYMENT_MODE_OPTIONS.map((option) => {
          const selected = paymentMode === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => {
                onModeChange(option.id);
                if (option.id === "manual") onProviderChange("");
              }}
              className={cn(
                "rounded-lg border px-3.5 py-3 text-left transition-all",
                selected
                  ? "border-brand/35 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)] ring-2 ring-brand/10"
                  : "border-gray-200 bg-white/80 hover:border-gray-300 hover:bg-white"
              )}
            >
              <div className="flex items-start gap-2.5">
                <span
                  className={cn(
                    "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    selected ? "border-brand" : "border-gray-300"
                  )}
                  aria-hidden
                >
                  {selected ? <span className="size-2 rounded-full bg-brand" /> : null}
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-medium text-gray-900">{option.title}</span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-gray-500">
                    {option.description}
                  </span>
                </span>
              </div>
            </button>
          );
        })}
      </div>
      {paymentMode === "api" ? (
        <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-3.5 py-2">
            <p className="text-[11px] font-medium text-gray-500">Payout provider</p>
            <span className="text-[10px] font-medium text-brand">Required</span>
          </div>
          <div className="px-2 py-1">
            <Select value={apiProvider} onValueChange={(v) => onProviderChange(v ?? "")}>
              <SelectTrigger className="h-9 w-full border-0 bg-transparent px-1.5 text-[13px] shadow-none focus-visible:ring-0">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                {API_PAYOUT_PROVIDERS.map((provider) => (
                  <SelectItem key={provider.value} value={provider.value}>
                    {provider.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ExecutionInstallmentRow({
  title,
  draft,
  locked = false,
  onChange,
}: {
  title: string;
  draft: PaymentExecutionDraft;
  locked?: boolean;
  onChange: (patch: Partial<PaymentExecutionDraft>) => void;
}) {
  const amountNum = parseAmountInput(draft.amount);
  const showDetails = draft.checked && !locked;

  const applyChange = (patch: Partial<PaymentExecutionDraft>) => {
    onChange({ ...draft, ...patch, proofRequiredHint: false });
  };

  return (
    <div
      className={cn(
        "rounded-xl border bg-white p-4 transition-colors",
        locked
          ? "border-emerald-100 bg-emerald-50/30"
          : draft.checked
            ? "border-gray-200"
            : "border-gray-100 bg-gray-50/60 opacity-80"
      )}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2.5">
          <Checkbox
            checked={draft.checked}
            disabled={locked}
            onCheckedChange={(c) => {
              const checked = c === true;
              applyChange({
                checked,
                ...(checked ? {} : { submitted: false, proofFileName: null }),
              });
            }}
          />
          <span className="text-[13px] font-medium text-gray-900">{title}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex h-9 min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
            <span className="flex shrink-0 items-center border-r border-gray-200 bg-gray-50 px-2.5 text-[12px] text-gray-500">
              USD
            </span>
            <input
              value={draft.amount}
              disabled={!draft.checked || locked}
              onChange={(e) => applyChange({ amount: e.target.value })}
              className="min-w-0 flex-1 bg-transparent px-2.5 text-[13px] tabular-nums text-gray-900 outline-none disabled:text-gray-400"
            />
          </div>
          <Input
            readOnly
            value={draft.dueDate}
            disabled={!draft.checked || locked}
            aria-label="Due date"
            className="h-9 min-w-0 cursor-default border-gray-200 bg-gray-50 text-[12px] text-gray-700 disabled:opacity-100"
          />
        </div>
      </div>

      {showDetails ? (
        <div className="mt-4 space-y-4 border-t border-gray-100 pt-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <p className="text-[11px] font-medium text-gray-500">Payment Status</p>
              <Select
                value={draft.paymentStatus}
                onValueChange={(v) =>
                  applyChange({ paymentStatus: (v as PaymentExecutionStatus) ?? "Pending" })
                }
              >
                <SelectTrigger className="h-9 w-full border-gray-200 text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <p className="text-[11px] font-medium text-gray-500">Payment Submission Date</p>
              <Input
                value={draft.submissionDate}
                onChange={(e) => applyChange({ submissionDate: e.target.value })}
                className="h-9 border-gray-200 text-[13px]"
                placeholder="YYYY/MM/DD"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-[11px] font-medium text-gray-500">Payment Proof</p>
            {draft.proofFileName ? (
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                <FileText size={16} className="text-gray-400" />
                <span className="truncate text-[12px] text-gray-700">{draft.proofFileName}</span>
              </div>
            ) : (
              <FileUploadZone
                title="Upload payment proof"
                hint="PNG, JPG or PDF up to 10MB"
                acceptedExtensions={[".png", ".jpg", ".jpeg", ".pdf"]}
                variant="brand"
                onFileChange={(file) => applyChange({ proofFileName: file?.name ?? null })}
              />
            )}
            {draft.proofRequiredHint ? (
              <p className="text-[11px] font-medium text-red-500">{PAYMENT_PROOF_REQUIRED_HINT}</p>
            ) : (
              <p className="text-[11px] text-gray-500">{PAYMENT_PROOF_HINT}</p>
            )}
          </div>
        </div>
      ) : null}

      {locked ? (
        <p className="mt-2 pl-7 text-[11px] font-medium text-emerald-600">
          Submitted — {formatUsd(amountNum)} · {draft.paymentStatus}
        </p>
      ) : null}
    </div>
  );
}

export default function ProcessPayoutSheet({
  open,
  onOpenChange,
  influencerName = "Amelia Stone",
  influencerHandle = "@instagram ins",
  approvedAmount = 20_000,
  amountPaid: _amountPaid = 0,
  dueDate: _dueDate = "Feb 11, 2024",
  settlementStatus = "Waiting for Validation",
  basisInstallments: initialBasisInstallments = DEFAULT_BASIS_INSTALLMENTS,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  influencerName?: string;
  influencerHandle?: string;
  approvedAmount?: number;
  amountPaid?: number;
  dueDate?: string;
  settlementStatus?: ClientSettlementStatus;
  /** Rows from Approve Payout → approved installments */
  basisInstallments?: PayoutBasisInstallment[];
}) {
  const [basisRows, setBasisRows] = useState<PayoutBasisInstallment[]>(initialBasisInstallments);
  const [paymentMode, setPaymentMode] = useState<"manual" | "api">("manual");
  const [apiProvider, setApiProvider] = useState("");
  const [executionById, setExecutionById] = useState<Record<string, PaymentExecutionDraft>>(() =>
    createExecutionDrafts(initialBasisInstallments)
  );

  const executionRows = useMemo(
    () => basisRows.filter(isExecutableBasisInstallment),
    [basisRows]
  );

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setPaymentMode("manual");
      setApiProvider("");
      setBasisRows(initialBasisInstallments);
      setExecutionById(createExecutionDrafts(initialBasisInstallments));
    }
    onOpenChange(next);
  };

  const handleInstallmentSubmit = (id: string, draft: PaymentExecutionDraft) => {
    const basisStatus = mapExecutionToBasisStatus(draft.paymentStatus);
    const paidAt =
      basisStatus === "Successful" ? formatPaidAtLabel(draft.submissionDate) : undefined;

    setBasisRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              status: basisStatus,
              paidAt,
              amount: parseAmountInput(draft.amount),
            }
          : row
      )
    );
  };

  const updateDraft = (id: string, patch: Partial<PaymentExecutionDraft>) => {
    setExecutionById((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...patch },
    }));
  };

  const checkedTotal = useMemo(() => {
    return executionRows.reduce((sum, row) => {
      const draft = executionById[row.id];
      if (!draft?.checked) return sum;
      return sum + parseAmountInput(draft.amount);
    }, 0);
  }, [executionRows, executionById]);

  const canConfirm = useMemo(() => {
    if (paymentMode === "api" && !apiProvider) return false;
    const checked = executionRows.filter((row) => executionById[row.id]?.checked);
    if (checked.length === 0) return false;
    return checked.every((row) => Boolean(executionById[row.id]?.proofFileName));
  }, [executionRows, executionById, paymentMode, apiProvider]);

  const handleConfirmTransfer = () => {
    const checked = executionRows.filter((row) => executionById[row.id]?.checked);
    if (checked.length === 0) return;

    const missingProof = checked.filter((row) => !executionById[row.id]?.proofFileName);
    if (missingProof.length > 0) {
      setExecutionById((prev) => {
        const next = { ...prev };
        for (const row of missingProof) {
          const draft = next[row.id];
          if (draft) next[row.id] = { ...draft, proofRequiredHint: true };
        }
        return next;
      });
      return;
    }

    for (const row of checked) {
      const draft = executionById[row.id];
      if (!draft) continue;
      handleInstallmentSubmit(row.id, { ...draft, submitted: true });
    }

    setExecutionById((prev) => {
      const next = { ...prev };
      for (const row of checked) {
        delete next[row.id];
      }
      return next;
    });
  };

  const initials = influencerName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);

  const executionBadge =
    settlementStatus === "Validated"
      ? "bg-amber-50 text-amber-800 border-amber-200"
      : "bg-sky-50 text-sky-700 border-sky-200";

  const snap = PROCESS_PAYOUT_SNAPSHOT;

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
              <p className="mt-1 whitespace-nowrap text-[12px] text-gray-500">
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

        <div className="flex min-h-0 flex-1 flex-col">
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
                    / {formatUsd(snap.contractTotal)} (Contract)
                  </span>
                </p>
              </div>

              <div className="mt-3 space-y-2">
                {basisRows.map((inst) => (
                  <BasisInstallmentCard key={inst.id} installment={inst} />
                ))}
              </div>

              <div className="mt-4 rounded-xl border border-gray-200 bg-white px-4 py-3">
                <p className="text-[11px] font-medium text-gray-500">Payment Remarks</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-gray-900">
                  {snap.paymentRemarks}
                </p>
              </div>

              <div className="mt-3 rounded-xl border border-gray-200 bg-white px-4">
                <BasisField label="Invoice Amount" value={formatUsd(snap.invoiceAmount)} />
                <BasisField label="Payment Method" value={snap.paymentMethod} />
                <BasisField label="Payment Term" value={snap.paymentTerm} />
              </div>

              <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-[12px] font-semibold text-gray-900">Payment Details</p>
                <div className="mt-3 space-y-0">
                  <BasisField label="Beneficiary Name" value={snap.bank.beneficiaryName} />
                  <BasisField label="Beneficiary Bank" value={snap.bank.beneficiaryBank} />
                  <BasisField label="Account Number" value={snap.bank.accountNumber} />
                  <BasisField label="Swift Code" value={snap.bank.swiftCode} />
                  <BasisField label="Bank Address" value={snap.bank.bankAddress} />
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[12px] font-semibold text-gray-900">Contract</p>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                    <CheckCircle2 size={11} strokeWidth={2} />
                    Countersigned
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {snap.contractFiles.map((file) => (
                    <button
                      key={file.name}
                      type="button"
                      className="flex w-full items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2.5 text-left hover:bg-gray-50"
                    >
                      <FileText size={16} className="shrink-0 text-gray-400" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12px] font-medium text-gray-900">
                          {file.name}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          Uploaded {file.uploadedAt}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-[12px] font-semibold text-gray-900">Invoice</p>
                <button
                  type="button"
                  className="mt-3 flex w-full items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2.5 text-left hover:bg-gray-50"
                >
                  <FileText size={16} className="shrink-0 text-gray-400" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-medium text-gray-900">
                      {snap.invoiceFile.name}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Uploaded {snap.invoiceFile.uploadedAt}
                    </span>
                  </span>
                </button>
                <div className="mt-3 border-t border-gray-100 pt-3">
                  <BasisField label="Invoice Number" value={snap.invoiceNumber} />
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
                <PaymentMethodSection
                  paymentMode={paymentMode}
                  apiProvider={apiProvider}
                  onModeChange={setPaymentMode}
                  onProviderChange={setApiProvider}
                />

                <div>
                  <p className="text-[12px] font-medium text-gray-700">
                    Paid Amount{" "}
                    <span className="font-normal text-gray-500">
                      (Total: {formatUsd(checkedTotal)})
                    </span>
                  </p>
                  <div className="mt-3 space-y-3">
                    {executionRows.map((row) => {
                      const draft = executionById[row.id];
                      if (!draft) return null;
                      const locked = row.status !== "Pending";
                      return (
                        <ExecutionInstallmentRow
                          key={row.id}
                          title={row.title}
                          draft={draft}
                          locked={locked}
                          onChange={(patch) => updateDraft(row.id, patch)}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>

          <div className="flex w-full shrink-0 items-center justify-end gap-3 border-t border-gray-100 bg-white px-8 py-4">
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
              disabled={!canConfirm}
              onClick={handleConfirmTransfer}
            >
              Confirm Transfer
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
