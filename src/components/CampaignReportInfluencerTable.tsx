"use client";

import { useMemo, useState } from "react";
import { InfluencerAvatar } from "@/components/InfluencerAvatar";
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
import {
  FOLLOWER_TIER_CLASS,
  getCampaignReportInfluencerRows,
  type ReportInfluencerRow,
} from "@/lib/campaignReportMock";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronUp,
  Columns3,
  Download,
  Search,
} from "@/lib/icons";

type SortKey =
  | "views"
  | "likes"
  | "comments"
  | "shares"
  | "saves"
  | "totalEngagement"
  | "viewRate"
  | "engagementRate";

type SortDir = "asc" | "desc";

const PLATFORM_OPTIONS = ["All", "Instagram", "TikTok", "YouTube", "RedNote"] as const;
const GEO_OPTIONS = ["All", "ID", "IN", "MY", "PH"] as const;
const SIZE_OPTIONS = ["All", "Nano", "Micro", "Mid", "Macro", "Mega"] as const;

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
      <DropdownMenuTrigger className="flex min-w-[132px] items-center justify-between gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[13px] text-gray-600 transition-colors hover:bg-gray-50">
        <span className="truncate">{value === "All" ? label : value}</span>
        <ChevronDown size={13} className="shrink-0 text-gray-400" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[180px] text-[13px]">
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt}
            onSelect={() => onChange(opt)}
            className={cn(value === opt && "font-medium text-brand")}
          >
            {opt === "All" ? `All ${label}` : opt}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PostLinkTag({ label }: { label: string }) {
  const isMirrored = label.toLowerCase().includes("mirrored");
  return (
    <span
      className={cn(
        "inline-flex h-[22px] items-center rounded-full border px-2 text-[11px] font-semibold",
        isMirrored
          ? "border-gray-200 bg-gray-50 text-gray-600"
          : "border-brand/25 bg-brand-50 text-brand"
      )}
    >
      {label}
    </span>
  );
}

