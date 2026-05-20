"use client";

import CampaignHubContractView from "@/components/CampaignHubContractView";
import CampaignHubLogisticsView from "@/components/CampaignHubLogisticsView";
import type { CampaignTab } from "@/components/CampaignDetailHeader";
import { cn } from "@/lib/utils";
import { useState, type MouseEvent } from "react";
import {
  AlertCircle,
  Check,
  ChevronRight,
  Clapperboard,
  CreditCard,
  FileText,
  Hourglass,
  Info,
  List,
  Package,
  ScrollText,
  Send,
  Truck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
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

type HubStatusIcon = "hourglass" | "check" | "truck" | "alert" | "package";

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

const statusIcons: Record<HubStatusIcon, LucideIcon> = {
  hourglass: Hourglass,
  check: Check,
  truck: Truck,
  alert: AlertCircle,
  package: Package,
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
      className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-3 py-1.5 text-[13px] font-semibold text-brand hover:bg-brand-100 transition-colors"
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
  icon,
}: {
  label: string;
  value: string | number;
  tone?: StatusTone;
  icon?: HubStatusIcon;
}) {
  const resolvedIcon =
    icon ?? (tone === "amber" ? ("hourglass" as const) : undefined);
  const Icon = resolvedIcon ? statusIcons[resolvedIcon] : null;

  return (
    <span
      className={cn(
        "inline-flex w-fit max-w-full items-center gap-1.5 rounded-full border px-3 py-2 text-[12px] font-semibold leading-none whitespace-nowrap",
        statusToneClass[tone]
      )}
    >
      {Icon ? <Icon size={12} className="shrink-0 opacity-80" /> : null}
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
  emphasized,
}: {
  title: string;
  icon: LucideIcon;
  iconClassName: string;
  badgeCount: number;
  children: ReactNode;
  onGo?: () => void;
  onEnter?: () => void;
  emphasized?: boolean;
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
        "flex h-full min-h-0 flex-col gap-3 rounded-xl border bg-white p-5 transition-colors",
        emphasized
          ? "border-sky-100 shadow-[0_2px_12px_rgba(37,99,235,0.08)] ring-1 ring-sky-100/80"
          : "border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
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
            <Info size={14} className="shrink-0 text-gray-300" aria-hidden />
          </span>
        </div>
        <HubCountBadge count={badgeCount} />
      </div>

      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col",
          emphasized ? "gap-1.5" : "gap-2"
        )}
      >
        <div className={cn("flex flex-col", emphasized ? "gap-2" : "gap-3")}>
          {children}
        </div>
        <div
          className={cn(
            "mt-auto flex shrink-0 justify-end",
            emphasized ? "pt-1" : "pt-2"
          )}
        >
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
          stroke="#dbeafe"
          strokeWidth={large ? 5 : 4}
        />
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="#2563eb"
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
    <div className="flex items-center justify-between gap-3 rounded-xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-white px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-700/80">
          {statusLabel}
        </p>
        <p className="mt-0.5 text-[22px] font-bold leading-none text-gray-900 tabular-nums">
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
    <div className="flex flex-col gap-3">
      <HubProgressOverview
        statusLabel="Countersigned"
        current={2}
        total={8}
        percent={25}
      />
      <HubStatusList>
        <HubStatus label="Signing" value={1} tone="green" />
        <HubStatus label="Awaiting Sending" value={1} tone="violet" />
        <HubStatus label="Pending Draft" value={2} tone="sky" />
        <HubStatus label="Awaiting Info" value={2} tone="amber" icon="hourglass" />
      </HubStatusList>
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
    <div className="flex min-h-0 flex-1 flex-col overflow-auto">
      <span className="sr-only">{campaignId}</span>
      <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-3 gap-4">
        <HubCell
          title="Contract"
          icon={FileText}
          iconClassName="bg-sky-50 text-sky-600"
          badgeCount={5}
          emphasized
          onEnter={openContract}
          onGo={openContract}
        >
          <ContractHubOverview />
        </HubCell>

        <HubCell
          title="Logistics"
          icon={Truck}
          iconClassName="bg-emerald-50 text-emerald-600"
          badgeCount={4}
          onEnter={openLogistics}
          onGo={openLogistics}
        >
          <div className="flex flex-col gap-3">
            <HubProgressOverview
              statusLabel="Received"
              current={0}
              total={8}
              percent={0}
            />
            <HubStatusList>
              <HubStatus label="Delivered" value={4} tone="green" icon="check" />
              <HubStatus label="In Transit" value={1} tone="sky" icon="truck" />
              <HubStatus label="Out of Delivery" value={0} tone="purple" icon="package" />
              <HubStatus label="Awaiting Pickup" value={3} tone="amber" icon="hourglass" />
              <HubStatus label="Delivery Failed" value={0} tone="red" icon="alert" />
            </HubStatusList>
          </div>
        </HubCell>

        <HubCell
          title="Payment"
          icon={CreditCard}
          iconClassName="bg-violet-50 text-violet-600"
          badgeCount={7}
          onGo={() => onNavigate?.("Payment")}
        >
          <div className="flex flex-col gap-2">
            <HubProgressOverview
              statusLabel="All Paid"
              current={1}
              total={5}
              percent={20}
            />
            <HubStatusList>
              <HubStatus label="Partially Paid" value={1} tone="sky" />
              <HubStatus label="Validated" value={1} tone="green" icon="check" />
              <HubStatus
                label="Waiting for Validation"
                value={1}
                tone="amber"
                icon="hourglass"
              />
              <HubStatus label="Rejected" value={1} tone="red" icon="alert" />
            </HubStatusList>
          </div>
        </HubCell>

        <HubCell
          title="Script"
          icon={ScrollText}
          iconClassName="bg-sky-50 text-sky-600"
          badgeCount={5}
          onGo={() => onNavigate?.("Pipeline")}
        >
          <div className="flex flex-col gap-2">
            <HubProgressOverview
              statusLabel="Approved"
              current={2}
              total={8}
              percent={25}
            />
            <HubStatusList>
              <HubStatus label="Pending" value={5} tone="amber" icon="hourglass" />
              <HubStatus label="Needs Revision" value={1} tone="red" icon="alert" />
            </HubStatusList>
          </div>
        </HubCell>

        <HubCell
          title="Content"
          icon={Clapperboard}
          iconClassName="bg-amber-50 text-amber-600"
          badgeCount={6}
          onGo={() => onNavigate?.("Pipeline")}
        >
          <div className="flex flex-col gap-2">
            <HubProgressOverview
              statusLabel="Approved"
              current={3}
              total={8}
              percent={38}
            />
            <HubStatusList>
              <HubStatus label="Video Pending" value={6} tone="amber" icon="hourglass" />
              <HubStatus label="Copy Approved" value={3} tone="sky" />
            </HubStatusList>
          </div>
        </HubCell>

        <HubCell
          title="Posting"
          icon={Send}
          iconClassName="bg-emerald-50 text-emerald-600"
          badgeCount={7}
          onGo={() => onNavigate?.("Pipeline")}
        >
          <div className="flex flex-col gap-2">
            <HubProgressOverview
              statusLabel="Posted"
              current={1}
              total={8}
              percent={13}
            />
            <HubStatusList>
              <HubStatus label="Ready" value={7} tone="sky" />
              <HubStatus label="In Progress" value={7} tone="amber" icon="hourglass" />
            </HubStatusList>
          </div>
        </HubCell>
      </div>
    </div>
  );
}
