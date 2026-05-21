/** Fixed pipeline table column widths (px) — prevents layout shift on row hover / scroll. */
export const PIPELINE_TABLE_COLUMNS = [
  { key: "select", width: 52 },
  { key: "influencer", width: 244 },
  { key: "collab", width: 172 },
  { key: "commercial", width: 124 },
  { key: "contract", width: 200 },
  { key: "logistics", width: 152 },
  { key: "script", width: 152 },
  { key: "content", width: 152 },
  { key: "posting", width: 152 },
  { key: "payment", width: 156 },
  { key: "manager", width: 120 },
  { key: "notes", width: 168 },
  { key: "action", width: 72 },
] as const;

export const PIPELINE_TABLE_MIN_WIDTH = PIPELINE_TABLE_COLUMNS.reduce(
  (sum, col) => sum + col.width,
  0
);
