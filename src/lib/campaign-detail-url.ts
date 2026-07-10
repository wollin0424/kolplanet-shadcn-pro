import type { CampaignTab } from "@/components/CampaignDetailHeader";
import type { HubSection } from "@/components/CampaignHub";
import type { ContractInfoTab } from "@/components/ContractInfoSheet";
import type { ReportSection } from "@/lib/campaignReportMock";

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
  posting: "posting",
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
  figmaPostingHover?: string;
  figmaPostingHoverRow?: string;
  figmaPostingHoverRows?: string;
  figmaPostingActionsOpen?: string;
  figmaOpenEditPostLink?: string;
  figmaEditPostLinkRow?: string;
  figmaEditPostLinkState?: string;
  figmaOpenUploadInsightReport?: string;
  figmaInsightReportState?: string;
  figmaUploadInsightRow?: string;
  figmaOpenImportPostLinks?: string;
  figmaOpenExecutionGuide?: string;
  figmaPostingMirroredTooltip?: string;
  figmaPostingMirroredTooltipRow?: string;
  figmaPostingValidationTooltips?: string;
  figmaOpenSetPostingDate?: string;
  figmaPostingPostLinkTooltips?: string;
  figmaReviewTab?: string;
  figmaReviewKol?: string;
  figmaOpenContractInfo?: string;
  figmaContractInfoTab?: string;
  reportSection?: string;
}): {
  initialTab?: CampaignTab;
  initialHubSection?: HubSection;
  initialReportSection?: ReportSection;
  initialScriptKolId?: string;
  figmaCapture?: boolean;
  figmaOpenFilters?: boolean;
  figmaOpenReview?: "script" | "visual" | "caption";
  figmaPostingHoverRowId?: string;
  figmaPostingHoverRowIds?: string[];
  figmaPostingActionsOpen?: boolean;
  figmaOpenEditPostLink?: boolean;
  figmaEditPostLinkRowId?: string;
  figmaEditPostLinkState?: "empty" | "partial" | "full";
  figmaOpenUploadInsightReport?: boolean;
  figmaInsightReportState?: string;
  figmaUploadInsightRowId?: string;
  figmaOpenImportPostLinks?: boolean;
  figmaOpenExecutionGuide?: boolean;
  figmaPostingMirroredTooltipRowId?: string;
  figmaPostingValidationTooltips?: boolean;
  figmaOpenSetPostingDate?: boolean;
  figmaPostingPostLinkTooltips?: boolean;
  figmaReviewTab?: "comments" | "brief";
  figmaReviewKol?: string;
  figmaOpenContractInfo?: boolean;
  figmaContractInfoTab?: ContractInfoTab;
} {
  const tabKey = searchParams.tab?.toLowerCase().replace(/_/g, "-");
  const sectionKey = searchParams.section?.toLowerCase().replace(/_/g, "-");
  const reportSectionKey = searchParams.reportSection?.toLowerCase().replace(/_/g, "-");
  const initialReportSection: ReportSection | undefined =
    reportSectionKey === "influencer"
      ? "influencer"
      : reportSectionKey === "content"
        ? "content"
        : reportSectionKey === "overview"
          ? "overview"
          : undefined;

  if (tabKey === "payment") {
    return { initialTab: "Campaign Hub", initialHubSection: "payment" };
  }

  const initialScriptKolId = searchParams.kol?.trim() || undefined;
  const figmaCapture = searchParams.figmaCapture === "1";
  const figmaOpenFilters = searchParams.figmaOpenFilters === "1";
  const figmaPostingHover = searchParams.figmaPostingHover === "1";
  const figmaPostingHoverRowIds = figmaPostingHover
    ? (searchParams.figmaPostingHoverRows?.split(",") ?? [])
        .map((id) => id.trim())
        .filter(Boolean)
    : undefined;
  const figmaPostingHoverRowId = figmaPostingHover
    ? figmaPostingHoverRowIds?.length
      ? figmaPostingHoverRowIds[0]
      : searchParams.figmaPostingHoverRow?.trim() || "p1"
    : undefined;
  const figmaPostingActionsOpen = searchParams.figmaPostingActionsOpen === "1";
  const figmaOpenEditPostLink = searchParams.figmaOpenEditPostLink === "1";
  const figmaEditPostLinkRowId = figmaOpenEditPostLink
    ? searchParams.figmaEditPostLinkRow?.trim() || "p4"
    : undefined;
  const figmaEditPostLinkStateRaw = searchParams.figmaEditPostLinkState?.trim().toLowerCase();
  const figmaEditPostLinkState =
    figmaEditPostLinkStateRaw === "empty" ||
    figmaEditPostLinkStateRaw === "partial" ||
    figmaEditPostLinkStateRaw === "full"
      ? figmaEditPostLinkStateRaw
      : figmaOpenEditPostLink
        ? "full"
        : undefined;
  const figmaOpenUploadInsightReport = searchParams.figmaOpenUploadInsightReport === "1";
  const figmaUploadInsightRowId = figmaOpenUploadInsightReport
    ? searchParams.figmaUploadInsightRow?.trim() || "p3"
    : undefined;
  const figmaOpenImportPostLinks = searchParams.figmaOpenImportPostLinks === "1";
  const figmaOpenExecutionGuide = searchParams.figmaOpenExecutionGuide === "1";
  const figmaPostingMirroredTooltip = searchParams.figmaPostingMirroredTooltip === "1";
  const figmaPostingMirroredTooltipRowId = figmaPostingMirroredTooltip
    ? searchParams.figmaPostingMirroredTooltipRow?.trim() || "p1"
    : undefined;
  const figmaPostingValidationTooltips = searchParams.figmaPostingValidationTooltips === "1";
  const figmaOpenSetPostingDate = searchParams.figmaOpenSetPostingDate === "1";
  const figmaPostingPostLinkTooltips = searchParams.figmaPostingPostLinkTooltips === "1";
  const reviewTrackKey = searchParams.figmaOpenReview?.toLowerCase().replace(/_/g, "-");
  const reviewTabKey = searchParams.figmaReviewTab?.toLowerCase().replace(/_/g, "-");
  const figmaOpenContractInfo = searchParams.figmaOpenContractInfo === "1";
  const contractInfoTabKey = searchParams.figmaContractInfoTab?.toLowerCase().replace(/_/g, "-");
  const figmaContractInfoTab: ContractInfoTab | undefined =
    contractInfoTabKey === "kol-information" ||
    contractInfoTabKey === "kol-info" ||
    contractInfoTabKey === "kol"
      ? "KOL Information"
      : contractInfoTabKey === "collaboration" ||
          contractInfoTabKey === "collaboration-details" ||
          contractInfoTabKey === "commercial"
        ? "Collaboration Details"
        : figmaOpenContractInfo
          ? "Collaboration Details"
          : undefined;

  return {
    initialTab: tabKey ? TAB_BY_QUERY[tabKey] : undefined,
    initialHubSection: sectionKey ? HUB_SECTION_BY_QUERY[sectionKey] : undefined,
    initialReportSection,
    initialScriptKolId,
    figmaCapture,
    figmaOpenFilters,
    figmaOpenReview: reviewTrackKey
      ? CONTENT_REVIEW_TRACK_BY_QUERY[reviewTrackKey]
      : undefined,
    figmaPostingHoverRowId,
    figmaPostingHoverRowIds:
      figmaPostingHoverRowIds && figmaPostingHoverRowIds.length > 0
        ? figmaPostingHoverRowIds
        : figmaPostingHoverRowId
          ? [figmaPostingHoverRowId]
          : undefined,
    figmaPostingActionsOpen,
    figmaOpenEditPostLink,
    figmaEditPostLinkRowId,
    figmaEditPostLinkState,
    figmaOpenUploadInsightReport,
    figmaInsightReportState: searchParams.figmaInsightReportState?.trim() || undefined,
    figmaUploadInsightRowId,
    figmaOpenImportPostLinks,
    figmaOpenExecutionGuide,
    figmaPostingMirroredTooltipRowId,
    figmaPostingValidationTooltips,
    figmaOpenSetPostingDate,
    figmaPostingPostLinkTooltips,
    figmaReviewTab:
      reviewTabKey === "brief" || reviewTabKey === "brief-settings"
        ? "brief"
        : reviewTabKey === "comments" || reviewTabKey === "comments-approve"
          ? "comments"
          : undefined,
    figmaReviewKol: searchParams.figmaReviewKol?.trim() || undefined,
    figmaOpenContractInfo,
    figmaContractInfoTab,
  };
}
