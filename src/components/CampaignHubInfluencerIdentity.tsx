"use client";

import { InfluencerAvatar } from "@/components/InfluencerAvatar";
import {
  InfluencerMetaIcons,
  type KolRelationship,
} from "@/components/InfluencerMetaIcons";
import type { Platform } from "@/components/PlatformIcon";
import { Checkbox } from "@/components/ui/checkbox";

export type { KolRelationship };

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
          <InfluencerMetaIcons kolManager={kolManager} relationship={relationship} />
        </div>
        <p className="mt-1 truncate text-xs text-gray-500">{handle}</p>
      </div>
    </div>
  );
}
