"use client";

import { Copy } from "@/lib/icons";

export function CampaignHubH5LinkCell({ path }: { path: string }) {
  const handleCopy = async () => {
    const copyValue =
      typeof window !== "undefined" ? `${window.location.origin}${path}` : path;
    try {
      await navigator.clipboard.writeText(copyValue);
    } catch {
      // Clipboard may be unavailable outside secure context.
    }
  };

  return (
    <div className="flex min-w-[160px] items-center gap-2">
      <a
        href={path}
        target="_blank"
        rel="noopener noreferrer"
        className="truncate text-[12px] font-medium text-gray-700 transition-colors hover:text-brand hover:underline hover:underline-offset-[3px] hover:decoration-brand/40"
      >
        {path}
      </a>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-brand transition-colors hover:bg-brand-50"
        aria-label="Copy H5 link"
      >
        <Copy size={14} strokeWidth={2} />
      </button>
    </div>
  );
}
