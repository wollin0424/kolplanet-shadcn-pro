"use client";

import { cn } from "@/lib/utils";
import type { AppIcon } from "@/lib/icons";
import type { ButtonHTMLAttributes, ReactNode } from "react";

/** Secondary chip action on Contract / Logistics influencer cards (e.g. files, view log). */
export function CampaignHubCardMetaAction({
  icon: Icon,
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: AppIcon;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-brand transition-colors",
        "hover:bg-brand-50",
        className
      )}
      {...props}
    >
      <Icon size={14} className="shrink-0 text-brand" aria-hidden />
      {children}
    </button>
  );
}

export const campaignHubCardMetaActionMutedClass =
  "inline-flex shrink-0 items-center gap-2 px-2 py-1 text-xs text-gray-500";
