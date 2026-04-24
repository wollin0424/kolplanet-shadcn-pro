import { DELIVERABLE_CATALOGUE, SCOPE_SECTION_ACCENT, type DeliverableType } from "./deliverableCatalog";

/** Rows from Plan Settings / Quote Matrix (instance rows share typeId). */
export type PlanScopeRowInput = {
  typeId: string;
  label: string;
  unit: string;
};

/**
 * One entry per unique typeId, in first-seen order — drives Quote Matrix "Add Scope".
 * Catalog types resolve from `DELIVERABLE_CATALOGUE`; unknown ids (e.g. custom) are built from the row.
 */
export function buildAllowedLinesFromRows(rows: PlanScopeRowInput[]): DeliverableType[] {
  const seen = new Set<string>();
  const out: DeliverableType[] = [];
  for (const d of rows) {
    if (seen.has(d.typeId)) continue;
    seen.add(d.typeId);
    const cat = DELIVERABLE_CATALOGUE.find((c) => c.id === d.typeId);
    if (cat) {
      out.push(cat);
    } else {
      out.push({
        id: d.typeId,
        label: d.label,
        platform: "Custom",
        color: SCOPE_SECTION_ACCENT.custom,
        defaultUnit: d.unit || "Qty",
        group: "standard",
      });
    }
  }
  return out;
}

export function getDefaultPlanAllowedLines(): DeliverableType[] {
  return buildAllowedLinesFromRows([
    { typeId: "ig-reel", label: "IG Reel", unit: "Qty" },
    { typeId: "ig-story", label: "IG Story", unit: "Qty" },
    { typeId: "ig-live", label: "IG Live", unit: "Hours" },
    { typeId: "content-usage", label: "Content Usage (Digital)", unit: "Days" },
  ]);
}
