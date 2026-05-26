"use client";

import { useMemo, useState } from "react";
import ProcessPayoutSheet from "@/components/ProcessPayoutSheet";
import { InfluencerIdentityCell } from "@/components/InfluencerIdentityCell";
import type { KolRelationship } from "@/components/InfluencerMetaIcons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ClientSettlementStatus } from "@/lib/clientBilling";
import {
  getInfluencerCampaignRows,
  type InfluencerPaymentCampaignRow,
} from "@/lib/influencerPayments";
import { cn } from "@/lib/utils";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Info,
  MoreVertical,
  Search,
} from "@/lib/icons";

const PAGE_SIZE_OPTIONS = [10, 20, 30] as const;

const TOOLBAR_CONTROL =
  "h-8 rounded-lg border border-gray-200 bg-white text-[12.5px] shadow-none";

const SETTLEMENT_FILTER_OPTIONS = [
  "All",
  "Waiting for Validation",
  "Partially Paid",
  "Validated",
  "All Paid",
  "Rejected",
] as const;

const PROCESSABLE_STATUSES: ClientSettlementStatus[] = [
  "Waiting for Validation",
  "Partially Paid",
  "Validated",
];

function formatAmount(currency: "USD" | "INR", amount: number) {
  if (currency === "INR") {
    return `INR ${amount.toLocaleString("en-IN")}`;
  }
  return `$${amount.toLocaleString("en-US")}`;
}

function SettlementStatusBadge({ status }: { status: ClientSettlementStatus }) {
  const styles: Record<ClientSettlementStatus, string> = {
    "Waiting for Validation": "bg-sky-50 text-sky-700 border-sky-200",
    "Partially Paid": "bg-blue-50 text-blue-700 border-blue-200",
    Validated: "bg-amber-50 text-amber-700 border-amber-200",
    "All Paid": "bg-emerald-50 text-emerald-700 border-emerald-200",
    Rejected: "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap",
        styles[status]
      )}
    >
      {status}
      {status === "Rejected" ? <Info size={11} className="opacity-80" /> : null}
    </span>
  );
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

