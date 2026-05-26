import type { ClientSettlementStatus, KolRelationship } from "@/lib/clientBilling";

export type InfluencerPaymentRow = {
  id: string;
  name: string;
  handle: string;
  platform: string;
  geo: string;
  campaignCount: number;
  approvedAmount: number;
  amountPaid: number;
  balance: number;
  notes: string;
  kolManager: string;
  relationship: KolRelationship;
};

export type InfluencerPaymentCampaignRow = {
  id: string;
  campaignId: string;
  campaignName: string;
  settlementStatus: ClientSettlementStatus;
  approvedAmount: number;
  amountPaid: number;
  balance: number;
  dueDate: string;
  note: string;
  currency: "USD" | "INR";
};

const BASE_INFLUENCER_ROWS: InfluencerPaymentRow[] = [
  {
    id: "1015753737",
    name: "Amelia Stone",
    handle: "@instagram ins",
    platform: "Instagram",
    geo: "IN",
    campaignCount: 34,
    approvedAmount: 300,
    amountPaid: 300,
    balance: 0,
    notes: "Active user — Frequent collaborator",
    kolManager: "Moca",
    relationship: "Manager",
  },
  {
    id: "2345678543",
    name: "Instagram ins",
    handle: "@instagram ins",
    platform: "Instagram",
    geo: "IN",
    campaignCount: 12,
    approvedAmount: 30_000,
    amountPaid: 30_000,
    balance: 0,
    notes: "Active user — Frequent collaborator",
    kolManager: "Moca",
    relationship: "Manager",
  },
  {
    id: "1982736450",
    name: "Lucas Turner",
    handle: "@lucasturner",
    platform: "Instagram",
    geo: "SG",
    campaignCount: 8,
    approvedAmount: 12_500,
    amountPaid: 8_000,
    balance: 4_500,
    notes: "Pending tax form update",
    kolManager: "Chris",
    relationship: "Direct",
  },
  {
    id: "1765432890",
    name: "Mia Chen",
    handle: "@miachen",
    platform: "Instagram",
    geo: "MY",
    campaignCount: 15,
    approvedAmount: 22_000,
    amountPaid: 22_000,
    balance: 0,
    notes: "Verified payout account",
    kolManager: "Moca",
    relationship: "MCN",
  },
  {
    id: "1654321098",
    name: "Jordan Lee",
    handle: "@jordanlee",
    platform: "Instagram",
    geo: "ID",
    campaignCount: 6,
    approvedAmount: 5_400,
    amountPaid: 2_800,
    balance: 2_600,
    notes: "Partial payout in progress",
    kolManager: "Wollin",
    relationship: "Manager",
  },
  {
    id: "1543210987",
    name: "Priya Sharma",
    handle: "@priyasharma",
    platform: "Instagram",
    geo: "IN",
    campaignCount: 21,
    approvedAmount: 18_750,
    amountPaid: 10_000,
    balance: 8_750,
    notes: "Awaiting deliverable sign-off",
    kolManager: "Chris",
    relationship: "Direct",
  },
];

const BASE_CAMPAIGN_ROWS: InfluencerPaymentCampaignRow[] = [
  {
    id: "IPC-01",
    campaignId: "CMP-12045",
    campaignName: "123456",
    settlementStatus: "Waiting for Validation",
    approvedAmount: 30_000,
    amountPaid: 30_000,
    balance: 0,
    dueDate: "Sep 02, 2026",
    note: "Active user — Frequent collaborator",
    currency: "INR",
  },
  {
    id: "IPC-02",
    campaignId: "CMP-12046",
    campaignName: "7657 Test Sample",
    settlementStatus: "Waiting for Validation",
    approvedAmount: 30_000,
    amountPaid: 30_000,
    balance: 0,
    dueDate: "Sep 02, 2026",
    note: "Active user — Frequent collaborator",
    currency: "INR",
  },
  {
    id: "IPC-03",
    campaignId: "CMP-12047",
    campaignName: "7657 Test Sample",
    settlementStatus: "Waiting for Validation",
    approvedAmount: 30_000,
    amountPaid: 30_000,
    balance: 0,
    dueDate: "Sep 02, 2026",
    note: "Active user — Frequent collaborator",
    currency: "INR",
  },
  {
    id: "IPC-04",
    campaignId: "CMP-12048",
    campaignName: "7657 Test Sample",
    settlementStatus: "Waiting for Validation",
    approvedAmount: 30_000,
    amountPaid: 30_000,
    balance: 0,
    dueDate: "Sep 02, 2026",
    note: "Active user — Frequent collaborator",
    currency: "INR",
  },
  {
    id: "IPC-05",
    campaignId: "CMP-12049",
    campaignName: "7657 Test Sample",
    settlementStatus: "Waiting for Validation",
    approvedAmount: 30_000,
    amountPaid: 30_000,
    balance: 0,
    dueDate: "Sep 02, 2026",
    note: "Active user — Frequent collaborator",
    currency: "INR",
  },
];

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length];
}

