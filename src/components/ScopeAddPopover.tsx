"use client";

import { useState, useMemo, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Plus, Search, X } from "lucide-react";
import { DELIVERABLE_CATALOGUE, type DeliverableType } from "@/lib/deliverableCatalog";

type AddedType = DeliverableType | {
  id: string;
  label: string;
  color: string;
  platform: string;
  defaultUnit: string;
  group: "standard" | "addon";
};

type Props = {
  existingIds?: string[];
  /** Alias accepted for backwards-compatibility */
  existingTypeIds?: string[];
  onAdd: (type: AddedType) => void;
  className?: string;
};

export function ScopeAddPopover({ existingIds: _existingIds, existingTypeIds, onAdd, className }: Props) {
  const existingIds = _existingIds ?? existingTypeIds ?? [];

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customLabel, setCustomLabel] = useState("");

  useEffect(() => {
    if (!open) {
      setQuery("");
      setShowCustomInput(false);
      setCustomLabel("");
    }
  }, [open]);

  const searchActive = query.trim().length > 0;

  const filteredStd = useMemo(
    () => DELIVERABLE_CATALOGUE.filter(
      (t) => t.group === "standard" &&
        (!searchActive || t.label.toLowerCase().includes(query.toLowerCase()))
    ),
    [query, searchActive]
  );

  const filteredAddon = useMemo(
    () => DELIVERABLE_CATALOGUE.filter(
      (t) => t.group === "addon" &&
        (!searchActive || t.label.toLowerCase().includes(query.toLowerCase()))
    ),
    [query, searchActive]
  );

  const hasRows = filteredStd.length > 0 || filteredAddon.length > 0;

  function handlePick(type: DeliverableType) {
    if (existingIds.includes(type.id)) return;
    onAdd(type);
    setOpen(false);
  }

  function handleAddCustom() {
    const label = customLabel.trim();
    if (!label) return;
    onAdd({ id: `custom-${Date.now()}`, label, color: "#d97706", platform: "Custom", defaultUnit: "Qty", group: "standard" });
    setOpen(false);
  }

  return (
    <div className={cn("shrink-0", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className={cn(
            "inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[12px] font-medium",
            "border border-brand-100 bg-brand-50 text-brand hover:bg-brand-100 transition-colors"
          )}
        >
          <Plus size={12} strokeWidth={2.5} />
          Add Scope
        </PopoverTrigger>

        <PopoverContent
          align="end"
          side="bottom"
          sideOffset={6}
          className="w-[min(calc(100vw-1.5rem),320px)] p-0 flex flex-col shadow-lg overflow-hidden"
          style={{ maxHeight: "min(460px, 80vh)" }}
        >
          {/* Search — fixed */}
          <div className="shrink-0 border-b border-border/60 px-3 py-2.5">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search scope types…"
                className="pl-7 h-8 text-[12.5px] border-gray-200 bg-gray-50 focus:bg-white"
                autoFocus
              />
            </div>
          </div>

          {/* Scrollable list */}
          <div className="overflow-y-auto" style={{ maxHeight: 280 }}>
            <div className="space-y-3 p-3">
              {filteredStd.length > 0 && (
                <div>
                  <p className="mb-1.5 px-0.5 text-[10px] font-semibold uppercase tracking-widest text-brand">
                    Standard Deliverables
                  </p>
                  <div className="space-y-0.5 rounded-md bg-brand-50/50 p-1">
                    {filteredStd.map((t) => {
                      const disabled = existingIds.includes(t.id);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          disabled={disabled}
                          onClick={() => handlePick(t)}
                          className={cn(
                            "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-[12.5px] transition-colors",
                            disabled ? "opacity-40 cursor-not-allowed text-gray-500" : "text-gray-800 hover:bg-brand-100/60"
                          )}
                        >
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                          <span className="flex-1 truncate">{t.label}</span>
                          <span className="shrink-0 text-[11px] text-gray-400">{t.platform}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {filteredAddon.length > 0 && (
                <div>
                  <p className="mb-1.5 px-0.5 text-[10px] font-semibold uppercase tracking-widest text-violet-700">
                    Add-ons &amp; Rights
                  </p>
                  <div className="space-y-0.5 rounded-md bg-violet-50/50 p-1">
                    {filteredAddon.map((t) => {
                      const disabled = existingIds.includes(t.id);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          disabled={disabled}
                          onClick={() => handlePick(t)}
                          className={cn(
                            "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-[12.5px] transition-colors",
                            disabled ? "opacity-40 cursor-not-allowed text-gray-500" : "text-gray-800 hover:bg-violet-100/60"
                          )}
                        >
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                          <span className="flex-1 truncate">{t.label}</span>
                          <span className="shrink-0 text-[11px] text-gray-400">{t.platform}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {searchActive && !hasRows && (
                <p className="text-center text-[12px] text-gray-400 py-4">No matches found</p>
              )}
            </div>
          </div>

          {/* Custom footer — always visible */}
          <Separator className="shrink-0" />
          <div className="shrink-0 bg-amber-50/60 p-2.5">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-amber-900/80">Custom</p>
            {showCustomInput ? (
              <div className="flex items-center gap-1.5">
                <Input
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
                  placeholder="Type a name…"
                  className="h-8 text-[12.5px] flex-1 border-amber-200 bg-white"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAddCustom}
                  disabled={!customLabel.trim()}
                  className="h-8 px-2.5 rounded-md bg-amber-500 text-white text-[12px] font-medium disabled:opacity-40 hover:bg-amber-600 transition-colors shrink-0"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => { setShowCustomInput(false); setCustomLabel(""); }}
                  className="h-8 w-8 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0"
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowCustomInput(true)}
                className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[12.5px] text-amber-800 hover:bg-amber-100/80 transition-colors"
              >
                <Plus size={12} strokeWidth={2.5} />
                Add custom type…
              </button>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
