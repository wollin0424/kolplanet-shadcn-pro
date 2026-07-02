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
    figmaOpenUploadInsightReport?: string;
    figmaUploadInsightRow?: string;
    figmaOpenImportPostLinks?: string;
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
    figmaPostingHoverRowIds,
    figmaPostingActionsOpen,
    figmaOpenEditPostLink,
    figmaEditPostLinkRowId,
    figmaOpenUploadInsightReport,
    figmaUploadInsightRowId,
    figmaOpenImportPostLinks,
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
      figmaPostingHoverRowIds={figmaPostingHoverRowIds}
      figmaPostingActionsOpen={figmaPostingActionsOpen}
      figmaOpenEditPostLink={figmaOpenEditPostLink}
      figmaEditPostLinkRowId={figmaEditPostLinkRowId}
      figmaOpenUploadInsightReport={figmaOpenUploadInsightReport}
      figmaUploadInsightRowId={figmaUploadInsightRowId}
      figmaOpenImportPostLinks={figmaOpenImportPostLinks}
      figmaPostingMirroredTooltipRowId={figmaPostingMirroredTooltipRowId}
      figmaPostingValidationTooltips={figmaPostingValidationTooltips}
      figmaReviewTab={figmaReviewTab}
      figmaReviewKol={figmaReviewKol}
    />
  );
}

