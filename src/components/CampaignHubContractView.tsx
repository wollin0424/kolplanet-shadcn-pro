"use client";

import { useMemo, useState } from "react";
import {
  CampaignHubDetailHeader,
  CampaignHubDetailToolbar,
} from "@/components/CampaignHubDetailToolbar";
import { CampaignHubFilterSelect } from "@/components/CampaignHubFilterSelect";
import {
  CampaignHubInfluencerIdentity,
  type KolRelationship,
} from "@/components/CampaignHubInfluencerIdentity";
import { CampaignHubStepList } from "@/components/CampaignHubStepList";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { platformFromLabel } from "@/components/PlatformIcon";
import { cn } from "@/lib/utils";
import {
  CampaignHubCardMetaAction,
  campaignHubCardMetaActionMutedClass,
} from "@/components/CampaignHubCardMetaAction";
import { FileText, Pencil, MoreHorizontal } from "@/lib/icons";
import ShippingDetailsSheet, {
  type ShippingAddress,
  type ShippingFulfillment,
} from "@/components/ShippingDetailsSheet";

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
  stepTimestamps: (string | null)[];
  fileCount: number;
  files?: string[];
  legalName?: string;
  contractShipping?: ShippingAddress;
  fulfillment?: ShippingFulfillment;
  actionLabel: string;
};

const DEFAULT_CONTRACT_SHIPPING: ShippingAddress = {
  recipientName: "342432",
  recipientPhone: "432432",
  countryRegion: "Indonesia",
  city: "432",
  zipPostalCode: "432",
  streetAddress: "4324",
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
    stepTimestamps: [null, null, null, null],
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
    stepTimestamps: ["Mar 24, 2025 2:15 PM", null, null, null],
    fileCount: 0,
    actionLabel: "Generate Draft",
    fulfillment: {
      useContractDefault: true,
      address: DEFAULT_CONTRACT_SHIPPING,
      courier: "SF Express",
      trackingId: "TRK-202605-0003",
      goodsContent: "",
    },
  },
  {
    id: "c3",
    name: "Maya Lin",
    handle: "@lifestyle.id",
    status: "Awaiting Sending",
    manager: "Wollin",
    relationship: "MCN",
    completedSteps: 2,
    stepTimestamps: [
      "Mar 24, 2025 9:00 AM",
      "Mar 26, 2025 11:30 AM",
      null,
      null,
    ],
    fileCount: 1,
    files: ["IO_V1_Original (Signed 2026-03-31).pdf"],
    actionLabel: "Invite to Sign",
  },
  {
    id: "c4",
    name: "Noah Brooks",
    handle: "@creator.ph",
    status: "Signing",
    manager: "Wollin",
    relationship: "Direct",
    completedSteps: 2,
    stepTimestamps: [
      "Mar 25, 2025 8:00 AM",
      "Mar 27, 2025 3:30 PM",
      "Mar 28, 2025 10:20 AM",
      null,
    ],
    fileCount: 1,
    files: ["NB_Contract_Draft_v2.pdf"],
    legalName: "342432",
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
    stepTimestamps: [
      "Mar 20, 2025 10:00 AM",
      "Mar 21, 2025 4:30 PM",
      "Mar 22, 2025 9:15 AM",
      "Mar 23, 2025 1:45 PM",
    ],
    fileCount: 1,
    files: ["SR_Final_Contract (Countersigned).pdf"],
    legalName: "892011",
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
    stepTimestamps: [
      "Mar 22, 2025 11:00 AM",
      "Mar 24, 2025 5:00 PM",
      "Mar 26, 2025 8:30 AM",
      null,
    ],
    fileCount: 1,
    files: ["LP_Signing_Agreement.pdf"],
    actionLabel: "Check Status",
  },
];

function contractFiles(card: ContractCard): string[] {
  if (card.files?.length) return card.files;
  if (card.fileCount <= 0) return [];
  return [`${card.name.replace(/\s+/g, "_")}_Contract.pdf`];
}

