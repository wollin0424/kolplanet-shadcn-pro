"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { InfluencerIdentityCell } from "@/components/InfluencerIdentityCell";
import { TableNotesCell } from "@/components/TableNotesCell";
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
import { cn } from "@/lib/utils";
import {
  INFLUENCER_PAYMENT_ROWS,
  type InfluencerPaymentRow,
} from "@/lib/influencerPayments";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Download,
  MoreVertical,
  Search,
} from "@/lib/icons";

const PAGE_SIZE_OPTIONS = [10, 20, 30] as const;

const TOOLBAR_CONTROL =
  "h-8 rounded-lg border border-gray-200 bg-white text-[12.5px] shadow-none";

const GEO_OPTIONS = ["All", "IN", "SG", "MY", "ID", "TH", "PH"] as const;

function formatUsd(amount: number) {
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

export default function InfluencerPaymentsTable() {
  const router = useRouter();
  const [geoFilter, setGeoFilter] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(30);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return INFLUENCER_PAYMENT_ROWS.filter((row) => {
      const matchesGeo = geoFilter === "All" || row.geo === geoFilter;
      const matchesQuery =
        q.length === 0 ||
        row.id.includes(q) ||
        row.name.toLowerCase().includes(q) ||
        row.handle.toLowerCase().includes(q);
      return matchesGeo && matchesQuery;
    });
  }, [geoFilter, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const pageEnd = Math.min(pageStart + pageSize, filtered.length);
  const pageRows = filtered.slice(pageStart, pageEnd);

  const goToPage = (p: number) => setCurrentPage(Math.min(Math.max(1, p), totalPages));

  const openDetail = (row: InfluencerPaymentRow) => {
    router.push(`/payments/influencer/${encodeURIComponent(row.id)}`);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-white">
      <div className="flex shrink-0 items-center gap-2 border-b border-gray-100 px-5 py-3">
        <Select
          value={geoFilter}
          onValueChange={(v) => {
            setGeoFilter(v ?? "All");
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className={cn(TOOLBAR_CONTROL, "h-8 w-[150px] text-gray-600")}>
            <SelectValue placeholder="Influencer Geo" />
          </SelectTrigger>
          <SelectContent>
            {GEO_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt === "All" ? "Influencer Geo" : opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative min-w-[200px] flex-1 max-w-md">
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
            placeholder="Search by influencer ID or name"
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

        <button
          type="button"
          className={cn(
            TOOLBAR_CONTROL,
            "inline-flex size-8 shrink-0 items-center justify-center text-gray-500 transition-colors hover:bg-gray-50"
          )}
          aria-label="Export"
        >
          <Download size={15} />
        </button>
      </div>

      <div className="no-scrollbar flex-1 min-h-0 overflow-auto [&_[data-slot=table-container]]:no-scrollbar">
        <Table className="w-full min-w-[1200px] table-auto border-separate border-spacing-0 text-[13px] [&_td]:px-5 [&_th]:px-5">
          <TableHeader>
            <TableRow className="border-b border-gray-100 bg-gray-50/80 hover:bg-gray-50/80">
              <TableHead className="py-3 font-semibold text-gray-700">Influencer Account</TableHead>
              <TableHead className="py-3 font-semibold text-gray-700">Influencer ID</TableHead>
              <TableHead className="py-3 font-semibold text-gray-700">Influencer Geo</TableHead>
              <TableHead className="py-3 font-semibold text-gray-700">No of Campaigns</TableHead>
              <TableHead className="py-3 font-semibold text-gray-700">Approved Amount</TableHead>
              <TableHead className="py-3 font-semibold text-gray-700">Amount Paid</TableHead>
              <TableHead className="py-3 font-semibold text-gray-700">Balance</TableHead>
              <TableHead className="py-3 font-semibold text-gray-700">Notes</TableHead>
              <TableHead className="w-10 py-3" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((row) => (
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
                  <InfluencerIdentityCell
                    name={row.name}
                    handle={row.handle}
                    platform={row.platform}
                    kolManager={row.kolManager}
                    relationship={row.relationship}
                    avatarSize="md"
                  />
                </TableCell>
                <TableCell className="py-3.5 tabular-nums text-gray-800">{row.id}</TableCell>
                <TableCell className="py-3.5 text-gray-700">{row.geo}</TableCell>
                <TableCell className="py-3.5 tabular-nums text-gray-800">{row.campaignCount}</TableCell>
                <TableCell className="py-3.5 tabular-nums text-gray-800">
                  {formatUsd(row.approvedAmount)}
                </TableCell>
                <TableCell className="py-3.5 tabular-nums text-gray-800">
                  {formatUsd(row.amountPaid)}
                </TableCell>
                <TableCell className="py-3.5 tabular-nums font-medium text-gray-900">
                  {formatUsd(row.balance)}
                </TableCell>
                <TableCell className="max-w-[180px] py-3.5">
                  <TableNotesCell
                    value={row.notes}
                    ariaLabel={`Edit notes for ${row.name}`}
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
                        View campaigns
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
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
