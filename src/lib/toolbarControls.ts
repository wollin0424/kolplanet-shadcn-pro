import { cn } from "@/lib/utils";

/** Table toolbar controls (select, input, icon button) — 32px / Tailwind h-8 */
export const TOOLBAR_CONTROL_HEIGHT = "h-8 min-h-8 max-h-8";

const toolbarBase =
  "rounded-lg border border-gray-200 bg-gray-50 py-0 text-[12.5px] shadow-none";

/** Select trigger in filter rows — pair with `<SelectTrigger size="sm" />` */
export function toolbarSelectClass(className?: string) {
  return cn(
    TOOLBAR_CONTROL_HEIGHT,
    toolbarBase,
    "text-gray-800 data-placeholder:text-gray-400",
    className
  );
}

/** Text search / input in filter rows */
export function toolbarInputClass(className?: string) {
  return cn(
    TOOLBAR_CONTROL_HEIGHT,
    toolbarBase,
    "px-2.5 text-gray-800 placeholder:text-gray-400",
    "focus-visible:border-gray-200 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-brand/15",
    className
  );
}

/** Icon-only actions aligned with toolbar inputs */
export function toolbarIconButtonClass(className?: string) {
  return cn(
    TOOLBAR_CONTROL_HEIGHT,
    "inline-flex w-8 shrink-0 items-center justify-center rounded-lg border border-transparent",
    "text-gray-500 transition-colors hover:border-gray-200 hover:bg-white",
    className
  );
}

const denseFieldBase =
  "border border-gray-200 bg-white py-0 text-[12px] shadow-none focus-visible:ring-2 focus-visible:ring-brand/15";

/** Dialog / dense form rows (32px) — pair selects with `<SelectTrigger size="sm" />` */
export function denseSelectTriggerClass(className?: string) {
  return cn(
    TOOLBAR_CONTROL_HEIGHT,
    denseFieldBase,
    "w-full min-w-0 justify-between rounded-md px-2.5 data-[size=default]:!h-8 data-[size=sm]:!h-8",
    className
  );
}

export function denseDateInputClass(className?: string) {
  return cn(
    TOOLBAR_CONTROL_HEIGHT,
    denseFieldBase,
    "w-full rounded-md px-2 pr-7 text-gray-900 outline-none",
    className
  );
}

export function denseAmountFieldShellClass(className?: string) {
  return cn(TOOLBAR_CONTROL_HEIGHT, "flex w-full overflow-hidden rounded-md", denseFieldBase, className);
}
