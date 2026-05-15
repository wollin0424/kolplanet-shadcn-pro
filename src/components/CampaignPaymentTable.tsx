"use client";

import { useMemo, useState } from "react";
import ApprovePayoutSheet from "@/components/ApprovePayoutSheet";
import RejectSettlementDialog from "@/components/RejectSettlementDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Info,
  MoreVertical,
  RefreshCcw,
  Search,
  X,
} from "lucide-react";

type InvoiceStatus = "Pending" | "Submitted";
type SettlementStatus =
  | "Waiting for Validation"
  | "Partially Paid"
  | "Validated"
  | "All Paid"
  | "Rejected";

type PaymentRow = {
  id: string;
  handle: string;
  platform: string;
  invoiceStatus: InvoiceStatus;
  settlementStatus: SettlementStatus;
  approvedAmount: number;
  amountPaid: number;
  earliestDueDate: string;
  manager: string;
  note: string;
};

const MOCK_ROWS: PaymentRow[] = [
  {
    id: "PAY-01",
    handle: "@instagram ins",
    platform: "Instagram",
    invoiceStatus: "Pending",
    settlementStatus: "Waiting for Validation",
    approvedAmount: 10000,
    amountPaid: 10000,
    earliestDueDate: "2024/01/01",
    manager: "wollin",
    note: "Active user — Fr...",
  },
  {
    id: "PAY-02",
    handle: "@instagram ins",
    platform: "Instagram",
    invoiceStatus: "Submitted",
    settlementStatus: "Partially Paid",
    approvedAmount: 10000,
    amountPaid: 10000,
    earliestDueDate: "2024/01/01",
    manager: "wollin",
    note: "Active user — Fr...",
  },
  {
    id: "PAY-03",
    handle: "@instagram ins",
    platform: "Instagram",
    invoiceStatus: "Submitted",
    settlementStatus: "Validated",
    approvedAmount: 10000,
    amountPaid: 10000,
    earliestDueDate: "2024/01/01",
    manager: "wollin",
    note: "Active user — Fr...",
  },
  {
    id: "PAY-04",
    handle: "@instagram ins",
    platform: "Instagram",
    invoiceStatus: "Submitted",
    settlementStatus: "All Paid",
    approvedAmount: 10000,
    amountPaid: 10000,
    earliestDueDate: "2024/01/01",
    manager: "wollin",
    note: "Active user — Fr...",
  },
  {
    id: "PAY-05",
    handle: "@instagram ins",
    platform: "Instagram",
    invoiceStatus: "Submitted",
    settlementStatus: "Rejected",
    approvedAmount: 10000,
    amountPaid: 0,
    earliestDueDate: "2024/01/01",
    manager: "wollin",
    note: "Active user — Fr...",
  },
  {
    id: "PAY-06",
    handle: "@foodie_my",
    platform: "Instagram",
    invoiceStatus: "Pending",
    settlementStatus: "Waiting for Validation",
    approvedAmount: 10000,
    amountPaid: 10000,
    earliestDueDate: "2024/01/01",
    manager: "wollin",
    note: "Active user — Fr...",
  },
  {
    id: "PAY-07",
    handle: "@lifestyle_id",
    platform: "Instagram",
    invoiceStatus: "Submitted",
    settlementStatus: "Partially Paid",
    approvedAmount: 10000,
    amountPaid: 10000,
    earliestDueDate: "2024/01/01",
    manager: "wollin",
    note: "Active user — Fr...",
  },
  {
    id: "PAY-08",
    handle: "@creator_ph",
    platform: "Instagram",
    invoiceStatus: "Submitted",
    settlementStatus: "Validated",
    approvedAmount: 10000,
    amountPaid: 10000,
    earliestDueDate: "2024/01/01",
    manager: "wollin",
    note: "Active user — Fr...",
  },
  {
    id: "PAY-09",
    handle: "@runner_in",
    platform: "Instagram",
    invoiceStatus: "Submitted",
    settlementStatus: "All Paid",
    approvedAmount: 10000,
    amountPaid: 10000,
    earliestDueDate: "2024/01/01",
    manager: "wollin",
    note: "Active user — Fr...",
  },
  {
    id: "PAY-10",
    handle: "@tech_my",
    platform: "Instagram",
    invoiceStatus: "Pending",
    settlementStatus: "Waiting for Validation",
    approvedAmount: 10000,
    amountPaid: 10000,
    earliestDueDate: "2024/01/01",
    manager: "wollin",
    note: "Active user — Fr...",
  },
  {
    id: "PAY-11",
    handle: "@beauty_id",
    platform: "Instagram",
    invoiceStatus: "Submitted",
    settlementStatus: "Partially Paid",
    approvedAmount: 10000,
    amountPaid: 10000,
    earliestDueDate: "2024/01/01",
    manager: "wollin",
    note: "Active user — Fr...",
  },
  {
    id: "PAY-12",
    handle: "@daily_ph",
    platform: "Instagram",
    invoiceStatus: "Submitted",
    settlementStatus: "Validated",
    approvedAmount: 10000,
    amountPaid: 10000,
    earliestDueDate: "2024/01/01",
    manager: "wollin",
    note: "Active user — Fr...",
  },
  {
    id: "PAY-13",
    handle: "@street_in",
    platform: "Instagram",
    invoiceStatus: "Submitted",
    settlementStatus: "All Paid",
    approvedAmount: 10000,
    amountPaid: 10000,
    earliestDueDate: "2024/01/01",
    manager: "wollin",
    note: "Active user — Fr...",
  },
  {
    id: "PAY-14",
    handle: "@style_my",
    platform: "Instagram",
    invoiceStatus: "Submitted",
    settlementStatus: "Rejected",
    approvedAmount: 10000,
    amountPaid: 0,
    earliestDueDate: "2024/01/01",
    manager: "wollin",
    note: "Active user — Fr...",
  },
];

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50];

