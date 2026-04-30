"use client";

import { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import ContractInfoSheet from "@/components/ContractInfoSheet";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Search,
  Columns3,
  RefreshCcw,
  Check,
  Hourglass,
  FileText,
} from "lucide-react";

type CollabStatus = "Pending" | "Approved";
type ContractStage =
  | "Fill Contract Info"
  | "Generate Draft"
  | "Sign as Advertiser"
  | "Check Status"
  | "View Final Contract";

type PipelineRow = {
  id: string;
  handle: string;
  platform: string;
  status: CollabStatus;
  actionLabel: string;
  contractStage: ContractStage;
  copy: "Pending" | "Approved";
  posting: "Ready" | "Posted";
  commercial: "Pending" | "Approved";
  manager: string;
  note: string;
};

const BASE_ROWS: PipelineRow[] = [
  {
    id: "INF-01",
    handle: "@instagram_ins",
    platform: "Instagram",
    status: "Pending",
    actionLabel: "Approve",
    contractStage: "Fill Contract Info",
    copy: "Pending",
    posting: "Ready",
    commercial: "Pending",
    manager: "Wollin",
    note: "Active user - F...",
  },
  {
    id: "INF-02",
    handle: "@instagram_ins",
    platform: "Instagram",
    status: "Pending",
    actionLabel: "Approve",
    contractStage: "Generate Draft",
    copy: "Pending",
    posting: "Ready",
    commercial: "Pending",
    manager: "Wollin",
    note: "Active user - F...",
  },
  {
    id: "INF-03",
    handle: "@instagram_ins",
    platform: "Instagram",
    status: "Pending",
    actionLabel: "Approve",
    contractStage: "Sign as Advertiser",
    copy: "Pending",
    posting: "Ready",
    commercial: "Pending",
    manager: "Wollin",
    note: "Active user - F...",
  },
  {
    id: "INF-04",
    handle: "@instagram_ins",
    platform: "Instagram",
    status: "Approved",
    actionLabel: "Add Post Link",
    contractStage: "Check Status",
    copy: "Approved",
    posting: "Ready",
    commercial: "Pending",
    manager: "Wollin",
    note: "Active user - F...",
  },
  {
    id: "INF-05",
    handle: "@instagram_ins",
    platform: "Instagram",
    status: "Approved",
    actionLabel: "Add Post Link",
    contractStage: "View Final Contract",
    copy: "Approved",
    posting: "Posted",
    commercial: "Approved",
    manager: "Wollin",
    note: "Active user - F...",
  },
];

function buildExtras(): PipelineRow[] {
  const handles = [
    "@foodie_my",
    "@lifestyle_id",
    "@creator_ph",
    "@runner_in",
    "@tech_my",
    "@beauty_id",
    "@daily_ph",
    "@street_in",
  ];
  const stages: ContractStage[] = [
    "Fill Contract Info",
    "Generate Draft",
    "Sign as Advertiser",
    "Check Status",
    "View Final Contract",
  ];
  return Array.from({ length: 16 }, (_, i) => ({
    // start at 06 to avoid clashing with the 5 canonical demo rows
    id: `INF-${String(i + 6).padStart(2, "0")}`,
    handle: handles[i % handles.length],
    platform: "Instagram",
    status: i % 5 === 0 ? "Approved" : "Pending",
    actionLabel: i % 5 === 0 ? "Add Post Link" : "Approve",
    contractStage: stages[i % stages.length],
    copy: i % 4 === 0 ? "Approved" : "Pending",
    posting: i % 7 === 0 ? "Posted" : "Ready",
    commercial: i % 6 === 0 ? "Approved" : "Pending",
    manager: "Wollin",
    note: "Active user - F...",
  }));
}

const MOCK_ROWS: PipelineRow[] = [...BASE_ROWS, ...buildExtras()];
const PAGE_SIZE_OPTIONS = [10, 20, 50];
const PROGRESS_STEPS = ["Contract", "Content", "Posting", "Payment", "Copy", "Commercial"] as const;

