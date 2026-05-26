export type ContractStatus =
  | "Pending"
  | "Drafting"
  | "Auditing"
  | "Partially Signed (Us)"
  | "Partially Signed (Client)"
  | "Countersigned";

export const CONTRACT_STATUS_OPTIONS: ContractStatus[] = [
  "Pending",
  "Drafting",
  "Auditing",
  "Partially Signed (Us)",
  "Partially Signed (Client)",
  "Countersigned",
];

export const CONTRACT_STATUS_STYLES: Record<ContractStatus, string> = {
  Pending: "bg-gray-50 text-gray-600 border-gray-200",
  Drafting: "bg-amber-50 text-amber-800 border-amber-200",
  Auditing: "bg-yellow-50 text-yellow-800 border-yellow-200",
  "Partially Signed (Us)": "bg-sky-50 text-sky-700 border-sky-200",
  "Partially Signed (Client)": "bg-sky-50 text-sky-700 border-sky-200",
  Countersigned: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export type ClientInvoiceStatus =
  | "Pending"
  | "Drafting"
  | "Issued"
  | "Revised"
  | "Cancelled";

export const INVOICE_STATUS_OPTIONS: ClientInvoiceStatus[] = [
  "Pending",
  "Drafting",
  "Issued",
  "Revised",
  "Cancelled",
];

export const INVOICE_STATUS_STYLES: Record<ClientInvoiceStatus, string> = {
  Pending: "bg-amber-50 text-amber-800 border-amber-200",
  Drafting: "bg-gray-50 text-gray-600 border-gray-200",
  Issued: "bg-sky-50 text-sky-700 border-sky-200",
  Revised: "bg-violet-50 text-violet-700 border-violet-200",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
};

export type CollectionStatus = "Unpaid" | "Partially Paid" | "Fully Paid";

export const COLLECTION_STATUS_OPTIONS: CollectionStatus[] = [
  "Unpaid",
  "Partially Paid",
  "Fully Paid",
];

export const COLLECTION_STATUS_STYLES: Record<CollectionStatus, string> = {
  Unpaid: "bg-red-50 text-red-700 border-red-200",
  "Partially Paid": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Fully Paid": "bg-green-50 text-green-800 border-green-200",
};

export type ClientBillingRow = {
  id: string;
  campaignName: string;
  serviceMonth: string;
  contractStatus: ContractStatus;
  invoiceStatus: ClientInvoiceStatus;
  collectionStatus: CollectionStatus;
  hasCommercialUpdate: boolean;
  contractingEntity: string;
  clientReceivable: number;
  settlementAmount: number;
  dueDate: string;
  paymentProofCount: number;
  internalNotes: string;
};

export type ClientSettlementStatus =
  | "Waiting for Validation"
  | "Partially Paid"
  | "Validated"
  | "All Paid"
  | "Rejected";

export type KolRelationship = "Direct" | "Manager" | "MCN";

export type ClientSettlementRow = {
  id: string;
  name: string;
  handle: string;
  platform: string;
  kolManager: string;
  relationship: KolRelationship;
  settlementStatus: ClientSettlementStatus;
  approvedAmount: number;
  amountPaid: number;
  balance: number;
  dueDate: string;
  note: string;
};

const BASE_CLIENT_BILLING_ROWS: ClientBillingRow[] = [
  {
    id: "B3053",
    campaignName: "Apex Mobile Research",
    serviceMonth: "2024-02",
    contractStatus: "Partially Signed (Us)",
    invoiceStatus: "Issued",
    collectionStatus: "Partially Paid",
    hasCommercialUpdate: true,
    contractingEntity: "EA Sales Est",
    clientReceivable: 22_000,
    settlementAmount: 18_500,
    dueDate: "2024/03/15",
    paymentProofCount: 2,
    internalNotes: "Client requested split billing across two entities.",
  },
  {
    id: "B3045",
    campaignName: "Global Vertical Study",
    serviceMonth: "2024-02",
    contractStatus: "Auditing",
    invoiceStatus: "Drafting",
    collectionStatus: "Unpaid",
    hasCommercialUpdate: false,
    contractingEntity: "Tencent Games Publishing",
    clientReceivable: 45_000,
    settlementAmount: 0,
    dueDate: "2024/04/01",
    paymentProofCount: 0,
    internalNotes: "Awaiting countersigned contract before invoice issue.",
  },
  {
    id: "B3038",
    campaignName: "Spotify Campus Push",
    serviceMonth: "2024-01",
    contractStatus: "Countersigned",
    invoiceStatus: "Issued",
    collectionStatus: "Fully Paid",
    hasCommercialUpdate: false,
    contractingEntity: "Spotify AB",
    clientReceivable: 12_000,
    settlementAmount: 12_000,
    dueDate: "2024/02/10",
    paymentProofCount: 3,
    internalNotes: "Closed loop — all influencers paid.",
  },
  {
    id: "B3031",
    campaignName: "Nike Run Club Q1",
    serviceMonth: "2024-01",
    contractStatus: "Drafting",
    invoiceStatus: "Pending",
    collectionStatus: "Unpaid",
    hasCommercialUpdate: true,
    contractingEntity: "Nike Inc.",
    clientReceivable: 88_000,
    settlementAmount: 0,
    dueDate: "2024/03/30",
    paymentProofCount: 0,
    internalNotes: "Scope revision pending legal review.",
  },
  {
    id: "B3024",
    campaignName: "Samsung Galaxy Launch",
    serviceMonth: "2023-12",
    contractStatus: "Pending",
    invoiceStatus: "Revised",
    collectionStatus: "Partially Paid",
    hasCommercialUpdate: false,
    contractingEntity: "Samsung Electronics",
    clientReceivable: 156_000,
    settlementAmount: 98_000,
    dueDate: "2024/01/20",
    paymentProofCount: 1,
    internalNotes: "Partial wire received — reconcile with finance.",
  },
  {
    id: "B3017",
    campaignName: "Grab Food Festival",
    serviceMonth: "2023-12",
    contractStatus: "Partially Signed (Client)",
    invoiceStatus: "Cancelled",
    collectionStatus: "Fully Paid",
    hasCommercialUpdate: true,
    contractingEntity: "Grab Holdings",
    clientReceivable: 34_500,
    settlementAmount: 22_000,
    dueDate: "2024/02/28",
    paymentProofCount: 2,
    internalNotes: "KOL list expanded — update settlement schedule.",
  },
];

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length];
}

