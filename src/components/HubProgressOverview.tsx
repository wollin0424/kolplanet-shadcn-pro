"use client";

import { cn } from "@/lib/utils";
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
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  sky: "border-sky-200 bg-sky-50 text-sky-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  gray: "border-gray-200 bg-gray-50 text-gray-700",
  brand: "border-brand/20 bg-brand-50 text-brand",
  purple: "border-violet-200 bg-violet-50 text-violet-700",
  red: "border-red-200 bg-red-50 text-red-700",
  violet: "border-violet-200 bg-violet-50 text-violet-700",
};

export function HubStatus({
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

export function HubStatusList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("mt-3 flex flex-wrap gap-x-2 gap-y-2", className)}>{children}</div>;
}

export function HubProgressRing({
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

export function HubProgressOverview({
  statusLabel,
  current,
  total,
  percent,
  ringSize = "md",
}: {
  statusLabel: string;
  current: number;
  total: number;
  percent: number;
  ringSize?: "md" | "lg";
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">{statusLabel}</p>
        <p className="mt-2 text-[22px] font-bold leading-none tabular-nums">
          <span className="text-brand">{current}</span>{" "}
          <span className="text-sm font-semibold text-gray-400">/ {total}</span>
        </p>
      </div>
      <HubProgressRing percent={percent} size={ringSize} />
    </div>
  );
}
