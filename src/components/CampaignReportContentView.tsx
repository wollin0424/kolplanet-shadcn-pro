"use client";

import { Images } from "@/lib/icons";

export default function CampaignReportContentView() {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border border-gray-100 bg-gray-50 text-gray-300">
        <Images size={22} strokeWidth={1.75} />
      </div>
      <h2 className="text-[15px] font-semibold text-gray-800">Content · Coming soon</h2>
      <p className="mt-1.5 max-w-[420px] text-[13px] leading-relaxed text-gray-500">
        Post-level performance and content breakdown will appear here.
      </p>
    </div>
  );
}