function buildClientBillingExtras(): ClientBillingRow[] {
  const campaigns = [
    "Domino's SG Q2",
    "Moca Promo April",
    "KOLPlanet Internal QA",
    "New Launch MY",
    "Seasonal Campaign ID",
    "Brand Awareness CA",
    "Summer Sale IN",
    "Campus Ambassador Program",
    "Creator Fund Pilot",
    "Regional Awareness Push",
  ];
  const entities = [
    "EA Sales Est",
    "Tencent Games Publishing",
    "Spotify AB",
    "Nike Inc.",
    "Samsung Electronics",
    "Grab Holdings",
    "ByteDance Ltd",
    "Unilever SEA",
  ];
  const months = ["2024-02", "2024-01", "2023-12", "2023-11"];
  const contractStatuses = CONTRACT_STATUS_OPTIONS;
  const invoiceStatuses = INVOICE_STATUS_OPTIONS;
  const collectionStatuses = COLLECTION_STATUS_OPTIONS;

  return Array.from({ length: 24 }, (_, i) => {
    const id = `B2${String(990 - i).padStart(3, "0")}`;
    const clientReceivable = 8_000 + (i % 12) * 7_500;
    const settlementAmount =
      pick(collectionStatuses, i) === "Unpaid" ? 0 : Math.round(clientReceivable * (0.4 + (i % 5) * 0.12));
    return {
      id,
      campaignName: pick(campaigns, i),
      serviceMonth: pick(months, i),
      contractStatus: pick(contractStatuses, i),
      invoiceStatus: pick(invoiceStatuses, i),
      collectionStatus: pick(collectionStatuses, i),
      hasCommercialUpdate: i % 4 === 0,
      contractingEntity: pick(entities, i),
      clientReceivable,
      settlementAmount,
      dueDate: `2024/${String((i % 12) + 1).padStart(2, "0")}/${String(10 + (i % 18)).padStart(2, "0")}`,
      paymentProofCount: i % 3,
      internalNotes: pick(
        [
          "Awaiting countersigned contract before invoice issue.",
          "Partial wire received — reconcile with finance.",
          "Closed loop — all influencers paid.",
          "Scope revision pending legal review.",
          "Client requested split billing across two entities.",
        ],
        i
      ),
    };
  });
}

export const CLIENT_BILLING_ROWS: ClientBillingRow[] = [
  ...BASE_CLIENT_BILLING_ROWS,
  ...buildClientBillingExtras(),
];

