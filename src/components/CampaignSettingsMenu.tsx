"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CampaignSettingsPlaceholderSheet } from "@/components/CampaignSettingsPlaceholderSheet";
import { ExecutionGuideSheet } from "@/components/ExecutionGuideSheet";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Info,
  Play,
  Settings,
  Users,
  Wallet,
  type AppIcon,
} from "@/lib/icons";

export type CampaignSettingsSection =
  | "basic-info"
  | "execution-guide"
  | "commercial-finance"
  | "team-assignment";

type SettingsMenuItem = {
  id: CampaignSettingsSection;
  label: string;
  icon: AppIcon;
  complete: boolean;
};

const SETTINGS_MENU_ITEMS: SettingsMenuItem[] = [
  { id: "basic-info", label: "Basic Info", icon: Info, complete: true },
  { id: "execution-guide", label: "Execution Guide", icon: Play, complete: false },
  { id: "commercial-finance", label: "Commercial & Finance", icon: Wallet, complete: false },
  { id: "team-assignment", label: "Team Assignment", icon: Users, complete: false },
];

function SettingsStatusIcon({ complete }: { complete: boolean }) {
  if (complete) {
    return <CheckCircle2 size={16} className="shrink-0 text-emerald-500" strokeWidth={2} />;
  }

  return (
    <span className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
      <AlertCircle size={11} strokeWidth={2.5} />
    </span>
  );
}

export function CampaignSettingsMenu({
  figmaCapture = false,
  figmaOpenExecutionGuide = false,
}: {
  figmaCapture?: boolean;
  figmaOpenExecutionGuide?: boolean;
} = {}) {
  const [openSection, setOpenSection] = useState<CampaignSettingsSection | null>(() =>
    figmaCapture && figmaOpenExecutionGuide ? "execution-guide" : null
  );

  const openSheet = (section: CampaignSettingsSection) => {
    setOpenSection(section);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 border-gray-200 text-[13px] text-gray-700"
            />
          }
        >
          <Settings size={14} className="text-gray-500" strokeWidth={2} />
          Campaign Settings
          <ChevronDown size={13} className="text-gray-400" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[248px] p-1.5">
          {SETTINGS_MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => openSheet(item.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors",
                  "hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25"
                )}
              >
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                  <Icon size={15} strokeWidth={2} />
                </span>
                <span className="min-w-0 flex-1 text-[13px] font-medium text-gray-800">
                  {item.label}
                </span>
                <SettingsStatusIcon complete={item.complete} />
              </button>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <ExecutionGuideSheet
        open={openSection === "execution-guide"}
        onOpenChange={(open) => {
          if (!open && openSection === "execution-guide") setOpenSection(null);
        }}
        figmaCapture={figmaCapture && figmaOpenExecutionGuide}
      />

      <CampaignSettingsPlaceholderSheet
        open={openSection === "basic-info"}
        onOpenChange={(open) => {
          if (!open && openSection === "basic-info") setOpenSection(null);
        }}
        title="Basic Info"
        description="Basic campaign information will be configured here. This section is marked complete in the menu preview."
      />

      <CampaignSettingsPlaceholderSheet
        open={openSection === "commercial-finance"}
        onOpenChange={(open) => {
          if (!open && openSection === "commercial-finance") setOpenSection(null);
        }}
        title="Commercial & Finance"
        description="Commercial and finance settings will be added in a follow-up pass."
      />

      <CampaignSettingsPlaceholderSheet
        open={openSection === "team-assignment"}
        onOpenChange={(open) => {
          if (!open && openSection === "team-assignment") setOpenSection(null);
        }}
        title="Team Assignment"
        description="Team assignment settings will be added in a follow-up pass."
      />
    </>
  );
}