function buildInfluencerExtras(): InfluencerPaymentRow[] {
  const names = [
    "Noah Williams",
    "Emma Davis",
    "Oliver Brown",
    "Sophia Wilson",
    "Liam Martinez",
    "Ava Anderson",
    "Ethan Thomas",
    "Isabella Taylor",
  ];
  const handles = [
    "@noahw",
    "@emmad",
    "@oliverb",
    "@sophiaw",
    "@liamm",
    "@avad",
    "@ethant",
    "@isabellat",
  ];
  const geos = ["IN", "SG", "MY", "ID", "TH", "PH"];
  const notes = [
    "Active user — Frequent collaborator",
    "Pending tax form update",
    "Verified payout account",
    "Partial payout in progress",
    "Awaiting deliverable sign-off",
  ];
  const managers = ["Moca", "Chris", "Wollin"];
  const relationships: KolRelationship[] = ["Direct", "Manager", "MCN"];

  return Array.from({ length: 24 }, (_, i) => {
    const approved = 300 + (i % 10) * 1_250;
    const paid = i % 3 === 0 ? approved : Math.round(approved * (0.4 + (i % 4) * 0.12));
    return {
      id: String(1_200_000_000 + i),
      name: pick(names, i),
      handle: pick(handles, i),
      platform: "Instagram",
      geo: pick(geos, i),
      campaignCount: 3 + (i % 28),
      approvedAmount: approved,
      amountPaid: paid,
      balance: Math.max(0, approved - paid),
      notes: pick(notes, i),
      kolManager: pick(managers, i),
      relationship: pick(relationships, i),
    };
  });
}

function buildCampaignExtras(influencerId: string, count: number): InfluencerPaymentCampaignRow[] {
  const campaignNames = ["123456", "7657 Test Sample", "Campus Push Q3", "Brand Lift Study"];
  const statuses: ClientSettlementStatus[] = [
    "Waiting for Validation",
    "Partially Paid",
    "Validated",
    "All Paid",
    "Rejected",
  ];
  const notes = [
    "Active user — Frequent collaborator",
    "First installment pending bank confirmation.",
    "Validated by finance on May 05.",
    "Completed — proof uploaded.",
  ];

  return Array.from({ length: count }, (_, i) => {
    const approved = 15_000 + (i % 6) * 5_000;
    const status = pick(statuses, i);
    const paid =
      status === "All Paid"
        ? approved
        : status === "Waiting for Validation"
          ? approved
          : Math.round(approved * (0.3 + (i % 5) * 0.1));
    return {
      id: `${influencerId}-IPC-${String(i + 6).padStart(2, "0")}`,
      campaignId: `CMP-${String(12_050 + i)}`,
      campaignName: pick(campaignNames, i),
      settlementStatus: status,
      approvedAmount: approved,
      amountPaid: paid,
      balance: Math.max(0, approved - paid),
      dueDate: `Sep ${String(2 + (i % 20)).padStart(2, "0")}, 2026`,
      note: pick(notes, i),
      currency: "INR",
    };
  });
}

export const INFLUENCER_PAYMENT_ROWS: InfluencerPaymentRow[] = [
  ...BASE_INFLUENCER_ROWS,
  ...buildInfluencerExtras(),
];

export function getInfluencerPaymentRow(id: string) {
  return INFLUENCER_PAYMENT_ROWS.find((row) => row.id === id);
}

export function getInfluencerCampaignRows(influencerId: string) {
  if (BASE_CAMPAIGN_ROWS.length >= 25) return BASE_CAMPAIGN_ROWS;
  return [...BASE_CAMPAIGN_ROWS, ...buildCampaignExtras(influencerId, 25 - BASE_CAMPAIGN_ROWS.length)];
}
