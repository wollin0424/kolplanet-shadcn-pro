"use client";

import { useState } from "react";
import CampaignDetailHeader, { type CampaignTab } from "@/components/CampaignDetailHeader";
import CampaignPipelineTable from "@/components/CampaignPipelineTable";
import PagePlaceholder from "@/components/PagePlaceholder";
import { CreditCard, FileText } from "lucide-react";

export default function CampaignDetailView({ campaignId }: { campaignId: string }) {
  const [tab, setTab] = useState<CampaignTab>("Pipeline");

  return (
    <>
      <div className="rounded-xl border border-gray-100 overflow-hidden bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <CampaignDetailHeader campaignId={campaignId} tab={tab} onTabChange={setTab} />
      </div>

      {tab === "Pipeline" ? (
        <div className="flex flex-col flex-1 min-h-0 rounded-xl border border-gray-100 overflow-hidden bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <CampaignPipelineTable campaignId={campaignId} />
        </div>
      ) : tab === "Payment" ? (
        <PagePlaceholder
          title="Payment"
          description="Payment module placeholder for the campaign detail view."
          icon={<CreditCard size={14} strokeWidth={2} />}
        />
      ) : (
        <PagePlaceholder
          title="Report"
          description="Report module placeholder for the campaign detail view."
          icon={<FileText size={14} strokeWidth={2} />}
        />
      )}
    </>
  );
}

