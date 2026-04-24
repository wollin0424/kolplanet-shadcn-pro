// ─── Shared Deliverable Catalogue ────────────────────────────────────────────
// Picker content aligned with product screenshots (Plan Scope → Add Scope).

export type DeliverableGroup = "standard" | "addon";

export type DeliverableType = {
  id: string;
  label: string;
  platform: string;
  color: string;
  defaultUnit: string;
  group: DeliverableGroup;
};

/** Picker dot: all standard items share one brand blue; add-ons share purple. `platform` is for table subtitles only. */
const STANDARD_DOT = "#023E8A";
const ADDON_DOT = "#7c3aed";

export const DELIVERABLE_CATALOGUE: DeliverableType[] = [
  // ── Standard deliverables (single dot color) ─────────────────────────────
  { id: "ig-reel",         label: "IG Reel",                 platform: "Instagram", color: STANDARD_DOT, defaultUnit: "Qty",   group: "standard" },
  { id: "ig-story",        label: "IG Story",                platform: "Instagram", color: STANDARD_DOT, defaultUnit: "Qty",   group: "standard" },
  { id: "ig-carousel",     label: "IG Carousel",            platform: "Instagram", color: STANDARD_DOT, defaultUnit: "Qty",   group: "standard" },
  { id: "ig-live",         label: "IG Live",                 platform: "Instagram", color: STANDARD_DOT, defaultUnit: "Hours", group: "standard" },
  { id: "tt-video",        label: "TikTok Video",            platform: "TikTok",    color: STANDARD_DOT, defaultUnit: "Qty",   group: "standard" },
  { id: "tt-live",         label: "TikTok Live",             platform: "TikTok",    color: STANDARD_DOT, defaultUnit: "Hours", group: "standard" },
  { id: "yt-shorts",       label: "YT Shorts",               platform: "YouTube",   color: STANDARD_DOT, defaultUnit: "Qty",   group: "standard" },
  { id: "yt-integrated",  label: "YT Integrated Video",     platform: "YouTube",   color: STANDARD_DOT, defaultUnit: "Qty",   group: "standard" },
  { id: "yt-dedicated",    label: "YT Dedicated Video",      platform: "YouTube",   color: STANDARD_DOT, defaultUnit: "Qty",   group: "standard" },
  // ── Add-ons & rights ────────────────────────────────────────────────────
  { id: "content-usage",   label: "Content Usage (Digital)",  platform: "Add-on",   color: ADDON_DOT, defaultUnit: "Days",  group: "addon" },
  { id: "post-retention",  label: "Post Retention",           platform: "Add-on",   color: ADDON_DOT, defaultUnit: "Days",  group: "addon" },
  { id: "whitelisting",    label: "Whitelisting (Post Boosting)", platform: "Add-on", color: ADDON_DOT, defaultUnit: "Days",  group: "addon" },
  { id: "exclusivity",     label: "Competitor Exclusivity",  platform: "Add-on",   color: ADDON_DOT, defaultUnit: "Days",  group: "addon" },
  { id: "collab-post",     label: "Collab Post",              platform: "Add-on",   color: ADDON_DOT, defaultUnit: "Qty",   group: "addon" },
  { id: "onsite-event",    label: "Onsite / Event",           platform: "Add-on",   color: ADDON_DOT, defaultUnit: "Days",  group: "addon" },
  { id: "cross-posting",   label: "Cross-posting (Mirroring)", platform: "Add-on",  color: ADDON_DOT, defaultUnit: "Days",  group: "addon" },
  { id: "link-in-bio",     label: "Link in Bio",              platform: "Add-on",   color: ADDON_DOT, defaultUnit: "Days",  group: "addon" },
];

export const UNIT_OPTIONS = ["Qty", "Hours", "Days", "Posts", "Videos", "Stories", "Months"];
/** Alias for backwards-compatibility */
export const DELIVERABLE_UNIT_OPTIONS = UNIT_OPTIONS;

export const CURRENCIES = [
  { value: "usd", label: "USD", symbol: "$",  name: "US Dollar" },
  { value: "inr", label: "INR", symbol: "₹",  name: "Indian Rupee" },
  { value: "sgd", label: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { value: "myr", label: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
  { value: "idr", label: "IDR", symbol: "Rp", name: "Indonesian Rupiah" },
  { value: "thb", label: "THB", symbol: "฿",  name: "Thai Baht" },
  { value: "php", label: "PHP", symbol: "₱",  name: "Philippine Peso" },
  { value: "vnd", label: "VND", symbol: "₫",  name: "Vietnamese Dong" },
];

export const SCOPE_SECTION_ACCENT: Record<DeliverableGroup | "custom", string> = {
  standard: "#023E8A",
  addon:    "#7c3aed",
  custom:   "#d97706",
};

export function scopeAccentForType(type: DeliverableType): string {
  return SCOPE_SECTION_ACCENT[type.group];
}

export function scopeAccentForTypeId(id: string): string {
  const t = DELIVERABLE_CATALOGUE.find((d) => d.id === id);
  return t ? scopeAccentForType(t) : SCOPE_SECTION_ACCENT.custom;
}
