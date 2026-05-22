"use client";

import { useMemo, useState } from "react";
import {
  CampaignHubDetailHeader,
  CampaignHubDetailToolbar,
  CampaignHubToolbarActionButton,
} from "@/components/CampaignHubDetailToolbar";
import { CampaignHubFilterSelect } from "@/components/CampaignHubFilterSelect";
import {
  CampaignHubInfluencerIdentity,
  type KolRelationship,
} from "@/components/CampaignHubInfluencerIdentity";
import { CampaignHubCardMetaAction } from "@/components/CampaignHubCardMetaAction";
import { CampaignHubStepList } from "@/components/CampaignHubStepList";
import ImportLogisticsTemplateSheet from "@/components/ImportLogisticsTemplateSheet";
import ShippingDetailsSheet, {
  type ShippingAddress,
  type ShippingFulfillment,
} from "@/components/ShippingDetailsSheet";
import { useHubCardSelection } from "@/hooks/useHubCardSelection";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  IconCopy,
  IconDownload,
  IconEdit,
  IconLogisticsLog,
  IconUpload,
} from "@/lib/icons";

type LogisticsCardStatus = "Awaiting Pickup" | "In Transit" | "Delivered";

type LogisticsCard = {
  id: string;
  name: string;
  handle: string;
  status: LogisticsCardStatus;
  manager: string;
  relationship: KolRelationship;
  legalName?: string;
  shipToDisplay: string;
  contractShipping: ShippingAddress;
  fulfillment?: ShippingFulfillment;
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

const DEFAULT_CONTRACT_SHIPPING: ShippingAddress = {
  recipientName: "342432",
  recipientPhone: "432432",
  countryRegion: "Indonesia",
  city: "432",
  zipPostalCode: "432",
  streetAddress: "4324",
};

function makeCard(
  card: Omit<LogisticsCard, "contractShipping" | "shipToDisplay"> & {
    contractShipping?: ShippingAddress;
    shipToDisplay?: string;
  }
): LogisticsCard {
  const contractShipping = card.contractShipping ?? DEFAULT_CONTRACT_SHIPPING;
  return {
    ...card,
    contractShipping,
    shipToDisplay:
      card.shipToDisplay ??
      (contractShipping.countryRegion ? contractShipping.countryRegion.slice(0, 2).toUpperCase() : "—"),
  };
}

const MOCK_CARDS: LogisticsCard[] = [
  makeCard({
    id: "l1",
    name: "Amelia Stone",
    handle: "@instagram.ins",
    status: "Awaiting Pickup",
    manager: "Wollin",
    relationship: "Direct",
    shipToDisplay: "ID",
    shippingLabel: "Unshipped",
    completedSteps: 0,
    stepTimestamps: [null, null, null, null, null],
    canConfirmReceipt: false,
  }),
  makeCard({
    id: "l2",
    name: "Ethan Carter",
    handle: "@foodie.my",
    status: "In Transit",
    manager: "Wollin",
    relationship: "Manager",
    shipToDisplay: "MY",
    shippingLabel: "SF Express - TRK-202605-0003",
    trackingNumber: "TRK-202605-0003",
    completedSteps: 1,
    activeStepIndex: 1,
    stepTimestamps: ["May 13, 2026 10:00 AM", null, null, null, null],
    canConfirmReceipt: false,
    fulfillment: {
      useContractDefault: true,
      address: DEFAULT_CONTRACT_SHIPPING,
      courier: "SF Express",
      trackingId: "TRK-202605-0003",
      goodsContent: "",
    },
  }),
  makeCard({
    id: "l3",
    name: "Maya Lin",
    handle: "@lifestyle.id",
    status: "Delivered",
    manager: "Wollin",
    relationship: "MCN",
    legalName: "892011",
    shipToDisplay: "ID",
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
  }),
  makeCard({
    id: "l4",
    name: "Noah Brooks",
    handle: "@creator.ph",
    status: "Awaiting Pickup",
    manager: "Wollin",
    relationship: "Direct",
    shipToDisplay: "PH",
    shippingLabel: "Unshipped",
    completedSteps: 0,
    stepTimestamps: [null, null, null, null, null],
    canConfirmReceipt: false,
  }),
  makeCard({
    id: "l5",
    name: "Sofia Reyes",
    handle: "@runner.in",
    status: "In Transit",
    manager: "Wollin",
    relationship: "Manager",
    shipToDisplay: "IN",
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
  }),
  makeCard({
    id: "l6",
    name: "Liam Park",
    handle: "@daily.vlog",
    status: "Delivered",
    manager: "Wollin",
    relationship: "MCN",
    legalName: "342432",
    shipToDisplay: "ID",
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
  }),
  makeCard({
    id: "l7",
    name: "Zoe Tan",
    handle: "@beauty.sg",
    status: "In Transit",
    manager: "Wollin",
    relationship: "Direct",
    shipToDisplay: "SG",
    shippingLabel: "SF Express - TRK-202605-0015",
    trackingNumber: "TRK-202605-0015",
    completedSteps: 1,
    activeStepIndex: 1,
    stepTimestamps: ["May 14, 2026 11:30 AM", null, null, null, null],
    canConfirmReceipt: false,
  }),
  makeCard({
    id: "l8",
    name: "James Wu",
    handle: "@tech.tw",
    status: "Awaiting Pickup",
    manager: "Wollin",
    relationship: "Manager",
    shipToDisplay: "TW",
    shippingLabel: "Unshipped",
    completedSteps: 0,
    stepTimestamps: [null, null, null, null, null],
    canConfirmReceipt: false,
  }),
];

function LogisticsInfluencerCard({
  card,
  selected,
  onSelectedChange,
  onEditShipping,
}: {
  card: LogisticsCard;
  selected: boolean;
  onSelectedChange: (selected: boolean) => void;
  onEditShipping: () => void;
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
        "flex flex-col gap-1.5 rounded-xl border bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-colors hover:border-gray-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
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
        <p className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
          <span className="shrink-0 font-medium text-gray-700">Tracking ID: </span>
          <span className="truncate font-normal text-gray-500">{card.shippingLabel}</span>
        </p>
        {card.trackingNumber ? (
          <button
            type="button"
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-white hover:text-gray-700"
            aria-label="Copy tracking number"
          >
            <IconCopy size={13} />
          </button>
        ) : null}
      </div>

      <div className="mt-4 ml-2">
        <CampaignHubStepList
          steps={LOGISTICS_STEPS}
          completedSteps={card.completedSteps}
          activeStepIndex={card.activeStepIndex}
          stepTimestamps={card.stepTimestamps}
          activeIcon="hourglass"
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-4 text-[12px] text-gray-500">
        <span className="flex min-w-0 flex-1 items-center gap-1.5">
          <span className="shrink-0 font-medium text-gray-700">Ship To: </span>
          <span className="truncate text-gray-500">{card.shipToDisplay}</span>
          <button
            type="button"
            onClick={onEditShipping}
            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700"
            aria-label="Edit shipping details"
          >
            <IconEdit size={13} />
          </button>
        </span>
        <CampaignHubCardMetaAction icon={IconLogisticsLog} className="whitespace-nowrap">
          View Full Log
        </CampaignHubCardMetaAction>
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
  onBack,
}: {
  campaignId: string;
  onBack: () => void;
}) {
  const [statusFilter, setStatusFilter] = useState("All");
  const [managerFilter, setManagerFilter] = useState("All");
  const [identityFilter, setIdentityFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [shippingCardId, setShippingCardId] = useState<string | null>(null);
  const [cards, setCards] = useState(MOCK_CARDS);

  const shippingCard = useMemo(
    () => cards.find((card) => card.id === shippingCardId) ?? null,
    [cards, shippingCardId]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cards.filter((card) => {
      if (statusFilter !== "All" && card.status !== statusFilter) return false;
      if (managerFilter !== "All" && card.manager !== managerFilter) return false;
      if (identityFilter !== "All" && card.relationship !== identityFilter) return false;
      if (!q) return true;
      return (
        card.name.toLowerCase().includes(q) ||
        card.handle.toLowerCase().includes(q) ||
        (card.legalName?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [cards, statusFilter, managerFilter, identityFilter, query]);

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
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
        <span className="sr-only">{campaignId}</span>

        <CampaignHubDetailHeader title="Logistics" onBack={onBack} />

        <div className="shrink-0 rounded-xl border border-gray-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <CampaignHubDetailToolbar
            batchSelection={{
              selectedCount,
              totalCount: filtered.length,
              onSelectAll: selectAll,
              onClear: clear,
            }}
            searchValue={query}
            onSearchChange={setQuery}
            filters={
              <>
                <CampaignHubFilterSelect
                  label="Logistics Status"
                  value={statusFilter}
                  options={statusOptions}
                  onChange={setStatusFilter}
                />
                <CampaignHubFilterSelect
                  label="KOL Manager"
                  value={managerFilter}
                  options={["All", "Wollin"]}
                  onChange={setManagerFilter}
                />
                <CampaignHubFilterSelect
                  label="Identity Type"
                  value={identityFilter}
                  options={["All", "Direct", "Manager", "MCN"]}
                  onChange={setIdentityFilter}
                />
              </>
            }
            actions={
              <>
                <CampaignHubToolbarActionButton onClick={() => setImportOpen(true)}>
                  <IconUpload size={13} />
                  Import
                </CampaignHubToolbarActionButton>
                <CampaignHubToolbarActionButton
                  onClick={handleExport}
                  disabled={selectedCount === 0}
                >
                  <IconDownload size={13} />
                  Download
                </CampaignHubToolbarActionButton>
              </>
            }
          />
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
                onEditShipping={() => setShippingCardId(card.id)}
              />
            ))}
          </div>
        </div>
      </div>

      <ImportLogisticsTemplateSheet open={importOpen} onOpenChange={setImportOpen} />

      {shippingCard ? (
        <ShippingDetailsSheet
          open={shippingCardId !== null}
          onOpenChange={(open) => {
            if (!open) setShippingCardId(null);
          }}
          influencerName={shippingCard.name}
          contractShipping={shippingCard.contractShipping}
          initialFulfillment={shippingCard.fulfillment}
          onSave={(fulfillment) => {
            setCards((prev) =>
              prev.map((card) =>
                card.id === shippingCard.id
                  ? {
                      ...card,
                      fulfillment,
                      trackingNumber: fulfillment.trackingId || undefined,
                      shippingLabel: fulfillment.trackingId
                        ? `${fulfillment.courier || "Courier"} - ${fulfillment.trackingId}`
                        : card.shippingLabel,
                    }
                  : card
              )
            );
            setShippingCardId(null);
          }}
        />
      ) : null}
    </TooltipProvider>
  );
}
