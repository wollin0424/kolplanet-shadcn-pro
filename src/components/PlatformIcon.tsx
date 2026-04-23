"use client";

import { cn } from "@/lib/utils";

export type Platform = "IG" | "TT" | "YT" | "FB";

const InstagramIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-label="Instagram">
    <defs>
      <linearGradient id="igGradient" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FEDA75" />
        <stop offset="25%" stopColor="#FA7E1E" />
        <stop offset="50%" stopColor="#D62976" />
        <stop offset="75%" stopColor="#962FBF" />
        <stop offset="100%" stopColor="#4F5BD5" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#igGradient)" />
    <rect
      x="5.5"
      y="5.5"
      width="13"
      height="13"
      rx="4"
      fill="none"
      stroke="white"
      strokeWidth="1.6"
    />
    <circle cx="12" cy="12" r="3.4" fill="none" stroke="white" strokeWidth="1.6" />
    <circle cx="17.3" cy="6.7" r="1" fill="white" />
  </svg>
);

const TikTokIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-label="TikTok">
    <rect x="2" y="2" width="20" height="20" rx="5" fill="#000" />
    <path
      d="M15.5 7.3c-.7-.6-1.1-1.4-1.1-2.3h-2.3v9.4a1.9 1.9 0 11-1.4-1.8v-2.3a4.2 4.2 0 103.7 4.2V9.7c.9.6 1.9.9 3 .9V8.3c-.7 0-1.4-.3-1.9-1z"
      fill="#25F4EE"
      transform="translate(0.5 0)"
    />
    <path
      d="M15 7.3c-.7-.6-1.1-1.4-1.1-2.3h-2.3v9.4a1.9 1.9 0 11-1.4-1.8v-2.3a4.2 4.2 0 103.7 4.2V9.7c.9.6 1.9.9 3 .9V8.3c-.7 0-1.4-.3-1.9-1z"
      fill="#FE2C55"
      transform="translate(-0.3 0.3)"
    />
    <path
      d="M15 7.3c-.7-.6-1.1-1.4-1.1-2.3h-2.3v9.4a1.9 1.9 0 11-1.4-1.8v-2.3a4.2 4.2 0 103.7 4.2V9.7c.9.6 1.9.9 3 .9V8.3c-.7 0-1.4-.3-1.9-1z"
      fill="#fff"
    />
  </svg>
);

const YouTubeIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-label="YouTube">
    <rect x="1" y="5" width="22" height="14" rx="3.5" fill="#FF0000" />
    <path d="M10 9.2v5.6l4.8-2.8z" fill="white" />
  </svg>
);

const FacebookIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-label="Facebook">
    <circle cx="12" cy="12" r="10" fill="#1877F2" />
    <path
      d="M13.3 19.9v-7h2.3l.3-2.7h-2.6V8.5c0-.8.2-1.3 1.3-1.3h1.4V4.8c-.7-.1-1.4-.1-2.1-.1-2.1 0-3.5 1.3-3.5 3.6v2H8v2.7h2.3v7h3z"
      fill="white"
    />
  </svg>
);

const iconMap: Record<Platform, React.ComponentType<{ size?: number }>> = {
  IG: InstagramIcon,
  TT: TikTokIcon,
  YT: YouTubeIcon,
  FB: FacebookIcon,
};

export function PlatformIcon({
  platform,
  size = 16,
  className,
}: {
  platform: Platform;
  size?: number;
  className?: string;
}) {
  const Icon = iconMap[platform];
  if (!Icon) return null;
  return (
    <span className={cn("inline-flex items-center justify-center shrink-0", className)}>
      <Icon size={size} />
    </span>
  );
}
