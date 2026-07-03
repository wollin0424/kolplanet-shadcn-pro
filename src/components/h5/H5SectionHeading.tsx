import type { ReactNode } from "react";
import type { FileText } from "@/lib/icons";
import { cn } from "@/lib/utils";

export const H5_SECTION_HELPER_CLASS = "text-[12px] leading-relaxed text-gray-500";

export const H5_SECTION_NOTE_CLASS = "font-semibold text-gray-600";

export function H5SectionNote({ children }: { children: ReactNode }) {
  return <p className={H5_SECTION_NOTE_CLASS}>{children}</p>;
}

export function H5SectionHeading({
  icon: Icon,
  title,
  trailing,
  description,
  className,
  descriptionClassName,
}: {
  icon: typeof FileText;
  title: string;
  trailing?: ReactNode;
  description?: ReactNode;
  className?: string;
  descriptionClassName?: string;
}) {
  return (
    <div className={cn(description ? "mb-4" : "mb-3", className)}>
      <div className="flex items-start gap-2">
        <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand">
          <Icon size={15} strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-[15px] font-semibold text-gray-900">{title}</h2>
            {trailing}
          </div>
          {description ? (
            <div
              className={cn(
                "mt-2 space-y-2",
                H5_SECTION_HELPER_CLASS,
                descriptionClassName
              )}
            >
              {description}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
