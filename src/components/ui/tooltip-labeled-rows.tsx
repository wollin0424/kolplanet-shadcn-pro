import { cn } from "@/lib/utils";

export type TooltipLabeledRow = {
  label: string;
  value: string;
};

export function TooltipLabeledRows({
  rows,
  variant = "light",
  className,
}: {
  rows: TooltipLabeledRow[];
  variant?: "light" | "default";
  className?: string;
}) {
  const labelClass =
    variant === "light" ? "font-semibold text-gray-900" : "font-semibold text-background";
  const valueClass =
    variant === "light" ? "font-normal text-gray-500" : "font-normal text-background/75";

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {rows.map((row) => (
        <div key={row.label} className="flex items-baseline gap-1.5 text-[12px] leading-snug">
          <span className={labelClass}>{row.label}:</span>
          <span className={valueClass}>{row.value}</span>
        </div>
      ))}
    </div>
  );
}
