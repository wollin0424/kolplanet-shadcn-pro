export type ContractStatus =
  | "Pending"
  | "Awaiting KOL Info"
  | "Agreement Generated"
  | "Platform Signed"
  | "Countersigned"
  | "Addendum Generated";

/** Aligned with Campaign Hub pipeline cards (logistics + sub-status tags). */
export type LogisticsStatus =
  | "Received"
  | "Delivered"
  | "In Transit"
  | "Out of Delivery"
  | "Awaiting Pickup"
  | "Delivery Failed";

export type ScriptStatus = "Pending" | "Waiting for Approval" | "Approved";

export type ContentStatus = "Video Pending" | "Copy Approved" | "Approved";

export type PostingStatus = "Ready" | "In Progress" | "Posted";

export type PaymentStatus =
  | "Partially Paid"
  | "Validated"
  | "All Paid"
  | "Waiting for Validation"
  | "Rejected";

export type CollabStatus =
  | "Pending"
  | "Invited"
  | "In Negotiation"
  | "Approved"
  | "Active"
  | "Completed"
  | "On Hold"
  | "Terminated";

export type StageStatus =
  | ContractStatus
  | LogisticsStatus
  | ScriptStatus
  | ContentStatus
  | PostingStatus
  | PaymentStatus;

/** Shared 5-step scale for stage progress rings in the table. */
export const STAGE_PROGRESS_TOTAL = 5;

/**
 * Canonical 8-hue pill palette — all status tags map to one of these (no orange/teal;
 * they were too close to amber and green/sky). Semantic reuse is OK across columns.
 */
export type BadgeTone =
  | "amber"
  | "sky"
  | "violet"
  | "brand"
  | "green"
  | "rose"
  | "indigo"
  | "gray";

/** Preview / docs: one status per tone in Collaboration column */
export const BADGE_TONE_PALETTE: { tone: BadgeTone; hint: string }[] = [
  { tone: "amber", hint: "Warning / in progress" },
  { tone: "sky", hint: "Info / invited" },
  { tone: "violet", hint: "Review / negotiation" },
  { tone: "brand", hint: "Approved / primary" },
  { tone: "indigo", hint: "Active / in progress" },
  { tone: "green", hint: "Completed / success" },
  { tone: "rose", hint: "Risk / on hold" },
  { tone: "gray", hint: "Pending / terminated / inactive" },
];

export type StageBadgeConfig = {
  label: string;
  tone: BadgeTone;
  /** Filled arc on ring: 0–5 → 0%–100% of STAGE_PROGRESS_TOTAL */
  progressStep: number;
  /** Terminal done state → check icon instead of progress ring */
  completed?: boolean;
};

const toneTextClass: Record<BadgeTone, string> = {
  amber: "text-amber-700",
  sky: "text-sky-700",
  violet: "text-violet-700",
  brand: "text-brand",
  green: "text-emerald-700",
  rose: "text-rose-700",
  indigo: "text-indigo-700",
  gray: "text-gray-600",
};

export function getStageToneTextClass(tone: BadgeTone) {
  return toneTextClass[tone];
}

export const COLLAB_STATUS_OPTIONS: CollabStatus[] = [
  "Pending",
  "Invited",
  "In Negotiation",
  "Approved",
  "Active",
  "Completed",
  "On Hold",
  "Terminated",
];

const badgeClass: Record<BadgeTone, string> = {
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  sky: "bg-sky-50 text-sky-700 border-sky-200",
  violet: "bg-violet-50 text-violet-700 border-violet-200",
  brand: "bg-brand-50 text-brand border-brand-100",
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rose: "bg-rose-50 text-rose-700 border-rose-200",
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
  gray: "bg-gray-50 text-gray-600 border-gray-200",
};

export function getStageBadgeClass(tone: BadgeTone) {
  return badgeClass[tone];
}

/** Compact status pill — Script hub KOL list + draft review (21px tall). */
export const STAGE_STATUS_PILL_CLASS =
  "inline-flex shrink-0 items-center h-[21px] rounded-full border px-2 text-[10px] font-semibold leading-none";

const toneDotClass: Record<BadgeTone, string> = {
  amber: "bg-amber-400",
  sky: "bg-sky-400",
  violet: "bg-violet-400",
  brand: "bg-brand",
  green: "bg-emerald-500",
  rose: "bg-rose-500",
  indigo: "bg-indigo-500",
  gray: "bg-gray-400",
};

export function getStageToneDotClass(tone: BadgeTone) {
  return toneDotClass[tone];
}

/** Colored pill styles applied on table row hover (Tailwind needs static class names). */
const hoverPillClass: Record<BadgeTone, string> = {
  amber:
    "group-hover:bg-amber-50 group-hover:text-amber-700 group-hover:border-amber-200",
  sky: "group-hover:bg-sky-50 group-hover:text-sky-700 group-hover:border-sky-200",
  violet:
    "group-hover:bg-violet-50 group-hover:text-violet-700 group-hover:border-violet-200",
  brand: "group-hover:bg-brand-50 group-hover:text-brand group-hover:border-brand-100",
  green:
    "group-hover:bg-emerald-50 group-hover:text-emerald-700 group-hover:border-emerald-200",
  rose: "group-hover:bg-rose-50 group-hover:text-rose-700 group-hover:border-rose-200",
  indigo:
    "group-hover:bg-indigo-50 group-hover:text-indigo-700 group-hover:border-indigo-200",
  gray: "group-hover:bg-gray-50 group-hover:text-gray-600 group-hover:border-gray-200",
};

