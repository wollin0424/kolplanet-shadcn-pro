"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TooltipProvider } from "@/components/ui/tooltip";
import BillingStatusSelect from "@/components/BillingStatusSelect";
import { CampaignStaffIcons } from "@/components/CampaignStaffIcons";
import { TableNotesCell } from "@/components/TableNotesCell";
import { cn } from "@/lib/utils";
import {
  CLIENT_BILLING_ROWS,
  COLLECTION_STATUS_OPTIONS,
  COLLECTION_STATUS_STYLES,
  CONTRACT_STATUS_OPTIONS,
  CONTRACT_STATUS_STYLES,
  INVOICE_STATUS_OPTIONS,
  INVOICE_STATUS_STYLES,
  type ClientBillingRow,
  type ClientInvoiceStatus,
  type CollectionStatus,
  type ContractStatus,
} from "@/lib/clientBilling";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Columns3,
  FileText,
  MoreVertical,
  Search,
  SlidersHorizontal,
} from "@/lib/icons";

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

const TOOLBAR_CONTROL =
  "h-8 rounded-lg border border-gray-200 bg-white text-[12.5px] shadow-none";

function formatMoney(amount: number) {
  return `$${amount.toLocaleString("en-US")}`;
}

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-medium text-gray-500">{label}</p>
      {children}
    </div>
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

