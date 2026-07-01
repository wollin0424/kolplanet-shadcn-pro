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
    figmaPostingActionsOpen?: string;
    figmaOpenEditPostLink?: string;
    figmaEditPostLinkRow?: string;
    figmaOpenUploadInsightReport?: string;
    figmaUploadInsightRow?: string;
    figmaPostingMirroredTooltip?: string;
    figmaPostingMirroredTooltipRow?: string;
    figmaPostingValidationTooltips?: string;
    figmaReviewTab?: string;
    figmaReviewKol?: string;
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
    figmaPostingActionsOpen,
    figmaOpenEditPostLink,
    figmaEditPostLinkRowId,
    figmaOpenUploadInsightReport,
    figmaUploadInsightRowId,
    figmaPostingMirroredTooltipRowId,
    figmaPostingValidationTooltips,
    figmaReviewTab,
    figmaReviewKol,
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
      figmaPostingActionsOpen={figmaPostingActionsOpen}
      figmaOpenEditPostLink={figmaOpenEditPostLink}
      figmaEditPostLinkRowId={figmaEditPostLinkRowId}
      figmaOpenUploadInsightReport={figmaOpenUploadInsightReport}
      figmaUploadInsightRowId={figmaUploadInsightRowId}
      figmaPostingMirroredTooltipRowId={figmaPostingMirroredTooltipRowId}
      figmaPostingValidationTooltips={figmaPostingValidationTooltips}
      figmaReviewTab={figmaReviewTab}
      figmaReviewKol={figmaReviewKol}
    />
  );
}

