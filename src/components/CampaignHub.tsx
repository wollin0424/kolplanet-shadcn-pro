"use client";

import CampaignHubContractView from "@/components/CampaignHubContractView";
import CampaignHubLogisticsView from "@/components/CampaignHubLogisticsView";
import type { CampaignTab } from "@/components/CampaignDetailHeader";
import { cn } from "@/lib/utils";
import { useState, type MouseEvent } from "react";
import {
  IconHubContent,
  IconHubContract,
  IconHubGoChevron,
  IconHubInfo,
  IconHubList,
  IconHubLogistics,
  IconHubPayment,
  IconHubPosting,
  IconHubScript,
  type LucideIcon,
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

const statusToneClass: Record<StatusTone, string> = {
  green: "border-emerald-200 bg-emerald-50 text-emerald-800",
  sky: "border-sky-200 bg-sky-50 text-sky-800",
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  gray: "border-gray-200 bg-gray-50 text-gray-700",
  brand: "border-brand-100 bg-brand-50 text-brand",
  purple: "border-violet-200 bg-violet-50 text-violet-800",
  red: "border-red-200 bg-red-50 text-red-800",
  violet: "border-violet-200 bg-violet-50 text-violet-800",
};

function HubCountBadge({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200/80 bg-amber-50 px-2.5 py-1 text-[12px] font-semibold text-amber-700">
      <IconHubList size={12} className="opacity-75" />
      {count}
    </span>
  );
}

function HubGoButton({ onClick }: { onClick?: (e: MouseEvent<HTMLButtonElement>) => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50"
    >
      Go
      <IconHubGoChevron size={14} strokeWidth={2.5} />
    </button>
  );
}

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
        "inline-flex w-fit max-w-full items-center rounded-full border px-3 py-2 text-[12px] font-semibold leading-none whitespace-nowrap",
        statusToneClass[tone]
      )}
    >
      {label}: {value}
    </span>
  );
}

function HubStatusList({ children }: { children: ReactNode }) {
  return <div className="mt-0 flex flex-wrap gap-x-2 gap-y-1.5">{children}</div>;
}

export type HubSection = "contract" | "logistics";

function HubCell({
  title,
  icon: Icon,
  iconClassName,
  badgeCount,
  children,
  onGo,
  onEnter,
}: {
  title: string;
  icon: LucideIcon;
  iconClassName: string;
  badgeCount: number;
  children: ReactNode;
  onGo?: () => void;
  onEnter?: () => void;
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
        "flex h-full min-h-0 flex-col gap-3 rounded-xl border border-gray-100 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors",
        onEnter && "cursor-pointer hover:border-gray-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
      )}
    >
      <div className="flex shrink-0 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
              iconClassName
            )}
          >
            <Icon size={17} strokeWidth={2} />
          </span>
          <span className="flex min-w-0 items-center gap-1.5">
            <h3 className="truncate text-[14px] font-semibold text-gray-900">{title}</h3>
            <IconHubInfo size={14} className="shrink-0 text-gray-300" aria-hidden />
          </span>
        </div>
        <HubCountBadge count={badgeCount} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 pt-2">{children}</div>
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
          large ? "text-[13px]" : "text-[12px]"
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
        <p className="mt-1.5 text-[22px] font-bold leading-none text-gray-900 tabular-nums">
          {current}{" "}
          <span className="text-[14px] font-semibold text-gray-400">/ {total}</span>
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
        <HubStatus label="Pending Draft" value={2} tone="sky" />
        <HubStatus label="Awaiting Sending" value={1} tone="violet" />
        <HubStatus label="Signing" value={1} tone="green" />
      </HubStatusList>
    </>
  );
}

export default function CampaignHub({
  campaignId,
  onNavigate,
  initialSection,
}: {
  campaignId: string;
  onNavigate?: (tab: CampaignTab) => void;
  initialSection?: HubSection;
}) {
  const [activeSection, setActiveSection] = useState<HubSection | null>(
    initialSection ?? null
  );

  const openContract = () => setActiveSection("contract");
  const openLogistics = () => setActiveSection("logistics");

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

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto">
      <span className="sr-only">{campaignId}</span>
      <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-3 gap-4">
        <HubCell
          title="Contract"
          icon={IconHubContent}
          iconClassName="bg-sky-50 text-sky-600"
          badgeCount={5}
          onEnter={openContract}
          onGo={openContract}
        >
          <ContractHubOverview />
        </HubCell>

        <HubCell
          title="Logistics"
          icon={IconHubLogistics}
          iconClassName="bg-emerald-50 text-emerald-600"
          badgeCount={4}
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
              <HubStatus label="Delivered" value={4} tone="green" />
              <HubStatus label="In Transit" value={1} tone="sky" />
              <HubStatus label="Out of Delivery" value={0} tone="purple" />
              <HubStatus label="Awaiting Pickup" value={3} tone="amber" />
              <HubStatus label="Delivery Failed" value={0} tone="red" />
            </HubStatusList>
          </>
        </HubCell>

        <HubCell
          title="Payment"
          icon={IconHubPayment}
          iconClassName="bg-violet-50 text-violet-600"
          badgeCount={7}
          onGo={() => onNavigate?.("Payment")}
        >
          <>
            <HubProgressOverview
              statusLabel="All Paid"
              current={1}
              total={5}
              percent={20}
            />
            <HubStatusList>
              <HubStatus label="Partially Paid" value={1} tone="sky" />
              <HubStatus label="Validated" value={1} tone="green" />
              <HubStatus label="Waiting for Validation" value={1} tone="amber" />
              <HubStatus label="Rejected" value={1} tone="red" />
            </HubStatusList>
          </>
        </HubCell>

        <HubCell
          title="Script"
          icon={IconHubContract}
          iconClassName="bg-sky-50 text-sky-600"
          badgeCount={5}
          onGo={() => onNavigate?.("Pipeline")}
        >
          <>
            <HubProgressOverview
              statusLabel="Approved"
              current={2}
              total={8}
              percent={25}
            />
            <HubStatusList>
              <HubStatus label="Pending" value={5} tone="amber" />
              <HubStatus label="Needs Revision" value={1} tone="red" />
            </HubStatusList>
          </>
        </HubCell>

        <HubCell
          title="Content"
          icon={IconHubScript}
          iconClassName="bg-amber-50 text-amber-600"
          badgeCount={6}
          onGo={() => onNavigate?.("Pipeline")}
        >
          <>
            <HubProgressOverview
              statusLabel="Approved"
              current={3}
              total={8}
              percent={38}
            />
            <HubStatusList>
              <HubStatus label="Video Pending" value={6} tone="amber" />
              <HubStatus label="Copy Approved" value={3} tone="sky" />
            </HubStatusList>
          </>
        </HubCell>

        <HubCell
          title="Posting"
          icon={IconHubPosting}
          iconClassName="bg-emerald-50 text-emerald-600"
          badgeCount={7}
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
      </div>
    </div>
  );
}
