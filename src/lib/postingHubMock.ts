import type { StageBadgeConfig } from "@/lib/pipeline/stageStatuses";

/** Posting hub detail page statuses (dropdown options). */
export type PostingHubStatus = "Pending" | "Posted" | "Post Approved";

export type ContentValidationStatus = "Verified" | "Mismatched" | "Cannot Verify";

export type ContentValidation = {
  caption: ContentValidationStatus;
  cover: ContentValidationStatus;
  video: ContentValidationStatus;
};

export type PostLinkType = "Master" | "Mirrored";

export type PostLink = {
  type: PostLinkType;
  url: string;
  issues?: string[];
  /** Per-link actual posting date shown in Posting Date breakdown. */
  postedDate?: string;
  /** Content validation applies to Master links only. */
  validation?: ContentValidation;
};

export const POSTING_HUB_STATUS_OPTIONS: PostingHubStatus[] = [
  "Pending",
  "Posted",
  "Post Approved",
];

export const POSTING_HUB_STATUS_CONFIG: Record<PostingHubStatus, StageBadgeConfig> = {
  Pending: { label: "Pending", tone: "gray", progressStep: 2 },
  Posted: { label: "Posted", tone: "sky", progressStep: 4 },
  "Post Approved": { label: "Post Approved", tone: "green", progressStep: 5, completed: true },
};

export type PostingHubRow = {
  id: string;
  name: string;
  handle: string;
  platform: string;
  postingStatus: PostingHubStatus;
  postLinks?: PostLink[];
  insightReports?: string[];
  planDate: string;
  planTimezone?: string;
  actualDate?: string;
};

export const POSTING_HUB_MOCK_ROWS: PostingHubRow[] = [
  {
    id: "p1",
    name: "Amelia Stone",
    handle: "@instagram.ins",
    platform: "Instagram",
    postingStatus: "Posted",
    postLinks: [
      {
        type: "Master",
        url: "https://www.instagram.com/p/6-missing-mention",
        postedDate: "01 Jun, 2026",
        issues: ["Missing @mention"],
        validation: {
          caption: "Verified",
          cover: "Mismatched",
          video: "Cannot Verify",
        },
      },
      {
        type: "Mirrored",
        url: "https://www.instagram.com/p/DKx9AmeliaStone-mirror/",
        postedDate: "08 Jun, 2026",
        issues: ["Caption mismatch"],
      },
      {
        type: "Mirrored",
        url: "https://www.tiktok.com/@amelia-mirror/video/7123456789",
        postedDate: "15 Jun, 2026",
      },
      {
        type: "Mirrored",
        url: "https://www.youtube.com/watch?v=amelia-mirror",
        postedDate: "25 Jun, 2026",
        issues: ["Missing hashtag"],
      },
    ],
    insightReports: ["Amelia_Insight_Deck.pdf"],
    planDate: "Jun 30, 2026",
    actualDate: "Jun 25, 2026",
  },
  {
    id: "p2",
    name: "Ava Collins",
    handle: "@instagram.ins",
    platform: "Instagram",
    postingStatus: "Posted",
    postLinks: [
      {
        type: "Mirrored",
        url: "https://www.instagram.com/p/DKx9AvaCollins/",
        issues: ["Missing hashtag"],
      },
    ],
    planDate: "Jun 30, 2026",
    actualDate: "Jun 26, 2026",
  },
  {
    id: "p3",
    name: "Chloe Reed",
    handle: "@instagram.ins",
    platform: "Instagram",
    postingStatus: "Post Approved",
    postLinks: [
      {
        type: "Mirrored",
        url: "https://www.instagram.com/p/1-mirror-1",
        issues: ["Data fetch failed"],
      },
      {
        type: "Mirrored",
        url: "https://www.instagram.com/p/1-mirror-2",
        issues: ["Data fetch failed"],
      },
      {
        type: "Mirrored",
        url: "https://www.instagram.com/p/1-mirror-3",
        issues: ["Data fetch failed"],
      },
    ],
    insightReports: ["Chloe_Insight_Deck.pdf", "Chloe_UGC_Stats.xlsx"],
    planDate: "Jun 30, 2026",
    actualDate: "Jun 27, 2026",
  },
  {
    id: "p4",
    name: "Ella Brooks",
    handle: "@instagram.ins",
    platform: "Instagram",
    postingStatus: "Pending",
    planDate: "Jul 2, 2026",
  },
  {
    id: "p5",
    name: "Grace Turner",
    handle: "@instagram.ins",
    platform: "Instagram",
    postingStatus: "Pending",
    planDate: "Jul 3, 2026",
  },
  {
    id: "p6",
    name: "Harper Lane",
    handle: "@instagram.ins",
    platform: "Instagram",
    postingStatus: "Pending",
    planDate: "Jul 4, 2026",
  },
  {
    id: "p7",
    name: "Ivy Morgan",
    handle: "@instagram.ins",
    platform: "Instagram",
    postingStatus: "Posted",
    postLinks: [
      {
        type: "Master",
        url: "https://www.instagram.com/p/DKx9IvyMorgan/",
        validation: {
          caption: "Mismatched",
          cover: "Verified",
          video: "Verified",
        },
      },
    ],
    insightReports: ["Ivy_Performance_Report.pdf"],
    planDate: "Jul 5, 2026",
  },
  {
    id: "p8",
    name: "Jade Wilson",
    handle: "@instagram.ins",
    platform: "Instagram",
    postingStatus: "Pending",
    postLinks: [
      {
        type: "Mirrored",
        url: "https://www.instagram.com/p/DKx9JadeWilson/",
        issues: ["Private account"],
      },
    ],
    planDate: "Jul 6, 2026",
  },
];

