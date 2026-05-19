"use client";

import { useMemo, useState } from "react";
import {
  CampaignHubInfluencerIdentity,
  type KolRelationship,
} from "@/components/CampaignHubInfluencerIdentity";
import { CampaignHubSelectionBar } from "@/components/CampaignHubSelectionBar";
import { useHubCardSelection } from "@/hooks/useHubCardSelection";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronDown,
  FileText,
  MoreHorizontal,
  Pencil,
  Search,
} from "lucide-react";

type ContractCardStatus =
  | "Awaiting Info"
  | "Pending Draft"
  | "Awaiting Sending"
  | "Signing"
  | "Countersigned";

type ContractCard = {
  id: string;
  name: string;
  handle: string;
  status: ContractCardStatus;
  manager: string;
  relationship: KolRelationship;
  completedSteps: number;
  fileCount: number;
  legalName?: string;
  contractType?: string;
  actionLabel: string;
};

const STATUS_BADGE: Record<ContractCardStatus, string> = {
  "Awaiting Info": "border-amber-200 bg-amber-50 text-amber-800",
  "Pending Draft": "border-sky-200 bg-sky-50 text-sky-800",
  "Awaiting Sending": "border-violet-200 bg-violet-50 text-violet-800",
  Signing: "border-teal-200 bg-teal-50 text-teal-800",
  Countersigned: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

const CONTRACT_STEPS = [
  "Contract Info",
  "Contract Draft",
  "Advertiser Sign",
  "KOL Sign",
] as const;

const MOCK_CARDS: ContractCard[] = [
  {
    id: "c1",
    name: "Amelia Stone",
    handle: "@instagram.ins",
    status: "Awaiting Info",
    manager: "Wollin",
    relationship: "Direct",
    completedSteps: 0,
    fileCount: 0,
    actionLabel: "Fill Contract Info",
  },
  {
    id: "c2",
    name: "Ethan Carter",
    handle: "@foodie.my",
    status: "Pending Draft",
    manager: "Wollin",
    relationship: "Manager",
    completedSteps: 1,
    fileCount: 0,
    actionLabel: "Generate Draft",
  },
  {
    id: "c3",
    name: "Maya Lin",
    handle: "@lifestyle.id",
    status: "Awaiting Sending",
    manager: "Wollin",
    relationship: "MCN",
    completedSteps: 2,
    fileCount: 1,
    actionLabel: "Invite to Sign",
  },
  {
    id: "c4",
    name: "Noah Brooks",
    handle: "@creator.ph",
    status: "Signing",
    manager: "Wollin",
    relationship: "Direct",
    completedSteps: 3,
    fileCount: 1,
    legalName: "342432",
    contractType: "Type A",
    actionLabel: "Check Status",
  },
  {
    id: "c5",
    name: "Sofia Reyes",
    handle: "@runner.in",
    status: "Countersigned",
    manager: "Wollin",
    relationship: "Manager",
    completedSteps: 4,
    fileCount: 1,
    legalName: "892011",
    contractType: "Type A",
    actionLabel: "View Final Contract",
  },
  {
    id: "c6",
    name: "Liam Park",
    handle: "@daily.vlog",
    status: "Signing",
    manager: "Wollin",
    relationship: "MCN",
    completedSteps: 3,
    fileCount: 1,
    actionLabel: "Check Status",
  },
];

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-8 min-w-[140px] items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 text-[13px] text-gray-700 transition-colors hover:bg-gray-50">
        <span className="truncate">
          <span className="text-gray-400">{label}: </span>
          {value}
        </span>
        <ChevronDown size={14} className="shrink-0 text-gray-400" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="text-[13px]">
        {options.map((opt) => (
          <DropdownMenuItem key={opt} onClick={() => onChange(opt)}>
            {opt}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ContractStepList({ completedSteps }: { completedSteps: number }) {
  return (
    <ul className="flex flex-col">
      {CONTRACT_STEPS.map((step, index) => {
        const done = index < completedSteps;
        const isLast = index === CONTRACT_STEPS.length - 1;
        const connectorDone = index < completedSteps;

        return (
          <li
            key={step}
            className={cn("relative flex items-center gap-2.5 text-[13px]", !isLast && "pb-5")}
          >
            {!isLast ? (
              <span
                className={cn(
                  "absolute top-5 left-[9px] w-px -translate-x-1/2",
                  connectorDone ? "bg-brand" : "bg-gray-200",
                  "h-[calc(100%-4px)]"
                )}
                aria-hidden
              />
            ) : null}
            <span
              className={cn(
                "relative z-10 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border bg-white",
                done
                  ? "border-brand bg-brand text-white"
                  : "border-gray-200 text-transparent"
              )}
            >
              {done ? <Check size={12} strokeWidth={3} /> : null}
            </span>
            <span className={done ? "font-medium text-gray-900" : "text-gray-500"}>
              {step}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function ContractInfluencerCard({
  card,
  selected,
  onSelectedChange,
}: {
  card: ContractCard;
  selected: boolean;
  onSelectedChange: (selected: boolean) => void;
}) {
  const statusBadgeClass = STATUS_BADGE[card.status];
  const initials = card.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article
      className={cn(
        "flex flex-col rounded-xl border bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-colors hover:border-gray-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
        selected ? "border-brand ring-2 ring-brand/15" : "border-gray-100"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <CampaignHubInfluencerIdentity
          name={card.name}
          handle={card.handle}
          kolManager={card.manager}
          relationship={card.relationship}
          initials={initials}
          avatarFallbackClassName="bg-violet-50 text-violet-700"
          selection={{
            checked: selected,
            onCheckedChange: onSelectedChange,
          }}
        />
        <span
          className={cn(
            "inline-flex shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none whitespace-nowrap",
            statusBadgeClass
          )}
        >
          {card.status}
        </span>
      </div>

      <div className="mt-4 ml-2">
        <ContractStepList completedSteps={card.completedSteps} />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-4 text-[12px] text-gray-500">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="shrink-0 text-gray-500">Legal Name:</span>
          <span className="truncate font-medium text-gray-800">
            {card.legalName ?? "—"}
          </span>
          {card.contractType ? (
            <span className="inline-flex shrink-0 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
              {card.contractType}
            </span>
          ) : null}
          <button
            type="button"
            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700"
            aria-label="Edit legal name"
          >
            <Pencil size={13} />
          </button>
        </span>
        <span className="inline-flex shrink-0 items-center gap-1.5">
          <FileText size={14} className="text-gray-400" />
          {card.fileCount} {card.fileCount === 1 ? "file" : "files"}
        </span>
      </div>

      <div className="mt-4 flex items-stretch gap-2">
        <button
          type="button"
          className="flex h-10 min-w-0 flex-1 items-center justify-center rounded-lg border border-brand bg-white px-3 text-[13px] font-semibold text-brand transition-colors hover:bg-brand hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
        >
          {card.actionLabel}
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
            aria-label="More actions"
          >
            <MoreHorizontal size={16} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 text-[13px]">
            <DropdownMenuItem>View contract history</DropdownMenuItem>
            <DropdownMenuItem>Send reminder</DropdownMenuItem>
            <DropdownMenuItem>Export contract</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  );
}

export default function CampaignHubContractView({
  campaignId,
  onBack: _onBack,
}: {
  campaignId: string;
  onBack: () => void;
}) {
  const [statusFilter, setStatusFilter] = useState("All");
  const [managerFilter, setManagerFilter] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_CARDS.filter((card) => {
      if (statusFilter !== "All" && card.status !== statusFilter) return false;
      if (managerFilter !== "All" && card.manager !== managerFilter) return false;
      if (!q) return true;
      return (
        card.name.toLowerCase().includes(q) ||
        card.handle.toLowerCase().includes(q)
      );
    });
  }, [statusFilter, managerFilter, query]);

  const statusOptions = ["All", ...Object.keys(STATUS_BADGE)] as string[];

  const visibleIds = useMemo(() => filtered.map((card) => card.id), [filtered]);
  const { selectedCount, toggle, selectAll, clear, isSelected } =
    useHubCardSelection(visibleIds);

  const handleExport = () => {
    const selected = filtered.filter((card) => isSelected(card.id));
    console.log("Export contract influencers:", selected);
  };

  return (
    <TooltipProvider>
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <span className="sr-only">{campaignId}</span>

      <div className="shrink-0 border-b border-gray-100 bg-gray-50/60 py-2.5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
            <span className="shrink-0 text-[12px] font-medium text-gray-500">
              Influencer:{" "}
              <span className="tabular-nums text-gray-900">{filtered.length}</span>
            </span>
            <CampaignHubSelectionBar
              selectedCount={selectedCount}
              totalCount={filtered.length}
              onSelectAll={selectAll}
              onClear={clear}
              onExport={handleExport}
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2">
            <FilterSelect
              label="Contract Status"
              value={statusFilter}
              options={statusOptions}
              onChange={setStatusFilter}
            />
            <FilterSelect
              label="KOL Manager"
              value={managerFilter}
              options={["All", "Wollin"]}
              onChange={setManagerFilter}
            />
            <div className="relative w-full min-w-[180px] sm:w-[220px]">
              <Search
                size={14}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Influencer"
                className="h-8 border-gray-200 bg-white pl-9 text-[13px]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="no-scrollbar min-h-0 flex-1 overflow-auto">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((card) => (
            <ContractInfluencerCard
              key={card.id}
              card={card}
              selected={isSelected(card.id)}
              onSelectedChange={(checked) => {
                if (checked !== isSelected(card.id)) toggle(card.id);
              }}
            />
          ))}
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
}
