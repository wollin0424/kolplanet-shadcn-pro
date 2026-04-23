"use client";

import { Pencil, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlanSettingsSheet } from "@/components/PlanSettingsSheet";

const categoryTags = ["Food & Drinks", "Sports & Outdoor"];

export default function CampaignHeader() {
  return (
    <div className="shrink-0 bg-white border-b border-gray-100 px-7 py-4">
      <div className="flex items-start justify-between gap-4">
        {/* Left: title + tags */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-[18px] font-bold text-gray-900 tracking-tight">
              Domino&apos;s Q2 Mega Campaign SG
            </h1>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <Pencil size={14} />
            </button>
            <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600 border border-gray-200">
              IN
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {categoryTags.map((tag) => (
              <button
                key={tag}
                className="text-[12px] text-gray-500 font-medium hover:text-brand hover:bg-brand-50 rounded-md px-2 py-0.5 transition-colors border border-transparent hover:border-brand-100"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Plan Settings → Sheet trigger lives inside */}
          <PlanSettingsSheet />

          <Button
            variant="outline"
            size="sm"
            className="h-8 text-[13px] gap-1.5 border-gray-200 text-gray-700"
          >
            <BookOpen size={13} />
            Planning Resource
          </Button>
        </div>
      </div>
    </div>
  );
}
