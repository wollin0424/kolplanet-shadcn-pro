import CampaignDetailView from "@/components/CampaignDetailView";
import { parseCampaignDetailSearchParams } from "@/lib/campaign-detail-url";

export default async function CampaignDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ campaignId: string }>;
  searchParams: Promise<{ tab?: string; section?: string; kol?: string; figmaCapture?: string }>;
}) {
  const { campaignId } = await params;
  const query = await searchParams;
  const { initialTab, initialHubSection, initialScriptKolId, figmaCapture } =
    parseCampaignDetailSearchParams(query);

  return (
    <CampaignDetailView
      campaignId={campaignId}
      initialTab={initialTab}
      initialHubSection={initialHubSection}
      initialScriptKolId={initialScriptKolId}
      figmaCapture={figmaCapture}
    />
  );
}

