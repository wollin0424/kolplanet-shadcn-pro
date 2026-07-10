"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { InfluencerAvatar } from "@/components/InfluencerAvatar";
import { PlatformIcon, platformFromLabel } from "@/components/PlatformIcon";
import {
  BREAKDOWN_ROWS,
  BREAKDOWN_TIERS,
  CAMPAIGN_REPORT_OVERVIEW,
  EFFICIENCY_METRICS,
  getCampaignReportInfluencerRows,
  LEADERBOARD_ROWS,
  PERFORMANCE_METRICS,
  REPORT_OVERVIEW_ANCHORS,
  REPORT_PLATFORMS,
  TIMELINE_POINTS,
  TOP_CONTENT_ITEMS,
  type LeaderboardMetric,
  type ReportPlatformFilter,
} from "@/lib/campaignReportMock";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  Clapperboard,
  Eye,
  Info,
  MessageSquare,
  Play,
  Star,
  TrendingUp,
  Users,
} from "@/lib/icons";

const LEADERBOARD_METRICS: LeaderboardMetric[] = [
  "View",
  "Engagement",
  "View Rate",
  "Engagement Rate",
];

const LEADERBOARD_BAR_GRADIENT = [
  "from-[#b8d9ff] to-[#7eb8ff]",
  "from-[#9ecaff] to-[#5fa3f8]",
  "from-[#84bafd] to-[#4a94f5]",
  "from-[#6aa8f7] to-[#3b82e8]",
  "from-[#4f94f0] to-[#2a66e8]",
];

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="h-[18px] w-[3px] rounded-full bg-brand shrink-0" aria-hidden />
      <h2 className="text-[15px] font-semibold tracking-tight text-gray-900">{title}</h2>
      <button
        type="button"
        className="inline-flex text-gray-300 transition-colors hover:text-gray-400"
        aria-label={`About ${title}`}
      >
        <Info size={13} strokeWidth={2} />
      </button>
    </div>
  );
}

function MetricLabel({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-1 text-[11.5px] font-medium text-gray-500">
      {children}
      <Info size={11} className="text-gray-300" strokeWidth={2} />
    </div>
  );
}

function HeroMetricCard({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix?: ReactNode;
}) {
  return (
    <div className="flex min-h-[92px] flex-col justify-between rounded-xl bg-gradient-to-b from-brand-50/70 to-white px-4 py-3.5 ring-1 ring-brand/[0.07]">
      <MetricLabel>{label}</MetricLabel>
      <div className="mt-2 flex items-end gap-3">
        <p className="text-[26px] font-bold leading-none tracking-tight tabular-nums text-gray-900">
          {value}
        </p>
        {suffix}
      </div>
    </div>
  );
}

