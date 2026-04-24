// ─── Shared Deliverable Catalogue ────────────────────────────────────────────

export type DeliverableGroup = "standard" | "addon";

export type DeliverableType = {
  id: string;
  label: string;
  platform: string;
  color: string;
  defaultUnit: string;
  group: DeliverableGroup;
};

export const DELIVERABLE_CATALOGUE: DeliverableType[] = [
  // Standard deliverables
  { id: "ig-reel",       label: "IG Reel",                 platform: "Instagram", color: "#E1306C", defaultUnit: "Qty",   group: "standard" },
  { id: "ig-story",      label: "IG Story",                platform: "Instagram", color: "#833AB4", defaultUnit: "Qty",   group: "standard" },
  { id: "ig-post",       label: "IG Static Post",          platform: "Instagram", color: "#F77737", defaultUnit: "Qty",   group: "standard" },
  { id: "ig-live",       label: "IG Live",                 platform: "Instagram", color: "#FCAF45", defaultUnit: "Hours", group: "standard" },
  { id: "tt-video",      label: "TikTok Video",            platform: "TikTok",    color: "#010101", defaultUnit: "Qty",   group: "standard" },
  { id: "tt-live",       label: "TikTok Live",             platform: "TikTok",    color: "#69C9D0", defaultUnit: "Hours", group: "standard" },
  { id: "yt-video",      label: "YouTube Video",           platform: "YouTube",   color: "#FF0000", defaultUnit: "Qty",   group: "standard" },
  { id: "yt-shorts",     label: "YouTube Shorts",          platform: "YouTube",   color: "#FF4500", defaultUnit: "Qty",   group: "standard" },
  { id: "fb-post",       label: "Facebook Post",           platform: "Facebook",  color: "#1877F2", defaultUnit: "Qty",   group: "standard" },
  { id: "fb-reel",       label: "Facebook Reel",           platform: "Facebook",  color: "#1877F2", defaultUnit: "Qty",   group: "standard" },
  // Add-ons & rights
  { id: "content-usage", label: "Content Usage (Digital)", platform: "Any",       color: "#6366f1", defaultUnit: "Days",  group: "addon" },
  { id: "exclusivity",   label: "Competitor Exclusivity",  platform: "Any",       color: "#7c3aed", defaultUnit: "Days",  group: "addon" },
  { id: "whitelisting",  label: "Whitelisting / Spark Ads",platform: "Any",       color: "#7c3aed", defaultUnit: "Days",  group: "addon" },
  { id: "usage-ooh",     label: "Content Usage (OOH)",     platform: "Any",       color: "#a855f7", defaultUnit: "Days",  group: "addon" },
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
