"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { DeliverableType } from "@/lib/deliverableCatalog";
import { getDefaultPlanAllowedLines } from "@/lib/planScope";

type PlanScopeContextValue = {
  /** Unique deliverable types allowed in Quote Matrix, in Plan Settings order. */
  allowedLines: DeliverableType[];
  setAllowedLines: (lines: DeliverableType[]) => void;
};

const PlanScopeContext = createContext<PlanScopeContextValue | null>(null);

export function PlanScopeProvider({ children }: { children: ReactNode }) {
  const [allowedLines, setAllowedLines] = useState<DeliverableType[]>(getDefaultPlanAllowedLines);

  const value = useMemo(
    () => ({
      allowedLines,
      setAllowedLines,
    }),
    [allowedLines]
  );

  return <PlanScopeContext.Provider value={value}>{children}</PlanScopeContext.Provider>;
}

export function usePlanScope() {
  const ctx = useContext(PlanScopeContext);
  if (!ctx) {
    throw new Error("usePlanScope must be used within PlanScopeProvider");
  }
  return ctx;
}

export function usePlanScopeOptional() {
  return useContext(PlanScopeContext);
}
