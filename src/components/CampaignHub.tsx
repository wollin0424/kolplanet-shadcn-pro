"use client";

import CampaignHubContentView from "@/components/CampaignHubContentView";
import { ContentHubOverview } from "@/components/ContentHubOverview";
import CampaignHubContractView from "@/components/CampaignHubContractView";
import CampaignHubLogisticsView from "@/components/CampaignHubLogisticsView";
import CampaignHubPostingView from "@/components/CampaignHubPostingView";
import CampaignHubScriptView from "@/components/CampaignHubScriptView";
import { CampaignHubDetailHeader } from "@/components/CampaignHubDetailToolbar";
import CampaignPaymentTable from "@/components/CampaignPaymentTable";
import { HubProgressOverview, HubStatus, HubStatusList } from "@/components/HubProgressOverview";
import type { CampaignTab } from "@/components/CampaignDetailHeader";
import { cn } from "@/lib/utils";
import { useState, type MouseEvent } from "react";
import {
  Stamp,
  ChevronRight,
  Info,
  Truck,
  CreditCard,
  Clapperboard,
  Send,
  type AppIcon,
} from "@/lib/icons";
import type { ReactNode } from "react";

function HubGoButton({ onClick }: { onClick?: (e: MouseEvent<HTMLButtonElement>) => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand"
    >
      Go
      <ChevronRight size={14} strokeWidth={2} />
    </button>
  );
}

export type HubSection =
  | "contract"
  | "logistics"
  | "payment"
  | "content"
  | "script"
  | "posting";

/** Fixed hub tile height — fits progress ring + two rows of status chips + Go. */
const HUB_CELL_HEIGHT_CLASS = "h-[300px]";

function HubCell({
  title,
  icon: Icon,
  iconClassName,
  children,
  onGo,
  onEnter,
  centerBody = false,
}: {
  title: string;
  icon: AppIcon;
  iconClassName: string;
  children: ReactNode;
  onGo?: () => void;
  onEnter?: () => void;
  centerBody?: boolean;
}) {
  const handleGo = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onGo?.();
  };

  return (
    <section
      role={onEnter ? "button" : undefined}
      tabIndex={onEnter ? 0 : undefined}
      onClick={onEnter}
      onKeyDown={
        onEnter
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onEnter();
              }
            }
          : undefined
      }
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors",
        HUB_CELL_HEIGHT_CLASS,
        onEnter && "cursor-pointer hover:border-gray-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
      )}
    >
      <div className="flex shrink-0 items-center gap-2">
        <span
          className={cn(
            "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            iconClassName
          )}
        >
          <Icon size={16} strokeWidth={2} />
        </span>
        <span className="flex min-w-0 items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-gray-900">{title}</h3>
          <Info size={14} className="shrink-0 text-gray-300" aria-hidden />
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <div
          className={cn(
            "flex min-h-0 w-full flex-1 flex-col",
            centerBody ? "gap-0 pt-0 justify-center" : "gap-4 pt-1.5"
          )}
        >
          {children}
        </div>
        <div className="mt-auto flex shrink-0 justify-end pt-2">
          <HubGoButton onClick={handleGo} />
        </div>
      </div>
    </section>
  );
}

function ContractHubOverview() {
  return (
    <>
      <HubProgressOverview
        statusLabel="Countersigned"
        current={2}
        total={8}
        percent={25}
      />
      <HubStatusList className="mt-0">
        <HubStatus label="Awaiting Info" value={2} tone="amber" />
        <HubStatus label="Pending Draft" value={1} tone="sky" />
        <HubStatus label="Awaiting Sending" value={2} tone="sky" />
        <HubStatus label="Signing" value={1} tone="violet" />
      </HubStatusList>
    </>
  );
}

