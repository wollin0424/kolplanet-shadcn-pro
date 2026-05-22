import { forwardRef, type ComponentType } from "react";
import type { LucideIcon, LucideProps } from "lucide-react";

export type AppIcon = ComponentType<LucideProps> & { displayName: string };

/**
 * Lucide glyph wrapped as a named React component (e.g. `Settings`).
 * - React DevTools / component tree: node label is `Settings`, not `ForwardRef` or `svg`
 * - DOM: inner node is still `<svg data-icon="Settings">` (HTML has no “Settings” tag)
 */
export function createIcon(LucideGlyph: LucideIcon, name: string): AppIcon {
  const NamedIcon = forwardRef<SVGSVGElement, LucideProps>(function NamedLucideIcon(
    props,
    ref
  ) {
    return (
      <span
        data-slot={name}
        className="inline-flex shrink-0 items-center justify-center leading-none"
        aria-hidden
      >
        <LucideGlyph ref={ref} data-icon={name} {...props} />
      </span>
    );
  });

  NamedIcon.displayName = name;

  return NamedIcon as AppIcon;
}
