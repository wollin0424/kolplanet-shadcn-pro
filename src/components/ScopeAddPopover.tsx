"use client";

import { useState, useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Check, Plus, Search, X } from "lucide-react";
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
  /** "dashed" matches Plan Settings sheet header (outline trigger) */
  triggerVariant?: "solid" | "dashed";
  /**
   * When set, the picker only lists these types (Plan Settings order).
   * Omit to use the full catalogue (Plan Settings Add Scope).
   */
  planScopeOnly?: DeliverableType[];
  /** Quote Matrix: hide custom row creation. */
  allowCustom?: boolean;
};

export function ScopeAddPopover({
  existingIds: _existingIds,
  existingTypeIds,
  onAdd,
  className,
  triggerVariant = "solid",
  planScopeOnly,
  allowCustom = true,
}: Props) {
  const existingIds = _existingIds ?? existingTypeIds ?? [];
  const catalogue = planScopeOnly ?? DELIVERABLE_CATALOGUE;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customLabel, setCustomLabel] = useState("");

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setQuery("");
      setShowCustomInput(false);
      setCustomLabel("");
    }
  }

  const searchActive = query.trim().length > 0;

  const filteredStd = useMemo(
    () =>
      catalogue.filter(
        (t) =>
          t.group === "standard" &&
          (!searchActive || t.label.toLowerCase().includes(query.toLowerCase()))
      ),
    [catalogue, query, searchActive]
  );

  const filteredAddon = useMemo(
    () =>
      catalogue.filter(
        (t) =>
          t.group === "addon" &&
          (!searchActive || t.label.toLowerCase().includes(query.toLowerCase()))
      ),
    [catalogue, query, searchActive]
  );

  const hasRows = filteredStd.length > 0 || filteredAddon.length > 0;
  const planEmpty = planScopeOnly !== undefined && planScopeOnly.length === 0;

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
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger
          className={cn(
            "inline-flex items-center gap-1.5 h-8 rounded-md px-3 text-[12.5px] font-medium transition-colors",
            triggerVariant === "dashed"
              ? [
                  // 常规：浅灰虚线、白底、深灰字（图3）
                  "border border-dashed border-gray-300 bg-white text-gray-700",
                  // 悬浮 / 打开：品牌虚线、浅蓝底、品牌字（图4）
                  "hover:border-brand hover:bg-brand-50 hover:text-brand",
                  "aria-expanded:border-brand aria-expanded:bg-brand-50 aria-expanded:text-brand",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20",
                ]
              : "border border-brand-100 bg-brand-50 text-brand hover:bg-brand-100"
          )}
        >
          <Plus size={12} strokeWidth={2.5} />
          Add Scope
        </PopoverTrigger>

        <PopoverContent
          align="end"
          side="bottom"
          sideOffset={6}
          className="w-[min(calc(100vw-1.5rem),320px)] gap-0 p-0 flex flex-col shadow-lg overflow-hidden"
          style={{ maxHeight: "min(460px, 80vh)" }}
        >
          {/* Search — fixed */}
          <div className="shrink-0 border-b border-border/60 px-3 py-2.5">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                className="pl-7 h-8 text-[12.5px] border-gray-200 bg-gray-50 focus:bg-white"
                autoFocus
              />
            </div>
          </div>

          {/* Scrollable list */}
          <div className="min-h-0 max-h-[280px] overflow-y-auto">
            <div className="space-y-3 px-3 pt-3 pb-0">
              {planEmpty && (
                <p className="text-center text-[12px] text-gray-500 py-6 px-1">
                  No scope in Plan Settings. Add items there first.
                </p>
              )}
              {filteredStd.length > 0 && (
                <div>
                  <p className="mb-1.5 px-0.5 text-[10px] font-semibold uppercase tracking-widest text-brand">
                    Standard Deliverables
                  </p>
                  <div className="space-y-0.5 rounded-md bg-brand-50/60 p-1">
                    {filteredStd.map((t) => {
                      const disabled = existingIds.includes(t.id);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          disabled={disabled}
                          onClick={() => !disabled && handlePick(t)}
                          className={cn(
                            "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-[12.5px] transition-colors",
                            disabled
                              ? "cursor-not-allowed text-gray-400 bg-white/60 opacity-80"
                              : "text-gray-800 hover:bg-brand-100/70"
                          )}
                        >
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                          <span className={cn("flex-1 min-w-0 truncate", disabled ? "text-gray-500" : "text-gray-800")}>
                            {t.label}
                          </span>
                          <span className="w-4 flex justify-end shrink-0">
                            {disabled ? (
                              <Check className="size-3.5 text-gray-400" strokeWidth={2.5} />
                            ) : null}
                          </span>
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
                          onClick={() => !disabled && handlePick(t)}
                          className={cn(
                            "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-[12.5px] transition-colors",
                            disabled
                              ? "cursor-not-allowed text-gray-400 bg-white/60 opacity-80"
                              : "text-gray-800 hover:bg-violet-100/60"
                          )}
                        >
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                          <span className={cn("flex-1 min-w-0 truncate", disabled ? "text-gray-500" : "text-gray-800")}>{t.label}</span>
                          <span className="w-4 flex justify-end shrink-0">
                            {disabled ? <Check className="size-3.5 text-violet-500" strokeWidth={2.5} /> : null}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {searchActive && !hasRows && !planEmpty && (
                <p className="text-center text-[12px] text-gray-400 py-4">No matches found</p>
              )}
            </div>
          </div>

          {allowCustom && (
            <div className="shrink-0 border-t border-gray-200 bg-gradient-to-b from-amber-50/95 to-[#fffbf5] px-3 py-2.5">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-amber-900/70">
              Custom
            </p>
            {showCustomInput ? (
              <div className="flex items-center gap-1.5">
                <Input
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
                  placeholder="Name..."
                  className={cn(
                    "h-8 min-w-0 flex-1 text-[12.5px] border-amber-200/90 bg-white",
                    "placeholder:text-gray-400",
                    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-300/60 focus-visible:border-amber-300"
                  )}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAddCustom}
                  disabled={!customLabel.trim()}
                  className="h-8 shrink-0 rounded-md bg-amber-500 px-2.5 text-[12px] font-medium text-white transition-colors hover:bg-amber-600 disabled:pointer-events-none disabled:opacity-40"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => { setShowCustomInput(false); setCustomLabel(""); }}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-amber-900/60 transition-colors hover:bg-white/60 hover:text-amber-950"
                  aria-label="Close"
                >
                  <X size={14} strokeWidth={2} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowCustomInput(true)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg py-2 px-2.5 text-left text-[13px] font-medium",
                  "text-amber-700 transition-colors",
                  "hover:bg-amber-100/60 hover:text-amber-800",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/60"
                )}
              >
                <Plus size={13} strokeWidth={2.5} className="shrink-0" />
                Add custom type
              </button>
            )}
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
