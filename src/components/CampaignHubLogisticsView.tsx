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
  Clock,
  Copy,
  Pencil,
  Search,
  Truck,
} from "lucide-react";

type LogisticsCardStatus = "Awaiting Pickup" | "In Transit" | "Delivered";

type LogisticsCard = {
  id: string;
  name: string;
  handle: string;
  status: LogisticsCardStatus;
  manager: string;
  relationship: KolRelationship;
  legalName?: string;
  shippingLabel: string;
  trackingNumber?: string;
  completedSteps: number;
  activeStepIndex?: number;
  stepTimestamps: (string | null)[];
  canConfirmReceipt: boolean;
};

const STATUS_BADGE: Record<LogisticsCardStatus, string> = {
  "Awaiting Pickup": "border-amber-200 bg-amber-50 text-amber-800",
  "In Transit": "border-sky-200 bg-sky-50 text-sky-800",
  Delivered: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

const LOGISTICS_STEPS = [
  "Pickup",
  "In Transit",
  "Out of Delivery",
  "Delivered",
  "Received",
] as const;

const MOCK_CARDS: LogisticsCard[] = [
  {
    id: "l1",
    name: "Amelia Stone",
    handle: "@instagram.ins",
    status: "Awaiting Pickup",
    manager: "Wollin",
    relationship: "Direct",
    shippingLabel: "Unshipped",
    completedSteps: 0,
    stepTimestamps: [null, null, null, null, null],
    canConfirmReceipt: false,
  },
  {
    id: "l2",
    name: "Ethan Carter",
    handle: "@foodie.my",
    status: "In Transit",
    manager: "Wollin",
    relationship: "Manager",
    shippingLabel: "SF Express - TRK-202605-0003",
    trackingNumber: "TRK-202605-0003",
    completedSteps: 1,
    activeStepIndex: 1,
    stepTimestamps: ["May 13, 2026 10:00 AM", null, null, null, null],
    canConfirmReceipt: false,
  },
  {
    id: "l3",
    name: "Maya Lin",
    handle: "@lifestyle.id",
    status: "Delivered",
    manager: "Wollin",
    relationship: "MCN",
    legalName: "892011",
    shippingLabel: "SF Express - TRK-202605-0004",
    trackingNumber: "TRK-202605-0004",
    completedSteps: 4,
    stepTimestamps: [
      "May 12, 2026 9:30 AM",
      "May 13, 2026 2:15 PM",
      "May 14, 2026 11:00 AM",
      "May 15, 2026 4:45 PM",
      null,
    ],
    canConfirmReceipt: true,
  },
  {
    id: "l4",
    name: "Noah Brooks",
    handle: "@creator.ph",
    status: "Awaiting Pickup",
    manager: "Wollin",
    relationship: "Direct",
    shippingLabel: "Unshipped",
    completedSteps: 0,
    stepTimestamps: [null, null, null, null, null],
    canConfirmReceipt: false,
  },
  {
    id: "l5",
    name: "Sofia Reyes",
    handle: "@runner.in",
    status: "In Transit",
    manager: "Wollin",
    relationship: "Manager",
    shippingLabel: "DHL Express - TRK-202605-0007",
    trackingNumber: "TRK-202605-0007",
    completedSteps: 2,
    activeStepIndex: 2,
    stepTimestamps: [
      "May 11, 2026 8:00 AM",
      "May 12, 2026 3:20 PM",
      null,
      null,
      null,
    ],
    canConfirmReceipt: false,
  },
  {
    id: "l6",
    name: "Liam Park",
    handle: "@daily.vlog",
    status: "Delivered",
    manager: "Wollin",
    relationship: "MCN",
    legalName: "342432",
    shippingLabel: "FedEx - TRK-202605-0011",
    trackingNumber: "TRK-202605-0011",
    completedSteps: 4,
    stepTimestamps: [
      "May 10, 2026 7:45 AM",
      "May 11, 2026 1:00 PM",
      "May 12, 2026 9:30 AM",
      "May 13, 2026 5:15 PM",
      null,
    ],
    canConfirmReceipt: true,
  },
  {
    id: "l7",
    name: "Zoe Tan",
    handle: "@beauty.sg",
    status: "In Transit",
    manager: "Wollin",
    relationship: "Direct",
    shippingLabel: "SF Express - TRK-202605-0015",
    trackingNumber: "TRK-202605-0015",
    completedSteps: 1,
    activeStepIndex: 1,
    stepTimestamps: ["May 14, 2026 11:30 AM", null, null, null, null],
    canConfirmReceipt: false,
  },
  {
    id: "l8",
    name: "James Wu",
    handle: "@tech.tw",
    status: "Awaiting Pickup",
    manager: "Wollin",
    relationship: "Manager",
    shippingLabel: "Unshipped",
    completedSteps: 0,
    stepTimestamps: [null, null, null, null, null],
    canConfirmReceipt: false,
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

function LogisticsStepList({
  completedSteps,
  activeStepIndex,
  stepTimestamps,
}: {
  completedSteps: number;
  activeStepIndex?: number;
  stepTimestamps: (string | null)[];
}) {
  return (
    <ul className="flex flex-col">
      {LOGISTICS_STEPS.map((step, index) => {
        const done = index < completedSteps;
        const active = activeStepIndex === index;
        const isLast = index === LOGISTICS_STEPS.length - 1;
        const connectorDone = index < completedSteps;
        const timestamp = stepTimestamps[index];

        return (
          <li
            key={step}
            className={cn(
              "relative flex items-start gap-2.5 text-[13px]",
              !isLast && "pb-5"
            )}
          >
            {!isLast ? (
              <span
                className={cn(
                  "absolute top-5 left-[10px] w-px -translate-x-1/2",
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
                  : active
                    ? "border-brand bg-white text-brand"
                    : "border-gray-200 bg-white text-transparent"
              )}
            >
              {done ? (
                <Check size={12} strokeWidth={3} />
              ) : active ? (
                <Clock size={11} strokeWidth={2.5} />
              ) : null}
            </span>
            <div className="relative z-10 flex min-w-0 flex-1 items-start justify-between gap-2 pt-0.5">
              <span
                className={cn(
                  "leading-snug",
                  done || active ? "font-medium text-gray-900" : "text-gray-500"
                )}
              >
                {step}
              </span>
              {timestamp ? (
                <span className="shrink-0 text-right text-[11px] leading-snug text-gray-400 tabular-nums">
                  {timestamp}
                </span>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function LogisticsInfluencerCard({
  card,
  selected,
  onSelectedChange,
}: {
  card: LogisticsCard;
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
          avatarFallbackClassName="bg-emerald-50 text-emerald-700"
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

      <div className="mt-4 flex h-11 items-center gap-2 overflow-hidden rounded-lg border border-gray-100 bg-gray-50/80 px-3 text-[12px]">
        <p className="flex min-w-0 flex-1 items-center overflow-hidden">
          <span className="shrink-0 text-gray-500">Tracking ID: </span>
          <span className="truncate font-medium text-gray-800">{card.shippingLabel}</span>
        </p>
        <div className="flex shrink-0 items-center gap-0.5">
          {card.trackingNumber ? (
            <button
              type="button"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-white hover:text-gray-700"
              aria-label="Copy tracking number"
            >
              <Copy size={13} />
            </button>
          ) : null}
          <button
            type="button"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-white hover:text-gray-700"
            aria-label="Edit tracking ID"
          >
            <Pencil size={13} />
          </button>
        </div>
      </div>

      <div className="mt-4 ml-2">
        <LogisticsStepList
          completedSteps={card.completedSteps}
          activeStepIndex={card.activeStepIndex}
          stepTimestamps={card.stepTimestamps}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-gray-100 pt-4 text-[12px] text-gray-500">
        <span className="flex min-w-0 flex-1 items-center gap-1.5">
          <span className="shrink-0 text-gray-500">Ship To:</span>
          <span className="truncate font-medium text-gray-800">
            {card.legalName ?? "—"}
          </span>
          <button
            type="button"
            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700"
            aria-label="Edit ship to"
          >
            <Pencil size={13} />
          </button>
        </span>
        <button
          type="button"
          className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[13px] font-medium text-brand transition-colors hover:text-brand/80"
        >
          <Truck size={14} className="shrink-0" />
          View Full Log
        </button>
      </div>

      <div className="mt-4">
        <button
          type="button"
          disabled={!card.canConfirmReceipt}
          className={cn(
            "flex h-10 w-full items-center justify-center rounded-lg border px-3 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30",
            card.canConfirmReceipt
              ? "border-brand bg-white text-brand hover:bg-brand hover:text-white"
              : "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
          )}
        >
          Confirm Receipt
        </button>
      </div>
    </article>
  );
}

export default function CampaignHubLogisticsView({
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
    console.log("Export logistics influencers:", selected);
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
                label="Logistics Status"
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
              <LogisticsInfluencerCard
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
