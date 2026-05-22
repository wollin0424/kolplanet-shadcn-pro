import { forwardRef } from "react";
import type { LucideIcon, LucideProps } from "lucide-react";

/**
 * Wraps a Lucide glyph so DevTools / DOM show semantic names, not anonymous ForwardRef.
 * - React `displayName`: e.g. IconRefresh
 * - DOM `data-icon`: same semantic name (inspect in browser)
 * - DOM `data-lucide`: underlying Lucide export name, e.g. RefreshCcw
 */
export function createIcon(
  LucideGlyph: LucideIcon,
  semanticName: string,
  lucideName: string
): LucideIcon {
  const NamedIcon = forwardRef<SVGSVGElement, LucideProps>(function NamedLucideIcon(
    { className, ...props },
    ref
  ) {
    return (
      <LucideGlyph
        ref={ref}
        data-icon={semanticName}
        data-lucide={lucideName}
        className={className}
        {...props}
      />
    );
  });

  NamedIcon.displayName = semanticName;
  return NamedIcon as LucideIcon;
}
