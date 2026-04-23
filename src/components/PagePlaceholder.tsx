import { Hammer } from "lucide-react";

interface PagePlaceholderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export default function PagePlaceholder({
  title,
  description = "This module is under construction. The UI and data model are still being finalised.",
  icon,
}: PagePlaceholderProps) {
  return (
    <div className="flex flex-col flex-1 min-h-0 rounded-xl border border-gray-100 overflow-hidden bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      {/* Header strip — consistent with the Plans page */}
      <div className="shrink-0 bg-white border-b border-gray-100 px-7 py-4">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-brand-50 text-brand">
            {icon ?? <Hammer size={14} strokeWidth={2} />}
          </span>
          <h1 className="text-[18px] font-bold text-gray-900 tracking-tight">
            {title}
          </h1>
        </div>
      </div>

      {/* Empty state */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-300 mb-4">
          <Hammer size={22} strokeWidth={1.75} />
        </div>
        <h2 className="text-[15px] font-semibold text-gray-800">
          {title} · Coming soon
        </h2>
        <p className="mt-1.5 max-w-[420px] text-[13px] text-gray-500 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
