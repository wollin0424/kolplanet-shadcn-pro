"use client";

import { InfluencerAvatar } from "@/components/InfluencerAvatar";
import type { Platform } from "@/components/PlatformIcon";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  Tag,
  UserRound,
  type AppIcon,
} from "@/lib/icons";

export type KolRelationship = "Direct" | "Manager" | "MCN";

/** Shown on hover only — icon stays neutral because type is unknown until then. */
const RELATIONSHIP_LABEL: Record<KolRelationship, string> = {
  Direct: "Individual",
  Manager: "Individual / Manager",
  MCN: "Company",
};

const metaIconBase =
  "inline-flex size-5 items-center justify-center rounded-full border transition-colors";

const metaIconVariantClass = {
  identity:
    "border-violet-200 bg-violet-50 text-violet-600 group-hover:border-violet-300 group-hover:bg-violet-100",
  manager:
    "border-brand-100 bg-brand-50 text-brand group-hover:border-brand-200 group-hover:bg-brand-100",
} as const;

const metaIconTriggerClass =
  "group inline-flex shrink-0 rounded-full outline-none transition-shadow hover:shadow-[0_0_0_3px_rgba(0,0,0,0.04)] focus-visible:ring-2 focus-visible:ring-brand/25";

function KolMetaIcon({
  icon: Icon,
  variant,
}: {
  icon: AppIcon;
  variant: keyof typeof metaIconVariantClass;
}) {
  return (
    <span className={cn(metaIconBase, metaIconVariantClass[variant])} aria-hidden>
      <Icon size={12} strokeWidth={2} />
    </span>
  );
}

function HubHoverField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-gray-400">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}

export function CampaignHubInfluencerIdentity({
  name,
  handle,
  platform,
  kolManager,
  relationship,
  initials,
  avatarFallbackClassName,
  selection,
}: {
  name: string;
  handle: string;
  platform?: Platform | string;
  kolManager: string;
  relationship: KolRelationship;
  initials: string;
  avatarFallbackClassName: string;
  selection?: {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
  };
}) {
  const relationshipLabel = RELATIONSHIP_LABEL[relationship];

  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="relative shrink-0">
        <InfluencerAvatar
          alt={name}
          fallback={initials}
          platform={platform}
          size="lg"
          fallbackClassName={avatarFallbackClassName}
        />
        {selection ? (
          <Checkbox
            checked={selection.checked}
            onCheckedChange={(checked) => selection.onCheckedChange(checked === true)}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Select ${name}`}
            className="absolute -left-1 -top-1 z-10 size-5 rounded border-gray-300 bg-white shadow-sm data-checked:border-brand data-checked:bg-brand"
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1 pt-1">
        <div className="flex max-w-full min-w-0 items-center gap-1">
          <span className="truncate text-sm font-semibold text-gray-900">{name}</span>
          <Tooltip>
            <TooltipTrigger
              type="button"
              className={metaIconTriggerClass}
              aria-label={`Identity type: ${relationshipLabel}`}
            >
              <KolMetaIcon icon={Tag} variant="identity" />
            </TooltipTrigger>
            <TooltipContent variant="light" side="bottom" align="start">
              <HubHoverField label="Identity Type: " value={relationshipLabel} />
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              type="button"
              className={metaIconTriggerClass}
              aria-label={`KOL Manager: ${kolManager}`}
            >
              <KolMetaIcon icon={UserRound} variant="manager" />
            </TooltipTrigger>
            <TooltipContent variant="light" side="bottom" align="start">
              <HubHoverField label="KOL Manager: " value={kolManager} />
            </TooltipContent>
          </Tooltip>
        </div>
        <p className="mt-1 truncate text-xs text-gray-500">{handle}</p>
      </div>
    </div>
  );
}
