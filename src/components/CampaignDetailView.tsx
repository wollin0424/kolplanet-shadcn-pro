"use client";

import { useState } from "react";
import CampaignDetailHeader, { type CampaignTab } from "@/components/CampaignDetailHeader";
import CampaignHub, { type HubSection } from "@/components/CampaignHub";
import CampaignPipelineTable from "@/components/CampaignPipelineTable";
import PagePlaceholder from "@/components/PagePlaceholder";
import { FileText } from "@/lib/icons";
import { cn } from "@/lib/utils";

export default function CampaignDetailView({
  campaignId,
  initialTab,
  initialHubSection,
  initialScriptKolId,
  figmaCapture,
}: {
  campaignId: string;
  initialTab?: CampaignTab;
  initialHubSection?: HubSection;
  initialScriptKolId?: string;
  figmaCapture?: boolean;
}) {
  const [tab, setTab] = useState<CampaignTab>(initialTab ?? "Pipeline");
  const [hubMountKey, setHubMountKey] = useState(0);

  const handleTabChange = (next: CampaignTab) => {
    if (next === "Campaign Hub") {
      setHubMountKey((key) => key + 1);
    }
    setTab(next);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <CampaignDetailHeader campaignId={campaignId} tab={tab} onTabChange={handleTabChange} />

      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-hidden bg-gray-50 p-5 pt-4",
          figmaCapture && "figma-capture-detail-content"
        )}
      >
        {tab === "Pipeline" ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <CampaignPipelineTable campaignId={campaignId} />
          </div>
        ) : tab === "Campaign Hub" ? (
          <CampaignHub
            key={hubMountKey}
            campaignId={campaignId}
            onNavigate={setTab}
            initialSection={hubMountKey === 0 ? initialHubSection : undefined}
            initialScriptKolId={hubMountKey === 0 ? initialScriptKolId : undefined}
            figmaCapture={hubMountKey === 0 ? figmaCapture : undefined}
          />
        ) : (
          <PagePlaceholder
            title="Report"
            description="Report module placeholder for the campaign detail view."
            icon={<FileText size={14} strokeWidth={2} />}
          />
        )}
      </div>
    </div>
  );
}
