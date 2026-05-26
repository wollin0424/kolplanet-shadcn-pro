"use client";

import { useId, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Plus, X } from "@/lib/icons";
import { cn } from "@/lib/utils";

export type InstallmentDraft = {
  amount: number;
  dueDate: string;
  accountId: string;
  invoiceId: string;
};

type InstallmentRow = {
  id: string;
  label: string;
  amount: string;
  dueDate: string;
  accountId: string;
  invoiceId: string;
};

const MOCK_INVOICE_OPTIONS = [
  { id: "inv-a", label: "Invoice A - May 26, 2026" },
  { id: "inv-b", label: "Invoice B - Apr 12, 2026" },
] as const;

function parseRowAmount(value: string) {
  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function formatDueDate(isoDate: string) {
  if (!isoDate) return "";
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function createRow(
  label: string,
  defaults?: Partial<Omit<InstallmentRow, "id" | "label">>
): InstallmentRow {
  return {
    id: crypto.randomUUID(),
    label,
    amount: defaults?.amount ?? "",
    dueDate: defaults?.dueDate ?? "",
    accountId: defaults?.accountId ?? "",
    invoiceId: defaults?.invoiceId ?? "",
  };
}

export default function AddInstallmentDialog({
  open,
  onOpenChange,
  currency,
  remainingToAllocate,
  startingInstallmentNumber,
  accountOptions,
  onValidate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: string;
  remainingToAllocate: number;
  startingInstallmentNumber: number;
  accountOptions: { id: string; label: string }[];
  onValidate: (rows: InstallmentDraft[]) => void;
}) {
  const baseId = useId();
  const defaultAccountId = accountOptions[0]?.id ?? "";
  const defaultInvoiceId = MOCK_INVOICE_OPTIONS[0]?.id ?? "";

  const [rows, setRows] = useState<InstallmentRow[]>([
    createRow(`Installment ${startingInstallmentNumber}`, {
      accountId: defaultAccountId,
      invoiceId: defaultInvoiceId,
    }),
  ]);

  const allocatedInDialog = useMemo(
    () => rows.reduce((sum, row) => sum + parseRowAmount(row.amount), 0),
    [rows]
  );

  const budgetLeft = Math.max(0, remainingToAllocate - allocatedInDialog);
  const canAddRow = budgetLeft > 0 && rows.length < 8;

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setRows([
        createRow(`Installment ${startingInstallmentNumber}`, {
          accountId: defaultAccountId,
          invoiceId: defaultInvoiceId,
        }),
      ]);
    }
    onOpenChange(next);
  };

  const updateRow = (id: string, patch: Partial<InstallmentRow>) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const removeRow = (id: string) => {
    setRows((prev) => {
      if (prev.length <= 1) {
        return [
          createRow(`Installment ${startingInstallmentNumber}`, {
            accountId: defaultAccountId,
            invoiceId: defaultInvoiceId,
          }),
        ];
      }
      return prev.filter((row) => row.id !== id);
    });
  };

  const addRow = () => {
    if (!canAddRow) return;
    setRows((prev) => [
      ...prev,
      createRow(`Installment ${startingInstallmentNumber + prev.length}`, {
        accountId: defaultAccountId,
        invoiceId: defaultInvoiceId,
      }),
    ]);
  };

  const validRows = rows.filter(
    (row) =>
      parseRowAmount(row.amount) > 0 &&
      row.dueDate.trim() !== "" &&
      row.accountId !== "" &&
      row.invoiceId !== ""
  );

  const canSubmit =
    validRows.length > 0 &&
    validRows.reduce((sum, row) => sum + parseRowAmount(row.amount), 0) <= remainingToAllocate;

  const handleValidate = () => {
    if (!canSubmit) return;
    onValidate(
      validRows.map((row) => ({
        amount: parseRowAmount(row.amount),
        dueDate: formatDueDate(row.dueDate),
        accountId: row.accountId,
        invoiceId: row.invoiceId,
      }))
    );
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-0 overflow-hidden border border-gray-200/80 bg-white p-0 shadow-[0_12px_40px_rgba(15,23,42,0.14)] sm:max-w-[600px]">
        <DialogHeader className="flex-row items-center justify-between gap-3 space-y-0 border-b border-gray-100 px-5 py-3.5 pr-12">
          <DialogTitle className="text-[16px] font-semibold text-gray-900">
            Add Installment
          </DialogTitle>
          {remainingToAllocate > 0 ? (
            <p className="shrink-0 text-[11px] font-medium tabular-nums text-gray-500">
              <span className="text-gray-900">{formatMoneyLabel(currency, budgetLeft)}</span>{" "}
              remaining
            </p>
          ) : null}
        </DialogHeader>

        <div className="no-scrollbar max-h-[min(52vh,360px)] overflow-y-auto px-5 py-3">
          <div className="divide-y divide-gray-100">
            {rows.map((row, index) => {
              const isLast = index === rows.length - 1;
              const amountId = `${baseId}-amount-${row.id}`;
              const dateId = `${baseId}-date-${row.id}`;

              return (
                <div key={row.id} className="py-2.5 first:pt-0 last:pb-0">
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <p className="text-[12px] font-semibold text-gray-900">{row.label}</p>
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        className="inline-flex size-6 items-center justify-center rounded text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                        aria-label={`Remove ${row.label}`}
                      >
                        <X size={14} strokeWidth={2} />
                      </button>
                      {isLast && canAddRow ? (
                        <button
                          type="button"
                          onClick={addRow}
                          className="inline-flex size-6 items-center justify-center rounded text-brand transition-colors hover:bg-brand/10"
                          aria-label="Add another installment row"
                        >
                          <Plus size={14} strokeWidth={2} />
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid grid-cols-[minmax(0,1fr)_118px_minmax(0,1fr)_minmax(0,1fr)] items-center gap-2">
                    <div>
                      <label htmlFor={amountId} className="sr-only">
                        Amount for {row.label}
                      </label>
                      <div className="flex h-8 overflow-hidden rounded-md border border-gray-200 bg-white">
                        <span className="flex shrink-0 items-center border-r border-gray-200 bg-gray-50 px-2 text-[11px] font-medium text-gray-500">
                          {currency}
                        </span>
                        <input
                          id={amountId}
                          value={row.amount}
                          onChange={(e) => updateRow(row.id, { amount: e.target.value })}
                          placeholder="Amount"
                          inputMode="decimal"
                          className="min-w-0 flex-1 bg-transparent px-2 text-[12px] text-gray-900 outline-none placeholder:text-gray-400"
                        />
                      </div>
                    </div>

                    <div className="relative">
                      <label htmlFor={dateId} className="sr-only">
                        Due date for {row.label}
                      </label>
                      <input
                        id={dateId}
                        type="date"
                        value={row.dueDate}
                        onChange={(e) => updateRow(row.id, { dueDate: e.target.value })}
                        className={cn(
                          "h-8 w-full rounded-md border border-gray-200 bg-white px-2 pr-7 text-[12px] text-gray-900 outline-none",
                          !row.dueDate && "text-gray-400"
                        )}
                      />
                      <Calendar
                        size={13}
                        strokeWidth={2}
                        className="pointer-events-none absolute top-1/2 right-1.5 -translate-y-1/2 text-gray-400"
                      />
                    </div>

                    <Select
                      value={row.accountId}
                      onValueChange={(value) => updateRow(row.id, { accountId: value ?? "" })}
                    >
                      <SelectTrigger className="h-8 w-full min-w-0 border-gray-200 bg-white px-2 text-[11px]">
                        <SelectValue placeholder="Account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accountOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id} className="text-[12px]">
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={row.invoiceId}
                      onValueChange={(value) => updateRow(row.id, { invoiceId: value ?? "" })}
                    >
                      <SelectTrigger className="h-8 w-full min-w-0 border-gray-200 bg-white px-2 text-[11px]">
                        <SelectValue placeholder="Invoice" />
                      </SelectTrigger>
                      <SelectContent>
                        {MOCK_INVOICE_OPTIONS.map((option) => (
                          <SelectItem key={option.id} value={option.id} className="text-[12px]">
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2.5 border-t border-gray-100 bg-white px-5 py-4">
          <Button
            variant="outline"
            className="h-9 min-w-[88px] border-gray-200 text-[13px]"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="brand"
            className="h-9 min-w-[88px] text-[13px]"
            disabled={!canSubmit}
            onClick={handleValidate}
          >
            Validate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatMoneyLabel(currency: string, amount: number) {
  return `${currency} ${amount.toLocaleString("en-US")}`;
}
