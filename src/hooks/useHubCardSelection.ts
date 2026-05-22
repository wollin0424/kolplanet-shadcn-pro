"use client";

import { useCallback, useMemo, useState } from "react";

export function useHubCardSelection(visibleIds: string[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  const visibleIdSet = useMemo(() => new Set(visibleIds), [visibleIds]);

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(visibleIds));
  }, [visibleIds]);

  const clear = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelected = useCallback(
    (id: string) => visibleIdSet.has(id) && selectedIds.has(id),
    [selectedIds, visibleIdSet]
  );

  const selectedCount = useMemo(
    () => visibleIds.filter((id) => selectedIds.has(id)).length,
    [visibleIds, selectedIds]
  );

  return { selectedCount, toggle, selectAll, clear, isSelected };
}
