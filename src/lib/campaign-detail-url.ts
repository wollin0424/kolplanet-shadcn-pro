import type { CampaignTab } from "@/components/CampaignDetailHeader";
import type { HubSection } from "@/components/CampaignHub";

const TAB_BY_QUERY: Record<string, CampaignTab> = {
  pipeline: "Pipeline",
  hub: "Campaign Hub",
  "campaign-hub": "Campaign Hub",
  report: "Report",
};

const HUB_SECTION_BY_QUERY: Record<string, HubSection> = {
  contract: "contract",
  logistics: "logistics",
  payment: "payment",
  content: "content",
  script: "script",
};

const CONTENT_REVIEW_TRACK_BY_QUERY: Record<string, "script" | "visual" | "caption"> = {
  script: "script",
  visual: "visual",
  "visual-draft": "visual",
  caption: "caption",
  "caption-cover": "caption",
};

export function parseCampaignDetailSearchParams(searchParams: {
  tab?: string;
  section?: string;
  kol?: string;
  figmaCapture?: string;
  figmaOpenFilters?: string;
  figmaOpenReview?: string;
  figmaReviewTab?: string;
  figmaReviewKol?: string;
}): {
  initialTab?: CampaignTab;
  initialHubSection?: HubSection;
  initialScriptKolId?: string;
  figmaCapture?: boolean;
  figmaOpenFilters?: boolean;
  figmaOpenReview?: "script" | "visual" | "caption";
  figmaReviewTab?: "comments" | "brief";
  figmaReviewKol?: string;
} {
  const tabKey = searchParams.tab?.toLowerCase().replace(/_/g, "-");
  const sectionKey = searchParams.section?.toLowerCase().replace(/_/g, "-");

  if (tabKey === "payment") {
    return { initialTab: "Campaign Hub", initialHubSection: "payment" };
  }

  const initialScriptKolId = searchParams.kol?.trim() || undefined;
  const figmaCapture = searchParams.figmaCapture === "1";
  const figmaOpenFilters = searchParams.figmaOpenFilters === "1";
  const reviewTrackKey = searchParams.figmaOpenReview?.toLowerCase().replace(/_/g, "-");
  const reviewTabKey = searchParams.figmaReviewTab?.toLowerCase().replace(/_/g, "-");

  return {
    initialTab: tabKey ? TAB_BY_QUERY[tabKey] : undefined,
    initialHubSection: sectionKey ? HUB_SECTION_BY_QUERY[sectionKey] : undefined,
    initialScriptKolId,
    figmaCapture,
    figmaOpenFilters,
    figmaOpenReview: reviewTrackKey
      ? CONTENT_REVIEW_TRACK_BY_QUERY[reviewTrackKey]
      : undefined,
    figmaReviewTab:
      reviewTabKey === "brief" || reviewTabKey === "brief-settings"
        ? "brief"
        : reviewTabKey === "comments" || reviewTabKey === "comments-approve"
          ? "comments"
          : undefined,
    figmaReviewKol: searchParams.figmaReviewKol?.trim() || undefined,
  };
}