function ContractInfluencerCard({
  card,
  onEditShipping,
}: {
  card: ContractCard;
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
        "flex flex-col gap-1 rounded-xl border border-gray-100 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-colors hover:border-gray-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <CampaignHubInfluencerIdentity
          name={card.name}
          handle={card.handle}
          platform={platformFromLabel(card.handle) ?? "IG"}
          kolManager={card.manager}
          relationship={card.relationship}
          initials={initials}
          avatarFallbackClassName="bg-violet-50 text-violet-700"
        />
        <span
          className={cn(
            "inline-flex shrink-0 rounded-full border px-3 py-1 text-xs font-semibold leading-none whitespace-nowrap",
            statusBadgeClass
          )}
        >
          {card.status}
        </span>
      </div>

      <div className="mt-4 ml-2">
        <CampaignHubStepList
          steps={CONTRACT_STEPS}
          completedSteps={card.completedSteps}
          stepTimestamps={card.stepTimestamps}
          inferActiveStep
          activeIcon="hourglass"
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-4 text-xs text-gray-500">
        <span className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 font-medium text-gray-700">Legal Name: </span>
          <span className="truncate text-gray-500">{card.legalName ?? "—"}</span>
          <button
            type="button"
            onClick={onEditShipping}
            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700"
            aria-label="Edit shipping details"
          >
            <Pencil size={14} />
          </button>
        </span>
        {card.fileCount > 0 ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <CampaignHubCardMetaAction
                  icon={FileText}
                  aria-label={`${card.fileCount} contract ${card.fileCount === 1 ? "file" : "files"}`}
                >
                  {card.fileCount} {card.fileCount === 1 ? "file" : "files"}
                </CampaignHubCardMetaAction>
              }
            />
            <TooltipContent variant="light" side="bottom" align="end" className="min-w-[200px]">
              <ul className="flex flex-col gap-2">
                {contractFiles(card).map((fileName) => (
                  <li key={fileName} className="flex min-w-0 items-start gap-2">
                    <FileText size={14} className="mt-1 shrink-0 text-gray-400" />
                    <span className="min-w-0 font-medium leading-snug text-gray-800">
                      {fileName}
                    </span>
                  </li>
                ))}
              </ul>
            </TooltipContent>
          </Tooltip>
        ) : (
          <span className={campaignHubCardMetaActionMutedClass}>
            <FileText size={14} className="shrink-0 text-gray-400" aria-hidden />
            0 files
          </span>
        )}
      </div>

      <div className="mt-4 flex items-stretch gap-2">
        <button
          type="button"
          className="flex h-10 min-w-0 flex-1 items-center justify-center rounded-lg border border-brand bg-white px-3 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
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
  onBack,
}: {
  campaignId: string;
  onBack: () => void;
}) {
  const [statusFilter, setStatusFilter] = useState("All");
  const [managerFilter, setManagerFilter] = useState("All");
  const [identityFilter, setIdentityFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [shippingCardId, setShippingCardId] = useState<string | null>(null);
  const [cards, setCards] = useState(MOCK_CARDS);

  const shippingCard = cards.find((card) => card.id === shippingCardId) ?? null;

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
  }, [statusFilter, managerFilter, identityFilter, query, cards]);

  const statusOptions = ["All", ...Object.keys(STATUS_BADGE)] as string[];

  return (
    <TooltipProvider>
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
        <span className="sr-only">{campaignId}</span>

        <CampaignHubDetailHeader title="Contract" onBack={onBack} />

        <CampaignHubDetailToolbar
            influencerCount={filtered.length}
            searchValue={query}
            onSearchChange={setQuery}
            filters={
              <>
                <CampaignHubFilterSelect
                  label="Contract Status"
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
          />

        <div className="no-scrollbar min-h-0 flex-1 overflow-auto">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((card) => (
              <ContractInfluencerCard
                key={card.id}
                card={card}
                onEditShipping={() => setShippingCardId(card.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {shippingCard ? (
        <ShippingDetailsSheet
          open={shippingCardId !== null}
          onOpenChange={(open) => {
            if (!open) setShippingCardId(null);
          }}
          influencerName={shippingCard.name}
          contractShipping={shippingCard.contractShipping ?? DEFAULT_CONTRACT_SHIPPING}
          initialFulfillment={shippingCard.fulfillment}
          onSave={(fulfillment) => {
            setCards((prev) =>
              prev.map((card) =>
                card.id === shippingCard.id ? { ...card, fulfillment } : card
              )
            );
            setShippingCardId(null);
          }}
        />
      ) : null}
    </TooltipProvider>
  );
}
