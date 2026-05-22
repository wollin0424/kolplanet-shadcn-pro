"use client";

import { useState } from "react";
import CampaignDetailHeader, { type CampaignTab } from "@/components/CampaignDetailHeader";
import CampaignHub, { type HubSection } from "@/components/CampaignHub";
import CampaignPaymentTable from "@/components/CampaignPaymentTable";
import CampaignPipelineTable from "@/components/CampaignPipelineTable";
import PagePlaceholder from "@/components/PagePlaceholder";
import { CheckSquare, FileText } from "@/lib/icons";

export default function CampaignDetailView({
  campaignId,
  initialTab,
  initialHubSection,
}: {
  campaignId: string;
  initialTab?: CampaignTab;
  initialHubSection?: HubSection;
}) {
  const [tab, setTab] = useState<CampaignTab>(initialTab ?? "Pipeline");

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <CampaignDetailHeader campaignId={campaignId} tab={tab} onTabChange={setTab} />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-gray-50 p-5 pt-4">
        {tab === "Pipeline" ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <CampaignPipelineTable campaignId={campaignId} />
          </div>
        ) : tab === "Campaign Hub" ? (
          <CampaignHub
            campaignId={campaignId}
            onNavigate={setTab}
            initialSection={initialHubSection}
          />
        ) : tab === "Payment" ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <CampaignPaymentTable campaignId={campaignId} />
          </div>
        ) : tab === "Todo" ? (
          <PagePlaceholder
            title="Todo"
            description="Campaign todo list placeholder."
            icon={<CheckSquare size={14} strokeWidth={2} />}
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