function SortableHead({
  label,
  sortKey,
  activeKey,
  dir,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey | null;
  dir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  const active = activeKey === sortKey;
  return (
    <TableHead className="py-3 font-semibold text-gray-800">
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="inline-flex items-center gap-1 hover:text-gray-900"
      >
        {label}
        <span className="inline-flex flex-col -space-y-1">
          <ChevronUp
            size={10}
            className={cn(active && dir === "asc" ? "text-brand" : "text-gray-300")}
          />
          <ChevronDown
            size={10}
            className={cn(active && dir === "desc" ? "text-brand" : "text-gray-300")}
          />
        </span>
      </button>
    </TableHead>
  );
}

function parseMetric(value: string): number {
  const normalized = value.replace(/%/g, "").trim();
  const match = normalized.match(/^([\d.]+)\s*([kKmM])?$/);
  if (!match) return 0;
  const num = Number.parseFloat(match[1]);
  const suffix = match[2]?.toLowerCase();
  if (suffix === "k") return num * 1_000;
  if (suffix === "m") return num * 1_000_000;
  return num;
}

export default function CampaignReportInfluencerTable() {
  const [query, setQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState("All");
  const [geoFilter, setGeoFilter] = useState("All");
  const [sizeFilter, setSizeFilter] = useState("All");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const rows = useMemo(() => getCampaignReportInfluencerRows(), []);

  const filtered = useMemo(() => {
    let result = rows.filter((row) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        row.name.toLowerCase().includes(q) ||
        row.handle.toLowerCase().includes(q);
      const matchesPlatform =
        platformFilter === "All" || row.platform === platformFilter;
      const matchesSize =
        sizeFilter === "All" || row.followerTier === sizeFilter;
      return matchesQuery && matchesPlatform && matchesSize;
    });

    if (sortKey) {
      result = [...result].sort((a, b) => {
        const av = parseMetric(a[sortKey]);
        const bv = parseMetric(b[sortKey]);
        return sortDir === "asc" ? av - bv : bv - av;
      });
    }

    return result;
  }, [rows, query, platformFilter, sizeFilter, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-3 shrink-0">
        <FilterDropdown
          label="Platform"
          value={platformFilter}
          options={PLATFORM_OPTIONS}
          onChange={setPlatformFilter}
        />
        <FilterDropdown
          label="Geo"
          value={geoFilter}
          options={GEO_OPTIONS}
          onChange={setGeoFilter}
        />
        <FilterDropdown
          label="Follower Size"
          value={sizeFilter}
          options={SIZE_OPTIONS}
          onChange={setSizeFilter}
        />
        <div className="relative min-w-0 flex-1 max-w-[280px]">
          <Search
            size={13}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for Influencer"
            className="h-8 border-gray-200 bg-gray-50 pl-8 text-[13px] focus:bg-white"
          />
        </div>
        <button
          type="button"
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-medium text-gray-700 transition-colors hover:bg-gray-50 shrink-0"
        >
          <Download size={14} className="text-gray-500" />
          Download
        </button>
      </div>

      <div className="flex items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/60 px-5 py-2.5 shrink-0">
        <span className="text-[12px] font-medium text-gray-500">
          Influencer:{" "}
          <span className="tabular-nums text-gray-900">{filtered.length}</span>
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-[12px] text-gray-600 transition-colors hover:bg-gray-50">
            Visible Columns
            <ChevronDown size={11} className="text-gray-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 text-[13px]">
            <DropdownMenuItem>
              <Columns3 size={14} className="text-gray-400" />
              Reset columns
            </DropdownMenuItem>
            <DropdownMenuItem>Save view</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
        <Table className="w-full table-auto border-separate border-spacing-0 text-[13px] [&_td]:px-5 [&_th]:px-5">
          <TableHeader>
            <TableRow className="border-b border-gray-100 bg-gray-50/70 hover:bg-gray-50/70">
              <TableHead className="py-3 !pl-5 font-semibold text-gray-800">
                Influencer
              </TableHead>
              <TableHead className="py-3 font-semibold text-gray-800">Post Link</TableHead>
              <TableHead className="py-3 font-semibold text-gray-800">Followers</TableHead>
              <SortableHead
                label="Views"
                sortKey="views"
                activeKey={sortKey}
                dir={sortDir}
                onSort={handleSort}
              />
              <SortableHead
                label="Likes"
                sortKey="likes"
                activeKey={sortKey}
                dir={sortDir}
                onSort={handleSort}
              />
              <SortableHead
                label="Comments"
                sortKey="comments"
                activeKey={sortKey}
                dir={sortDir}
                onSort={handleSort}
              />
              <SortableHead
                label="Shares"
                sortKey="shares"
                activeKey={sortKey}
                dir={sortDir}
                onSort={handleSort}
              />
              <SortableHead
                label="Saves"
                sortKey="saves"
                activeKey={sortKey}
                dir={sortDir}
                onSort={handleSort}
              />
              <SortableHead
                label="Total Engagement"
                sortKey="totalEngagement"
                activeKey={sortKey}
                dir={sortDir}
                onSort={handleSort}
              />
              <SortableHead
                label="View Rate"
                sortKey="viewRate"
                activeKey={sortKey}
                dir={sortDir}
                onSort={handleSort}
              />
              <SortableHead
                label="Engagement Rate"
                sortKey="engagementRate"
                activeKey={sortKey}
                dir={sortDir}
                onSort={handleSort}
              />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((row) => (
              <InfluencerRow key={row.id} row={row} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function InfluencerRow({ row }: { row: ReportInfluencerRow }) {
  return (
    <TableRow className="border-b border-gray-50 hover:bg-gray-50/50">
      <TableCell className="py-3 !pl-5">
        <div className="flex items-center gap-2.5 min-w-[180px]">
          <InfluencerAvatar
            src={row.avatarUrl}
            alt={row.name}
            platform={row.platform}
            size="sm"
            fallback={row.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          />
          <div className="min-w-0">
            <p className="truncate font-semibold text-gray-900">{row.name}</p>
            <p className="truncate text-[12px] text-gray-500">{row.handle}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="py-3">
        {row.postLinks.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {row.postLinks.map((link) => (
              <PostLinkTag key={link} label={link} />
            ))}
          </div>
        ) : (
          <span className="text-gray-300">—</span>
        )}
      </TableCell>
      <TableCell className="py-3">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex h-[22px] items-center rounded-full border px-2 text-[11px] font-semibold",
              FOLLOWER_TIER_CLASS[row.followerTier]
            )}
          >
            {row.followerTier}
          </span>
          <span className="tabular-nums text-gray-800">{row.followers}</span>
        </div>
      </TableCell>
      <TableCell className="py-3 tabular-nums text-gray-800">{row.views}</TableCell>
      <TableCell className="py-3 tabular-nums text-gray-800">{row.likes}</TableCell>
      <TableCell className="py-3 tabular-nums text-gray-800">{row.comments}</TableCell>
      <TableCell className="py-3 tabular-nums text-gray-800">{row.shares}</TableCell>
      <TableCell className="py-3 tabular-nums text-gray-800">{row.saves}</TableCell>
      <TableCell className="py-3 tabular-nums text-gray-800">{row.totalEngagement}</TableCell>
      <TableCell className="py-3 tabular-nums text-gray-800">{row.viewRate}</TableCell>
      <TableCell className="py-3 tabular-nums text-gray-800">{row.engagementRate}</TableCell>
    </TableRow>
  );
}