function Badge({
  tone,
  children,
}: {
  tone: "amber" | "green" | "gray" | "brand";
  children: React.ReactNode;
}) {
  const cls =
    tone === "amber"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : tone === "green"
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : tone === "brand"
          ? "bg-brand-50 text-brand border-brand-100"
          : "bg-gray-50 text-gray-600 border-gray-200";
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold border", cls)}>
      {children}
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

function hashString(input: string) {
  // Deterministic tiny hash for stable mock UI
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function buildProgressForRow(id: string) {
  // random-ish but stable per row: completes first N steps
  const h = hashString(id);
  const completed = (h % (PROGRESS_STEPS.length + 1)) as number; // 0..6
  return PROGRESS_STEPS.map((_, i) => i < completed);
}

const CONTRACT_STEPS = ["Contract Info", "Contract Draft", "Advertiser Sign", "KOL Sign"] as const;

function contractStageIndex(stage: ContractStage) {
  switch (stage) {
    case "Fill Contract Info":
      return 0; // 0/4 complete
    case "Generate Draft":
      return 1; // 1/4 complete
    case "Sign as Advertiser":
      return 2; // 2/4 complete
    case "Check Status":
      return 3; // 3/4 complete
    case "View Final Contract":
      return 4; // 4/4 complete
  }
}

function ContractStepper({
  stage,
  onPrimaryAction,
}: {
  stage: ContractStage;
  onPrimaryAction?: () => void;
}) {
  const idx = contractStageIndex(stage); // 0..4
  const completed = Math.min(idx, 4);
  const currentStep = Math.min(idx + 1, 4); // 1..4, used for hourglass

  const meta =
    stage === "Fill Contract Info"
      ? ""
      : stage === "Generate Draft"
        ? "Mar 31, 2026 12:22 PM"
        : stage === "Sign as Advertiser"
          ? "Generated at 03:40 PM"
          : "Signed at 06:18 PM";

  const showFiles = stage === "View Final Contract";
  const isFill = stage === "Fill Contract Info";

  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50/40 px-3.5 py-2.5">
      {/* Stepper row */}
      <div className="flex items-center gap-2 text-[11px] text-gray-400 overflow-hidden">
        {CONTRACT_STEPS.map((label, i) => {
          const stepNo = i + 1;
          const isDone = stepNo <= completed;
          const isCurrent = stepNo === currentStep && completed < 4;
          return (
            <div key={label} className="flex items-center min-w-0">
              <span
                className={cn(
                  "h-3.5 w-3.5 shrink-0 rounded-full inline-flex items-center justify-center border",
                  isDone
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : isCurrent
                      ? "bg-brand-50 border-brand-100 text-brand"
                      : "bg-white border-gray-200 text-gray-300"
                )}
              >
                {isDone ? (
                  <Check size={10} strokeWidth={2.8} />
                ) : isCurrent ? (
                  <Hourglass size={10} strokeWidth={2.4} />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                )}
              </span>

              <span
                className={cn(
                  "ml-2 truncate",
                  isDone ? "text-gray-800 font-medium" : "text-gray-400"
                )}
              >
                {label}
              </span>

              {i !== CONTRACT_STEPS.length - 1 && (
                <span className="mx-2 text-gray-200">--</span>
              )}
            </div>
          );
        })}
      </div>

      {meta ? (
        <div className="mt-1.5 text-[11px] text-gray-400 italic">{meta}</div>
      ) : (
        <div className="mt-1.5 h-[16px]" />
      )}

      <Button
        variant="outline"
        size="sm"
        className="mt-2 h-8 w-full justify-center text-[12px] border-gray-200 bg-white/70 text-brand hover:bg-white"
        onClick={(e) => {
          e.stopPropagation();
          if (isFill) onPrimaryAction?.();
        }}
      >
        {stage}
        <ChevronDown size={13} className="ml-2 text-gray-400" />
      </Button>

      {showFiles && (
        <div className="mt-2.5 space-y-1.5 text-[11px] text-gray-600">
          {[
            "IO_V1_Original (Signed 2026-03-31).pdf",
            "IO_V2_Addendum (Signed 2026-03-31).pdf",
          ].map((f) => (
            <div key={f} className="flex items-center gap-2">
              <FileText size={13} className="text-gray-400" />
              <span className="truncate">{f}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CampaignPipelineTable({ campaignId }: { campaignId: string }) {
  const [query, setQuery] = useState("");
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [contractInfoOpen, setContractInfoOpen] = useState(false);
  const [contractInfoInfluencer, setContractInfoInfluencer] = useState<{
    handle: string;
    name: string;
  } | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_ROWS.filter((r) => q.length === 0 || r.handle.toLowerCase().includes(q));
  }, [query]);

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
      <ContractInfoSheet
        open={contractInfoOpen}
        onOpenChange={setContractInfoOpen}
        influencerHandle={contractInfoInfluencer?.handle ?? "@instagram ins"}
        influencerName={contractInfoInfluencer?.name ?? "Amelia Stones"}
      />
      {/* Toolbar row */}
      <div className="flex items-center justify-between gap-3 px-6 py-3 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-[13px] text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors hover:bg-gray-50">
            <SlidersHorizontal size={13} />
            Filters
            <span className="w-4 h-4 rounded-full bg-brand text-white text-[9px] font-bold flex items-center justify-center">
              4
            </span>
          </button>

          <div className="relative w-[220px]">
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
              placeholder="Search for influencer"
              className="pl-8 h-8 text-[13px] border-gray-200 bg-gray-50 focus:bg-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-transparent hover:border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors">
            <RefreshCcw size={15} />
          </button>
          <button className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-transparent hover:border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors">
            <Columns3 size={15} />
          </button>
        </div>
      </div>

      {/* Sub-toolbar */}
      <div className="flex items-center justify-between gap-3 px-6 py-2.5 border-b border-gray-100 shrink-0 bg-gray-50/60">
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-gray-500 font-medium">
            Influencer:{" "}
            <span className="text-gray-900 tabular-nums">
              {filtered.length}/{MOCK_ROWS.length}
            </span>
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger className={cn("shrink-0 flex items-center gap-1 text-[12px] border border-gray-200 rounded-md px-2.5 py-1 bg-white hover:bg-gray-50 transition-colors", (someSelected || allSelected) ? "text-gray-700" : "text-gray-400")}>
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
          <DropdownMenuTrigger className="flex items-center gap-1 text-[12px] text-gray-600 border border-gray-200 rounded-md px-2.5 py-1 bg-white hover:bg-gray-50 transition-colors">
            Visible Columns
            <ChevronDown size={11} className="text-gray-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="text-[13px] w-40">
            <DropdownMenuItem>Reset</DropdownMenuItem>
            <DropdownMenuItem>Save view</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <Table className="w-full table-auto text-[13px] border-separate border-spacing-0 [&_th]:px-10 [&_td]:px-10">
          <TableHeader>
            <TableRow className="bg-gray-50/70 hover:bg-gray-50/70 border-b border-gray-100">
              <TableHead className="w-14 !px-6">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  className="border-gray-300 data-[state=indeterminate]:bg-brand data-[state=checked]:bg-brand data-[state=checked]:border-brand"
                  data-state={
                    someSelected
                      ? "indeterminate"
                      : allSelected
                        ? "checked"
                        : "unchecked"
                  }
                />
              </TableHead>
              <TableHead className="font-semibold text-gray-800 py-3 !pl-6">
                Influencer
              </TableHead>
              <TableHead className="font-semibold text-gray-800 py-3">
                Collaboration Status
              </TableHead>
              <TableHead className="font-semibold text-gray-800 py-3">Action</TableHead>
              <TableHead className="font-semibold text-gray-800 py-3">Progress</TableHead>
              <TableHead className="font-semibold text-gray-800 py-3">Contract</TableHead>

              {/* NOTE: user requested these three columns removed: Logistics / Script / Video */}
              <TableHead className="font-semibold text-gray-800 py-3">Copy</TableHead>
              <TableHead className="font-semibold text-gray-800 py-3">Posting</TableHead>
              <TableHead className="font-semibold text-gray-800 py-3">
                Commercial
              </TableHead>
              <TableHead className="font-semibold text-gray-800 py-3">
                KOL Manager
              </TableHead>
              <TableHead className="font-semibold text-gray-800 py-3">
                Internal Notes
              </TableHead>
              <TableHead className="font-semibold text-gray-800 py-3">Chat</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {pageRows.map((row) => {
              const isSelected = selected.has(row.id);
              return (
                <TableRow
                  key={row.id}
                  className={cn(
                    "border-b border-gray-50 transition-colors group bg-white hover:bg-[#f5f8fe]",
                    isSelected && "bg-[#e8f1fb] hover:bg-[#dce9f8]"
                  )}
                >
                  <TableCell className="py-4 !px-6">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleRow(row.id)}
                      className="border-gray-300 data-[state=checked]:bg-brand data-[state=checked]:border-brand"
                    />
                  </TableCell>

                  <TableCell className="py-4 !pl-6">
                    <div className="flex items-center gap-3 min-w-[180px]">
                      <Avatar className="w-7 h-7 shrink-0">
                        <AvatarImage src="" />
                        <AvatarFallback className="text-[10px] font-semibold bg-violet-100 text-violet-700">
                          {row.handle.slice(1, 3).toUpperCase()}
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
                    {row.status === "Pending" ? (
                      <Badge tone="amber">Pending</Badge>
                    ) : (
                      <Badge tone="brand">Approved</Badge>
                    )}
                  </TableCell>

                  <TableCell className="py-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-[12px] border-gray-200 text-brand"
                    >
                      {row.actionLabel}
                      <ChevronDown size={12} className="ml-1 text-gray-400" />
                    </Button>
                  </TableCell>

                  <TableCell className="py-4">
                    <div className="grid grid-cols-3 gap-x-9 gap-y-3 text-[11px] min-w-[240px]">
                      {PROGRESS_STEPS.map((step, i) => {
                        const done = buildProgressForRow(row.id)[i];
                        return (
                          <span
                            key={step}
                            className={cn(
                              "inline-flex items-center gap-2 rounded-full px-1.5 py-0.5",
                              done ? "text-emerald-700/90" : "text-gray-500"
                            )}
                          >
                            {done ? (
                              <span className="h-4 w-4 shrink-0 rounded-full bg-emerald-50/70 border border-emerald-200/70 inline-flex items-center justify-center text-emerald-700">
                                <Check size={11} strokeWidth={2.6} />
                              </span>
                            ) : (
                              <span className="h-4 w-4 shrink-0 rounded-full bg-gray-50 border border-gray-200/80 inline-flex items-center justify-center">
                                <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                              </span>
                            )}
                            <span className="leading-none">{step}</span>
                          </span>
                        );
                      })}
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    <div className="min-w-[360px]">
                      <ContractStepper
                        stage={row.contractStage}
                        onPrimaryAction={
                          row.contractStage === "Fill Contract Info"
                            ? () => {
                                setContractInfoInfluencer({
                                  handle: row.handle,
                                  name: "Amelia Stones",
                                });
                                setContractInfoOpen(true);
                              }
                            : undefined
                        }
                      />
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    {row.copy === "Pending" ? (
                      <Badge tone="amber">Pending</Badge>
                    ) : (
                      <Badge tone="green">Approved</Badge>
                    )}
                  </TableCell>

                  <TableCell className="py-4">
                    {row.posting === "Ready" ? (
                      <Badge tone="amber">Ready</Badge>
                    ) : (
                      <Badge tone="green">Posted</Badge>
                    )}
                  </TableCell>

                  <TableCell className="py-4">
                    {row.commercial === "Pending" ? (
                      <Badge tone="amber">Pending</Badge>
                    ) : (
                      <Badge tone="green">Approved</Badge>
                    )}
                  </TableCell>

                  <TableCell className="py-4">
                    <button className="text-[13px] text-brand hover:underline">
                      {row.manager}
                      <ChevronDown size={12} className="inline-block ml-1 text-gray-300" />
                    </button>
                  </TableCell>

                  <TableCell className="py-4">
                    <div className="text-[12px] text-gray-500 truncate max-w-[160px]">
                      {row.note}
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    <button className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                      …
                    </button>
                  </TableCell>
                </TableRow>
              );
            })}
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

      {/* keep prop referenced for future real data wiring */}
      <span className="sr-only">{campaignId}</span>
    </div>
  );
}

