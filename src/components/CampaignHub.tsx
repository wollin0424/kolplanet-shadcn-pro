"use client";

import CampaignHubContractView from "@/components/CampaignHubContractView";
import CampaignHubLogisticsView from "@/components/CampaignHubLogisticsView";
import type { CampaignTab } from "@/components/CampaignDetailHeader";
import { cn } from "@/lib/utils";
import { useState, type MouseEvent } from "react";
import {
  ChevronRight,
  Clapperboard,
  CreditCard,
  FileText,
  Info,
  List,
  ScrollText,
  Send,
  Truck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type StatusTone = "green" | "sky" | "amber" | "gray" | "brand";

const statusToneClass: Record<StatusTone, string> = {
  green: "border-emerald-200 bg-emerald-50 text-emerald-800",
  sky: "border-sky-200 bg-sky-50 text-sky-800",
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  gray: "border-gray-200 bg-gray-50 text-gray-700",
  brand: "border-brand-100 bg-brand-50 text-brand",
};

function HubCountBadge({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200/80 bg-amber-50 px-2.5 py-1 text-[12px] font-semibold text-amber-700">
      <List size={12} className="opacity-75" />
      {count}
    </span>
  );
}

function HubGoButton({ onClick }: { onClick?: (e: MouseEvent<HTMLButtonElement>) => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-lg bg-[#e8f1fb] px-3 py-1.5 text-[13px] font-semibold text-brand hover:bg-[#dce9f8] transition-colors"
    >
      Go
      <ChevronRight size={14} strokeWidth={2.5} />
    </button>
  );
}

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

function HubContentBox({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4",
        className
      )}
    >
      {children}
    </div>
  );
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
        "flex h-full min-h-0 flex-col gap-3 p-6 transition-colors hover:bg-gray-50/80",
        onEnter && "cursor-pointer"
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
            <Info size={14} className="shrink-0 text-gray-300" aria-hidden />
          </span>
        </div>
        <HubCountBadge count={badgeCount} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <div className="flex flex-col gap-3">{children}</div>
        <div className="mt-auto flex justify-end pt-2">
          <HubGoButton onClick={handleGo} />
        </div>
      </div>
    </section>
  );
}

function ContractProgressRing({ percent }: { percent: number }) {
  const r = 22;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - percent / 100);

  return (
    <div className="relative h-14 w-14 shrink-0">
      <svg className="h-14 w-14 -rotate-90" viewBox="0 0 56 56" aria-hidden>
        <circle cx="28" cy="28" r={r} fill="none" stroke="#e5e7eb" strokeWidth="4" />
        <circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          stroke="#2563eb"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[12px] font-bold text-gray-900">
        {percent}%
      </span>
    </div>
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
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <span className="sr-only">{campaignId}</span>
      <div className="grid min-h-0 flex-1 grid-cols-3 grid-rows-2 divide-x divide-y divide-gray-100">
        <HubCell
          title="Contract"
          icon={FileText}
          iconClassName="bg-sky-50 text-sky-600"
          badgeCount={5}
          onEnter={openContract}
          onGo={openContract}
        >
          <HubContentBox>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[22px] font-bold leading-none text-gray-900 tabular-nums">
                  2 <span className="text-[15px] font-semibold text-gray-400">/ 8</span>
                </p>
                <p className="mt-0.5 text-[12px] text-gray-500">Countersigned</p>
              </div>
              <ContractProgressRing percent={25} />
            </div>
            <HubStatusList>
              <HubStatus label="Contract Info" value="6/8" tone="sky" />
              <HubStatus label="Draft" value="4/8" tone="sky" />
              <HubStatus label="Advertiser Sign" value="3/8" tone="sky" />
              <HubStatus label="KOL Sign" value="2/8" tone="sky" />
            </HubStatusList>
          </HubContentBox>
        </HubCell>

        <HubCell
          title="Logistics"
          icon={Truck}
          iconClassName="bg-emerald-50 text-emerald-600"
          badgeCount={4}
          onEnter={openLogistics}
          onGo={openLogistics}
        >
          <HubStatusList>
            <HubStatus label="Delivered" value={4} tone="green" />
            <HubStatus label="In Transit" value={1} tone="sky" />
            <HubStatus label="To Ship" value={3} tone="amber" />
          </HubStatusList>
        </HubCell>

        <HubCell
          title="Payment"
          icon={CreditCard}
          iconClassName="bg-violet-50 text-violet-600"
          badgeCount={7}
          onGo={() => onNavigate?.("Payment")}
        >
          <HubContentBox className="gap-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              Total Paid / Approved
            </p>
            <p className="mt-0.5 text-[22px] font-bold leading-none text-gray-900 tabular-nums">
              $40,000 <span className="text-[15px] font-semibold text-gray-400">/ $50,000</span>
            </p>
          </HubContentBox>
          <HubStatusList>
            <HubStatus label="Validated Influencers" value="4/5" tone="sky" />
            <HubStatus label="Invoice Uploaded" value="2/5" tone="gray" />
          </HubStatusList>
        </HubCell>

        <HubCell
          title="Script"
          icon={ScrollText}
          iconClassName="bg-sky-50 text-sky-600"
          badgeCount={5}
          onGo={() => onNavigate?.("Pipeline")}
        >
          <HubStatusList>
            <HubStatus label="Approved" value={2} tone="green" />
            <HubStatus label="Pending" value={5} tone="amber" />
            <HubStatus label="Needs Revision" value={1} tone="gray" />
          </HubStatusList>
        </HubCell>

        <HubCell
          title="Content"
          icon={Clapperboard}
          iconClassName="bg-amber-50 text-amber-600"
          badgeCount={6}
          onGo={() => onNavigate?.("Pipeline")}
        >
          <HubStatusList>
            <HubStatus label="Approved" value={3} tone="green" />
            <HubStatus label="Video Pending" value={6} tone="amber" />
            <HubStatus label="Copy Approved" value={3} tone="sky" />
          </HubStatusList>
        </HubCell>

        <HubCell
          title="Posting"
          icon={Send}
          iconClassName="bg-emerald-50 text-emerald-600"
          badgeCount={7}
          onGo={() => onNavigate?.("Pipeline")}
        >
          <HubStatusList>
            <HubStatus label="Posted" value={1} tone="green" />
            <HubStatus label="Ready" value={7} tone="sky" />
            <HubStatus label="In Progress" value={7} tone="brand" />
          </HubStatusList>
        </HubCell>
      </div>
    </div>
  );
}
