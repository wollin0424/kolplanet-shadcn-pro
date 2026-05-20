export type LogisticsStatus = "Recruiting" | "To Ship" | "In Transit" | "Delivered";
export type ScriptStatus = "Recruiting" | "Pending" | "Needs Revision" | "Approved";
export type ContentStatus = "Recruiting" | "Video Pending" | "Copy Approved" | "Approved";
export type PostingStatus = "Recruiting" | "Ready" | "In Progress" | "Posted";
export type PaymentStatus = "Recruiting" | "Invoice Uploaded" | "Validated";

export type CollabStatus = "Pending" | "Approved" | "Posted" | "Done" | "Terminated";

export type StageStatus =
  | LogisticsStatus
  | ScriptStatus
  | ContentStatus
  | PostingStatus
  | PaymentStatus;

/** Shared 5-step scale for stage progress rings in the table. */
export const STAGE_PROGRESS_TOTAL = 5;

type BadgeTone = "amber" | "green" | "sky" | "gray" | "brand" | "violet";

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
  green: "text-emerald-700",
  sky: "text-sky-700",
  gray: "text-gray-600",
  brand: "text-brand",
  violet: "text-violet-700",
};

export function getStageToneTextClass(tone: BadgeTone) {
  return toneTextClass[tone];
}

export const COLLAB_STATUS_OPTIONS: CollabStatus[] = [
  "Pending",
  "Approved",
  "Posted",
  "Done",
  "Terminated",
];

const badgeClass: Record<BadgeTone, string> = {
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  sky: "bg-sky-50 text-sky-700 border-sky-200",
  gray: "bg-gray-50 text-gray-600 border-gray-200",
  brand: "bg-brand-50 text-brand border-brand-100",
  violet: "bg-violet-50 text-violet-700 border-violet-200",
};

export function getStageBadgeClass(tone: BadgeTone) {
  return badgeClass[tone];
}

const toneDotClass: Record<BadgeTone, string> = {
  amber: "bg-amber-400",
  green: "bg-emerald-500",
  sky: "bg-sky-400",
  gray: "bg-gray-400",
  brand: "bg-brand",
  violet: "bg-violet-400",
};

export function getStageToneDotClass(tone: BadgeTone) {
  return toneDotClass[tone];
}

/** Colored pill styles applied on table row hover (Tailwind needs static class names). */
const hoverPillClass: Record<BadgeTone, string> = {
  amber:
    "group-hover:bg-amber-50 group-hover:text-amber-700 group-hover:border-amber-200",
  green:
    "group-hover:bg-emerald-50 group-hover:text-emerald-700 group-hover:border-emerald-200",
  sky: "group-hover:bg-sky-50 group-hover:text-sky-700 group-hover:border-sky-200",
  gray: "group-hover:bg-gray-50 group-hover:text-gray-600 group-hover:border-gray-200",
  brand: "group-hover:bg-brand-50 group-hover:text-brand group-hover:border-brand-100",
  violet:
    "group-hover:bg-violet-50 group-hover:text-violet-700 group-hover:border-violet-200",
};

export function getStageHoverPillClass(tone: BadgeTone) {
  return hoverPillClass[tone];
}

export const LOGISTICS_STATUS_CONFIG: Record<LogisticsStatus, StageBadgeConfig> = {
  Recruiting: { label: "Recruiting", tone: "amber", progressStep: 1 },
  "To Ship": { label: "To Ship", tone: "amber", progressStep: 2 },
  "In Transit": { label: "In Transit", tone: "sky", progressStep: 3 },
  Delivered: { label: "Delivered", tone: "green", progressStep: 5, completed: true },
};

export const SCRIPT_STATUS_CONFIG: Record<ScriptStatus, StageBadgeConfig> = {
  Recruiting: { label: "Recruiting", tone: "amber", progressStep: 1 },
  Pending: { label: "Pending", tone: "amber", progressStep: 2 },
  "Needs Revision": { label: "Needs Revision", tone: "gray", progressStep: 2 },
  Approved: { label: "Approved", tone: "green", progressStep: 5, completed: true },
};

export const CONTENT_STATUS_CONFIG: Record<ContentStatus, StageBadgeConfig> = {
  Recruiting: { label: "Recruiting", tone: "amber", progressStep: 1 },
  "Video Pending": { label: "Video Pending", tone: "amber", progressStep: 2 },
  "Copy Approved": { label: "Copy Approved", tone: "sky", progressStep: 4 },
  Approved: { label: "Approved", tone: "green", progressStep: 5, completed: true },
};

export const POSTING_STATUS_CONFIG: Record<PostingStatus, StageBadgeConfig> = {
  Recruiting: { label: "Recruiting", tone: "amber", progressStep: 1 },
  Ready: { label: "Ready", tone: "sky", progressStep: 3 },
  "In Progress": { label: "In Progress", tone: "brand", progressStep: 4 },
  Posted: { label: "Posted", tone: "green", progressStep: 5, completed: true },
};

export const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, StageBadgeConfig> = {
  Recruiting: { label: "Recruiting", tone: "amber", progressStep: 1 },
  "Invoice Uploaded": { label: "Invoice Uploaded", tone: "gray", progressStep: 3 },
  Validated: { label: "Validated", tone: "sky", progressStep: 5, completed: true },
};

export const COLLAB_STATUS_CONFIG: Record<
  CollabStatus,
  { label: string; tone: BadgeTone; showCheck?: boolean }
> = {
  Pending: { label: "Pending", tone: "amber" },
  Approved: { label: "Approved", tone: "brand" },
  Posted: { label: "Posted", tone: "green", showCheck: true },
  Done: { label: "Done", tone: "green", showCheck: true },
  Terminated: { label: "Terminated", tone: "gray" },
};
