import type { CampaignTab } from "@/components/CampaignDetailHeader";
import type { HubSection } from "@/components/CampaignHub";

const TAB_BY_QUERY: Record<string, CampaignTab> = {
  pipeline: "Pipeline",
  hub: "Campaign Hub",
  "campaign-hub": "Campaign Hub",
  payment: "Payment",
  todo: "Todo",
  report: "Report",
};

const HUB_SECTION_BY_QUERY: Record<string, HubSection> = {
  contract: "contract",
  logistics: "logistics",
};

export function parseCampaignDetailSearchParams(searchParams: {
  tab?: string;
  section?: string;
}): { initialTab?: CampaignTab; initialHubSection?: HubSection } {
  const tabKey = searchParams.tab?.toLowerCase().replace(/_/g, "-");
  const sectionKey = searchParams.section?.toLowerCase().replace(/_/g, "-");

  return {
    initialTab: tabKey ? TAB_BY_QUERY[tabKey] : undefined,
    initialHubSection: sectionKey ? HUB_SECTION_BY_QUERY[sectionKey] : undefined,
  };
}
