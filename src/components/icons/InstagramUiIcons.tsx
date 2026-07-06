import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Instagram Repost — two arrows forming a rounded square.
 * Same glyph under posts/reels and on the profile Reposts tab.
 * @see Meta asset `instagram-reshare-shared`
 */
export const InstagramRepostIcon = forwardRef<SVGSVGElement, LucideProps>(
  function InstagramRepostIcon(
    { size = 24, strokeWidth = 2, className, ...props },
    ref
  ) {
    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        data-icon="InstagramRepost"
        className={cn("shrink-0", className)}
        aria-hidden
        {...props}
      >
        <path d="M8 7h9a3 3 0 0 1 3 3v1" />
        <path d="M17 9.5 19.5 7 17 4.5" />
        <path d="M16 17H7a3 3 0 0 1-3-3v-1" />
        <path d="M7 14.5 4.5 17 7 19.5" />
      </svg>
    );
  }
);
InstagramRepostIcon.displayName = "InstagramRepostIcon";
