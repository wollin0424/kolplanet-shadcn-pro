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
    avatar: "size-7",
    fallback: "text-[10px]",
    badge: "size-4",
    icon: 12,
  },
  md: {
    avatar: "size-8",
    fallback: "text-[10px]",
    badge: "size-[18px]",
    icon: 14,
  },
  lg: {
    avatar: "size-11",
    fallback: "text-xs",
    badge: "size-5",
    icon: 16,
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
}: {
  src?: string;
  alt?: string;
  fallback: ReactNode;
  fallbackClassName?: string;
  platform?: Platform | string;
  size?: InfluencerAvatarSize;
  className?: string;
}) {
  const styles = sizeStyles[size];
  const platformCode = resolvePlatform(platform);

  return (
    <div className={cn("relative shrink-0", className)}>
      <Avatar className={cn(styles.avatar, "border border-gray-100")}>
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
            "absolute bottom-0 right-0 z-10 inline-flex items-center justify-center rounded-full ring-2 ring-white",
            styles.badge
          )}
          aria-hidden
        >
          <PlatformIcon platform={platformCode} size={styles.icon} />
        </span>
      ) : null}
    </div>
  );
}
