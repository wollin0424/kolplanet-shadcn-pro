"use client";

import { useState } from "react";
import CampaignDetailHeader, { type CampaignTab } from "@/components/CampaignDetailHeader";
import CampaignHub, { type HubSection } from "@/components/CampaignHub";
import type { ContractInfoTab } from "@/components/ContractInfoSheet";
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
}: {
  campaignId: string;
  initialTab?: CampaignTab;
  initialHubSection?: HubSection;
  initialScriptKolId?: string;
  figmaCapture?: boolean;
  figmaOpenFilters?: boolean;
  figmaOpenReview?: "script" | "visual" | "caption";
  figmaPostingHoverRowId?: string;
  figmaPostingHoverRowIds?: string[];
  figmaPostingActionsOpen?: boolean;
  figmaOpenEditPostLink?: boolean;
  figmaEditPostLinkRowId?: string;
  figmaEditPostLinkState?: "empty" | "partial" | "full";
  figmaOpenUploadInsightReport?: boolean;
  figmaInsightReportState?: string;
  figmaUploadInsightRowId?: string;
  figmaOpenImportPostLinks?: boolean;
  figmaOpenExecutionGuide?: boolean;
  figmaPostingMirroredTooltipRowId?: string;
  figmaPostingValidationTooltips?: boolean;
  figmaOpenSetPostingDate?: boolean;
  figmaPostingPostLinkTooltips?: boolean;
  figmaReviewTab?: "comments" | "brief";
  figmaReviewKol?: string;
  figmaOpenContractInfo?: boolean;
  figmaContractInfoTab?: ContractInfoTab;
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
      <CampaignDetailHeader
        campaignId={campaignId}
        tab={tab}
        onTabChange={handleTabChange}
        figmaCapture={figmaCapture}
        figmaOpenExecutionGuide={figmaOpenExecutionGuide}
      />

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
            figmaOpenFilters={hubMountKey === 0 ? figmaOpenFilters : undefined}
            figmaOpenReview={hubMountKey === 0 ? figmaOpenReview : undefined}
            figmaPostingHoverRowId={hubMountKey === 0 ? figmaPostingHoverRowId : undefined}
            figmaPostingHoverRowIds={hubMountKey === 0 ? figmaPostingHoverRowIds : undefined}
            figmaPostingActionsOpen={hubMountKey === 0 ? figmaPostingActionsOpen : undefined}
            figmaOpenEditPostLink={hubMountKey === 0 ? figmaOpenEditPostLink : undefined}
            figmaEditPostLinkRowId={hubMountKey === 0 ? figmaEditPostLinkRowId : undefined}
            figmaEditPostLinkState={hubMountKey === 0 ? figmaEditPostLinkState : undefined}
            figmaOpenUploadInsightReport={hubMountKey === 0 ? figmaOpenUploadInsightReport : undefined}
            figmaInsightReportState={hubMountKey === 0 ? figmaInsightReportState : undefined}
            figmaUploadInsightRowId={hubMountKey === 0 ? figmaUploadInsightRowId : undefined}
            figmaOpenImportPostLinks={hubMountKey === 0 ? figmaOpenImportPostLinks : undefined}
            figmaPostingMirroredTooltipRowId={hubMountKey === 0 ? figmaPostingMirroredTooltipRowId : undefined}
            figmaPostingValidationTooltips={hubMountKey === 0 ? figmaPostingValidationTooltips : undefined}
            figmaOpenSetPostingDate={hubMountKey === 0 ? figmaOpenSetPostingDate : undefined}
            figmaPostingPostLinkTooltips={hubMountKey === 0 ? figmaPostingPostLinkTooltips : undefined}
            figmaReviewTab={hubMountKey === 0 ? figmaReviewTab : undefined}
            figmaReviewKol={hubMountKey === 0 ? figmaReviewKol : undefined}
            figmaOpenContractInfo={hubMountKey === 0 ? figmaOpenContractInfo : undefined}
            figmaContractInfoTab={hubMountKey === 0 ? figmaContractInfoTab : undefined}
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
