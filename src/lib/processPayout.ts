/** Installment rows shown in Process Payout — sourced from Approve Payout approved amount step */

export type BasisInstallmentStatus = "Pending" | "Voided" | "Successful" | "Failed";

export type PayoutBasisInstallment = {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  status: BasisInstallmentStatus;
  /** When status is Successful — shown as "Successful paid: …" on the left */
  paidAt?: string;
};

export type PaymentExecutionStatus = "Successful" | "Failed" | "Pending";

export type PaymentExecutionDraft = {
  checked: boolean;
  amount: string;
  dueDate: string;
  submitted: boolean;
  paymentStatus: PaymentExecutionStatus;
  submissionDate: string;
  proofFileName: string | null;
  proofRequiredHint: boolean;
};

/** Automated API Payout — provider options shown in Process Payout */
export const API_PAYOUT_PROVIDERS = [
  { value: "airwallex", label: "Airwallex" },
  { value: "wise", label: "Wise Business" },
  { value: "stripe", label: "Stripe Connect" },
  { value: "paypal", label: "PayPal Payouts" },
] as const;

export const PROCESS_PAYOUT_SNAPSHOT = {
  currency: "USD",
  contractTotal: 10_000,
  paymentRemarks: "喊打死的",
  invoiceAmount: 10_000,
  paymentMethod: "50% Advance",
  paymentTerm: "45 Days",
  bank: {
    beneficiaryName: "Blue Orbit Media Pte. Ltd.",
    beneficiaryBank: "Bank of China",
    accountNumber: "6222 8888 0000 1234",
    swiftCode: "BKCHCNBJ300",
    bankAddress: "1 Raffles Place, Singapore 048616",
  },
  contractFiles: [
    { name: "Signed_IO_V1_Original.pdf", uploadedAt: "May 05, 2026" },
    { name: "KOL_Addendum_2026-03-31.pdf", uploadedAt: "May 05, 2026" },
  ],
  invoiceFile: { name: "开票文件.png", uploadedAt: "May 05, 2026" },
  invoiceNumber: "INV-20250706-12343-91234-001",
} as const;

/** Approve Payout → Process Payout (mock mirrors post-approval state) */
export const DEFAULT_BASIS_INSTALLMENTS: PayoutBasisInstallment[] = [
  {
    id: "inst-1",
    title: "Installment 1",
    amount: 10_000,
    dueDate: "Jan 01, 2024",
    status: "Voided",
  },
  {
    id: "inst-2",
    title: "Installment 2",
    amount: 1_000,
    dueDate: "May 29, 2026",
    status: "Successful",
    paidAt: "May 27, 2026",
  },
  {
    id: "inst-3",
    title: "Installment 3",
    amount: 2_000,
    dueDate: "May 29, 2026",
    status: "Successful",
    paidAt: "May 27, 2026",
  },
  {
    id: "inst-4",
    title: "Installment 4",
    amount: 3_000,
    dueDate: "May 29, 2026",
    status: "Pending",
  },
  {
    id: "inst-5",
    title: "Installment 5",
    amount: 4_000,
    dueDate: "May 29, 2026",
    status: "Pending",
  },
];

export type ApprovePayoutInstallmentInput = {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  inactive?: "voided" | "removed";
  alreadyPaid?: { paidAt: string };
};

/** Map installments from Approve Payout (approved amount) into Process Payout basis rows */
export function buildBasisFromApprovePayout(
  installments: ApprovePayoutInstallmentInput[]
): PayoutBasisInstallment[] {
  return installments.map((row) => {
    if (row.inactive === "voided") {
      return {
        id: row.id,
        title: row.title,
        amount: row.amount,
        dueDate: row.dueDate,
        status: "Voided",
      };
    }
    if (row.inactive === "removed") {
      return {
        id: row.id,
        title: row.title,
        amount: row.amount,
        dueDate: row.dueDate,
        status: "Voided",
      };
    }
    if (row.alreadyPaid) {
      return {
        id: row.id,
        title: row.title,
        amount: row.amount,
        dueDate: row.dueDate,
        status: "Successful",
        paidAt: row.alreadyPaid.paidAt,
      };
    }
    return {
      id: row.id,
      title: row.title,
      amount: row.amount,
      dueDate: row.dueDate,
      status: "Pending",
    };
  });
}

export function isExecutableBasisInstallment(row: PayoutBasisInstallment) {
  return row.status === "Pending";
}

export function createExecutionDrafts(
  installments: PayoutBasisInstallment[]
): Record<string, PaymentExecutionDraft> {
  const drafts: Record<string, PaymentExecutionDraft> = {};
  for (const row of installments.filter(isExecutableBasisInstallment)) {
    drafts[row.id] = {
      checked: false,
      amount: String(row.amount),
      dueDate: row.dueDate,
      submitted: false,
      paymentStatus: "Successful",
      submissionDate: "2026/05/27",
      proofFileName: null,
      proofRequiredHint: false,
    };
  }
  return drafts;
}

export function parseAmountInput(value: string) {
  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

/** Display date for left card after successful update */
export function formatPaidAtLabel(submissionDate: string) {
  const normalized = submissionDate.replace(/\//g, "-");
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return submissionDate;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function mapExecutionToBasisStatus(
  status: PaymentExecutionStatus
): BasisInstallmentStatus {
  if (status === "Successful") return "Successful";
  if (status === "Failed") return "Failed";
  return "Pending";
}
