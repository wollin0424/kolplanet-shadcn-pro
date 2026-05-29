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
};

export function parseCampaignDetailSearchParams(searchParams: {
  tab?: string;
  section?: string;
}): { initialTab?: CampaignTab; initialHubSection?: HubSection } {
  const tabKey = searchParams.tab?.toLowerCase().replace(/_/g, "-");
  const sectionKey = searchParams.section?.toLowerCase().replace(/_/g, "-");

  if (tabKey === "payment") {
    return { initialTab: "Campaign Hub", initialHubSection: "payment" };
  }

  return {
    initialTab: tabKey ? TAB_BY_QUERY[tabKey] : undefined,
    initialHubSection: sectionKey ? HUB_SECTION_BY_QUERY[sectionKey] : undefined,
  };
}
