import { cn } from "@/lib/utils";

/** 10px — matches :root { --radius: 0.625rem } (Tailwind rounded-lg). */
export const FORM_FIELD_RADIUS = "rounded-lg";

const formFieldBase =
  "border border-gray-200 bg-white shadow-none placeholder:text-gray-300 focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/20 focus-visible:ring-offset-0";

/** Standard sheet / settings text field — 40px height, 10px radius, brand focus ring. */
export function formInputClass(className?: string) {
  return cn(
    FORM_FIELD_RADIUS,
    formFieldBase,
    "h-10 px-2.5 text-[14px]",
    className
  );
}

/** Standard sheet / settings textarea — matches {@link formInputClass} radius and focus. */
export function formTextareaClass(className?: string) {
  return cn(
    FORM_FIELD_RADIUS,
    formFieldBase,
    "px-2.5 py-2 text-[14px] leading-relaxed",
    className
  );
}
