import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Instagram profile Posts tab — 3×3 grid of published posts.
 * @see https://help.instagram.com/ (profile tabs)
 */
export const InstagramPostsTabIcon = forwardRef<SVGSVGElement, LucideProps>(
  function InstagramPostsTabIcon(
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
        data-icon="InstagramPostsTab"
        className={cn("shrink-0", className)}
        aria-hidden
        {...props}
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    );
  }
);
InstagramPostsTabIcon.displayName = "InstagramPostsTabIcon";

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