export function getStageHoverPillClass(tone: BadgeTone) {
  return hoverPillClass[tone];
}

export const CONTRACT_STATUS_CONFIG: Record<ContractStatus, StageBadgeConfig> = {
  Pending: {
    label: "Pending",
    tone: "gray",
    progressStep: 1,
  },
  "Awaiting KOL Info": {
    label: "Awaiting KOL Info",
    tone: "amber",
    progressStep: 2,
  },
  "Agreement Generated": {
    label: "Agreement Generated",
    tone: "amber",
    progressStep: 3,
  },
  "Platform Signed": {
    label: "Platform Signed",
    tone: "amber",
    progressStep: 4,
  },
  Countersigned: {
    label: "Countersigned",
    tone: "green",
    progressStep: 5,
    completed: true,
  },
  "Addendum Generated": {
    label: "Addendum Generated",
    tone: "amber",
    progressStep: 4,
  },
};

export const LOGISTICS_STATUS_CONFIG: Record<LogisticsStatus, StageBadgeConfig> = {
  Received: { label: "Received", tone: "amber", progressStep: 1 },
  Delivered: { label: "Delivered", tone: "green", progressStep: 5, completed: true },
  "In Transit": { label: "In Transit", tone: "sky", progressStep: 3 },
  "Out of Delivery": { label: "Out of Delivery", tone: "violet", progressStep: 4 },
  "Awaiting Pickup": { label: "Awaiting Pickup", tone: "amber", progressStep: 2 },
  "Delivery Failed": { label: "Delivery Failed", tone: "rose", progressStep: 1 },
};

export const SCRIPT_STATUS_CONFIG: Record<ScriptStatus, StageBadgeConfig> = {
  Pending: { label: "Pending", tone: "gray", progressStep: 1 },
  "Waiting for Approval": {
    label: "Waiting for Approval",
    tone: "brand",
    progressStep: 2,
  },
  Approved: { label: "Approved", tone: "green", progressStep: 5, completed: true },
};

/** Campaign Hub → Content table (Script / Visual / Caption columns). */
export type ContentHubStageStatus = "Approved" | "Under Review" | "Pending";

export const CONTENT_HUB_STAGE_STATUS_CONFIG: Record<
  ContentHubStageStatus,
  StageBadgeConfig
> = {
  Pending: { label: "Pending", tone: "gray", progressStep: 1 },
  "Under Review": { label: "Under Review", tone: "sky", progressStep: 3 },
  Approved: { label: "Approved", tone: "green", progressStep: 5, completed: true },
};

/** Segment fills — solid pastels aligned with HubStatus pill borders (no opacity / ring). */
export const CONTENT_HUB_STAGE_BAR_FILL: Record<ContentHubStageStatus, string> = {
  Pending: "bg-gray-200",
  "Under Review": "bg-sky-200",
  Approved: "bg-emerald-200",
};

export const CONTENT_STATUS_CONFIG: Record<ContentStatus, StageBadgeConfig> = {
  "Video Pending": { label: "Video Pending", tone: "gray", progressStep: 2 },
  "Copy Approved": { label: "Copy Approved", tone: "sky", progressStep: 4 },
  Approved: { label: "Approved", tone: "green", progressStep: 5, completed: true },
};

export const POSTING_STATUS_CONFIG: Record<PostingStatus, StageBadgeConfig> = {
  Ready: { label: "Ready", tone: "sky", progressStep: 3 },
  "In Progress": { label: "In Progress", tone: "amber", progressStep: 4 },
  Posted: { label: "Posted", tone: "green", progressStep: 5, completed: true },
};

export const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, StageBadgeConfig> = {
  "Partially Paid": { label: "Partially Paid", tone: "sky", progressStep: 3 },
  Validated: { label: "Validated", tone: "amber", progressStep: 4 },
  "All Paid": { label: "All Paid", tone: "green", progressStep: 5, completed: true },
  "Waiting for Validation": {
    label: "Waiting for Validation",
    tone: "amber",
    progressStep: 2,
  },
  Rejected: { label: "Rejected", tone: "rose", progressStep: 1 },
};

export const COLLAB_STATUS_CONFIG: Record<
  CollabStatus,
  { label: string; tone: BadgeTone }
> = {
  Pending: { label: "Pending", tone: "gray" },
  Invited: { label: "Invited", tone: "sky" },
  "In Negotiation": { label: "In Negotiation", tone: "violet" },
  Approved: { label: "Approved", tone: "brand" },
  Active: { label: "Active", tone: "indigo" },
  Completed: { label: "Completed", tone: "green" },
  "On Hold": { label: "On Hold", tone: "rose" },
  Terminated: { label: "Terminated", tone: "gray" },
};
