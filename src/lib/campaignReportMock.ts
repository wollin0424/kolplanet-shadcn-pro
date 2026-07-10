import { getMockInfluencerAvatar } from "@/lib/mockInfluencerAvatars";

export type ReportSection = "overview" | "influencer" | "content";

export type ReportPlatformFilter = "All" | "Instagram" | "TikTok" | "YouTube" | "RedNote";

export type FollowerTier = "Nano" | "Micro" | "Mid" | "Macro" | "Mega";

export type LeaderboardMetric = "View" | "Engagement" | "View Rate" | "Engagement Rate";

export const REPORT_SECTIONS: { id: ReportSection; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "influencer", label: "Influencer" },
  { id: "content", label: "Content" },
];

export const REPORT_OVERVIEW_ANCHORS = [
  { id: "overview", label: "Overview" },
  { id: "performance", label: "Performance" },
  { id: "efficiency", label: "Efficiency" },
  { id: "breakdown", label: "Breakdown" },
  { id: "leaderboard", label: "Leaderboard" },
  { id: "timeline", label: "Timeline" },
  { id: "top-content", label: "Top Content" },
] as const;

export const REPORT_PLATFORMS: ReportPlatformFilter[] = [
  "All",
  "Instagram",
  "TikTok",
  "YouTube",
  "RedNote",
];

export const PERFORMANCE_METRICS = [
  "Total Followers",
  "Total Views",
  "Total Likes",
  "Total Comments",
  "Total Shares",
  "Total Saves",
  "Total Engagements",
  "Engagement Rate %",
  "View Rate %",
] as const;

export const EFFICIENCY_METRICS = ["CPM", "CPV", "CPE"] as const;

export const BREAKDOWN_TIERS: FollowerTier[] = ["Nano", "Micro", "Mid", "Macro", "Mega"];

export const BREAKDOWN_ROWS = [
  { label: "Influencers Engaged", icon: "users" as const, values: ["1", "3", "2", "2", "1"] },
  { label: "Posts Published", icon: "clapperboard" as const, values: ["3", "3", "3", "2", "1"] },
  { label: "Views", icon: "eye" as const, values: ["21.46k", "166.21k", "372.38k", "1.11M", "1.11M"] },
  {
    label: "Engagements",
    icon: "trending" as const,
    values: ["1.31k", "8.41k", "22.72k", "52.07k", "52.38k"],
  },
  { label: "View Rate", icon: "percent" as const, values: ["218.9%", "209.6%", "83.3%", "76.4%", "73.9%"] },
  {
    label: "Engagement Rate",
    icon: "percent" as const,
    values: ["6.1%", "5.2%", "6.1%", "4.7%", "4.7%"],
  },
] as const;

export type ReportInfluencerRow = {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  platform: string;
  postLinks: string[];
  followerTier: FollowerTier;
  followers: string;
  views: string;
  likes: string;
  comments: string;
  shares: string;
  saves: string;
  totalEngagement: string;
  viewRate: string;
  engagementRate: string;
};