const INVOICE_FILTER_OPTIONS = ["All", "Pending", "Submitted"] as const;
const SETTLEMENT_FILTER_OPTIONS = [
  "All",
  "Waiting for Validation",
  "Partially Paid",
  "Validated",
  "All Paid",
  "Rejected",
] as const;

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString("en-US")}`;
}

function buildPageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);
  if (left > 2) pages.push("…");
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < total - 1) pages.push("…");
  pages.push(total);
  return pages;
}

function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold border",
        status === "Pending"
          ? "bg-gray-50 text-gray-600 border-gray-200"
          : "bg-slate-50 text-slate-700 border-slate-200"
      )}
    >
      {status}
    </span>
  );
}

function SettlementStatusBadge({ status }: { status: SettlementStatus }) {
  const styles: Record<SettlementStatus, string> = {
    "Waiting for Validation": "bg-sky-50 text-sky-700 border-sky-200",
    "Partially Paid": "bg-blue-50 text-blue-700 border-blue-200",
    Validated: "bg-amber-50 text-amber-700 border-amber-200",
    "All Paid": "bg-emerald-50 text-emerald-700 border-emerald-200",
    Rejected: "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border",
        styles[status]
      )}
    >
      {status}
      {status === "Rejected" && <Info size={12} className="opacity-80" />}
    </span>
  );
}

function FilterDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1.5 text-[13px] text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors hover:bg-gray-50 bg-white min-w-[140px] justify-between">
        <span className="truncate">{value === "All" ? label : value}</span>
        <ChevronDown size={13} className="text-gray-400 shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="text-[13px] min-w-[180px]">
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt}
            onSelect={() => onChange(opt)}
            className={cn(value === opt && "text-brand font-medium")}
          >
            {opt === "All" ? `All ${label}` : opt}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function CampaignPaymentTable({ campaignId }: { campaignId: string }) {
  const [query, setQuery] = useState("");
  const [pageSize, setPageSize] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const [invoiceFilter, setInvoiceFilter] = useState<string>("All");
  const [settlementFilter, setSettlementFilter] = useState<string>("All");
  const [approvePayoutOpen, setApprovePayoutOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [activeRow, setActiveRow] = useState<PaymentRow | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_ROWS.filter((r) => {
      const matchesQuery =
        q.length === 0 ||
        r.handle.toLowerCase().includes(q) ||
        r.manager.toLowerCase().includes(q);
      const matchesInvoice =
        invoiceFilter === "All" || r.invoiceStatus === invoiceFilter;
      const matchesSettlement =
        settlementFilter === "All" || r.settlementStatus === settlementFilter;
      return matchesQuery && matchesInvoice && matchesSettlement;
    });
  }, [query, invoiceFilter, settlementFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const pageEnd = Math.min(pageStart + pageSize, filtered.length);
  const pageRows = filtered.slice(pageStart, pageEnd);

  const goToPage = (p: number) =>
    setCurrentPage(Math.min(Math.max(1, p), totalPages));

  const openApprovePayout = (row: PaymentRow) => {
    setActiveRow(row);
    setApprovePayoutOpen(true);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white overflow-hidden">
      <ApprovePayoutSheet
        open={approvePayoutOpen}
        onOpenChange={setApprovePayoutOpen}
        influencerHandle={activeRow?.handle ?? "@instagram ins"}
        influencerName="Amelia Stone"
      />
      <RejectSettlementDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        influencerName="Amelia Stone"
      />
      {/* Filters */}
      <div className="flex items-center justify-between gap-3 px-6 py-3 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          <FilterDropdown
            label="Invoice Status"
            value={invoiceFilter}
            options={INVOICE_FILTER_OPTIONS}
            onChange={(v) => {
              setInvoiceFilter(v);
              setCurrentPage(1);
            }}
          />
          <FilterDropdown
            label="Settlement Status"
            value={settlementFilter}
            options={SETTLEMENT_FILTER_OPTIONS}
            onChange={(v) => {
              setSettlementFilter(v);
              setCurrentPage(1);
            }}
          />
          <button
            type="button"
            className="flex items-center gap-2 text-[13px] text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 bg-white hover:bg-gray-50 transition-colors whitespace-nowrap"
          >
            <Calendar size={13} className="text-gray-400 shrink-0" />
            Start Due Date — End Due Date
          </button>
          <div className="relative w-[200px]">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search Influencer"
              className="pl-8 h-8 text-[13px] border-gray-200 bg-gray-50 focus:bg-white"
            />
          </div>
        </div>

        <button
          type="button"
          className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-transparent hover:border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors shrink-0"
          aria-label="Refresh"
        >
          <RefreshCcw size={15} />
        </button>
      </div>

      {/* Sub-toolbar */}
      <div className="flex items-center justify-between gap-3 px-6 py-2.5 border-b border-gray-100 shrink-0 bg-gray-50/60">
        <span className="text-[12px] text-gray-500 font-medium">
          Influencer:{" "}
          <span className="text-gray-900 tabular-nums">{filtered.length}</span>
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 text-[12px] text-gray-600 border border-gray-200 rounded-md px-2.5 py-1 bg-white hover:bg-gray-50 transition-colors">
            Visible Columns
            <ChevronDown size={11} className="text-gray-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="text-[13px] w-44">
            <DropdownMenuItem>
              <Columns3 size={14} className="text-gray-400" />
              Reset columns
            </DropdownMenuItem>
            <DropdownMenuItem>Save view</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <Table className="w-full table-auto text-[13px] border-separate border-spacing-0 [&_th]:px-6 [&_td]:px-6">
          <TableHeader>
            <TableRow className="bg-gray-50/70 hover:bg-gray-50/70 border-b border-gray-100">
              <TableHead className="font-semibold text-gray-800 py-3 !pl-6">
                Influencer
              </TableHead>
              <TableHead className="font-semibold text-gray-800 py-3">
                Invoice Status
              </TableHead>
              <TableHead className="font-semibold text-gray-800 py-3">
                Settlement Status
              </TableHead>
              <TableHead className="font-semibold text-gray-800 py-3">
                Approved Amount
              </TableHead>
              <TableHead className="font-semibold text-gray-800 py-3">
                Amount Paid
              </TableHead>
              <TableHead className="font-semibold text-gray-800 py-3">
                Earliest Due Date
              </TableHead>
              <TableHead className="font-semibold text-gray-800 py-3">
                KOL Manager
              </TableHead>
              <TableHead className="font-semibold text-gray-800 py-3">Notes</TableHead>
              <TableHead className="font-semibold text-gray-800 py-3 w-12 !pr-6" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {pageRows.map((row) => (
              <TableRow
                key={row.id}
                className="border-b border-gray-50 transition-colors bg-white hover:bg-[#f5f8fe]"
              >
                <TableCell className="py-4 !pl-6">
                  <div className="flex items-center gap-3 min-w-[180px]">
                    <Avatar className="w-7 h-7 shrink-0">
                      <AvatarImage src="" />
                      <AvatarFallback className="text-[10px] font-semibold bg-violet-100 text-violet-700">
                        {row.handle.replace("@", "").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-gray-900 truncate">
                        {row.handle}
                      </p>
                      <p className="text-[11px] text-gray-400">{row.platform}</p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-4">
                  <InvoiceStatusBadge status={row.invoiceStatus} />
                </TableCell>

                <TableCell className="py-4">
                  <SettlementStatusBadge status={row.settlementStatus} />
                </TableCell>

                <TableCell className="py-4 tabular-nums text-gray-800">
                  {formatCurrency(row.approvedAmount)}
                </TableCell>

                <TableCell className="py-4 tabular-nums">
                  <span
                    className={cn(
                      "font-medium",
                      row.amountPaid === 0 ? "text-red-500" : "text-gray-800"
                    )}
                  >
                    {formatCurrency(row.amountPaid)}
                  </span>
                </TableCell>

                <TableCell className="py-4 tabular-nums text-gray-600">
                  {row.earliestDueDate}
                </TableCell>

                <TableCell className="py-4 text-gray-700">{row.manager}</TableCell>

                <TableCell className="py-4">
                  <div className="text-[12px] text-gray-500 truncate max-w-[140px]">
                    {row.note}
                  </div>
                </TableCell>

                <TableCell className="py-4 !pr-6">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                      aria-label="Row actions"
                    >
                      <MoreVertical size={14} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52 p-1.5">
                      {row.settlementStatus === "Waiting for Validation" ? (
                        <>
                          <DropdownMenuItem
                            className="gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-gray-900"
                            onClick={() => openApprovePayout(row)}
                          >
                            <Check size={15} className="text-gray-900" strokeWidth={2.25} />
                            Approve Payout
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            className="gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium"
                            onClick={() => {
                              setActiveRow(row);
                              setRejectOpen(true);
                            }}
                          >
                            <X size={15} strokeWidth={2.25} />
                            Reject
                          </DropdownMenuItem>
                        </>
                      ) : (
                        <DropdownMenuItem
                          className="rounded-lg px-2.5 py-2 text-[13px] text-gray-500"
                          disabled
                        >
                          No actions available
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-4 px-5 py-3 border-t border-gray-100 shrink-0 bg-white">
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-gray-500">
            <span className="tabular-nums text-gray-800 font-medium">
              {filtered.length === 0 ? 0 : pageStart + 1}–{pageEnd}
            </span>{" "}
            of <span className="tabular-nums text-gray-800 font-medium">{filtered.length}</span>
          </span>
          <span className="text-gray-200">|</span>
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-gray-500">Rows per page</span>
            <DropdownMenu>
              <DropdownMenuTrigger className="h-7 inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 text-[12px] text-gray-700 hover:bg-gray-50">
                {pageSize}
                <ChevronDown size={11} className="text-gray-400" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-24">
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <DropdownMenuItem
                    key={n}
                    onSelect={() => {
                      setPageSize(n);
                      setCurrentPage(1);
                    }}
                  >
                    {n}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => goToPage(safePage - 1)}
            disabled={safePage <= 1}
            className={cn(
              "h-7 w-7 inline-flex items-center justify-center rounded-md border border-gray-200 text-gray-500 transition-colors",
              safePage <= 1
                ? "opacity-40 cursor-not-allowed"
                : "hover:bg-gray-50 hover:text-gray-800"
            )}
            aria-label="Previous page"
          >
            <ChevronLeft size={13} />
          </button>

          {buildPageList(safePage, totalPages).map((p, i) =>
            p === "…" ? (
              <span
                key={`e-${i}`}
                className="h-7 w-7 inline-flex items-center justify-center text-[12px] text-gray-400"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => goToPage(p)}
                className={cn(
                  "h-7 min-w-[28px] px-1.5 inline-flex items-center justify-center rounded-md text-[12px] tabular-nums transition-colors",
                  p === safePage
                    ? "bg-brand text-white font-medium"
                    : "border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
                aria-current={p === safePage ? "page" : undefined}
              >
                {p}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => goToPage(safePage + 1)}
            disabled={safePage >= totalPages}
            className={cn(
              "h-7 w-7 inline-flex items-center justify-center rounded-md border border-gray-200 text-gray-500 transition-colors",
              safePage >= totalPages
                ? "opacity-40 cursor-not-allowed"
                : "hover:bg-gray-50 hover:text-gray-800"
            )}
            aria-label="Next page"
          >
            <ChevronRight size={13} />
          </button>

          <span className="ml-2 text-[12px] text-gray-500 tabular-nums">{pageSize} / page</span>
        </div>
      </div>

      <span className="sr-only">{campaignId}</span>
    </div>
  );
}
