"use client";

import { useMemo, useState } from "react";
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
import { Button } from "@/components/ui/button";
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
import { PlatformIcon, type Platform } from "@/components/PlatformIcon";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react";

type CampaignStatus = "Active" | "New" | "Draft" | "Terminated";

type CampaignRow = {
  id: string;
  name: string;
  platforms: Platform[];
  geo: string;
  status: CampaignStatus;
  influencers: number;
  deliverables: string;
  projectLead: string;
  createdAt: string;
  hasNewMessages: boolean;
  notes: string;
};

const BASE_ROWS: CampaignRow[] = [
  {
    id: "11231",
    name: "t23",
    platforms: ["IG", "FB", "YT"],
    geo: "IN",
    status: "Active",
    influencers: 1,
    deliverables: "--",
    projectLead: "Moca",
    createdAt: "2026/04/30",
    hasNewMessages: false,
    notes: "N/A",
  },
  {
    id: "t23",
    name: "test contract to planet",
    platforms: ["IG", "FB", "YT"],
    geo: "CA, US",
    status: "Active",
    influencers: 6,
    deliverables: "--",
    projectLead: "Moca",
    createdAt: "2026/04/28",
    hasNewMessages: false,
    notes: "N/A",
  },
  {
    id: "MOCA-TEST",
    name: "test-Apr10",
    platforms: ["IG"],
    geo: "ID, IN, MY",
    status: "Active",
    influencers: 3,
    deliverables: "asfasf2",
    projectLead: "Moca",
    createdAt: "2026/04/10",
    hasNewMessages: true,
    notes: "N/A",
  },
  {
    id: "t23",
    name: "Chris - 创建新测试",
    platforms: ["IG"],
    geo: "MY",
    status: "Active",
    influencers: 1,
    deliverables: "Deliverables Details Demo test",
    projectLead: "Moca",
    createdAt: "2026/04/10",
    hasNewMessages: false,
    notes: "N/A",
  },
  {
    id: "123333",
    name: "123333",
    platforms: ["IG", "FB", "YT"],
    geo: "CA, ID, IN",
    status: "New",
    influencers: 3,
    deliverables: "test123",
    projectLead: "Moca",
    createdAt: "2026/04/07",
    hasNewMessages: false,
    notes: "N/A",
  },
  {
    id: "localreg1",
    name: "Chris - 测试项目",
    platforms: ["IG"],
    geo: "ID",
    status: "Terminated",
    influencers: 1,
    deliverables: "--",
    projectLead: "Chris",
    createdAt: "2026/03/31",
    hasNewMessages: false,
    notes: "N/A",
  },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

function buildExtras(): CampaignRow[] {
  const names = [
    "Client billing test - chris",
    "123123",
    "Chris - 创建新测试2",
    "Localreg1 - 测试活动",
    "Domino’s SG - Q2 Campaign",
    "Moca - Promo April",
    "KOLPlanet - Internal QA",
    "New Launch - MY",
    "Seasonal Campaign - ID",
    "Test contract - US",
    "Brand Awareness - CA",
    "Chris - 新项目跟进",
    "Moca - Deliverables Demo",
    "Summer Sale - IN",
    "Terminated sample",
    "Draft sample",
  ];
  const geos = ["IN", "MY", "ID", "CA, US", "ID, IN, MY", "CA, ID, IN"];
  const leads = ["Moca", "Chris"];
  const statuses: CampaignStatus[] = ["Active", "New", "Draft", "Terminated"];
  const platforms: Platform[][] = [["IG"], ["IG", "FB"], ["IG", "YT"], ["IG", "FB", "YT"]];

  return Array.from({ length: 24 }, (_, i) => {
    const status = pick(statuses, i);
    const id = `CMP-${String(i + 7).padStart(4, "0")}`;
    return {
      id,
      name: pick(names, i),
      platforms: pick(platforms, i),
      geo: pick(geos, i),
      status,
      influencers: 1 + (i % 9),
      deliverables: i % 3 === 0 ? "--" : pick(["test123", "asfasf2", "Deliverables Details Demo test"], i),
      projectLead: pick(leads, i),
      createdAt: `2026/04/${String(30 - (i % 22)).padStart(2, "0")}`,
      hasNewMessages: i % 11 === 0,
      notes: "N/A",
    };
  });
}

const MOCK_ROWS: CampaignRow[] = [...BASE_ROWS, ...buildExtras()];

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

function StatusBadge({ status }: { status: CampaignStatus }) {
  const styles =
    status === "Active"
      ? "bg-[#e8f1fb] text-brand border-[#c5d9f5]"
      : status === "New"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : status === "Draft"
          ? "bg-gray-50 text-gray-600 border-gray-200"
          : "bg-gray-100 text-gray-700 border-gray-200";
  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold border", styles)}>
      {status}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] text-gray-500">{label}</span>
      <span className="text-[20px] font-semibold text-gray-900 tabular-nums">
        {value}
      </span>
    </div>
  );
}