export default function CampaignHub({
  campaignId,
  onNavigate,
  initialSection,
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
  figmaInsightReportState,
  figmaUploadInsightRowId,
  figmaOpenImportPostLinks,
  figmaPostingMirroredTooltipRowId,
  figmaPostingValidationTooltips,
  figmaOpenSetPostingDate,
  figmaPostingPostLinkTooltips,
  figmaReviewTab,
  figmaReviewKol,
}: {
  campaignId: string;
  onNavigate?: (tab: CampaignTab) => void;
  initialSection?: HubSection;
  initialScriptKolId?: string;
  figmaCapture?: boolean;
  figmaOpenFilters?: boolean;
  figmaOpenReview?: "script" | "visual" | "caption";
  figmaPostingHoverRowId?: string;
  figmaPostingHoverRowIds?: string[];
  figmaPostingActionsOpen?: boolean;
  figmaOpenEditPostLink?: boolean;
  figmaEditPostLinkRowId?: string;
  figmaOpenUploadInsightReport?: boolean;
  figmaInsightReportState?: string;
  figmaUploadInsightRowId?: string;
  figmaOpenImportPostLinks?: boolean;
  figmaPostingMirroredTooltipRowId?: string;
  figmaPostingValidationTooltips?: boolean;
  figmaOpenSetPostingDate?: boolean;
  figmaPostingPostLinkTooltips?: boolean;
  figmaReviewTab?: "comments" | "brief";
  figmaReviewKol?: string;
}) {
  const [activeSection, setActiveSection] = useState<HubSection | null>(
    initialSection ?? null
  );

  const openContract = () => setActiveSection("contract");
  const openLogistics = () => setActiveSection("logistics");
  const openPayment = () => setActiveSection("payment");
  const openContent = () => setActiveSection("content");
  const openPosting = () => setActiveSection("posting");

  if (activeSection === "contract") {
    return (
      <CampaignHubContractView
        campaignId={campaignId}
        onBack={() => setActiveSection(null)}
      />
    );
  }

  if (activeSection === "logistics") {
    return (
      <CampaignHubLogisticsView
        campaignId={campaignId}
        onBack={() => setActiveSection(null)}
      />
    );
  }

  if (activeSection === "content") {
    return (
      <CampaignHubContentView
        campaignId={campaignId}
        onBack={() => setActiveSection(null)}
        figmaCapture={figmaCapture}
        figmaOpenFilters={figmaOpenFilters}
        figmaOpenReview={figmaOpenReview}
        figmaReviewTab={figmaReviewTab}
        figmaReviewKol={figmaReviewKol}
      />
    );
  }

  if (activeSection === "script") {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <CampaignHubScriptView
          campaignId={campaignId}
          onBack={() => setActiveSection(null)}
          initialSelectedKolId={initialScriptKolId}
          figmaCapture={figmaCapture}
        />
      </div>
    );
  }

  if (activeSection === "payment") {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
        <span className="sr-only">{campaignId}</span>
        <CampaignHubDetailHeader title="Payment" onBack={() => setActiveSection(null)} />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <CampaignPaymentTable campaignId={campaignId} />
        </div>
      </div>
    );
  }

  if (activeSection === "posting") {
    return (
      <CampaignHubPostingView
        campaignId={campaignId}
        onBack={() => setActiveSection(null)}
        figmaCapture={figmaCapture}
        figmaPostingHoverRowId={figmaPostingHoverRowId}
        figmaPostingHoverRowIds={figmaPostingHoverRowIds}
        figmaPostingActionsOpen={figmaPostingActionsOpen}
        figmaOpenEditPostLink={figmaOpenEditPostLink}
        figmaEditPostLinkRowId={figmaEditPostLinkRowId}
        figmaOpenUploadInsightReport={figmaOpenUploadInsightReport}
        figmaInsightReportState={figmaInsightReportState}
        figmaUploadInsightRowId={figmaUploadInsightRowId}
        figmaOpenImportPostLinks={figmaOpenImportPostLinks}
        figmaPostingMirroredTooltipRowId={figmaPostingMirroredTooltipRowId}
        figmaPostingValidationTooltips={figmaPostingValidationTooltips}
        figmaOpenSetPostingDate={figmaOpenSetPostingDate}
        figmaPostingPostLinkTooltips={figmaPostingPostLinkTooltips}
      />
    );
  }

  return (
    <div className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-auto">
      <span className="sr-only">{campaignId}</span>
      <div className="grid auto-rows-[300px] grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <HubCell
          title="Contract"
          icon={Stamp}
          iconClassName="bg-sky-50 text-sky-600"
          onEnter={openContract}
          onGo={openContract}
        >
          <ContractHubOverview />
        </HubCell>

        <HubCell
          title="Logistics"
          icon={Truck}
          iconClassName="bg-emerald-50 text-emerald-600"
          onEnter={openLogistics}
          onGo={openLogistics}
        >
          <>
            <HubProgressOverview
              statusLabel="Received"
              current={0}
              total={8}
              percent={0}
            />
            <HubStatusList className="mt-0">
              <HubStatus label="Awaiting Pickup" value={3} tone="amber" />
              <HubStatus label="In Transit" value={1} tone="sky" />
              <HubStatus label="Out of Delivery" value={1} tone="purple" />
              <HubStatus label="Delivered" value={1} tone="green" />
              <HubStatus label="Delivery Failed" value={1} tone="red" />
            </HubStatusList>
          </>
        </HubCell>

        <HubCell
          title="Payment"
          icon={CreditCard}
          iconClassName="bg-violet-50 text-violet-600"
          onEnter={openPayment}
          onGo={openPayment}
        >
          <>
            <HubProgressOverview
              statusLabel="All Paid"
              current={1}
              total={5}
              percent={20}
            />
            <HubStatusList className="mt-0">
              <HubStatus label="Waiting for Validation" value={1} tone="amber" />
              <HubStatus label="Validated" value={1} tone="green" />
              <HubStatus label="Partially Paid" value={1} tone="sky" />
              <HubStatus label="Rejected" value={1} tone="red" />
            </HubStatusList>
          </>
        </HubCell>

        <HubCell
          title="Content"
          icon={Clapperboard}
          iconClassName="bg-amber-50 text-amber-600"
          onEnter={openContent}
          onGo={openContent}
        >
          <ContentHubOverview />
        </HubCell>

        <HubCell
          title="Posting"
          icon={Send}
          iconClassName="bg-emerald-50 text-emerald-600"
          onEnter={openPosting}
          onGo={openPosting}
        >
          <>
            <HubProgressOverview
              statusLabel="Posted"
              current={1}
              total={8}
              percent={13}
            />
            <HubStatusList className="mt-0">
              <HubStatus label="Ready" value={7} tone="sky" />
              <HubStatus label="In Progress" value={7} tone="amber" />
            </HubStatusList>
          </>
        </HubCell>
      </div>
    </div>
  );
}
