"use client";

import { useState } from "react";
import CampaignReportContentView from "@/components/CampaignReportContentView";
import CampaignReportInfluencerTable from "@/components/CampaignReportInfluencerTable";
import CampaignReportOverview from "@/components/CampaignReportOverview";
import { type ReportSection, REPORT_SECTIONS } from "@/lib/campaignReportMock";
import { cn } from "@/lib/utils";
import { Images, Share2, Sparkles, TrendingUp, UsersRound } from "@/lib/icons";

const SECTION_ICONS: Record<ReportSection, typeof TrendingUp> = {
  overview: TrendingUp,
  influencer: UsersRound,
  content: Images,
};

export default function CampaignReportView({
  initialSection = "overview",
}: {
  initialSection?: ReportSection;
}) {
  const [section, setSection] = useState<ReportSection>(initialSection);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-white ring-1 ring-gray-100/90 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-gray-100/90 bg-gradient-to-b from-gray-50/70 to-white px-6 py-3.5">
        <div className="inline-flex items-center gap-1 rounded-[10px] bg-gray-100/80 p-1 ring-1 ring-gray-200/40">
          {REPORT_SECTIONS.map(({ id, label }) => {
            const Icon = SECTION_ICONS[id];
            const active = section === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSection(id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[13px] font-medium transition-all",
                  active
                    ? "bg-white text-brand shadow-[0_1px_4px_rgba(15,23,42,0.06)] ring-1 ring-gray-200/50"
                    : "text-gray-500 hover:text-gray-700"
                )}
                aria-current={active ? "true" : undefined}
              >
                <Icon size={14} className={active ? "text-brand" : "text-gray-400"} strokeWidth={2} />
                {label}
              </button>
            );
          })}
        </div>

        {section === "overview" ? (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-1.5 text-[13px] font-medium text-white shadow-[0_2px_8px_rgba(42,102,232,0.24)] transition-all hover:bg-brand/92"
            >
              <Sparkles size={14} strokeWidth={2} />
              AI Summary
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[13px] font-medium text-gray-600 ring-1 ring-gray-200/80 transition-all hover:text-gray-900 hover:ring-gray-300"
            >
              <Share2 size={14} className="text-gray-400" strokeWidth={2} />
              Share
            </button>
          </div>
        ) : null}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {section === "overview" ? (
          <CampaignReportOverview />
        ) : section === "influencer" ? (
          <CampaignReportInfluencerTable />
        ) : (
          <CampaignReportContentView />
        )}
      </div>
    </div>
  );
}
