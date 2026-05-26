"use client";

import { InfluencerAvatar } from "@/components/InfluencerAvatar";
import {
  InfluencerMetaIcons,
  type KolRelationship,
} from "@/components/InfluencerMetaIcons";
import { platformFromLabel } from "@/components/PlatformIcon";

export function InfluencerIdentityCell({
  name,
  handle,
  platform,
  kolManager = "Moca",
  relationship = "Manager",
  avatarSize = "sm",
}: {
  name: string;
  handle: string;
  platform?: string;
  kolManager?: string;
  relationship?: KolRelationship;
  avatarSize?: "sm" | "md";
}) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="flex min-w-[180px] items-center gap-3">
      <InfluencerAvatar
        alt={name}
        platform={platformFromLabel(platform ?? handle) ?? platform}
        size={avatarSize}
        fallback={initials}
        fallbackClassName="bg-violet-100 text-violet-700"
      />
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1">
          <p className="truncate text-[13px] font-medium text-gray-900">{name}</p>
          <InfluencerMetaIcons kolManager={kolManager} relationship={relationship} />
        </div>
        <p className="truncate text-[11px] text-gray-400">{handle}</p>
      </div>
    </div>
  );
}
