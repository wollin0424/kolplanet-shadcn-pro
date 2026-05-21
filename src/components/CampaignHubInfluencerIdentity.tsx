"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { IdCard, User } from "lucide-react";

export type KolRelationship = "Direct" | "Manager" | "MCN";

/** Shown on hover only — icon stays neutral because type is unknown until then. */
const RELATIONSHIP_LABEL: Record<KolRelationship, string> = {
  Direct: "Individual",
  Manager: "Individual / Manager",
  MCN: "Company",
};

const metaIconShell =
  "inline-flex h-4 w-4 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-500";

const metaIconTriggerClass =
  "inline-flex shrink-0 rounded-full outline-none transition-shadow hover:shadow-[0_0_0_3px_rgba(0,0,0,0.04)] focus-visible:ring-2 focus-visible:ring-brand/25";

function HubHoverField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-gray-400">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}

function KolIdentityIcon() {
  return (
    <span className={metaIconShell} aria-hidden>
      <IdCard size={10} strokeWidth={2.5} />
    </span>
  );
}

function KolManagerIcon() {
  return (
    <span className={metaIconShell} aria-hidden>
      <User size={10} strokeWidth={2.5} />
    </span>
  );
}

export function CampaignHubInfluencerIdentity({
  name,
  handle,
  kolManager,
  relationship,
  initials,
  avatarFallbackClassName,
  selection,
}: {
  name: string;
  handle: string;
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
        <Avatar className="h-11 w-11 border border-gray-100">
          <AvatarImage src="" alt={name} />
          <AvatarFallback className={cn("text-[11px] font-semibold", avatarFallbackClassName)}>
            {initials}
          </AvatarFallback>
        </Avatar>
        {selection ? (
          <Checkbox
            checked={selection.checked}
            onCheckedChange={(checked) => selection.onCheckedChange(checked === true)}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Select ${name}`}
            className="absolute -left-1 -top-1 z-10 size-[18px] rounded-[4px] border-gray-300 bg-white shadow-sm data-checked:border-brand data-checked:bg-brand"
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex max-w-full min-w-0 items-center gap-1">
          <span className="truncate text-[14px] font-semibold text-gray-900">{name}</span>
          <Tooltip>
            <TooltipTrigger
              type="button"
              className={metaIconTriggerClass}
              aria-label={`Identity type: ${relationshipLabel}`}
            >
              <KolIdentityIcon />
            </TooltipTrigger>
            <TooltipContent variant="light" side="bottom" align="start">
              <HubHoverField label="Identity Type:" value={relationshipLabel} />
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              type="button"
              className={metaIconTriggerClass}
              aria-label={`KOL Manager: ${kolManager}`}
            >
              <KolManagerIcon />
            </TooltipTrigger>
            <TooltipContent variant="light" side="bottom" align="start">
              <HubHoverField label="KOL Manager:" value={kolManager} />
            </TooltipContent>
          </Tooltip>
        </div>
        <p className="mt-0.5 truncate text-[12px] text-gray-500">{handle}</p>
      </div>
    </div>
  );
}
