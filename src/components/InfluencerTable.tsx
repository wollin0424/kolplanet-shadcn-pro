"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Search,
  Plus,
  SlidersHorizontal,
  ChevronDown,
  Pencil,
  Link as LinkIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { VettingStatusSelect, type VettingStatus } from "./VettingStatusSelect";
import { PlatformIcon, type Platform } from "./PlatformIcon";

// ─── Types ───────────────────────────────────────────────────────────────────

type Influencer = {
  id: string;
  handle: string;
  platform: string;
  avatarUrl: string;
  vettingStatuses: VettingStatus[];
  linkedAccounts: Platform[];
  geo: string;
  contactDots: string[];
  followers: string;
  engRate: string;
  viewRate: string;
  avgView: string;
  quotes: string;
  deliverables: string;
  finalInfluencerCost: string;
  finalClientPrice: string;
  marginPct: string;
  cpm: string;
  kolManager: string;
  internalNotes: string;
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const BASE_ROWS: Influencer[] = [
  {
    id: "INF-001",
    handle: "@insta_beautyqueen",
    platform: "Instagram",
    avatarUrl: "",
    vettingStatuses: ["Rejected: Over Budget", "Pending"],
    linkedAccounts: ["IG", "TT"],
    geo: "SG",
    contactDots: ["#22c55e", "#3b82f6", "#a855f7", "#ec4899", "#14b8a6"],
    followers: "34K",
    engRate: "3.4%",
    viewRate: "34%",
    avgView: "334K",
    quotes: "Quote Matrix",
    deliverables: "2 Reels + 1 Story",
    finalInfluencerCost: "₹30,000",
    finalClientPrice: "₹30,000",
    marginPct: "34%",
    cpm: "₹30,000",
    kolManager: "Wollin",
    internalNotes: "Active user — F...",
  },
  {
    id: "INF-002",
    handle: "@sportsmaven_sg",
    platform: "Instagram",
    avatarUrl: "",
    vettingStatuses: ["No Response", "Rejected: Poor Content"],
    linkedAccounts: ["IG", "YT"],
    geo: "SG",
    contactDots: ["#22c55e", "#3b82f6", "#a855f7", "#f97316", "#14b8a6"],
    followers: "34K",
    engRate: "2.8%",
    viewRate: "34%",
    avgView: "334K",
    quotes: "Quote Matrix",
    deliverables: "3 Posts",
    finalInfluencerCost: "₹30,000",
    finalClientPrice: "₹30,000",
    marginPct: "34%",
    cpm: "₹30,000",
    kolManager: "Wollin",
    internalNotes: "Active user — F...",
  },
  {
    id: "INF-003",
    handle: "@foodiesg_official",
    platform: "Instagram",
    avatarUrl: "",
    vettingStatuses: ["Rejected: Over Budget", "Rejected: Poor Content"],
    linkedAccounts: ["IG", "TT", "YT"],
    geo: "SG",
    contactDots: ["#22c55e", "#3b82f6", "#a855f7", "#ec4899", "#f97316"],
    followers: "54K",
    engRate: "4.1%",
    viewRate: "41%",
    avgView: "412K",
    quotes: "Quote Matrix",
    deliverables: "1 Reel + 2 Stories",
    finalInfluencerCost: "₹45,000",
    finalClientPrice: "₹45,000",
    marginPct: "32%",
    cpm: "₹28,000",
    kolManager: "Wollin",
    internalNotes: "High engagement —...",
  },
  {
    id: "INF-004",
    handle: "@lifestylediaries",
    platform: "Instagram",
    avatarUrl: "",
    vettingStatuses: ["Rejected: Over Budget", "Shortlisted"],
    linkedAccounts: ["IG", "FB"],
    geo: "SG",
    contactDots: ["#22c55e", "#3b82f6", "#a855f7", "#ec4899", "#14b8a6"],
    followers: "34K",
    engRate: "3.1%",
    viewRate: "34%",
    avgView: "334K",
    quotes: "Quote Matrix",
    deliverables: "2 Reels",
    finalInfluencerCost: "₹30,000",
    finalClientPrice: "₹30,000",
    marginPct: "34%",
    cpm: "₹30,000",
    kolManager: "Wollin",
    internalNotes: "Active user — F...",
  },
  {
    id: "INF-005",
    handle: "@techreview_asia",
    platform: "YouTube",
    avatarUrl: "",
    vettingStatuses: ["Rejected: Over Budget"],
    linkedAccounts: ["YT", "IG"],
    geo: "MY",
    contactDots: ["#22c55e", "#3b82f6", "#a855f7", "#f97316", "#6366f1"],
    followers: "45K",
    engRate: "5.2%",
    viewRate: "52%",
    avgView: "520K",
    quotes: "Quote Matrix",
    deliverables: "1 Video (10 min)",
    finalInfluencerCost: "₹55,000",
    finalClientPrice: "₹55,000",
    marginPct: "28%",
    cpm: "₹24,000",
    kolManager: "Wollin",
    internalNotes: "Long-form creator...",
  },
  {
    id: "INF-006",
    handle: "@travelwithme_sg",
    platform: "TikTok",
    avatarUrl: "",
    vettingStatuses: ["Pending"],
    linkedAccounts: ["TT", "IG"],
    geo: "SG",
    contactDots: ["#22c55e", "#3b82f6", "#ec4899", "#14b8a6", "#6366f1"],
    followers: "28K",
    engRate: "6.7%",
    viewRate: "67%",
    avgView: "220K",
    quotes: "Quote Matrix",
    deliverables: "3 TikToks",
    finalInfluencerCost: "₹22,000",
    finalClientPrice: "₹22,000",
    marginPct: "38%",
    cpm: "₹18,000",
    kolManager: "Wollin",
    internalNotes: "Pending negotiation",
  },
];

// ─── Extend to 24 rows for realistic pagination ───────────────────────────────

const EXTRA_HANDLES = [
  "@fashion_gurugram",
  "@gamingcorner_my",
  "@fitcoach_singapore",
  "@beautyhacks_asia",
  "@streetfood_explorer",
  "@petlovers_daily",
  "@techgeeks_review",
  "@dailyfashion_sg",
  "@momlifestyle_my",
  "@coffeelovers_id",
  "@wanderlust_th",
  "@homecook_kitchen",
  "@autoreview_pro",
  "@sneakerhead_collective",
  "@parentinghub_sg",
  "@digitalartist_dy",
  "@yogateacher_bali",
  "@finance_forbeginners",
];

const PLATFORMS = ["Instagram", "YouTube", "TikTok"];
const STATUS_POOL: VettingStatus[][] = [
  ["Shortlisted"],
  ["Pending"],
  ["Approved"],
  ["No Response"],
  ["Rejected: Over Budget"],
  ["Pending", "Shortlisted"],
  ["Rejected: Poor Content"],
  ["Shortlisted", "Approved"],
];
const LINKED_POOL: Platform[][] = [
  ["IG"],
  ["IG", "TT"],
  ["IG", "YT"],
  ["YT", "TT"],
  ["IG", "FB"],
  ["IG", "TT", "YT"],
  ["TT"],
];
const GEO_POOL = ["SG", "MY", "ID", "TH", "PH", "VN"];
const DOTS = ["#22c55e", "#3b82f6", "#a855f7", "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#eab308"];
const MANAGERS = ["Wollin", "Derek", "Sophie", "Jasmine"];
const DELIVERABLE_POOL = [
  "1 Reel + 1 Story",
  "2 Reels",
  "3 Posts",
  "1 Video (10 min)",
  "2 TikToks",
  "1 Reel + 2 Stories",
  "4 Posts",
  "1 Dedicated Post",
];
const NOTES_POOL = [
  "Active user — F...",
  "High engagement —...",
  "Pending negotiation",
  "Long-form creator...",
  "Under contract draft",
  "Priority talent list",
  "Awaiting media kit",
  "Re-engaged after Q1",
];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

function buildExtras(): Influencer[] {
  return EXTRA_HANDLES.map((handle, i) => {
    const f = 20 + ((i * 7) % 80); // 20–99 K range
    const cost = 22 + ((i * 5) % 40); // 22–61 k INR
    const client = cost + ((i * 3) % 12);
    const margin = 26 + ((i * 4) % 18);
    const cpm = 18 + ((i * 6) % 20);

    return {
      id: `INF-${String(i + 7).padStart(3, "0")}`,
      handle,
      platform: pick(PLATFORMS, i),
      avatarUrl: "",
      vettingStatuses: pick(STATUS_POOL, i),
      linkedAccounts: pick(LINKED_POOL, i),
      geo: pick(GEO_POOL, i),
      contactDots: [
        pick(DOTS, i),
        pick(DOTS, i + 1),
        pick(DOTS, i + 2),
        pick(DOTS, i + 3),
        pick(DOTS, i + 4),
      ],
      followers: `${f}K`,
      engRate: `${(2 + ((i * 0.4) % 5)).toFixed(1)}%`,
      viewRate: `${20 + ((i * 3) % 50)}%`,
      avgView: `${100 + ((i * 37) % 500)}K`,
      quotes: "Quote Matrix",
      deliverables: pick(DELIVERABLE_POOL, i),
      finalInfluencerCost: `₹${cost},000`,
      finalClientPrice: `₹${client},000`,
      marginPct: `${margin}%`,
      cpm: `₹${cpm},000`,
      kolManager: pick(MANAGERS, i),
      internalNotes: pick(NOTES_POOL, i),
    };
  });
}

const MOCK_DATA: Influencer[] = [...BASE_ROWS, ...buildExtras()];

const COL_INTERNAL_NOTES_W = "min-w-[220px]";
const COL_KOL_MANAGER_W = "min-w-[140px]";

// ─── Typography tokens ───────────────────────────────────────────────────────
// All numeric data shares ONE style — tabular-nums keeps digit columns aligned
// across rows without needing a mono font. No weight/color variation between
// metrics; the column header alone establishes meaning.
const NUMERIC = "text-[13px] text-gray-800 tabular-nums font-normal";
const TEXT = "text-[13px] text-gray-600";

// ─── Auto Badge ───────────────────────────────────────────────────────────────

function AutoBadge() {
  return (
    <span className="inline-flex items-center rounded-md bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold text-brand border border-brand-100">
      Auto
    </span>
  );
}

// ─── Contact Dots ─────────────────────────────────────────────────────────────

function ContactDots({ colors }: { colors: string[] }) {
  return (
    <div className="flex items-center gap-1">
      {colors.map((color, i) => (
        <span
          key={i}
          className="w-4 h-4 rounded-full shrink-0 border border-white ring-1 ring-black/5"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}

// ─── Sticky cell bg helpers (left columns only) ──────────────────────────────
const stickyBgDefault = "bg-white";
const stickyBgHover = "group-hover:bg-[#f0f5fc]";
const stickyBgSelected = "group-data-[selected=true]:bg-[#e8f1fb]";

// ─── Main Component ───────────────────────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [10, 20, 50];

// Build a compact page list with ellipses, e.g. [1, '…', 4, 5, 6, '…', 12]
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

export default function InfluencerTable() {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [statusOverrides, setStatusOverrides] = useState<Record<string, VettingStatus[]>>({});

  const setRowStatuses = (id: string, next: VettingStatus[]) => {
    setStatusOverrides((prev) => ({ ...prev, [id]: next }));
  };
  const getRowStatuses = (row: Influencer): VettingStatus[] =>
    statusOverrides[row.id] ?? row.vettingStatuses;
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = MOCK_DATA.filter((r) =>
    r.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const pageEnd = Math.min(pageStart + pageSize, filtered.length);
  const pageRows = filtered.slice(pageStart, pageEnd);

  const pageIds = pageRows.map((r) => r.id);
  const allSelected = pageIds.length > 0 && pageIds.every((id) => selectedRows.has(id));
  const someSelected = pageIds.some((id) => selectedRows.has(id)) && !allSelected;

  const toggleAll = () => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (allSelected) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const toggleRow = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const goToPage = (p: number) => {
    setCurrentPage(Math.min(Math.max(1, p), totalPages));
  };

  const selectedQuoteValue = "$80,000";

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white overflow-hidden">
      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 shrink-0">
        <button className="flex items-center gap-1.5 text-[13px] text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors hover:bg-gray-50">
          <SlidersHorizontal size={13} />
          Filters
          <span className="w-4 h-4 rounded-full bg-brand text-white text-[9px] font-bold flex items-center justify-center">
            4
          </span>
        </button>

        <div className="relative flex-1 max-w-sm">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search influencer"
            className="pl-8 h-8 text-[13px] border-gray-200 bg-gray-50 focus:bg-white"
          />
        </div>

        <div className="flex-1" />

        <Button
          size="sm"
          className="h-8 gap-1.5 text-white text-[13px] px-4"
          style={{ backgroundColor: "#023E8A" }}
        >
          <Plus size={14} />
          Add Influencers
        </Button>
      </div>

      {/* ── Sub-toolbar ── */}
      <div className="flex items-center gap-3 px-5 py-2.5 border-b border-gray-100 shrink-0 bg-gray-50/60">
        <span className="text-[12px] text-gray-500 font-medium">
          Influencers:{" "}
          <span className="text-gray-900 tabular-nums">
            {filtered.length}/{MOCK_DATA.length}
          </span>
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "flex items-center gap-1 text-[12px] border border-gray-200 rounded-md px-2.5 py-1 bg-white hover:bg-gray-50 transition-colors",
              someSelected || allSelected ? "text-gray-700" : "text-gray-400"
            )}
          >
            Bulk Actions
            <ChevronDown size={11} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="text-[13px]">
            <DropdownMenuItem>Export Selected</DropdownMenuItem>
            <DropdownMenuItem>Send Proposal</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Remove Selected</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button className="text-[12px] border border-brand-100 bg-brand-50 text-brand font-medium rounded-md px-2.5 py-1 hover:bg-brand-100 transition-colors">
          Proposal
        </button>

        <div className="flex-1" />

        <span className="text-[12px] text-gray-500">
          Selected Quote Value:{" "}
          <span className="font-semibold text-gray-900">{selectedQuoteValue}</span>
        </span>

        <button className="flex items-center gap-1 text-[12px] text-gray-600 border border-gray-200 rounded-md px-2.5 py-1 bg-white hover:bg-gray-50 transition-colors">
          Visible Columns
          <ChevronDown size={11} />
        </button>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto flex-1">
        <Table className="min-w-max text-[13px] border-separate border-spacing-0 [&_th]:px-5 [&_td]:px-5">
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-100">
              {/* Sticky left: checkbox */}
              <TableHead className="sticky left-0 z-20 bg-gray-50 w-14">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  className="border-gray-300 data-[state=indeterminate]:bg-brand data-[state=checked]:bg-brand data-[state=checked]:border-brand"
                  data-state={someSelected ? "indeterminate" : allSelected ? "checked" : "unchecked"}
                />
              </TableHead>
              {/* Sticky left: Influencer */}
              <TableHead className="sticky left-14 z-20 bg-gray-50 min-w-[220px] font-semibold text-gray-700 after:absolute after:right-0 after:top-0 after:h-full after:w-px after:bg-gray-200">
                Influencer
              </TableHead>

              {/* Scrollable columns */}
              <TableHead className="min-w-[220px] font-semibold text-gray-700">Vetting Status</TableHead>
              <TableHead className="min-w-[130px] font-semibold text-gray-700">Linked Account</TableHead>
              <TableHead className="min-w-[110px] font-semibold text-gray-700">Influencer Geo</TableHead>
              <TableHead className="min-w-[150px] font-semibold text-gray-700">Contact</TableHead>
              <TableHead className="min-w-[100px] font-semibold text-gray-700">Followers</TableHead>
              <TableHead className="min-w-[100px] font-semibold text-gray-700">Eng Rate</TableHead>
              <TableHead className="min-w-[100px] font-semibold text-gray-700">View Rate</TableHead>
              <TableHead className="min-w-[100px] font-semibold text-gray-700">Avg. View</TableHead>
              <TableHead className="min-w-[160px] font-semibold text-gray-700">Quotes</TableHead>
              <TableHead className="min-w-[170px] font-semibold text-gray-700">Deliverables</TableHead>
              <TableHead className="min-w-[190px] font-semibold text-gray-700">Final Influencer Cost</TableHead>
              <TableHead className="min-w-[200px] font-semibold text-gray-700">Final Client Price (Net)</TableHead>
              <TableHead className="min-w-[110px] font-semibold text-gray-700">Margin %</TableHead>
              <TableHead className="min-w-[130px] font-semibold text-gray-700">CPM</TableHead>

              {/* KOL Manager */}
              <TableHead className={`${COL_KOL_MANAGER_W} font-semibold text-gray-700`}>
                KOL Manager
              </TableHead>
              {/* Internal Notes */}
              <TableHead className={`${COL_INTERNAL_NOTES_W} font-semibold text-gray-700`}>
                Internal Notes
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {pageRows.map((row) => {
              const isSelected = selectedRows.has(row.id);
              const rowBg = isSelected ? "bg-[#e8f1fb]" : "bg-white";
              const rowHoverBg = isSelected ? "hover:bg-[#dce9f8]" : "hover:bg-[#f5f8fe]";

              return (
                <TableRow
                  key={row.id}
                  data-selected={isSelected}
                  className={cn(
                    "border-b border-gray-50 transition-colors group",
                    rowBg,
                    rowHoverBg
                  )}
                >
                  {/* Checkbox — sticky left */}
                  <TableCell
                    className={cn(
                      "sticky left-0 z-10 w-14 py-4",
                      stickyBgDefault,
                      stickyBgHover,
                      stickyBgSelected,
                      isSelected && "bg-[#e8f1fb]"
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleRow(row.id)}
                      className="border-gray-300 data-[state=checked]:bg-brand data-[state=checked]:border-brand"
                    />
                  </TableCell>

                  {/* Influencer — sticky left */}
                  <TableCell
                    className={cn(
                      "sticky left-14 z-10 py-4",
                      "after:absolute after:right-0 after:top-0 after:h-full after:w-px after:bg-gray-100",
                      stickyBgDefault,
                      stickyBgHover,
                      stickyBgSelected,
                      isSelected && "bg-[#e8f1fb]"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-[185px]">
                      <Avatar className="w-8 h-8 shrink-0">
                        <AvatarImage src={row.avatarUrl} />
                        <AvatarFallback className="text-[10px] font-semibold bg-violet-100 text-violet-700">
                          {row.handle.slice(1, 3).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-gray-900 truncate max-w-[130px]">
                          {row.handle}
                        </p>
                        <p className="text-[11px] text-gray-400">{row.platform}</p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Vetting Status */}
                  <TableCell className="py-3 align-middle">
                    <VettingStatusSelect
                      value={getRowStatuses(row)}
                      onChange={(next) => setRowStatuses(row.id, next)}
                    />
                  </TableCell>

                  {/* Linked Accounts */}
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      {row.linkedAccounts.map((p) => (
                        <PlatformIcon key={p} platform={p} size={18} />
                      ))}
                    </div>
                  </TableCell>

                  {/* Influencer Geo */}
                  <TableCell className="py-4">
                    <div className="inline-flex items-center gap-1.5 border border-gray-200 rounded-md px-2.5 py-1.5 bg-gray-50 text-[13px] text-gray-700 cursor-pointer hover:border-gray-300 transition-colors">
                      {row.geo}
                      <ChevronDown size={11} className="text-gray-400" />
                    </div>
                  </TableCell>

                  {/* Contact Dots */}
                  <TableCell className="py-4">
                    <ContactDots colors={row.contactDots} />
                  </TableCell>

                  {/* Followers */}
                  <TableCell className="py-4">
                    <span className={NUMERIC}>{row.followers}</span>
                  </TableCell>

                  {/* Eng Rate */}
                  <TableCell className="py-4">
                    <span className={NUMERIC}>{row.engRate}</span>
                  </TableCell>

                  {/* View Rate */}
                  <TableCell className="py-4">
                    <span className={NUMERIC}>{row.viewRate}</span>
                  </TableCell>

                  {/* Avg. View */}
                  <TableCell className="py-4">
                    <span className={NUMERIC}>{row.avgView}</span>
                  </TableCell>

                  {/* Quotes */}
                  <TableCell className="py-4">
                    <div className="flex items-center gap-1.5">
                      <button className="text-brand text-[13px] font-medium hover:underline flex items-center gap-1">
                        <LinkIcon size={11} />
                        {row.quotes}
                      </button>
                      <button className="text-gray-400 hover:text-gray-600 transition-colors">
                        <Pencil size={11} />
                      </button>
                    </div>
                  </TableCell>

                  {/* Deliverables */}
                  <TableCell className="py-4">
                    <span className={TEXT}>{row.deliverables}</span>
                  </TableCell>

                  {/* Final Influencer Cost */}
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <span className={NUMERIC}>{row.finalInfluencerCost}</span>
                      <AutoBadge />
                    </div>
                  </TableCell>

                  {/* Final Client Price */}
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <span className={NUMERIC}>{row.finalClientPrice}</span>
                      <AutoBadge />
                    </div>
                  </TableCell>

                  {/* Margin % */}
                  <TableCell className="py-4">
                    <span className={NUMERIC}>{row.marginPct}</span>
                  </TableCell>

                  {/* CPM */}
                  <TableCell className="py-4">
                    <span className={NUMERIC}>{row.cpm}</span>
                  </TableCell>

                  {/* KOL Manager */}
                  <TableCell className={`py-4 ${COL_KOL_MANAGER_W}`}>
                    <div className="flex items-center gap-2 px-2">
                      <Avatar className="w-6 h-6 shrink-0">
                        <AvatarFallback className="text-[9px] font-bold bg-brand-50 text-brand">
                          WL
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[13px] text-gray-800">{row.kolManager}</span>
                    </div>
                  </TableCell>

                  {/* Internal Notes */}
                  <TableCell className={`py-4 ${COL_INTERNAL_NOTES_W}`}>
                    <div className="flex items-center gap-2 px-2">
                      <span className="text-[13px] text-gray-500 truncate max-w-[170px]">
                        {row.internalNotes}
                      </span>
                      <button className="shrink-0 text-gray-400 hover:text-brand transition-colors">
                        <Pencil size={11} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination footer ── */}
      <div className="flex items-center justify-between gap-4 px-5 py-3 border-t border-gray-100 shrink-0 bg-white">
        {/* Left: range + page size */}
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
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(Number(v));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-7 w-[66px] text-[12px] border-gray-200 gap-1 px-2">
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

        {/* Right: page nav */}
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
    </div>
  );
}
