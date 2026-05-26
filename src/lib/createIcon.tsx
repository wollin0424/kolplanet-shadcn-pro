import { forwardRef, type ComponentType, type CSSProperties } from "react";
import type { LucideIcon, LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

export type AppIcon = ComponentType<LucideProps> & { displayName: string };

const SIZE_CLASS_RE = /\bsize-(?:\[[^\]]+\]|[^\s]+)/;

function lockBox(px: number): CSSProperties {
  return {
    width: px,
    height: px,
    minWidth: px,
    minHeight: px,
    maxWidth: px,
    maxHeight: px,
  };
}

function defaultStrokeWidth(px: number | undefined): number | undefined {
  if (px == null) return undefined;
  if (px <= 16) return Math.max(1.5, (px / 24) * 2);
  return undefined;
}

/**
 * Lucide glyph wrapped as a named React component (e.g. `Settings`).
 * - React DevTools / component tree: node label is `Settings`, not `ForwardRef` or `svg`
 * - DOM: inner node is still `<svg data-icon="Settings">` (HTML has no “Settings” tag)
 *
 * The outer span locks layout size so flex parents (buttons, pills) cannot stretch
 * chevrons to fill the trigger. Pass `size={12}` or Tailwind `size-*` on the component.
 */
export function createIcon(LucideGlyph: LucideIcon, name: string): AppIcon {
  const NamedIcon = forwardRef<SVGSVGElement, LucideProps>(function NamedLucideIcon(
    { size = 24, strokeWidth, className, style, ...props },
    ref
  ) {
    const px = typeof size === "number" ? size : undefined;
    const hasSizeClass = SIZE_CLASS_RE.test(className ?? "");
    const locked = px != null && !hasSizeClass ? lockBox(px) : undefined;

    return (
      <span
        data-slot={name}
        aria-hidden
        className={cn(
          "inline-flex shrink-0 flex-none items-center justify-center overflow-visible leading-none",
          className
        )}
        style={locked ? { ...locked, ...(style as CSSProperties | undefined) } : style}
      >
        <LucideGlyph
          ref={ref}
          data-icon={name}
          size={hasSizeClass ? "100%" : (px ?? size)}
          strokeWidth={strokeWidth ?? defaultStrokeWidth(px)}
          className={cn(
            "block shrink-0 overflow-visible",
            hasSizeClass && "size-full"
          )}
          style={locked}
          {...props}
        />
      </span>
    );
  });

  NamedIcon.displayName = name;

  return NamedIcon as AppIcon;
}