const BASE_SETTLEMENT_ROWS: ClientSettlementRow[] = [
    {
      id: "CS-01",
      name: "Amelia Stone",
      handle: "@instagram ins",
      platform: "Instagram",
      kolManager: "Moca",
      relationship: "Manager",
      settlementStatus: "Waiting for Validation",
      approvedAmount: 4_100,
      amountPaid: 0,
      balance: 4_100,
      dueDate: "Feb 11, 2024",
      note: "Rev. 2 invoice sent after tax update.",
    },
    {
      id: "CS-02",
      name: "Lucas Turner",
      handle: "@lucasturner",
      platform: "Instagram",
      kolManager: "Chris",
      relationship: "Direct",
      settlementStatus: "Partially Paid",
      approvedAmount: 10_000,
      amountPaid: 0,
      balance: 10_000,
      dueDate: "Feb 15, 2024",
      note: "First installment pending bank confirmation.",
    },
    {
      id: "CS-03",
      name: "Mia Chen",
      handle: "@miachen",
      platform: "Instagram",
      kolManager: "Moca",
      relationship: "MCN",
      settlementStatus: "Validated",
      approvedAmount: 6_500,
      amountPaid: 3_200,
      balance: 3_300,
      dueDate: "Feb 18, 2024",
      note: "Validated by finance on May 05.",
    },
    {
      id: "CS-04",
      name: "Jordan Lee",
      handle: "@jordanlee",
      platform: "Instagram",
      kolManager: "Wollin",
      relationship: "Manager",
      settlementStatus: "All Paid",
      approvedAmount: 2_800,
      amountPaid: 2_800,
      balance: 0,
      dueDate: "Jan 30, 2024",
      note: "Completed — proof uploaded.",
    },
    {
      id: "CS-05",
      name: "Priya Sharma",
      handle: "@priyasharma",
      platform: "Instagram",
      kolManager: "Chris",
      relationship: "Direct",
      settlementStatus: "Rejected",
      approvedAmount: 5_000,
      amountPaid: 0,
      balance: 5_000,
      dueDate: "Feb 20, 2024",
      note: "Missing deliverable evidence.",
    },
];

function buildSettlementExtras(billingId: string, count: number): ClientSettlementRow[] {
  const names = [
    "Noah Williams",
    "Emma Davis",
    "Oliver Brown",
    "Sophia Wilson",
    "Liam Martinez",
    "Ava Anderson",
    "Ethan Thomas",
    "Isabella Taylor",
    "Mason Moore",
    "Charlotte Jackson",
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
    "@masonm",
    "@charlottej",
  ];
  const statuses: ClientSettlementStatus[] = [
    "Waiting for Validation",
    "Partially Paid",
    "Validated",
    "All Paid",
    "Rejected",
  ];
  const notes = [
    "Rev. 2 invoice sent after tax update.",
    "First installment pending bank confirmation.",
    "Validated by finance on May 05.",
    "Completed — proof uploaded.",
    "Missing deliverable evidence.",
  ];
  const managers = ["Moca", "Chris", "Wollin"];
  const relationships: KolRelationship[] = ["Direct", "Manager", "MCN"];

  return Array.from({ length: count }, (_, i) => {
    const status = pick(statuses, i);
    const approvedAmount = 2_500 + (i % 8) * 1_250;
    const amountPaid =
      status === "All Paid"
        ? approvedAmount
        : status === "Partially Paid" || status === "Validated"
          ? Math.round(approvedAmount * (0.2 + (i % 4) * 0.15))
          : 0;
    const balance = Math.max(0, approvedAmount - amountPaid);
    return {
      id: `${billingId}-CS-${String(i + 6).padStart(2, "0")}`,
      name: pick(names, i),
      handle: pick(handles, i),
      platform: "Instagram",
      kolManager: pick(managers, i),
      relationship: pick(relationships, i),
      settlementStatus: status,
      approvedAmount,
      amountPaid,
      balance,
      dueDate: `Feb ${String(10 + (i % 18)).padStart(2, "0")}, 2024`,
      note: pick(notes, i),
    };
  });
}

export const CLIENT_SETTLEMENT_BY_BILLING: Record<string, ClientSettlementRow[]> = {
  B3038: BASE_SETTLEMENT_ROWS,
};

export function getBillingRow(id: string) {
  return CLIENT_BILLING_ROWS.find((row) => row.id === id);
}

export function getSettlementRows(billingId: string) {
  const base = CLIENT_SETTLEMENT_BY_BILLING[billingId] ?? BASE_SETTLEMENT_ROWS;
  if (base.length >= 25) return base;
  return [...base, ...buildSettlementExtras(billingId, 25 - base.length)];
}
