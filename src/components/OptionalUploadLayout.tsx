import type { ReactNode } from "react";

export function OptionalUploadOrDivider() {
  return (
    <div
      className="flex items-center gap-3 py-1"
      role="separator"
      aria-label="or enter manually"
    >
      <div className="h-px flex-1 bg-gray-200" />
      <span className="shrink-0 text-[11px] font-medium uppercase tracking-wide text-gray-400">
        or enter manually
      </span>
      <div className="h-px flex-1 bg-gray-200" />
    </div>
  );
}

export function ManualEntrySection({
  children,
  description = "Complete the required fields below. Uploading a document is optional.",
}: {
  children: ReactNode;
  description?: string;
}) {
  return (
    <section className="space-y-5">
      <div>
        <p className="text-[13px] font-medium text-gray-900">Enter details manually</p>
        <p className="mt-1 text-[11px] leading-relaxed text-gray-500">{description}</p>
      </div>
      {children}
    </section>
  );
}