export default function InfluencerPaymentCampaignsTable({
  influencerId,
  influencerName,
  influencerHandle,
  platform,
  kolManager,
  relationship,
}: {
  influencerId: string;
  influencerName: string;
  influencerHandle: string;
  platform: string;
  kolManager: string;
  relationship: KolRelationship;
}) {
  const allRows = getInfluencerCampaignRows(influencerId);
  const [query, setQuery] = useState("");
  const [settlementFilter, setSettlementFilter] = useState("All");
  const [pageSize, setPageSize] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const [processOpen, setProcessOpen] = useState(false);
  const [activeRow, setActiveRow] = useState<InfluencerPaymentCampaignRow | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allRows.filter((row) => {
      const matchesQuery =
        q.length === 0 ||
        row.campaignName.toLowerCase().includes(q) ||
        row.campaignId.toLowerCase().includes(q);
      const matchesStatus =
        settlementFilter === "All" || row.settlementStatus === settlementFilter;
      return matchesQuery && matchesStatus;
    });
  }, [allRows, query, settlementFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const pageEnd = Math.min(pageStart + pageSize, filtered.length);
  const pageRows = filtered.slice(pageStart, pageEnd);

  const goToPage = (p: number) => setCurrentPage(Math.min(Math.max(1, p), totalPages));

  const openProcess = (row: InfluencerPaymentCampaignRow) => {
    setActiveRow(row);
    setProcessOpen(true);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-white">
      <ProcessPayoutSheet
        open={processOpen}
        onOpenChange={setProcessOpen}
        influencerName={influencerName}
        influencerHandle={influencerHandle}
        approvedAmount={activeRow?.approvedAmount ?? 30_000}
        amountPaid={activeRow?.amountPaid ?? 0}
        dueDate={activeRow?.dueDate ?? "Sep 02, 2026"}
        settlementStatus={activeRow?.settlementStatus ?? "Waiting for Validation"}
      />

      <div className="shrink-0 border-b border-gray-100 px-6 py-4">
        <p className="text-[13px] text-gray-600">
          Influencer ID:{" "}
          <span className="font-semibold tabular-nums text-gray-900">{influencerId}</span>
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-gray-100 px-5 py-3">
        <Select
          value={settlementFilter}
          onValueChange={(v) => {
            setSettlementFilter(v ?? "All");
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className={cn(TOOLBAR_CONTROL, "h-8 w-[170px] text-gray-600")}>
            <SelectValue placeholder="Settlement Status" />
          </SelectTrigger>
          <SelectContent>
            {SETTLEMENT_FILTER_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt === "All" ? "Settlement Status" : opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button
          type="button"
          className={cn(
            TOOLBAR_CONTROL,
            "inline-flex items-center gap-2 px-3 text-gray-500"
          )}
        >
          <Calendar size={13} className="text-gray-400" />
          Start Date — End Date
        </button>

        <div className="relative min-w-[200px] flex-1 max-w-sm">
          <Search
            size={13}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search Campaign"
            className={cn(
              TOOLBAR_CONTROL,
              "h-8 w-full pl-8 text-gray-800 placeholder:text-gray-400 focus-visible:ring-brand/30"
            )}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              TOOLBAR_CONTROL,
              "ml-auto inline-flex shrink-0 items-center gap-1 px-2.5 text-gray-600 transition-colors hover:bg-gray-50"
            )}
          >
            <Columns3 size={13} className="text-gray-400" />
            Visible Columns
            <ChevronDown size={11} className="text-gray-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="text-[13px]">
            <DropdownMenuItem>Reset columns</DropdownMenuItem>
            <DropdownMenuItem>Save view</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="no-scrollbar flex-1 min-h-0 overflow-auto [&_[data-slot=table-container]]:no-scrollbar">
        <Table className="w-full min-w-[1280px] table-auto border-separate border-spacing-0 text-[13px] [&_td]:px-5 [&_th]:px-5">
          <TableHeader>
            <TableRow className="border-b border-gray-100 bg-gray-50/80 hover:bg-gray-50/80">
              <TableHead className="py-3 font-semibold text-gray-700">Campaign Name</TableHead>
              <TableHead className="py-3 font-semibold text-gray-700">Influencer Account</TableHead>
              <TableHead className="py-3 font-semibold text-gray-700">Settlement Status</TableHead>
              <TableHead className="py-3 font-semibold text-gray-700">Approved Amount</TableHead>
              <TableHead className="py-3 font-semibold text-gray-700">Amount Paid</TableHead>
              <TableHead className="py-3 font-semibold text-gray-700">Balance</TableHead>
              <TableHead className="py-3 font-semibold text-gray-700">Due Date</TableHead>
              <TableHead className="py-3 font-semibold text-gray-700">Notes</TableHead>
              <TableHead className="w-10 py-3" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((row) => {
              const canProcess = PROCESSABLE_STATUSES.includes(row.settlementStatus);
              return (
                <TableRow
                  key={row.id}
                  className={cn(
                    "border-b border-gray-50 bg-white transition-colors hover:bg-brand-row-hover",
                    canProcess && "cursor-pointer"
                  )}
                  onClick={canProcess ? () => openProcess(row) : undefined}
                  onKeyDown={
                    canProcess
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            openProcess(row);
                          }
                        }
                      : undefined
                  }
                  tabIndex={canProcess ? 0 : undefined}
                  role={canProcess ? "button" : undefined}
                >
                  <TableCell className="py-3.5">
                    <button
                      type="button"
                      className="text-[13px] font-medium text-brand hover:text-brand/80"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {row.campaignName}
                    </button>
                  </TableCell>
                  <TableCell className="py-3.5">
                    <InfluencerIdentityCell
                      name={influencerName}
                      handle={influencerHandle}
                      platform={platform}
                      kolManager={kolManager}
                      relationship={relationship}
                      avatarSize="md"
                    />
                  </TableCell>
                  <TableCell className="py-3.5">
                    <SettlementStatusBadge status={row.settlementStatus} />
                  </TableCell>
                  <TableCell className="py-3.5 tabular-nums text-gray-800">
                    {formatAmount(row.currency, row.approvedAmount)}
                  </TableCell>
                  <TableCell className="py-3.5 tabular-nums text-gray-800">
                    {formatAmount(row.currency, row.amountPaid)}
                  </TableCell>
                  <TableCell className="py-3.5 tabular-nums font-medium text-gray-900">
                    {formatAmount(row.currency, row.balance)}
                  </TableCell>
                  <TableCell className="py-3.5 tabular-nums text-gray-600">{row.dueDate}</TableCell>
                  <TableCell className="max-w-[180px] py-3.5">
                    <p className="truncate text-[12px] text-gray-500">{row.note}</p>
                  </TableCell>
                  <TableCell className="py-3.5" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="inline-flex size-8 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50"
                        aria-label="Row actions"
                      >
                        <MoreVertical size={14} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="text-[13px]">
                        {canProcess ? (
                          <DropdownMenuItem onSelect={() => openProcess(row)}>
                            Process Payout
                          </DropdownMenuItem>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-4 border-t border-gray-100 bg-white px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-gray-500">
            <span className="tabular-nums font-medium text-gray-800">
              {filtered.length === 0 ? 0 : pageStart + 1}–{pageEnd}
            </span>{" "}
            of <span className="tabular-nums font-medium text-gray-800">{filtered.length}</span>
          </span>

          <span className="text-gray-200">|</span>

          <div className="flex items-center gap-2">
            <span className="text-[12px] text-gray-500">Rows per page</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(Number(v));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-7 w-[66px] gap-1 border-gray-200 px-2 text-[12px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)} className="text-[12px]">
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => goToPage(safePage - 1)}
            disabled={safePage <= 1}
            className={cn(
              "inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-500 transition-colors",
              safePage <= 1 ? "cursor-not-allowed opacity-40" : "hover:bg-gray-50 hover:text-gray-800"
            )}
            aria-label="Previous page"
          >
            <ChevronLeft size={13} />
          </button>
          {buildPageList(safePage, totalPages).map((page, i) =>
            page === "…" ? (
              <span
                key={`ellipsis-${i}`}
                className="inline-flex h-7 w-7 items-center justify-center text-[12px] text-gray-400"
              >
                …
              </span>
            ) : (
              <button
                key={page}
                type="button"
                onClick={() => goToPage(page)}
                className={cn(
                  "inline-flex h-7 min-w-[28px] items-center justify-center rounded-md px-1.5 text-[12px] tabular-nums transition-colors",
                  page === safePage
                    ? "bg-brand font-medium text-white"
                    : "border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
                aria-current={page === safePage ? "page" : undefined}
              >
                {page}
              </button>
            )
          )}
          <button
            type="button"
            onClick={() => goToPage(safePage + 1)}
            disabled={safePage >= totalPages}
            className={cn(
              "inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-500 transition-colors",
              safePage >= totalPages
                ? "cursor-not-allowed opacity-40"
                : "hover:bg-gray-50 hover:text-gray-800"
            )}
            aria-label="Next page"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
