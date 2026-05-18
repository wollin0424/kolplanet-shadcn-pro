/** Fixed pipeline table column widths (px) — prevents layout shift on row hover / scroll. */
export const PIPELINE_TABLE_COLUMNS = [
  { key: "select", width: 48 },
  { key: "influencer", width: 220 },
  { key: "collab", width: 156 },
  { key: "logistics", width: 138 },
  { key: "script", width: 138 },
  { key: "content", width: 138 },
  { key: "posting", width: 138 },
  { key: "payment", width: 140 },
  { key: "commercial", width: 88 },
  { key: "manager", width: 108 },
  { key: "notes", width: 148 },
  { key: "chat", width: 56 },
] as const;

export const PIPELINE_TABLE_MIN_WIDTH = PIPELINE_TABLE_COLUMNS.reduce(
  (sum, col) => sum + col.width,
  0
);