export default function CampaignsTable() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | "All">("All");
  const [geoFilter, setGeoFilter] = useState<string>("All");
  const [projectLeadFilter, setProjectLeadFilter] = useState<string>("All");
  const [archivedFilter, setArchivedFilter] = useState<"All" | "Archived" | "Not archived">("All");
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  const rows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return MOCK_ROWS.filter((r) => {
      const matchesQuery =
        normalized.length === 0 ||
        r.name.toLowerCase().includes(normalized) ||
        r.id.toLowerCase().includes(normalized);
      const matchesStatus = statusFilter === "All" || r.status === statusFilter;
      const matchesGeo = geoFilter === "All" || r.geo.includes(geoFilter);
      const matchesLead = projectLeadFilter === "All" || r.projectLead === projectLeadFilter;
      const matchesArchived = archivedFilter === "All" || archivedFilter === "Not archived";
      return matchesQuery && matchesStatus && matchesGeo && matchesLead && matchesArchived;
    });
  }, [archivedFilter, geoFilter, projectLeadFilter, query, statusFilter]);

  const stats = useMemo(() => {
    const counts = {
      New: 0,
      Live: 0,
      Draft: 0,
      Terminated: 0,
    };
    for (const r of MOCK_ROWS) {
      if (r.status === "New") counts.New += 1;
      if (r.status === "Active") counts.Live += 1;
      if (r.status === "Draft") counts.Draft += 1;
      if (r.status === "Terminated") counts.Terminated += 1;
    }
    return counts;
  }, []);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const pageEnd = Math.min(pageStart + pageSize, rows.length);
  const pageRows = rows.slice(pageStart, pageEnd);

  const goToPage = (p: number) => setCurrentPage(Math.min(Math.max(1, p), totalPages));

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white overflow-hidden">
      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-6 px-6 py-4 border-b border-gray-100">
        <Stat label="New" value={stats.New} />
        <Stat label="Live" value={stats.Live} />
        <Stat label="Draft" value={stats.Draft} />
        <Stat label="Terminated" value={stats.Terminated} />
      </div>

      {/* Filters + search */}
      <div className="flex items-center gap-2.5 px-6 py-3 border-b border-gray-100 shrink-0 bg-white">
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v as CampaignStatus | "All");
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-[150px] text-[12.5px] border-gray-200 bg-gray-50 gap-1">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">Status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="New">New</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Terminated">Terminated</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={geoFilter}
          onValueChange={(v) => {
            setGeoFilter(v);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-[160px] text-[12.5px] border-gray-200 bg-gray-50 gap-1">
            <SelectValue placeholder="Influencer Geo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">Influencer Geo</SelectItem>
            <SelectItem value="IN">IN</SelectItem>
            <SelectItem value="MY">MY</SelectItem>
            <SelectItem value="ID">ID</SelectItem>
            <SelectItem value="US">US</SelectItem>
            <SelectItem value="CA">CA</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={projectLeadFilter}
          onValueChange={(v) => {
            setProjectLeadFilter(v);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-[150px] text-[12.5px] border-gray-200 bg-gray-50 gap-1">
            <SelectValue placeholder="Project Lead" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">Project Lead</SelectItem>
            <SelectItem value="Moca">Moca</SelectItem>
            <SelectItem value="Chris">Chris</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={archivedFilter}
          onValueChange={(v) => {
            setArchivedFilter(v as "All" | "Archived" | "Not archived");
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-[170px] text-[12.5px] border-gray-200 bg-gray-50 gap-1">
            <SelectValue placeholder="Archived Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">Archived Status</SelectItem>
            <SelectItem value="Not archived">Not archived</SelectItem>
            <SelectItem value="Archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative flex-1 max-w-sm ml-1">
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
            placeholder="Search by campaign name or id"
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
          New Campaign
        </Button>
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <Table className="w-full table-auto text-[13px] border-separate border-spacing-0 [&_th]:px-10 [&_td]:px-10">
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-100">
              <TableHead className="font-semibold text-gray-700 py-3">
                Campaign Name
              </TableHead>
              <TableHead className="font-semibold text-gray-700 py-3">
                Platforms
              </TableHead>
              <TableHead className="font-semibold text-gray-700 py-3">
                Influencer Geo
              </TableHead>
              <TableHead className="font-semibold text-gray-700 py-3">
                Status
              </TableHead>
              <TableHead className="font-semibold text-gray-700 py-3">
                No. of Influencers
              </TableHead>
              <TableHead className="font-semibold text-gray-700 py-3">
                Deliverable Details
              </TableHead>
              <TableHead className="font-semibold text-gray-700 py-3">
                Project Lead
              </TableHead>
              <TableHead className="font-semibold text-gray-700 py-3">
                Creation Time
              </TableHead>
              <TableHead className="font-semibold text-gray-700 py-3">
                New Messages
              </TableHead>
              <TableHead className="font-semibold text-gray-700 py-3">
                Notes
              </TableHead>
              <TableHead className="w-12 font-semibold text-gray-700 text-right py-3">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {pageRows.map((row) => {
              const href = `/projects/campaigns/${encodeURIComponent(row.id)}`;
              return (
              <TableRow
                key={`${row.id}-${row.name}`}
                role="link"
                tabIndex={0}
                onClick={() => router.push(href)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(href);
                  }
                }}
                className="border-b border-gray-50 transition-colors group bg-white hover:bg-[#f5f8fe] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
              >
                <TableCell className="py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-brand shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[13px] font-medium text-gray-900 truncate">
                          {row.name}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-400 tabular-nums truncate">
                        {row.id}
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-4">
                  <div className="flex items-center gap-2">
                    {row.platforms.map((p) => (
                      <PlatformIcon key={p} platform={p} size={18} />
                    ))}
                  </div>
                </TableCell>

                <TableCell className="py-4">
                  <span className="text-[13px] text-gray-600">{row.geo}</span>
                </TableCell>

                <TableCell className="py-4">
                  <StatusBadge status={row.status} />
                </TableCell>

                <TableCell className="py-4">
                  <span className="text-[13px] text-gray-800 tabular-nums">
                    {row.influencers}
                  </span>
                </TableCell>

                <TableCell className="py-4">
                  <span className="text-[13px] text-gray-500 truncate block w-full">
                    {row.deliverables}
                  </span>
                </TableCell>

                <TableCell className="py-4">
                  <span className="text-[13px] text-gray-600">{row.projectLead}</span>
                </TableCell>

                <TableCell className="py-4">
                  <span className="text-[13px] text-gray-500 tabular-nums">
                    {row.createdAt}
                  </span>
                </TableCell>

                <TableCell className="py-4">
                  {row.hasNewMessages ? (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand text-white text-[10px] font-semibold">
                      1
                    </span>
                  ) : (
                    <span className="text-[13px] text-gray-300">—</span>
                  )}
                </TableCell>

                <TableCell className="py-4">
                  <span className="text-[13px] text-gray-500">{row.notes}</span>
                </TableCell>

                <TableCell className="py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-transparent hover:border-gray-200 hover:bg-gray-50 transition-colors text-gray-500"
                    >
                      <MoreHorizontal size={16} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem>Open</DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem variant="destructive">Archive</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
              {rows.length === 0 ? 0 : pageStart + 1}–{pageEnd}
            </span>{" "}
            of <span className="tabular-nums text-gray-800 font-medium">{rows.length}</span>
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

        <div className="flex items-center gap-1">
          <button
            onClick={() => goToPage(safePage - 1)}
            disabled={safePage <= 1}
            className={cn(
              "h-7 w-7 inline-flex items-center justify-center rounded-md border border-gray-200 text-gray-500 transition-colors",
              safePage <= 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50 hover:text-gray-800"
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
              safePage >= totalPages ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50 hover:text-gray-800"
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

