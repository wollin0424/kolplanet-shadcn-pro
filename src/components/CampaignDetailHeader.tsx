"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ChevronDown, ExternalLink, MoreHorizontal } from "lucide-react";

const TABS = ["Pipeline", "Payment", "Report"] as const;
export type CampaignTab = (typeof TABS)[number];

export default function CampaignDetailHeader({
  campaignId,
  tab,
  onTabChange,
}: {
  campaignId: string;
  tab: CampaignTab;
  onTabChange: (t: CampaignTab) => void;
}) {

  const title = useMemo(() => {
    if (campaignId.toLowerCase().includes("bud")) return "Budweiser 2024 Sales Drive";
    return "Campaign";
  }, [campaignId]);

  return (
    <div className="bg-white">
      {/* Header row */}
      <div className="px-7 py-5 border-b border-gray-100">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 shrink-0" />

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-[18px] font-bold text-gray-900 tracking-tight truncate">
                  {title}
                </h1>
              </div>

              <div className="mt-1.5 flex items-center gap-2 flex-wrap text-[12px] text-gray-500">
                <span className="text-gray-500">Brand ABC</span>
                <span className="text-gray-200">•</span>
                <span className="text-gray-500">ID, IN, MY, PH</span>
                <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
                  New
                </span>
                <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
                  ⚠ Settings Incomplete
                </span>
              </div>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-[13px] gap-1.5 border-gray-200 text-gray-700"
            >
              Campaign Settings
              <ChevronDown size={13} className="text-gray-400" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-8 text-[13px] border-gray-200 text-gray-700"
            >
              Activate
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center h-8 px-3 rounded-md border border-gray-200 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors">
                More
                <ChevronDown size={13} className="ml-1 text-gray-400" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem>
                  <ExternalLink size={14} />
                  Open in new tab
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MoreHorizontal size={14} />
                  More actions
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Tabs strip (page switcher) */}
      <div className="px-7 border-b border-gray-100">
        <nav className="flex items-center gap-7" aria-label="Campaign sections">
          {TABS.map((t) => {
            const isActive = tab === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => onTabChange(t)}
                className={cn(
                  "relative py-3 text-[13px] font-medium transition-colors",
                  isActive ? "text-brand" : "text-gray-500 hover:text-gray-800"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="inline-flex items-center gap-1.5">
                  {t}
                  {t === "Report" && (
                    <ExternalLink size={12} className="text-gray-300" />
                  )}
                </span>
                {isActive && (
                  <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-brand rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