export const POSTING_TIMEZONE_OPTIONS = [
  { value: "UTC+08:00", label: "UTC+08:00 (CN/MY/SG)" },
  { value: "UTC+07:00", label: "UTC+07:00 (TH/VN/ID)" },
  { value: "UTC", label: "UTC" },
] as const;

export function formatPostingPlanDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getPostingHubOverviewStats(rows: PostingHubRow[] = POSTING_HUB_MOCK_ROWS) {
  const total = rows.length;
  const pending = rows.filter((row) => row.postingStatus === "Pending").length;
  const posted = rows.filter((row) => row.postingStatus === "Posted").length;
  const postApproved = rows.filter((row) => row.postingStatus === "Post Approved").length;
  const completed = posted + postApproved;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { total, posted: completed, pending, postApproved, percent };
}

export function postLinkNeedsAttention(link: PostLink) {
  return getPostLinkStatus(link) !== "success";
}

export type PostLinkHealthStatus = "success" | "warning" | "error";

const POST_LINK_WARNING_ISSUES = new Set([
  "Missing hashtag",
  "Missing @mention",
]);

function getIssuesHealthStatus(issues: string[]): PostLinkHealthStatus {
  if (issues.some((issue) => !POST_LINK_WARNING_ISSUES.has(issue))) {
    return "error";
  }
  return "warning";
}

export function getPostLinkStatus(link: PostLink): PostLinkHealthStatus {
  if (link.issues?.length) return getIssuesHealthStatus(link.issues);
  if (link.type === "Master" && link.validation) {
    const statuses = [link.validation.caption, link.validation.cover, link.validation.video];
    if (statuses.some((status) => status === "Mismatched")) return "error";
    if (statuses.some((status) => status === "Cannot Verify")) return "warning";
  }
  return "success";
}

const POST_LINK_TOOLTIP_TAG_CLASS = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  error: "border-red-200 bg-red-50 text-red-700",
} as const;

const POST_LINK_ISSUE_DESCRIPTIONS: Record<string, string> = {
  "Missing hashtag": "Cannot verify because no approved baseline exists for reference.",
  "Missing @mention": "Cannot verify because no approved baseline exists for reference.",
  "Caption mismatch": "Caption text does not match the approved version.",
  "Data fetch failed": "Unable to retrieve media or content from the provided post link.",
  "Private account": "This link is not publicly accessible.",
};

