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
        url: "https://www.tiktok.com/@amelia-mirror/video/7123456790",
        postedDate: "16 Jun, 2026",
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
        type: "Master",
        url: "https://www.instagram.com/p/DKx9AvaCollins-1/",
        validation: {
          caption: "Verified",
          cover: "Verified",
          video: "Verified",
        },
      },
      {
        type: "Master",
        url: "https://www.instagram.com/p/DKx9AvaCollins-2/",
        issues: ["Missing hashtag"],
        validation: {
          caption: "Cannot Verify",
          cover: "Cannot Verify",
          video: "Cannot Verify",
        },
      },
      {
        type: "Mirrored",
        url: "https://www.tiktok.com/@ava-mirror/video/1",
        issues: ["Caption mismatch"],
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
        type: "Master",
        url: "https://www.instagram.com/p/DKx9ChloeReed/",
        issues: ["Data fetch failed"],
        validation: {
          caption: "Mismatched",
          cover: "Mismatched",
          video: "Mismatched",
        },
      },
      {
        type: "Mirrored",
        url: "https://www.instagram.com/p/1-mirror-1",
        issues: ["Data fetch failed"],
      },
      {
        type: "Mirrored",
        url: "https://www.instagram.com/p/1-mirror-2",
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
        url: "https://www.instagram.com/p/DKx9IvyMorgan-1/",
        validation: {
          caption: "Verified",
          cover: "Verified",
          video: "Verified",
        },
      },
      {
        type: "Master",
        url: "https://www.instagram.com/p/DKx9IvyMorgan-2/",
        validation: {
          caption: "Mismatched",
          cover: "Mismatched",
          video: "Mismatched",
        },
      },
      {
        type: "Master",
        url: "https://www.instagram.com/p/DKx9IvyMorgan-3/",
        validation: {
          caption: "Cannot Verify",
          cover: "Cannot Verify",
          video: "Cannot Verify",
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
        type: "Master",
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
  if (!link.url.trim()) return "warning";
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

export function getVisibleMirroredLinks(links?: PostLink[]) {
  return getPostLinksByType(links, "Mirrored");
}

export function getMasterPostLinks(links?: PostLink[]) {
  return getPostLinksByType(links, "Master");
}

/** First master link, if any. */
export function getMasterPostLink(links?: PostLink[]) {
  return getMasterPostLinks(links)[0] ?? null;
}

export function getMasterLabel(index: number, total: number) {
  return total === 1 ? "Master" : `Master ${index + 1}`;
}

export function getMirroredLabel(index: number, total: number) {
  return total === 1 ? "Mirrored" : `Mirrored ${index + 1}`;
}

export function hasFetchedPostLinks(links?: PostLink[]) {
  return (links ?? []).some((link) => link.url.trim().length > 0);
}

export function getMasterContentValidation(links?: PostLink[]): ContentValidation | null {
  return getMasterPostLink(links)?.validation ?? null;
}

export type PostLinkStatusFilter = "All" | "Not Fetched Yet" | "All Verified" | "Has Exceptions";

export type ContentValidationFilter =
  | "All"
  | "All Verified"
  | "Has Mismatched"
  | "Has Fetch Failed"
  | "Has No Draft";

export const POST_LINK_STATUS_FILTER_OPTIONS: PostLinkStatusFilter[] = [
  "All",
  "Not Fetched Yet",
  "All Verified",
  "Has Exceptions",
];

export const CONTENT_VALIDATION_FILTER_OPTIONS: ContentValidationFilter[] = [
  "All",
  "All Verified",
  "Has Mismatched",
  "Has Fetch Failed",
  "Has No Draft",
];

export function getRowPostLinkFilterStatus(
  row: PostingHubRow
): "not_fetched" | "all_verified" | "has_exceptions" {
  const links = row.postLinks ?? [];
  if (!hasFetchedPostLinks(links)) return "not_fetched";
  const statuses = links.filter((link) => link.url.trim()).map(getPostLinkStatus);
  if (!statuses.length) return "not_fetched";
  if (statuses.every((status) => status === "success")) return "all_verified";
  return "has_exceptions";
}

export function matchesPostLinkStatusFilter(
  row: PostingHubRow,
  filter: PostLinkStatusFilter
): boolean {
  if (filter === "All") return true;
  const status = getRowPostLinkFilterStatus(row);
  if (filter === "Not Fetched Yet") return status === "not_fetched";
  if (filter === "All Verified") return status === "all_verified";
  if (filter === "Has Exceptions") return status === "has_exceptions";
  return true;
}

export function matchesContentValidationFilter(
  row: PostingHubRow,
  filter: ContentValidationFilter
): boolean {
  if (filter === "All") return true;

  const masters = getMasterPostLinks(row.postLinks).filter((link) => link.url.trim());

  if (filter === "Has No Draft") {
    return masters.length > 0 && masters.some((link) => !link.validation);
  }

  const validations = masters
    .map((link) => link.validation)
    .filter((validation): validation is ContentValidation => Boolean(validation));

  if (!validations.length) return false;

  const allStatuses = validations.flatMap((validation) => [
    validation.caption,
    validation.cover,
    validation.video,
  ]);

  if (filter === "All Verified") {
    return masters.every((link) => {
      if (!link.validation) return false;
      return [link.validation.caption, link.validation.cover, link.validation.video].every(
        (status) => status === "Verified"
      );
    });
  }
  if (filter === "Has Mismatched") return allStatuses.some((status) => status === "Mismatched");
  if (filter === "Has Fetch Failed") return allStatuses.some((status) => status === "Cannot Verify");
  return true;
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
      url: `https://www.instagram.com/p/${row.id}-master-1/`,
      postedDate: row.actualDate ?? row.planDate,
    },
    {
      type: "Master",
      url: `https://www.instagram.com/p/${row.id}-master-2/`,
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
  return (links ?? []).map((link) => {
    if (link.type !== "Master" || !link.url.trim() || link.validation) return link;
    return { ...link, validation: MOCK_AUTO_VALIDATION_RESULT };
  });
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
  if (link.type === "Master") {
    const masters = getMasterPostLinks(links);
    const index = masters.indexOf(link);
    return getMasterLabel(index, masters.length);
  }
  const mirrored = getPostLinksByType(links, "Mirrored");
  const index = mirrored.indexOf(link);
  return getMirroredLabel(index, mirrored.length);
}

export function getPostLinkDateEntries(
  links?: PostLink[]
): { label: string; date: string }[] {
  if (!links?.length) return [];

  const masters = getMasterPostLinks(links);
  const mirrored = getPostLinksByType(links, "Mirrored");
  const ordered = [...masters, ...mirrored];

  return ordered
    .filter((link) => link.postedDate)
    .map((link) => ({
      label: getPostLinkDateLabel(links, link),
      date: link.postedDate!,
    }));
}
