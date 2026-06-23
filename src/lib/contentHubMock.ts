import type { KolRelationship } from "@/components/InfluencerMetaIcons";
import { ensureContentScriptReviewDemoData } from "@/lib/contentScriptReviewDemo";
import { getCaptionCoverSubmissions } from "@/lib/captionCoverSubmissions";
import {
  getScriptDraftSubmissions,
  type ScriptDraftStatus,
} from "@/lib/scriptDraftSubmissions";
import {
  type ContentHubStageStatus,
} from "@/lib/pipeline/stageStatuses";

export const CONTENT_HUB_STAGE_ORDER: ContentHubStageStatus[] = [
  "Pending",
  "Under Review",
  "Approved",
];

export type ContentHubRow = {
  id: string;
  name: string;
  handle: string;
  platform: string;
  manager: string;
  relationship: KolRelationship;
  h5Path: string;
  script: { status: ContentHubStageStatus; updatedAt: string };
  visual: { status: ContentHubStageStatus; updatedAt: string };
  caption: { status: ContentHubStageStatus; updatedAt: string };
  scriptOverdue: boolean;
  visualOverdue: boolean;
};

function mapSubmissionStatusToHubStatus(
  status: ScriptDraftStatus | undefined,
  hasSubmissions: boolean
): ContentHubStageStatus {
  if (!hasSubmissions) return "Pending";
  if (status === "Approved") return "Approved";
  return "Under Review";
}

function seedContentHubLiveDemoData(rowId: string) {
  ensureContentScriptReviewDemoData(rowId);
  ensureContentScriptReviewDemoData(`${rowId}-video`);
  ensureContentScriptReviewDemoData(`${rowId}-caption`);
}

/** Merges mock row metadata with script / visual / caption submission state from localStorage. */
export function mergeContentHubRowWithLiveStatus(row: ContentHubRow): ContentHubRow {
  if (typeof window === "undefined") return row;

  seedContentHubLiveDemoData(row.id);

  const scriptSubmissions = getScriptDraftSubmissions(row.id);
  const visualSubmissions = getScriptDraftSubmissions(`${row.id}-video`);
  const captionSubmissions = getCaptionCoverSubmissions(`${row.id}-caption`);

  const scriptLatest = scriptSubmissions[scriptSubmissions.length - 1];
  const visualLatest = visualSubmissions[visualSubmissions.length - 1];
  const captionLatest = captionSubmissions[captionSubmissions.length - 1];

  return {
    ...row,
    script: {
      status: mapSubmissionStatusToHubStatus(scriptLatest?.status, scriptSubmissions.length > 0),
      updatedAt: scriptLatest?.submittedAt ?? row.script.updatedAt,
    },
    visual: {
      status: mapSubmissionStatusToHubStatus(visualLatest?.status, visualSubmissions.length > 0),
      updatedAt: visualLatest?.submittedAt ?? row.visual.updatedAt,
    },
    caption: {
      status: mapSubmissionStatusToHubStatus(captionLatest?.status, captionSubmissions.length > 0),
      updatedAt: captionLatest?.submittedAt ?? row.caption.updatedAt,
    },
  };
}

export function getContentHubRowsWithLiveStatus(
  rows: ContentHubRow[] = CONTENT_HUB_MOCK_ROWS
): ContentHubRow[] {
  return rows.map(mergeContentHubRowWithLiveStatus);
}

