"use client";

import type { ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  PlatformIcon,
  platformFromLabel,
  type Platform,
} from "@/components/PlatformIcon";
import { cn } from "@/lib/utils";

const sizeStyles = {
  sm: {
    avatar: "size-9",
    fallback: "text-[11px]",
    icon: 14,
    badgeOffset: "-bottom-px -right-px",
  },
  md: {
    avatar: "size-10",
    fallback: "text-xs",
    icon: 16,
    badgeOffset: "-bottom-0.5 -right-0.5",
  },
  lg: {
    avatar: "size-12",
    fallback: "text-sm",
    icon: 18,
    badgeOffset: "-bottom-0.5 -right-0.5",
  },
} as const;

export type InfluencerAvatarSize = keyof typeof sizeStyles;

function resolvePlatform(platform?: Platform | string): Platform | undefined {
  if (!platform) return undefined;
  if (platform === "IG" || platform === "TT" || platform === "YT" || platform === "FB") {
    return platform;
  }
  return platformFromLabel(platform);
}

export function InfluencerAvatar({
  src,
  alt,
  fallback,
  fallbackClassName,
  platform,
  size = "md",
  className,
  avatarClassName,
}: {
  src?: string;
  alt?: string;
  fallback: ReactNode;
  fallbackClassName?: string;
  platform?: Platform | string;
  size?: InfluencerAvatarSize;
  className?: string;
  avatarClassName?: string;
}) {
  const styles = sizeStyles[size];
  const platformCode = resolvePlatform(platform);

  return (
    <div className={cn("relative shrink-0", className)}>
      <Avatar className={cn(styles.avatar, "border border-gray-200/80", avatarClassName)}>
        <AvatarImage src={src} alt={alt} />
        <AvatarFallback
          className={cn("font-semibold", styles.fallback, fallbackClassName)}
        >
          {fallback}
        </AvatarFallback>
      </Avatar>
      {platformCode ? (
        <span
          className={cn(
            "absolute z-10 inline-flex overflow-hidden rounded-full shadow-[0_0_0_2px_#fff]",
            styles.badgeOffset
          )}
          aria-hidden
        >
          <PlatformIcon platform={platformCode} size={styles.icon} />
        </span>
      ) : null}
    </div>
  );
}