const INFLUENCER_ROWS: Omit<ReportInfluencerRow, "avatarUrl">[] = [
  {
    id: "r1",
    name: "Amelia Stone",
    handle: "@amelia.stone",
    platform: "Instagram",
    postLinks: ["Master 1", "Mirrored 1"],
    followerTier: "Mid",
    followers: "1.51M",
    views: "27.05K",
    likes: "4.33K",
    comments: "757",
    shares: "487",
    saves: "379",
    totalEngagement: "5.96K",
    viewRate: "276.0%",
    engagementRate: "22.0%",
  },
  {
    id: "r2",
    name: "Lucas Turner",
    handle: "@lucas.turner",
    platform: "Instagram",
    postLinks: ["Master 1"],
    followerTier: "Mid",
    followers: "1.48M",
    views: "26.10K",
    likes: "4.10K",
    comments: "701",
    shares: "460",
    saves: "350",
    totalEngagement: "5.61K",
    viewRate: "268.0%",
    engagementRate: "21.5%",
  },
  {
    id: "r3",
    name: "Mia Chen",
    handle: "@mia.chen",
    platform: "TikTok",
    postLinks: ["Master 1"],
    followerTier: "Micro",
    followers: "78.60K",
    views: "18.42K",
    likes: "2.88K",
    comments: "512",
    shares: "320",
    saves: "240",
    totalEngagement: "3.95K",
    viewRate: "234.0%",
    engagementRate: "21.4%",
  },
  {
    id: "r4",
    name: "Jordan Lee",
    handle: "@jordan.lee",
    platform: "Instagram",
    postLinks: ["Master 1", "Master 2"],
    followerTier: "Nano",
    followers: "9.80K",
    views: "12.05K",
    likes: "1.92K",
    comments: "301",
    shares: "210",
    saves: "165",
    totalEngagement: "2.60K",
    viewRate: "198.0%",
    engagementRate: "21.6%",
  },
  {
    id: "r5",
    name: "Priya Sharma",
    handle: "@priya.sharma",
    platform: "Instagram",
    postLinks: ["Mirrored 1"],
    followerTier: "Macro",
    followers: "1.01M",
    views: "24.80K",
    likes: "3.95K",
    comments: "680",
    shares: "430",
    saves: "330",
    totalEngagement: "5.39K",
    viewRate: "245.0%",
    engagementRate: "21.7%",
  },
  {
    id: "r6",
    name: "Maya Lim",
    handle: "@maya.lim",
    platform: "TikTok",
    postLinks: ["Master 1"],
    followerTier: "Micro",
    followers: "59.80K",
    views: "15.20K",
    likes: "2.40K",
    comments: "420",
    shares: "280",
    saves: "210",
    totalEngagement: "3.31K",
    viewRate: "220.0%",
    engagementRate: "21.8%",
  },
  {
    id: "r7",
    name: "Noah Williams",
    handle: "@noah.w",
    platform: "YouTube",
    postLinks: [],
    followerTier: "Mega",
    followers: "2.10M",
    views: "31.50K",
    likes: "5.10K",
    comments: "890",
    shares: "560",
    saves: "420",
    totalEngagement: "6.97K",
    viewRate: "290.0%",
    engagementRate: "22.1%",
  },
  {
    id: "r8",
    name: "Emma Davis",
    handle: "@emma.davis",
    platform: "Instagram",
    postLinks: ["Master 1"],
    followerTier: "Mid",
    followers: "1.22M",
    views: "22.40K",
    likes: "3.60K",
    comments: "610",
    shares: "390",
    saves: "300",
    totalEngagement: "4.90K",
    viewRate: "255.0%",
    engagementRate: "21.9%",
  },
  {
    id: "r9",
    name: "Oliver Brown",
    handle: "@oliver.b",
    platform: "Instagram",
    postLinks: ["Mirrored 1"],
    followerTier: "Macro",
    followers: "980K",
    views: "20.10K",
    likes: "3.20K",
    comments: "540",
    shares: "350",
    saves: "270",
    totalEngagement: "4.36K",
    viewRate: "240.0%",
    engagementRate: "21.7%",
  },
  {
    id: "r10",
    name: "Sophia Wilson",
    handle: "@sophia.w",
    platform: "TikTok",
    postLinks: ["Master 1"],
    followerTier: "Micro",
    followers: "65.40K",
    views: "14.80K",
    likes: "2.30K",
    comments: "390",
    shares: "260",
    saves: "195",
    totalEngagement: "3.15K",
    viewRate: "215.0%",
    engagementRate: "21.3%",
  },
  {
    id: "r11",
    name: "Liam Martinez",
    handle: "@liam.m",
    platform: "Instagram",
    postLinks: ["Master 1"],
    followerTier: "Nano",
    followers: "12.40K",
    views: "10.20K",
    likes: "1.60K",
    comments: "250",
    shares: "180",
    saves: "140",
    totalEngagement: "2.17K",
    viewRate: "190.0%",
    engagementRate: "21.3%",
  },
];

export function getCampaignReportInfluencerRows(): ReportInfluencerRow[] {
  return INFLUENCER_ROWS.map((row) => ({
    ...row,
    avatarUrl: getMockInfluencerAvatar(row.id),
  }));
}

export const CAMPAIGN_REPORT_OVERVIEW = {
  influencersEngaged: 9,
  postsPublished: 12,
  instagramPosts: 10,
  tiktokPosts: 2,
  totalBudget: "$ 268,500",
};

export const LEADERBOARD_ROWS = [
  { id: "r1", name: "Amelia Stone", value: 99, top: true },
  { id: "r2", name: "Lucas Turner", value: 98, top: false },
  { id: "r5", name: "Priya Sharma", value: 87, top: false },
  { id: "r7", name: "Noah Williams", value: 69, top: false },
  { id: "r8", name: "Emma Davis", value: 56, top: false },
] as const;

export const TIMELINE_POINTS = [
  { date: "12 Jun 26", kolIds: ["r4", "r6"] },
  { date: "14 Jun 26", kolIds: ["r1", "r2", "r3"] },
  { date: "18 Jun 26", kolIds: ["r5", "r7"] },
  { date: "20 Jun 26", kolIds: ["r8", "r9", "r10"] },
] as const;

export const TOP_CONTENT_ITEMS = [
  { id: "c1", kolId: "r1", likes: "3.7k", comments: "120.1k", date: "22 Jun 26" },
  { id: "c2", kolId: "r2", likes: "3.4k", comments: "111.0k", date: "22 Jun 26" },
  { id: "c3", kolId: "r5", likes: "3.1k", comments: "98.2k", date: "21 Jun 26" },
  { id: "c4", kolId: "r7", likes: "2.9k", comments: "92.4k", date: "20 Jun 26" },
  { id: "c5", kolId: "r3", likes: "2.6k", comments: "85.0k", date: "19 Jun 26" },
] as const;

export const FOLLOWER_TIER_CLASS: Record<FollowerTier, string> = {
  Nano: "border-violet-200 bg-violet-50 text-violet-700",
  Micro: "border-sky-200 bg-sky-50 text-sky-700",
  Mid: "border-cyan-200 bg-cyan-50 text-cyan-700",
  Macro: "border-indigo-200 bg-indigo-50 text-indigo-700",
  Mega: "border-gray-300 bg-gray-800 text-white",
};
