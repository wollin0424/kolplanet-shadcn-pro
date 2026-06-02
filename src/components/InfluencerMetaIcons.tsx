"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Tag, UserRound, type AppIcon } from "@/lib/icons";

export type KolRelationship = "Direct" | "Manager" | "MCN";

const RELATIONSHIP_LABEL: Record<KolRelationship, string> = {
  Direct: "Individual",
  Manager: "Individual / Manager",
  MCN: "Company",
};

const metaIconBase =
  "inline-flex size-5 items-center justify-center rounded-full border transition-colors";

const metaIconVariantClass = {
  identity: "border-violet-200 bg-violet-50 text-violet-600",
  manager: "border-brand-100 bg-brand-50 text-brand",
} as const;

const metaIconTriggerClass =
  "inline-flex shrink-0 rounded-full outline-none transition-shadow hover:shadow-[0_0_0_3px_rgba(0,0,0,0.04)] focus-visible:ring-2 focus-visible:ring-brand/25";

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

function HoverField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-gray-400">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}

export function InfluencerMetaIcons({
  kolManager,
  relationship,
}: {
  kolManager: string;
  relationship: KolRelationship;
}) {
  const relationshipLabel = RELATIONSHIP_LABEL[relationship];

  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            <span
              className={metaIconTriggerClass}
              aria-label={`Identity type: ${relationshipLabel}`}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <KolMetaIcon icon={Tag} variant="identity" />
            </span>
          }
        />
        <TooltipContent variant="light" side="bottom" align="start">
          <HoverField label="Identity Type: " value={relationshipLabel} />
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <span
              className={metaIconTriggerClass}
              aria-label={`KOL Manager: ${kolManager}`}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <KolMetaIcon icon={UserRound} variant="manager" />
            </span>
          }
        />
        <TooltipContent variant="light" side="bottom" align="start">
          <HoverField label="KOL Manager: " value={kolManager} />
        </TooltipContent>
      </Tooltip>
    </>
  );
}
