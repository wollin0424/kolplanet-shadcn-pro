"use client";

import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, X } from "@/lib/icons";
import type { PostLinkHealthStatus, PostLinkType } from "@/lib/postingHubMock";

const STATUS_ICON_CLASS: Record<"success" | "warning" | "error", string> = {
  success: "text-emerald-600",
  warning: "text-amber-600",
  error: "text-red-600",
};

const POST_LINK_STATUS_CONFIG: Record<
  PostLinkHealthStatus,
  { iconClassName: string; Icon: typeof CheckCircle2; title: string }
> = {
  success: {
    iconClassName: STATUS_ICON_CLASS.success,
    Icon: CheckCircle2,
    title: "Verified",
  },
  warning: {
    iconClassName: STATUS_ICON_CLASS.warning,
    Icon: AlertCircle,
    title: "Needs attention",
  },
  error: {
    iconClassName: STATUS_ICON_CLASS.error,
    Icon: X,
    title: "Issue found",
  },
};

const POST_LINK_TYPE_CLASS: Record<PostLinkType, string> = {
  Master: "border-gray-200/90 bg-gray-50 text-gray-700",
  Mirrored: "border-gray-200 bg-gray-50 text-gray-500",
};

/** Fixed width so Master / Mirrored pills align in the Post Link column. */
const POST_LINK_PILL_WIDTH_CLASS = "w-[80px] justify-center whitespace-nowrap";

const POST_LINK_PILL_BASE_CLASS =
  "inline-flex h-[22px] items-center gap-1 rounded-full border px-1.5 text-[11px] font-semibold leading-none";

const POST_LINK_MASTER_WITH_MIRRORED_CLASS = "w-auto min-w-[118px] justify-start whitespace-nowrap";

const POST_LINK_MIRRORED_INLINE_CLASS = "inline-flex items-center gap-1 text-gray-500";

const POST_LINK_MIRRORED_ICON_CLASS =
  "inline-flex size-3 shrink-0 flex-none items-center justify-center text-gray-500";

const POST_LINK_INLINE_COUNT_CLASS =
  "inline-grid size-[15px] shrink-0 place-items-center rounded-full border border-gray-200 bg-white text-[9px] font-semibold leading-none tabular-nums text-gray-500";

const POST_LINK_MIRRORED_COUNT_CLASS = POST_LINK_INLINE_COUNT_CLASS;

export const PostLinkPill = forwardRef<
  HTMLSpanElement,
  {
    label: string;
    linkType: PostLinkType;
    status: PostLinkHealthStatus;
    showStatusIcon?: boolean;
    inlineCount?: number;
    className?: string;
  } & ComponentPropsWithoutRef<"span">
>(function PostLinkPill(
  { label, linkType, status, showStatusIcon = true, inlineCount, className, ...props },
  ref
) {
  const config = POST_LINK_STATUS_CONFIG[status];
  const Icon = config.Icon;

  return (
    <span
      ref={ref}
      className={cn(
        POST_LINK_PILL_BASE_CLASS,
        POST_LINK_PILL_WIDTH_CLASS,
        POST_LINK_TYPE_CLASS[linkType],
        className
      )}
      title={config.title}
      {...props}
    >
      {showStatusIcon ? (
        <Icon size={13} strokeWidth={2.2} className={cn("shrink-0", config.iconClassName)} />
      ) : null}
      {label}
      {inlineCount != null && inlineCount > 1 ? (
        <span aria-hidden className={POST_LINK_INLINE_COUNT_CLASS}>
          {inlineCount}
        </span>
      ) : null}
    </span>
  );
});

export {
  POST_LINK_TYPE_CLASS,
  POST_LINK_STATUS_CONFIG,
  POST_LINK_PILL_WIDTH_CLASS,
  POST_LINK_PILL_BASE_CLASS,
  POST_LINK_MASTER_WITH_MIRRORED_CLASS,
  POST_LINK_MIRRORED_INLINE_CLASS,
  POST_LINK_MIRRORED_ICON_CLASS,
  POST_LINK_MIRRORED_COUNT_CLASS,
};
