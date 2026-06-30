import { FORM_FIELD_RADIUS } from "@/lib/formControls";

/** 10px — same as form fields ({@link FORM_FIELD_RADIUS} / --radius 0.625rem). */
export const H5_CONTROL_RADIUS = FORM_FIELD_RADIUS;
export const H5_CONTROL_HEIGHT = "h-10";

export const H5_INPUT_CLASS = `${H5_CONTROL_HEIGHT} flex-1 ${H5_CONTROL_RADIUS} border-gray-200 bg-white px-3 text-[13px] shadow-none focus-visible:ring-2 focus-visible:ring-brand/20`;

export const H5_PRIMARY_BUTTON_CLASS = `${H5_CONTROL_HEIGHT} w-full ${H5_CONTROL_RADIUS} text-[13px] font-semibold transition-colors`;

export const H5_DASHED_ADD_BUTTON_CLASS = `${H5_CONTROL_HEIGHT} inline-flex w-full items-center justify-center gap-1.5 ${H5_CONTROL_RADIUS} border border-dashed border-brand/30 bg-white px-3 text-[13px] font-medium text-brand transition-colors hover:border-brand/45 hover:bg-brand-50/30`;
