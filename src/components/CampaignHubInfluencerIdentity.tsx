"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Briefcase, Building2, User, type LucideIcon } from "lucide-react";

export type KolRelationship = "Direct" | "Manager" | "MCN";

const RELATIONSHIP_STYLE: Record<
  KolRelationship,
  { className: string; Icon: LucideIcon }
> = {
  Direct: {
    className: "border-sky-200 bg-sky-50 text-sky-700",
    Icon: User,
  },
  Manager: {
    className: "border-violet-200 bg-violet-50 text-violet-700",
    Icon: Briefcase,
  },
  MCN: {
    className: "border-amber-200 bg-amber-50 text-amber-800",
    Icon: Building2,
  },
};

function KolRelationshipIcon({ relationship }: { relationship: KolRelationship }) {
  const { className, Icon } = RELATIONSHIP_STYLE[relationship];

  return (
    <span
      className={cn(
        "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
        className
      )}
      aria-hidden
    >
      <Icon size={10} strokeWidth={2.5} />
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
  selection: {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
  };
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="relative shrink-0">
        <Avatar className="h-11 w-11 border border-gray-100">
          <AvatarImage src="" alt={name} />
          <AvatarFallback className={cn("text-[11px] font-semibold", avatarFallbackClassName)}>
            {initials}
          </AvatarFallback>
        </Avatar>
        <Checkbox
          checked={selection.checked}
          onCheckedChange={(checked) => selection.onCheckedChange(checked === true)}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select ${name}`}
          className="absolute -left-1 -top-1 z-10 size-[18px] rounded-[4px] border-gray-300 bg-white shadow-sm data-checked:border-brand data-checked:bg-brand"
        />
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <Tooltip>
          <TooltipTrigger
            type="button"
            className="flex max-w-full min-w-0 items-center gap-1 overflow-hidden rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
            aria-label={`${name}, Cooperation: ${relationship}, KOL Manager: ${kolManager}`}
          >
            <span className="truncate text-[14px] font-semibold text-gray-900">{name}</span>
            <KolRelationshipIcon relationship={relationship} />
            <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border border-gray-200 bg-gray-50 text-[9px] font-bold uppercase text-gray-500">
              m
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="px-3 py-2 text-[12px]">
            <div className="flex flex-col gap-1">
              <p>
                <span className="text-gray-400">Cooperation: </span>
                <span className="font-medium text-gray-900">{relationship}</span>
              </p>
              <p>
                <span className="text-gray-400">KOL Manager: </span>
                <span className="font-medium text-gray-900">{kolManager}</span>
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
        <p className="mt-0.5 truncate text-[12px] text-gray-500">{handle}</p>
      </div>
    </div>
  );
}