export const CONTENT_HUB_MOCK_ROWS: ContentHubRow[] = [
  {
    id: "s1",
    name: "Amelia Stone",
    handle: "@instagram ins",
    platform: "Instagram",
    manager: "Wollin",
    relationship: "Manager",
    h5Path: "/h5/kol-info/s1",
    script: { status: "Approved", updatedAt: "Jun 26, 2026 13:07" },
    visual: { status: "Approved", updatedAt: "Jun 26, 2026 13:07" },
    caption: { status: "Under Review", updatedAt: "Jun 26, 2026 13:07" },
    scriptOverdue: false,
    visualOverdue: false,
  },
  {
    id: "s2",
    name: "Ava Collins",
    handle: "@avacollins",
    platform: "Instagram",
    manager: "Wollin",
    relationship: "Direct",
    h5Path: "/h5/kol-info/s2",
    script: { status: "Approved", updatedAt: "Jun 24, 2026 11:20" },
    visual: { status: "Under Review", updatedAt: "Jun 25, 2026 09:15" },
    caption: { status: "Pending", updatedAt: "—" },
    scriptOverdue: false,
    visualOverdue: false,
  },
  {
    id: "s3",
    name: "Ethan Carter",
    handle: "@foodie.my",
    platform: "Instagram",
    manager: "Chris",
    relationship: "Manager",
    h5Path: "/h5/kol-info/s3",
    script: { status: "Under Review", updatedAt: "Jun 22, 2026 16:40" },
    visual: { status: "Pending", updatedAt: "—" },
    caption: { status: "Pending", updatedAt: "—" },
    scriptOverdue: true,
    visualOverdue: false,
  },
  {
    id: "s4",
    name: "Lucas Turner",
    handle: "@lucasturner",
    platform: "TikTok",
    manager: "Wollin",
    relationship: "Direct",
    h5Path: "/h5/kol-info/s4",
    script: { status: "Pending", updatedAt: "—" },
    visual: { status: "Pending", updatedAt: "—" },
    caption: { status: "Pending", updatedAt: "—" },
    scriptOverdue: false,
    visualOverdue: false,
  },
  {
    id: "s5",
    name: "Mia Sullivan",
    handle: "@miachen",
    platform: "Instagram",
    manager: "Moca",
    relationship: "MCN",
    h5Path: "/h5/kol-info/s5",
    script: { status: "Approved", updatedAt: "Jun 20, 2026 14:05" },
    visual: { status: "Approved", updatedAt: "Jun 21, 2026 10:30" },
    caption: { status: "Approved", updatedAt: "Jun 23, 2026 08:12" },
    scriptOverdue: false,
    visualOverdue: false,
  },
  {
    id: "s6",
    name: "James Miller",
    handle: "@jamesm",
    platform: "YouTube",
    manager: "Chris",
    relationship: "Manager",
    h5Path: "/h5/kol-info/s6",
    script: { status: "Approved", updatedAt: "Jun 19, 2026 18:22" },
    visual: { status: "Under Review", updatedAt: "Jun 25, 2026 12:00" },
    caption: { status: "Pending", updatedAt: "—" },
    scriptOverdue: false,
    visualOverdue: true,
  },
  {
    id: "s7",
    name: "Priya Sharma",
    handle: "@priyasharma",
    platform: "Instagram",
    manager: "Wollin",
    relationship: "Direct",
    h5Path: "/h5/kol-info/s7",
    script: { status: "Under Review", updatedAt: "Jun 23, 2026 15:48" },
    visual: { status: "Pending", updatedAt: "—" },
    caption: { status: "Pending", updatedAt: "—" },
    scriptOverdue: false,
    visualOverdue: false,
  },
  {
    id: "s8",
    name: "Jordan Lee",
    handle: "@jordanlee",
    platform: "TikTok",
    manager: "Chris",
    relationship: "Direct",
    h5Path: "/h5/kol-info/s8",
    script: { status: "Approved", updatedAt: "Jun 18, 2026 09:55" },
    visual: { status: "Approved", updatedAt: "Jun 19, 2026 11:10" },
    caption: { status: "Under Review", updatedAt: "Jun 24, 2026 17:33" },
    scriptOverdue: false,
    visualOverdue: false,
  },
];

export type ContentHubStageBreakdown = {
  total: number;
  counts: Record<ContentHubStageStatus, number>;
};

export type ContentHubOverviewStats = {
  kolCount: number;
  activeKolCount: number;
  script: ContentHubStageBreakdown;
  visual: ContentHubStageBreakdown;
  caption: ContentHubStageBreakdown;
};

function emptyCounts(): Record<ContentHubStageStatus, number> {
  return {
    Pending: 0,
    "Under Review": 0,
    Approved: 0,
  };
}

function aggregateStage(
  rows: ContentHubRow[],
  key: "script" | "visual" | "caption"
): ContentHubStageBreakdown {
  const counts = emptyCounts();

  for (const row of rows) {
    counts[row[key].status] += 1;
  }

  return { total: rows.length, counts };
}

export function getContentHubOverviewStats(
  rows: ContentHubRow[] = getContentHubRowsWithLiveStatus()
): ContentHubOverviewStats {
  const activeKolCount = rows.filter(
    (row) =>
      row.script.status !== "Approved" ||
      row.visual.status !== "Approved" ||
      row.caption.status !== "Approved"
  ).length;

  return {
    kolCount: rows.length,
    activeKolCount,
    script: aggregateStage(rows, "script"),
    visual: aggregateStage(rows, "visual"),
    caption: aggregateStage(rows, "caption"),
  };
}
