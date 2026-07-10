import CampaignDetailView from "@/components/CampaignDetailView";
import { parseCampaignDetailSearchParams } from "@/lib/campaign-detail-url";

export default async function CampaignDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ campaignId: string }>;
  searchParams: Promise<{
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
  }>;
}) {
  const { campaignId } = await params;
  const query = await searchParams;
  const {
    initialTab,
    initialHubSection,
    initialScriptKolId,
    figmaCapture,
    figmaOpenFilters,
    figmaOpenReview,
    figmaPostingHoverRowId,
    figmaPostingHoverRowIds,
    figmaPostingActionsOpen,
    figmaOpenEditPostLink,
    figmaEditPostLinkRowId,
    figmaEditPostLinkState,
    figmaOpenUploadInsightReport,
    figmaInsightReportState,
    figmaUploadInsightRowId,
    figmaOpenImportPostLinks,
    figmaOpenExecutionGuide,
    figmaPostingMirroredTooltipRowId,
    figmaPostingValidationTooltips,
    figmaOpenSetPostingDate,
    figmaPostingPostLinkTooltips,
    figmaReviewTab,
    figmaReviewKol,
    figmaOpenContractInfo,
    figmaContractInfoTab,
    initialReportSection,
  } = parseCampaignDetailSearchParams(query);

  return (
    <CampaignDetailView
      campaignId={campaignId}
      initialTab={initialTab}
      initialHubSection={initialHubSection}
      initialScriptKolId={initialScriptKolId}
      figmaCapture={figmaCapture}
      figmaOpenFilters={figmaOpenFilters}
      figmaOpenReview={figmaOpenReview}
      figmaPostingHoverRowId={figmaPostingHoverRowId}
      figmaPostingHoverRowIds={figmaPostingHoverRowIds}
      figmaPostingActionsOpen={figmaPostingActionsOpen}
      figmaOpenEditPostLink={figmaOpenEditPostLink}
      figmaEditPostLinkRowId={figmaEditPostLinkRowId}
      figmaEditPostLinkState={figmaEditPostLinkState}
      figmaOpenUploadInsightReport={figmaOpenUploadInsightReport}
      figmaInsightReportState={figmaInsightReportState}
      figmaUploadInsightRowId={figmaUploadInsightRowId}
      figmaOpenImportPostLinks={figmaOpenImportPostLinks}
      figmaOpenExecutionGuide={figmaOpenExecutionGuide}
      figmaPostingMirroredTooltipRowId={figmaPostingMirroredTooltipRowId}
      figmaPostingValidationTooltips={figmaPostingValidationTooltips}
      figmaOpenSetPostingDate={figmaOpenSetPostingDate}
      figmaPostingPostLinkTooltips={figmaPostingPostLinkTooltips}
      figmaReviewTab={figmaReviewTab}
      figmaReviewKol={figmaReviewKol}
      figmaOpenContractInfo={figmaOpenContractInfo}
      figmaContractInfoTab={figmaContractInfoTab}
      initialReportSection={initialReportSection}
    />
  );
}

