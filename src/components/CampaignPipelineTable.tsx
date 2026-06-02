"use client";

import { useMemo, useState } from "react";
import { InfluencerIdentityCell } from "@/components/InfluencerIdentityCell";
import type { KolRelationship } from "@/components/InfluencerMetaIcons";
import CollabStatusSelect from "@/components/pipeline/CollabStatusSelect";
import { CommercialScopePopover } from "@/components/pipeline/CommercialScopePopover";
import { PipelineRowActionsMenu } from "@/components/pipeline/PipelineRowActionsMenu";
import PipelineStageCell from "@/components/pipeline/PipelineStageCell";
import { TableNotesCell } from "@/components/TableNotesCell";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  CONTENT_STATUS_CONFIG,
  CONTRACT_STATUS_CONFIG,
  LOGISTICS_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
  POSTING_STATUS_CONFIG,
  SCRIPT_STATUS_CONFIG,
  COLLAB_STATUS_OPTIONS,
  type CollabStatus,
  type ContentStatus,
  type ContractStatus,
  type LogisticsStatus,
  type PaymentStatus,
  type PostingStatus,
  type ScriptStatus,
} from "@/lib/pipeline/stageStatuses";
import {
  PIPELINE_TABLE_COLUMNS,
  PIPELINE_TABLE_MIN_WIDTH,
} from "@/lib/pipeline/tableColumns";
import {
  toolbarIconButtonClass,
  toolbarInputClass,
  toolbarSelectClass,
} from "@/lib/toolbarControls";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  History,
  Search,
  UserPlus,
} from "@/lib/icons";

type PipelineRow = {
  id: string;
  handle: string;
  displayName: string;
  platform: string;
  collabStatus: CollabStatus;
  contract: ContractStatus;
  logistics: LogisticsStatus;
  script: ScriptStatus;
  content: ContentStatus;
  posting: PostingStatus;
  payment: PaymentStatus;
  manager: string;
  relationship: KolRelationship;
  note: string;
};

const RELATIONSHIP_POOL: KolRelationship[] = ["Direct", "Manager", "MCN"];

/** Order matches Campaign Hub cards; mock rows cycle with `i % length`. */
const LOGISTICS_POOL: LogisticsStatus[] = [
  "Received",
  "Delivered",
  "In Transit",
  "Out of Delivery",
  "Awaiting Pickup",
  "Delivery Failed",
];
const SCRIPT_POOL: ScriptStatus[] = ["Pending", "Waiting for Approval", "Approved"];
const CONTENT_POOL: ContentStatus[] = ["Video Pending", "Copy Approved", "Approved"];
const POSTING_POOL: PostingStatus[] = ["Ready", "In Progress", "Posted"];
const PAYMENT_POOL: PaymentStatus[] = [
  "Partially Paid",
  "Validated",
  "All Paid",
  "Waiting for Validation",
  "Rejected",
];
const COLLAB_POOL: CollabStatus[] = [
  "Pending",
  "Invited",
  "In Negotiation",
  "Approved",
  "Active",
  "Completed",
  "On Hold",
  "Terminated",
];

const CONTRACT_POOL: ContractStatus[] = [
  "Pending",
  "Awaiting KOL Info",
  "Agreement Generated",
  "Platform Signed",
  "Countersigned",
  "Addendum Generated",
];

const DISPLAY_NAMES = [
  "Amelia Stones",
  "Ethan Carter",
  "Maya Lin",
  "Noah Brooks",
  "Sofia Reyes",
  "Liam Park",
  "Chloe Tan",
  "Aria Singh",
];

const HANDLES = [
  "@instagram_ins",
  "@foodie_my",
  "@lifestyle_id",
  "@creator_ph",
  "@runner_in",
  "@tech_my",
  "@beauty_id",
  "@daily_ph",
];

function buildMockRows(count: number): PipelineRow[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `INF-${String(i + 1).padStart(2, "0")}`,
    handle: HANDLES[i % HANDLES.length],
    displayName: DISPLAY_NAMES[i % DISPLAY_NAMES.length],
    platform: "Instagram",
    collabStatus: COLLAB_POOL[i % COLLAB_POOL.length],
    contract: CONTRACT_POOL[i % CONTRACT_POOL.length],
    logistics: LOGISTICS_POOL[i % LOGISTICS_POOL.length],
    script: SCRIPT_POOL[(i + 1) % SCRIPT_POOL.length],
    content: CONTENT_POOL[(i + 2) % CONTENT_POOL.length],
    posting: POSTING_POOL[(i + 3) % POSTING_POOL.length],
    payment: PAYMENT_POOL[(i + 4) % PAYMENT_POOL.length],
    manager: "Wolin",
    relationship: RELATIONSHIP_POOL[i % RELATIONSHIP_POOL.length],
    note: "Active user - Fr...",
  }));
}