export default function ClientBillingTable() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [serviceMonth, setServiceMonth] = useState("All");
  const [contractStatus, setContractStatus] = useState("All");
  const [invoiceStatus, setInvoiceStatus] = useState("All");
  const [collectionStatus, setCollectionStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [contractStatusById, setContractStatusById] = useState<
    Partial<Record<string, ContractStatus>>
  >({});
  const [invoiceStatusById, setInvoiceStatusById] = useState<
    Partial<Record<string, ClientInvoiceStatus>>
  >({});
  const [collectionStatusById, setCollectionStatusById] = useState<
    Partial<Record<string, CollectionStatus>>
  >({});

  const rowsWithStatuses = useMemo(
    () =>
      CLIENT_BILLING_ROWS.map((row) => ({
        ...row,
        contractStatus: contractStatusById[row.id] ?? row.contractStatus,
        invoiceStatus: invoiceStatusById[row.id] ?? row.invoiceStatus,
        collectionStatus: collectionStatusById[row.id] ?? row.collectionStatus,
      })),
    [contractStatusById, invoiceStatusById, collectionStatusById]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rowsWithStatuses.filter((row) => {
      const matchesQuery =
        q.length === 0 ||
        row.id.toLowerCase().includes(q) ||
        row.campaignName.toLowerCase().includes(q) ||
        row.contractingEntity.toLowerCase().includes(q);
      const matchesMonth = serviceMonth === "All" || row.serviceMonth === serviceMonth;
      const matchesContract =
        contractStatus === "All" || row.contractStatus === contractStatus;
      const matchesInvoice =
        invoiceStatus === "All" || row.invoiceStatus === invoiceStatus;
      const matchesCollection =
        collectionStatus === "All" || row.collectionStatus === collectionStatus;
      return (
        matchesQuery &&
        matchesMonth &&
        matchesContract &&
        matchesInvoice &&
        matchesCollection
      );
    });
  }, [query, serviceMonth, contractStatus, invoiceStatus, collectionStatus, rowsWithStatuses]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const pageEnd = Math.min(pageStart + pageSize, filtered.length);
  const pageRows = filtered.slice(pageStart, pageEnd);

  const goToPage = (p: number) => setCurrentPage(Math.min(Math.max(1, p), totalPages));

  const resetFilters = () => {
    setContractStatus("All");
    setInvoiceStatus("All");
    setCollectionStatus("All");
    setCurrentPage(1);
  };

  const openDetail = (row: ClientBillingRow) => {
    router.push(`/payments/client/${encodeURIComponent(row.id)}`);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (contractStatus !== "All") count += 1;
    if (invoiceStatus !== "All") count += 1;
    if (collectionStatus !== "All") count += 1;
    return count;
  }, [contractStatus, invoiceStatus, collectionStatus]);

  return (
    <TooltipProvider>
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-white">
      <div className="flex shrink-0 items-center gap-2 border-b border-gray-100 px-5 py-3">
        <div className="flex min-w-0 items-center gap-2">
        <Popover>
          <PopoverTrigger
            type="button"
            className={cn(
              TOOLBAR_CONTROL,
              "inline-flex shrink-0 items-center gap-1.5 px-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
            )}
          >
            <SlidersHorizontal size={13} className="text-gray-500" strokeWidth={2} />
            Filters
            {activeFilterCount > 0 ? (
              <span className="flex size-4 items-center justify-center rounded-full bg-brand text-[9px] font-bold text-white">
                {activeFilterCount}
              </span>
            ) : null}
          </PopoverTrigger>
          <PopoverContent align="start" sideOffset={8} className="w-[300px] gap-0 p-0">
            <div className="border-b border-gray-100 px-4 py-3">
              <p className="text-[13px] font-semibold text-gray-900">Filters</p>
            </div>
            <div className="space-y-3 p-4">
              <FilterField label="Contract Status">
                <Select
                  value={contractStatus}
                  onValueChange={(v) => {
                    setContractStatus(v ?? "All");
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 w-full border-gray-200 bg-white text-[12.5px]">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    {CONTRACT_STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterField>

              <FilterField label="Invoice Status">
                <Select
                  value={invoiceStatus}
                  onValueChange={(v) => {
                    setInvoiceStatus(v ?? "All");
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 w-full border-gray-200 bg-white text-[12.5px]">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    {INVOICE_STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterField>

              <FilterField label="Collection Status">
                <Select
                  value={collectionStatus}
                  onValueChange={(v) => {
                    setCollectionStatus(v ?? "All");
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 w-full border-gray-200 bg-white text-[12.5px]">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    {COLLECTION_STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterField>

            </div>
            <div className="border-t border-gray-100 px-4 py-3">
              <button
                type="button"
                onClick={resetFilters}
                className="text-[12.5px] font-medium text-brand hover:text-brand/80"
              >
                Reset all filters
              </button>
            </div>
          </PopoverContent>
        </Popover>

        <div className="relative shrink-0">
          <Select
            value={serviceMonth}
            onValueChange={(v) => {
              setServiceMonth(v ?? "All");
              setCurrentPage(1);
            }}
          >
            <SelectTrigger
              size="sm"
              className={cn(
                TOOLBAR_CONTROL,
                "h-8 w-[156px] pr-8 pl-2.5 text-gray-600 data-[size=default]:h-8 [&_svg:last-child]:hidden"
              )}
            >
              <SelectValue placeholder="Service Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Service Month</SelectItem>
              <SelectItem value="2024-02">2024-02</SelectItem>
              <SelectItem value="2024-01">2024-01</SelectItem>
              <SelectItem value="2023-12">2023-12</SelectItem>
            </SelectContent>
          </Select>
          <Calendar
            size={14}
            strokeWidth={2}
            className="pointer-events-none absolute top-1/2 right-2.5 z-10 -translate-y-1/2 text-gray-400"
          />
        </div>

        <div className="relative w-[248px] shrink-0">
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
            placeholder="Search Campaign, ID or Entity"
            className={cn(
              TOOLBAR_CONTROL,
              "h-8 w-full pl-8 text-gray-800 placeholder:text-gray-400 focus-visible:ring-brand/30"
            )}
          />
        </div>
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

      <div className="wide-table-scroll flex-1 min-h-0 overflow-hidden">
        <Table className="w-full min-w-[1320px] table-auto border-separate border-spacing-0 text-[13px] [&_td]:px-5 [&_th]:px-5">
          <TableHeader>
            <TableRow className="border-b border-gray-100 bg-gray-50/80 hover:bg-gray-50/80">
              <TableHead className="py-3 font-semibold text-gray-700">Campaign Name</TableHead>
              <TableHead className="py-3 font-semibold text-gray-700">Service Month</TableHead>
              <TableHead className="py-3 font-semibold text-gray-700">Contract Status</TableHead>
              <TableHead className="py-3 font-semibold text-gray-700">Invoice Status</TableHead>
              <TableHead className="py-3 font-semibold text-gray-700">Collection Status</TableHead>
              <TableHead className="py-3 font-semibold text-gray-700">Commercial</TableHead>
              <TableHead className="py-3 font-semibold text-gray-700">Contracting Entity</TableHead>
              <TableHead className="py-3 font-semibold text-gray-700">
                Client Receivable (Net)
              </TableHead>
              <TableHead className="py-3 font-semibold text-gray-700">
                Settlement Amount
              </TableHead>
              <TableHead className="py-3 font-semibold text-gray-700">Due Date</TableHead>
              <TableHead className="py-3 font-semibold text-gray-700">Payment Proof</TableHead>
              <TableHead className="py-3 font-semibold text-gray-700">Internal Notes</TableHead>
              <TableHead className="w-10 py-3" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((row) => {
              return (
                <TableRow
                  key={row.id}
                  role="link"
                  tabIndex={0}
                  onClick={() => openDetail(row)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openDetail(row);
                    }
                  }}
                  className="cursor-pointer border-b border-gray-50 bg-white transition-colors hover:bg-brand-row-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
                >
                  <TableCell className="py-3.5">
                    <div className="flex min-w-[240px] items-center gap-2.5">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[10px] font-semibold text-gray-500">
                        {row.id.slice(0, 2)}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-gray-900">
                            {row.id} {row.campaignName}
                          </span>
                          <CampaignStaffIcons sales={row.sales} pm={row.pm} />
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5 tabular-nums text-gray-700">
                    {row.serviceMonth}
                  </TableCell>
                  <TableCell className="py-3.5" onClick={(e) => e.stopPropagation()}>
                    <BillingStatusSelect
                      status={row.contractStatus}
                      options={CONTRACT_STATUS_OPTIONS}
                      styles={CONTRACT_STATUS_STYLES}
                      onChange={(next) =>
                        setContractStatusById((prev) => ({ ...prev, [row.id]: next }))
                      }
                    />
                  </TableCell>
                  <TableCell className="py-3.5" onClick={(e) => e.stopPropagation()}>
                    <BillingStatusSelect
                      status={row.invoiceStatus}
                      options={INVOICE_STATUS_OPTIONS}
                      styles={INVOICE_STATUS_STYLES}
                      onChange={(next) =>
                        setInvoiceStatusById((prev) => ({ ...prev, [row.id]: next }))
                      }
                    />
                  </TableCell>
                  <TableCell className="py-3.5" onClick={(e) => e.stopPropagation()}>
                    <BillingStatusSelect
                      status={row.collectionStatus}
                      options={COLLECTION_STATUS_OPTIONS}
                      styles={COLLECTION_STATUS_STYLES}
                      onChange={(next) =>
                        setCollectionStatusById((prev) => ({ ...prev, [row.id]: next }))
                      }
                    />
                  </TableCell>
                  <TableCell className="py-3.5" onClick={(e) => e.stopPropagation()}>
                    {row.hasCommercialUpdate ? (
                      <button
                        type="button"
                        className="relative inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-800"
                      >
                        <FileText size={12} strokeWidth={2} />
                        New Update
                        <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-amber-500" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-50"
                      >
                        <FileText size={12} strokeWidth={2} />
                        View Details
                      </button>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[180px] py-3.5 text-gray-700">
                    <span className="line-clamp-2">{row.contractingEntity}</span>
                  </TableCell>
                  <TableCell className="py-3.5 tabular-nums text-gray-800">
                    {formatMoney(row.clientReceivable)}
                  </TableCell>
                  <TableCell className="py-3.5 tabular-nums text-gray-800">
                    {formatMoney(row.settlementAmount)}
                  </TableCell>
                  <TableCell className="py-3.5 tabular-nums text-gray-600">{row.dueDate}</TableCell>
                  <TableCell className="py-3.5 text-gray-600">
                    {row.paymentProofCount > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[12px]">
                        <FileText size={13} className="text-gray-400" />
                        {row.paymentProofCount} files
                      </span>
                    ) : (
                      <span className="text-[12px] text-gray-400">No proof</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[200px] py-3.5">
                    <TableNotesCell
                      value={row.internalNotes}
                      ariaLabel={`Edit internal notes for ${row.id}`}
                    />
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
                        <DropdownMenuItem onSelect={() => openDetail(row)}>
                          Open campaign billing
                        </DropdownMenuItem>
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
    </TooltipProvider>
  );
}
