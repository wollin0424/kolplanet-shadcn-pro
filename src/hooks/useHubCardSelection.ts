"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export function useHubCardSelection(visibleIds: string[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  const visibleIdSet = useMemo(() => new Set(visibleIds), [visibleIds]);

  useEffect(() => {
    setSelectedIds((prev) => {
      const next = new Set([...prev].filter((id) => visibleIdSet.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [visibleIdSet]);

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

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds]);

  const selectedCount = useMemo(
    () => [...selectedIds].filter((id) => visibleIdSet.has(id)).length,
    [selectedIds, visibleIdSet]
  );

  return { selectedCount, toggle, selectAll, clear, isSelected };
}
