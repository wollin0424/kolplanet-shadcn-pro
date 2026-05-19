import CampaignDetailView from "@/components/CampaignDetailView";
import { parseCampaignDetailSearchParams } from "@/lib/campaign-detail-url";

export default async function CampaignDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ campaignId: string }>;
  searchParams: Promise<{ tab?: string; section?: string }>;
}) {
  const { campaignId } = await params;
  const query = await searchParams;
  const { initialTab, initialHubSection } = parseCampaignDetailSearchParams(query);

  return (
    <CampaignDetailView
      campaignId={campaignId}
      initialTab={initialTab}
      initialHubSection={initialHubSection}
    />
  );
}