export type PostLinkTooltipCopy = {
  tag: string;
  description: string;
  tagClassName: string;
};

export function getPostLinkTooltipCopy(link: PostLink): PostLinkTooltipCopy {
  if (link.issues?.[0]) {
    const tag = link.issues[0];
    const issueStatus = getIssuesHealthStatus(link.issues);
    return {
      tag,
      description: POST_LINK_ISSUE_DESCRIPTIONS[tag] ?? "This link requires manual review.",
      tagClassName: POST_LINK_TOOLTIP_TAG_CLASS[issueStatus === "error" ? "error" : "warning"],
    };
  }

  if (link.type === "Master" && link.validation) {
    const { caption, cover, video } = link.validation;
    if (caption === "Mismatched" || cover === "Mismatched" || video === "Mismatched") {
      const field =
        caption === "Mismatched" ? "Caption" : cover === "Mismatched" ? "Cover" : "Video";
      return {
        tag: "Mismatched",
        description: `${field} does not match the approved version.`,
        tagClassName: POST_LINK_TOOLTIP_TAG_CLASS.error,
      };
    }
    if (caption === "Cannot Verify" || cover === "Cannot Verify" || video === "Cannot Verify") {
      return {
        tag: "Fetch Failed",
        description: "Cannot verify because no approved baseline exists for reference.",
        tagClassName: POST_LINK_TOOLTIP_TAG_CLASS.warning,
      };
    }
  }

  return {
    tag: "Verified",
    description: "Content matches draft (AI-checked).",
    tagClassName: POST_LINK_TOOLTIP_TAG_CLASS.success,
  };
}

export function getPostLinksByType(links: PostLink[] | undefined, type: PostLinkType) {
  return links?.filter((link) => link.type === type) ?? [];
}

/** Each row has at most one Master link. */
export function getMasterPostLink(links?: PostLink[]) {
  return links?.find((link) => link.type === "Master") ?? null;
}

export function getMasterContentValidation(links?: PostLink[]): ContentValidation | null {
  return getMasterPostLink(links)?.validation ?? null;
}

export const MOCK_AUTO_VALIDATION_RESULT: ContentValidation = {
  caption: "Verified",
  cover: "Verified",
  video: "Cannot Verify",
};

export function buildMockFetchedPostLinks(row: PostingHubRow): PostLink[] {
  return [
    {
      type: "Master",
      url: `https://www.instagram.com/p/${row.id}-master/`,
      postedDate: row.actualDate ?? row.planDate,
    },
    {
      type: "Mirrored",
      url: `https://www.instagram.com/p/${row.id}-mirror-1/`,
      postedDate: row.actualDate ?? row.planDate,
    },
  ];
}

export function applyMockValidationToPostLinks(links?: PostLink[]): PostLink[] {
  return (links ?? []).map((link) =>
    link.type === "Master" ? { ...link, validation: MOCK_AUTO_VALIDATION_RESULT } : link
  );
}

export function getMirroredAggregateStatus(links: PostLink[]): PostLinkHealthStatus {
  const statuses = links.map(getPostLinkStatus);
  if (statuses.includes("error")) return "error";
  if (statuses.includes("warning")) return "warning";
  return "success";
}

export function formatPostLinkHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Link";
  }
}

export function getPostLinkDateLabel(links: PostLink[], link: PostLink): string {
  if (link.type === "Master") return "Master";
  const mirrored = getPostLinksByType(links, "Mirrored");
  const index = mirrored.indexOf(link);
  return mirrored.length === 1 ? "Mirrored" : `Mirrored ${index + 1}`;
}

export function getPostLinkDateEntries(
  links?: PostLink[]
): { label: string; date: string }[] {
  if (!links?.length) return [];

  const master = getMasterPostLink(links);
  const mirrored = getPostLinksByType(links, "Mirrored");
  const ordered = [...(master ? [master] : []), ...mirrored];

  return ordered
    .filter((link) => link.postedDate)
    .map((link) => ({
      label: getPostLinkDateLabel(links, link),
      date: link.postedDate!,
    }));
}