const MOCK_ROWS = buildMockRows(90);
const INFLUENCER_CAP = 300;
const PAGE_SIZE_OPTIONS = [10, 20, 30, 50];
const KOL_MANAGERS = ["Wolin", "Moca", "Chris", "Sarah"] as const;

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

export default function CampaignPipelineTable({ campaignId }: { campaignId: string }) {
  const [query, setQuery] = useState("");
  const [collabFilter, setCollabFilter] = useState<CollabStatus | "All">("All");
  const [managerFilter, setManagerFilter] = useState<string>("All");
  const [pageSize, setPageSize] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [rows, setRows] = useState<PipelineRow[]>(MOCK_ROWS);

  const updateCollabStatus = (rowId: string, collabStatus: CollabStatus) => {
    setRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, collabStatus } : r))
    );
  };

  const filtered = useMemo(() => {
    let list = rows;
    if (collabFilter !== "All") {
      list = list.filter((r) => r.collabStatus === collabFilter);
    }
    if (managerFilter !== "All") {
      list = list.filter((r) => r.manager === managerFilter);
    }
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (r) =>
        r.handle.toLowerCase().includes(q) ||
        r.displayName.toLowerCase().includes(q)
    );
  }, [query, rows, collabFilter, managerFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const pageEnd = Math.min(pageStart + pageSize, filtered.length);
  const pageRows = filtered.slice(pageStart, pageEnd);

  const pageIds = pageRows.map((r) => r.id);
  const allSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const someSelected = pageIds.some((id) => selected.has(id)) && !allSelected;

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const toggleRow = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const goToPage = (p: number) =>
    setCurrentPage(Math.min(Math.max(1, p), totalPages));

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white overflow-hidden">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/80 px-6 py-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2.5">
          <Select
            value={collabFilter === "All" ? "" : collabFilter}
            onValueChange={(v) => {
              setCollabFilter(v ? (v as CollabStatus) : "All");
              setCurrentPage(1);
            }}
          >
            <SelectTrigger size="sm" className={toolbarSelectClass("w-[200px]")}>
              <SelectValue placeholder="Collaboration Status" />
            </SelectTrigger>
            <SelectContent>
              {COLLAB_STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={managerFilter === "All" ? "" : managerFilter}
            onValueChange={(v) => {
              setManagerFilter(v ?? "All");
              setCurrentPage(1);
            }}
          >
            <SelectTrigger size="sm" className={toolbarSelectClass("w-[150px]")}>
              <SelectValue placeholder="KOL Manager" />
            </SelectTrigger>
            <SelectContent>
              {KOL_MANAGERS.map((manager) => (
                <SelectItem key={manager} value={manager}>
                  {manager}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative min-w-[220px] flex-1 max-w-md">
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
              placeholder="Search Influencer by Name or Handle"
              className={toolbarInputClass("pl-8")}
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            className={toolbarIconButtonClass()}
            aria-label="View history"
          >
            <History size={16} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            className={toolbarIconButtonClass()}
            aria-label="Add influencer"
          >
            <UserPlus size={16} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/60 px-6 py-2.5">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[12px] text-gray-500 font-medium shrink-0">
            Influencer:{" "}
            <span className="text-gray-900 tabular-nums">
              {filtered.length}/{INFLUENCER_CAP}
            </span>
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "shrink-0 flex items-center gap-1 text-[12px] border border-gray-200 rounded-md px-2.5 py-1 bg-white hover:bg-gray-50 transition-colors",
                someSelected || allSelected ? "text-gray-700" : "text-gray-400"
              )}
            >
              Bulk Actions
              <ChevronDown size={11} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="text-[13px]">
              <DropdownMenuItem>Export Selected</DropdownMenuItem>
              <DropdownMenuItem>Send Reminder</DropdownMenuItem>
              <DropdownMenuItem variant="destructive">Remove Selected</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 text-[12px] text-gray-600 border border-gray-200 rounded-md px-2.5 py-1 bg-white hover:bg-gray-50 transition-colors shrink-0">
            Visible Columns
            <ChevronDown size={11} className="text-gray-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="text-[13px] w-40">
            <DropdownMenuItem>Reset</DropdownMenuItem>
            <DropdownMenuItem>Save view</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="no-scrollbar flex-1 min-h-0 overflow-auto">
        <Table
          className="w-full table-fixed text-[13px] border-separate border-spacing-0 [&_th]:!px-6 [&_td]:!px-6"
          style={{ minWidth: PIPELINE_TABLE_MIN_WIDTH }}
        >
          <colgroup>
            {PIPELINE_TABLE_COLUMNS.map((col) => (
              <col key={col.key} style={{ width: col.width }} />
            ))}
          </colgroup>
          <TableHeader>
            <TableRow className="border-b border-gray-100 bg-gray-50/70 hover:bg-gray-50/70">
              <TableHead className="py-3.5 align-middle">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onCheckedChange={toggleAll}
                  className="border-gray-300"
                />
              </TableHead>
              <TableHead className="font-semibold text-gray-800 py-3.5">
                Influencer
              </TableHead>
              <TableHead className="font-semibold text-gray-800 py-3.5">
                Collaboration Status
              </TableHead>
              <TableHead className="font-semibold text-gray-800 py-3.5 !pr-10">
                Commercial
              </TableHead>
              <TableHead className="font-semibold text-gray-800 py-3.5">
                Contract
              </TableHead>
              <TableHead className="font-semibold text-gray-800 py-3.5">
                Logistics
              </TableHead>
              <TableHead className="font-semibold text-gray-800 py-3.5">
                Script
              </TableHead>
              <TableHead className="font-semibold text-gray-800 py-3.5">
                Content
              </TableHead>
              <TableHead className="font-semibold text-gray-800 py-3.5">
                Posting
              </TableHead>
              <TableHead className="font-semibold text-gray-800 py-3.5">
                Payment
              </TableHead>
              <TableHead className="font-semibold text-gray-800 py-3.5">
                KOL Manager
              </TableHead>
              <TableHead className="font-semibold text-gray-800 py-3.5">
                Internal Notes
              </TableHead>
              <TableHead className="font-semibold text-gray-800 py-3.5">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {pageRows.map((row) => {
              const isSelected = selected.has(row.id);
              return (
                <TableRow
                  key={row.id}
                  className={cn(
                    "border-b border-gray-50 transition-colors group bg-white hover:bg-brand-row-hover",
                    isSelected && "bg-brand-row-selected hover:bg-brand-row-selected-hover"
                  )}
                >
                  <TableCell className="py-4">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleRow(row.id)}
                      className="border-gray-300"
                    />
                  </TableCell>

                  <TableCell className="py-4 overflow-hidden">
                    <InfluencerIdentityCell
                      name={row.displayName}
                      handle={row.handle}
                      platform={row.platform}
                      kolManager={row.manager}
                      relationship={row.relationship}
                    />
                  </TableCell>

                  <TableCell className="py-4 overflow-hidden">
                    <CollabStatusSelect
                      status={row.collabStatus}
                      onChange={(next) => updateCollabStatus(row.id, next)}
                    />
                  </TableCell>

                  <TableCell className="py-4 !pr-10">
                    <CommercialScopePopover />
                  </TableCell>

                  <TableCell className="py-4 overflow-hidden">
                    <PipelineStageCell config={CONTRACT_STATUS_CONFIG[row.contract]} />
                  </TableCell>

                  <TableCell className="py-4 overflow-hidden">
                    <PipelineStageCell config={LOGISTICS_STATUS_CONFIG[row.logistics]} />
                  </TableCell>

                  <TableCell className="py-4 overflow-hidden">
                    <PipelineStageCell config={SCRIPT_STATUS_CONFIG[row.script]} />
                  </TableCell>

                  <TableCell className="py-4 overflow-hidden">
                    <PipelineStageCell config={CONTENT_STATUS_CONFIG[row.content]} />
                  </TableCell>

                  <TableCell className="py-4 overflow-hidden">
                    <PipelineStageCell config={POSTING_STATUS_CONFIG[row.posting]} />
                  </TableCell>

                  <TableCell className="py-4 overflow-hidden">
                    <PipelineStageCell config={PAYMENT_STATUS_CONFIG[row.payment]} />
                  </TableCell>

                  <TableCell className="py-4">
                    <button
                      type="button"
                      className="inline-flex items-center text-[13px] text-gray-500 hover:text-gray-700"
                    >
                      {row.manager}
                      <ChevronDown size={12} className="ml-0.5 text-gray-400" />
                    </button>
                  </TableCell>

                  <TableCell className="py-4">
                    <TableNotesCell
                      value={row.note}
                      ariaLabel={`Edit internal note for ${row.handle}`}
                    />
                  </TableCell>

                  <TableCell className="py-4">
                    <PipelineRowActionsMenu
                      onAddToPayment={() => {
                        console.log("Add to payment:", row.id);
                      }}
                      onTerminate={() => updateCollabStatus(row.id, "Terminated")}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-4 px-5 py-3 border-t border-gray-100 shrink-0 bg-white">
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-gray-500">
            Page <span className="tabular-nums text-gray-800 font-medium">{safePage}</span> of{" "}
            <span className="tabular-nums text-gray-800 font-medium">{totalPages}</span>
          </span>
          <span className="text-gray-200 hidden sm:inline">|</span>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[12px] text-gray-500">{pageSize} / page</span>
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
        </div>
      </div>

      <span className="sr-only">{campaignId}</span>
    </div>
  );
}