function MetricTile({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex min-h-[76px] flex-col justify-between rounded-xl bg-brand-50/35 px-3.5 py-3 ring-1 ring-brand/[0.05] transition-colors hover:bg-brand-50/55">
      <MetricLabel>{label}</MetricLabel>
      <p
        className={cn(
          "mt-2 text-[20px] font-semibold leading-none tracking-tight tabular-nums",
          muted ? "text-gray-300" : "text-gray-900"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function PlatformFilterPills({
  platforms,
  value,
  onChange,
  includeAll = true,
}: {
  platforms: readonly ReportPlatformFilter[];
  value: ReportPlatformFilter;
  onChange: (p: ReportPlatformFilter) => void;
  includeAll?: boolean;
}) {
  const items = includeAll ? platforms : platforms.filter((p) => p !== "All");

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((p) => {
        const active = value === p;
        const code = p !== "All" ? platformFromLabel(p) : undefined;
        return (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={cn(
              "inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[12px] font-medium transition-all",
              active
                ? "bg-brand text-white shadow-[0_2px_8px_rgba(42,102,232,0.22)]"
                : "bg-white text-gray-600 ring-1 ring-gray-200/80 hover:ring-brand/20 hover:text-brand"
            )}
          >
            {code ? <PlatformIcon platform={code} size={13} /> : null}
            {p}
          </button>
        );
      })}
    </div>
  );
}

function ReportSection({
  id,
  title,
  children,
  actions,
  className,
}: {
  id: string;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-6 border-b border-gray-100/90 pb-10 pt-8 first:pt-0 last:border-0 last:pb-6",
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <SectionHeading title={title} />
        {actions}
      </div>
      {children}
    </section>
  );
}

function BreakdownIcon({ type }: { type: (typeof BREAKDOWN_ROWS)[number]["icon"] }) {
  if (type === "users") return <Users size={13} className="text-gray-400" strokeWidth={2} />;
  if (type === "clapperboard")
    return <Clapperboard size={13} className="text-gray-400" strokeWidth={2} />;
  if (type === "eye") return <Eye size={13} className="text-gray-400" strokeWidth={2} />;
  if (type === "trending")
    return <TrendingUp size={13} className="text-gray-400" strokeWidth={2} />;
  return <span className="text-[11px] font-medium text-gray-400">%</span>;
}

function MetricSegmentedControl({
  options,
  value,
  onChange,
}: {
  options: readonly LeaderboardMetric[];
  value: LeaderboardMetric;
  onChange: (v: LeaderboardMetric) => void;
}) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-lg bg-gray-100/90 p-0.5 ring-1 ring-gray-200/50">
      {options.map((metric) => {
        const active = value === metric;
        return (
          <button
            key={metric}
            type="button"
            onClick={() => onChange(metric)}
            className={cn(
              "rounded-md px-2.5 py-1 text-[11px] font-medium whitespace-nowrap transition-all",
              active
                ? "bg-white text-brand shadow-[0_1px_3px_rgba(15,23,42,0.06)]"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {active ? (
              <span className="mr-1.5 inline-block size-1.5 rounded-full bg-brand align-middle" />
            ) : null}
            {metric}
          </button>
        );
      })}
    </div>
  );
}

export default function CampaignReportOverview() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeAnchor, setActiveAnchor] = useState<string>(REPORT_OVERVIEW_ANCHORS[0].id);
  const [platform, setPlatform] = useState<ReportPlatformFilter>("All");
  const [breakdownPlatform, setBreakdownPlatform] = useState<ReportPlatformFilter>("Instagram");
  const [leaderboardMetric, setLeaderboardMetric] = useState<LeaderboardMetric>("View");

  const avatarById = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of getCampaignReportInfluencerRows()) {
      map.set(row.id, row.avatarUrl);
    }
    return map;
  }, []);

  const scrollToAnchor = useCallback((id: string) => {
    const root = scrollRef.current;
    const target = root?.querySelector<HTMLElement>(`#${id}`);
    if (root && target) {
      const top = target.offsetTop - root.offsetTop - 12;
      root.scrollTo({ top, behavior: "smooth" });
      setActiveAnchor(id);
    }
  }, []);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;

    const onScroll = () => {
      const scrollTop = root.scrollTop;
      let current: string = REPORT_OVERVIEW_ANCHORS[0].id;
      for (const anchor of REPORT_OVERVIEW_ANCHORS) {
        const el = root.querySelector<HTMLElement>(`#${anchor.id}`);
        if (el && el.offsetTop - root.offsetTop - 32 <= scrollTop) {
          current = anchor.id;
        }
      }
      setActiveAnchor(current);
    };

    root.addEventListener("scroll", onScroll, { passive: true });
    return () => root.removeEventListener("scroll", onScroll);
  }, []);

  const overview = CAMPAIGN_REPORT_OVERVIEW;

  return (
    <div className="relative flex min-h-0 flex-1 bg-[linear-gradient(180deg,#fafbfd_0%,#ffffff_120px)]">
      <div ref={scrollRef} className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-7 py-6">
        <div className="max-w-[calc(100%-12px)]">
          <ReportSection id="overview" title="Overview">
            <div className="mt-5 grid grid-cols-3 gap-3.5">
              <HeroMetricCard label="Influencers Engaged" value={String(overview.influencersEngaged)} />
              <HeroMetricCard
                label="Posts Published"
                value={String(overview.postsPublished)}
                suffix={
                  <div className="mb-0.5 flex items-center gap-2.5 text-[12px] font-medium text-gray-500">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-1.5 py-0.5 ring-1 ring-gray-200/60">
                      <PlatformIcon platform="IG" size={13} />
                      {overview.instagramPosts}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-1.5 py-0.5 ring-1 ring-gray-200/60">
                      <PlatformIcon platform="TT" size={13} />
                      {overview.tiktokPosts}
                    </span>
                  </div>
                }
              />
              <HeroMetricCard label="Total Budget (Net)" value={overview.totalBudget} />
            </div>
          </ReportSection>

          <ReportSection id="performance" title="Performance">
            <div className="mt-4">
              <PlatformFilterPills platforms={REPORT_PLATFORMS} value={platform} onChange={setPlatform} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {PERFORMANCE_METRICS.map((metric) => (
                <MetricTile key={metric} label={metric} value="N/A" muted />
              ))}
            </div>
          </ReportSection>

          <ReportSection id="efficiency" title="Efficiency">
            <div className="mt-5 grid grid-cols-3 gap-3">
              {EFFICIENCY_METRICS.map((metric) => (
                <MetricTile key={metric} label={metric} value="N/A" muted />
              ))}
            </div>
          </ReportSection>

          <ReportSection id="breakdown" title="Influencer Breakdown">
            <div className="mt-4">
              <PlatformFilterPills
                platforms={REPORT_PLATFORMS}
                value={breakdownPlatform}
                onChange={setBreakdownPlatform}
                includeAll={false}
              />
            </div>
            <div className="mt-4 overflow-x-auto rounded-xl bg-gray-50/70 p-3 ring-1 ring-gray-100">
              <div className="min-w-[640px]">
                <div className="grid grid-cols-[148px_repeat(5,1fr)] gap-1.5">
                  <div className="px-2 py-2.5 text-[11.5px] font-medium text-gray-400">
                    Influencer Tier
                  </div>
                  {BREAKDOWN_TIERS.map((tier) => (
                    <div
                      key={tier}
                      className="rounded-lg bg-brand-50 px-2 py-2.5 text-center text-[12px] font-semibold text-brand"
                    >
                      <span className="inline-flex items-center justify-center gap-1">
                        {tier}
                        <Info size={10} className="text-brand/40" strokeWidth={2} />
                      </span>
                    </div>
                  ))}
                  {BREAKDOWN_ROWS.map((row) => (
                    <div key={row.label} className="contents">
                      <div className="flex items-center gap-1.5 px-2 py-2.5 text-[12px] font-medium text-gray-600">
                        <BreakdownIcon type={row.icon} />
                        {row.label}
                      </div>
                      {row.values.map((cell, i) => (
                        <div
                          key={`${row.label}-${BREAKDOWN_TIERS[i]}`}
                          className="rounded-lg bg-white px-2 py-2.5 text-center text-[12px] font-medium tabular-nums text-gray-800 ring-1 ring-brand/[0.04]"
                        >
                          {cell}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ReportSection>

          <ReportSection
            id="leaderboard"
            title="Influencer Leaderboard"
            actions={
              <MetricSegmentedControl
                options={LEADERBOARD_METRICS}
                value={leaderboardMetric}
                onChange={setLeaderboardMetric}
              />
            }
          >
            <div className="mt-5 space-y-3.5">
              {LEADERBOARD_ROWS.map((row, index) => (
                <div key={row.id} className="flex items-center gap-3">
                  <div className="relative w-9 shrink-0">
                    {row.top ? (
                      <Star
                        size={11}
                        className="absolute -left-0.5 -top-0.5 z-10 fill-amber-400 text-amber-400 drop-shadow-sm"
                      />
                    ) : null}
                    <InfluencerAvatar
                      src={avatarById.get(row.id)}
                      alt={row.name}
                      size="sm"
                      fallback={initials(row.name)}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="relative h-8 overflow-hidden rounded-full bg-gray-100/90">
                      <div
                        className={cn(
                          "absolute inset-y-0 left-0 rounded-full bg-gradient-to-r shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition-[width] duration-500 ease-out",
                          LEADERBOARD_BAR_GRADIENT[index]
                        )}
                        style={{ width: `${row.value}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-11 shrink-0 text-right text-[12px] font-semibold tabular-nums text-gray-600">
                    {row.value.toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between pl-12 pr-14 text-[10px] font-medium text-gray-300 tabular-nums">
                {Array.from({ length: 11 }, (_, i) => i * 10).map((n) => (
                  <span key={n}>{n}</span>
                ))}
              </div>
            </div>
          </ReportSection>

          <ReportSection id="timeline" title="Posting Timeline">
            <div className="mt-6 overflow-x-auto pb-1">
              <div className="min-w-[600px] px-3">
                <div className="relative flex justify-between pt-10">
                  <div className="absolute left-3 right-3 top-[46px] h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                  {TIMELINE_POINTS.map((point) => (
                    <div key={point.date} className="relative z-[1] flex flex-col items-center">
                      <div className="absolute bottom-[calc(100%+10px)] flex flex-col items-center gap-1">
                        {point.kolIds.map((kolId) => (
                          <InfluencerAvatar
                            key={kolId}
                            src={avatarById.get(kolId)}
                            alt={kolId}
                            size="sm"
                            fallback={kolId.slice(0, 2).toUpperCase()}
                            className="ring-2 ring-white shadow-sm"
                          />
                        ))}
                      </div>
                      <span className="mt-3 size-2 rounded-full bg-brand/80 ring-4 ring-brand/10" />
                      <span className="mt-2 text-[11px] font-medium text-gray-500 whitespace-nowrap">
                        {point.date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ReportSection>

          <ReportSection id="top-content" title="Top Content">
            <div className="relative mt-5">
              <div className="no-scrollbar flex gap-3.5 overflow-x-auto pb-1 pr-12">
                {TOP_CONTENT_ITEMS.map((item) => (
                  <article
                    key={item.id}
                    className="group w-[132px] shrink-0 cursor-pointer"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-200/70 transition-all group-hover:-translate-y-0.5 group-hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
                      <InfluencerAvatar
                        src={avatarById.get(item.kolId)}
                        alt={item.kolId}
                        size="lg"
                        fallback={item.kolId.slice(0, 2).toUpperCase()}
                        avatarClassName="size-full rounded-xl"
                        className="absolute inset-0 size-full"
                      />
                      <span className="absolute right-1.5 top-1.5 inline-flex size-5 items-center justify-center rounded-md bg-black/45 text-white backdrop-blur-[2px]">
                        <Play size={10} fill="currentColor" />
                      </span>
                    </div>
                    <div className="mt-2.5 flex items-center gap-2.5 text-[11px] font-medium text-gray-600">
                      <span className="inline-flex items-center gap-0.5">
                        <Star size={11} className="text-gray-400" />
                        {item.likes}
                      </span>
                      <span className="inline-flex items-center gap-0.5">
                        <MessageSquare size={11} className="text-gray-400" />
                        {item.comments}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[10px] text-gray-400">{item.date}</p>
                  </article>
                ))}
              </div>
              <button
                type="button"
                className="absolute right-0 top-[calc(50%-22px)] inline-flex size-9 items-center justify-center rounded-full bg-white text-gray-500 shadow-[0_2px_10px_rgba(15,23,42,0.08)] ring-1 ring-gray-200/80 transition-all hover:text-brand hover:ring-brand/20"
                aria-label="Scroll right"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </ReportSection>
        </div>
      </div>

      <aside className="relative hidden w-[168px] shrink-0 xl:block">
        <nav
          className="sticky top-5 mx-3 my-5 space-y-0.5 rounded-xl border border-gray-100 bg-white/95 px-2 py-2.5 shadow-[0_4px_20px_rgba(15,23,42,0.05)] backdrop-blur-sm"
          aria-label="Report sections"
        >
          {REPORT_OVERVIEW_ANCHORS.map((anchor) => {
            const active = activeAnchor === anchor.id;
            return (
              <button
                key={anchor.id}
                type="button"
                onClick={() => scrollToAnchor(anchor.id)}
                className={cn(
                  "block w-full rounded-lg px-2.5 py-1.5 text-left text-[12px] font-medium transition-all",
                  active
                    ? "bg-brand-50 text-brand shadow-[inset_0_0_0_1px_rgba(42,102,232,0.08)]"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                )}
              >
                {anchor.label}
              </button>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}
