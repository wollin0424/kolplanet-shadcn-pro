"use client";

import CampaignHubContentView from "@/components/CampaignHubContentView";
import { ContentHubOverview } from "@/components/ContentHubOverview";
import CampaignHubContractView from "@/components/CampaignHubContractView";
import CampaignHubLogisticsView from "@/components/CampaignHubLogisticsView";
import CampaignHubScriptView from "@/components/CampaignHubScriptView";
import { CampaignHubDetailHeader } from "@/components/CampaignHubDetailToolbar";
import CampaignPaymentTable from "@/components/CampaignPaymentTable";
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
  ScrollText,
  type AppIcon,
} from "@/lib/icons";
import type { ReactNode } from "react";

type StatusTone =
  | "green"
  | "sky"
  | "amber"
  | "gray"
  | "brand"
  | "purple"
  | "red"
  | "violet";

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

const statusToneClass: Record<StatusTone, string> = {
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  sky: "border-sky-200 bg-sky-50 text-sky-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  gray: "border-gray-200 bg-gray-50 text-gray-700",
  brand: "border-brand/20 bg-brand-50 text-brand",
  purple: "border-violet-200 bg-violet-50 text-violet-700",
  red: "border-red-200 bg-red-50 text-red-700",
  violet: "border-violet-200 bg-violet-50 text-violet-700",
};

/** Count chip: color encodes state; no per-tag icons (consistent SaaS breakdown pattern). */
function HubStatus({
  label,
  value,
  tone = "sky",
}: {
  label: string;
  value: string | number;
  tone?: StatusTone;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit max-w-full items-center rounded-full border px-3 py-2 text-xs font-medium leading-none whitespace-nowrap",
        statusToneClass[tone]
      )}
    >
      {label}: {value}
    </span>
  );
}

function HubStatusList({ children }: { children: ReactNode }) {
  return <div className="mt-0 flex flex-wrap gap-x-2 gap-y-2">{children}</div>;
}

export type HubSection = "contract" | "logistics" | "payment" | "content" | "script";

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
            centerBody ? "gap-0 pt-0 justify-center" : "gap-4 pt-1"
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

function HubProgressRing({
  percent,
  size = "md",
}: {
  percent: number;
  size?: "md" | "lg";
}) {
  const large = size === "lg";
  const r = large ? 26 : 22;
  const box = large ? "h-16 w-16" : "h-14 w-14";
  const view = large ? 64 : 56;
  const center = large ? 32 : 28;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - percent / 100);

  return (
    <div className={cn("relative shrink-0", box)}>
      <svg className={cn(box, "-rotate-90")} viewBox={`0 0 ${view} ${view}`} aria-hidden>
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="var(--brand-100)"
          strokeWidth={large ? 5 : 4}
        />
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="var(--brand)"
          strokeWidth={large ? 5 : 4}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center font-bold text-gray-900",
          large ? "text-sm" : "text-xs"
        )}
      >
        {percent}%
      </span>
    </div>
  );
}

function HubProgressOverview({
  statusLabel,
  current,
  total,
  percent,
}: {
  statusLabel: string;
  current: number;
  total: number;
  percent: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">
          {statusLabel}
        </p>
        <p className="mt-2 text-[22px] font-bold leading-none tabular-nums">
          <span className="text-brand">{current}</span>{" "}
          <span className="text-sm font-semibold text-gray-400">/ {total}</span>
        </p>
      </div>
      <HubProgressRing percent={percent} />
    </div>
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
      <HubStatusList>
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
}: {
  campaignId: string;
  onNavigate?: (tab: CampaignTab) => void;
  initialSection?: HubSection;
  initialScriptKolId?: string;
  figmaCapture?: boolean;
}) {
  const [activeSection, setActiveSection] = useState<HubSection | null>(
    initialSection ?? null
  );

  const openContract = () => setActiveSection("contract");
  const openLogistics = () => setActiveSection("logistics");
  const openPayment = () => setActiveSection("payment");
  const openContent = () => setActiveSection("content");
  const openScript = () => setActiveSection("script");

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
            <HubStatusList>
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
            <HubStatusList>
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
          centerBody
          onEnter={openContent}
          onGo={openContent}
        >
          <ContentHubOverview />
        </HubCell>

        <HubCell
          title="Posting"
          icon={Send}
          iconClassName="bg-emerald-50 text-emerald-600"
          onGo={() => onNavigate?.("Pipeline")}
        >
          <>
            <HubProgressOverview
              statusLabel="Posted"
              current={1}
              total={8}
              percent={13}
            />
            <HubStatusList>
              <HubStatus label="Ready" value={7} tone="sky" />
              <HubStatus label="In Progress" value={7} tone="amber" />
            </HubStatusList>
          </>
        </HubCell>

        <HubCell
          title="Script"
          icon={ScrollText}
          iconClassName="bg-sky-50 text-sky-600"
          onEnter={openScript}
          onGo={openScript}
        >
          <>
            <HubProgressOverview
              statusLabel="Approved"
              current={2}
              total={8}
              percent={25}
            />
            <HubStatusList>
              <HubStatus label="Pending" value={5} tone="gray" />
              <HubStatus label="Waiting for Approval" value={1} tone="sky" />
            </HubStatusList>
          </>
        </HubCell>
      </div>
    </div>
  );
}
