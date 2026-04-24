"use client";

import { useState, useRef, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Settings, ChevronDown, X } from "lucide-react";
import {
  CURRENCIES,
  UNIT_OPTIONS,
  DELIVERABLE_CATALOGUE,
  SCOPE_SECTION_ACCENT,
  type DeliverableType,
} from "@/lib/deliverableCatalog";
import { ScopeAddPopover } from "./ScopeAddPopover";
import { usePlanScope } from "@/context/PlanScopeContext";
import { buildAllowedLinesFromRows } from "@/lib/planScope";

// ─── Row model ────────────────────────────────────────────────────────────────

type ActiveDeliverable = {
  instanceId: string;
  typeId: string;
  label: string;
  qty: string;
  unit: string;
};

/** Matches screenshot: four default rows (3 standard + 1 add-on). */
const DEFAULT_DELIVERABLES: ActiveDeliverable[] = [
  { instanceId: "d1", typeId: "ig-reel",        label: "IG Reel",                 qty: "1",  unit: "Qty" },
  { instanceId: "d2", typeId: "ig-story",       label: "IG Story",                qty: "1",  unit: "Qty" },
  { instanceId: "d3", typeId: "ig-live",      label: "IG Live",                 qty: "2",  unit: "Hours" },
  { instanceId: "d4", typeId: "content-usage",  label: "Content Usage (Digital)", qty: "30", unit: "Days" },
];

function subtitleForTypeId(typeId: string): string {
  if (typeId.startsWith("custom-")) return "Custom";
  const t = DELIVERABLE_CATALOGUE.find((d) => d.id === typeId);
  if (!t) return "";
  return t.group === "addon" ? "Add-ons" : t.platform;
}

function accentBarForTypeId(typeId: string): string {
  if (typeId.startsWith("custom-")) return SCOPE_SECTION_ACCENT.custom;
  const t = DELIVERABLE_CATALOGUE.find((d) => d.id === typeId);
  if (!t) return SCOPE_SECTION_ACCENT.standard;
  return t.group === "addon" ? SCOPE_SECTION_ACCENT.addon : SCOPE_SECTION_ACCENT.standard;
}

// ─── Deliverable row ──────────────────────────────────────────────────────────

function DeliverableRow({
  item,
  onChange,
  onRemove,
}: {
  item: ActiveDeliverable;
  onChange: (patch: Partial<ActiveDeliverable>) => void;
  onRemove: () => void;
}) {
  const bar = accentBarForTypeId(item.typeId);
  const sub = subtitleForTypeId(item.typeId);

  return (
    <div className="group grid grid-cols-[minmax(140px,1fr)_72px_104px_24px] gap-3 items-center py-2.5 px-4">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="w-1.5 h-8 rounded-full shrink-0" style={{ backgroundColor: bar }} />
        <div className="min-w-0 leading-tight">
          <div className="text-[13px] font-medium text-gray-800 truncate">{item.label}</div>
          <div className="text-[11px] text-gray-400 truncate">{sub}</div>
        </div>
      </div>

      <Input
        value={item.qty}
        onChange={(e) => onChange({ qty: e.target.value })}
        className="w-full h-9 text-[13px] text-center tabular-nums border-gray-200 px-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        type="number"
        min="1"
      />

      <Select value={item.unit} onValueChange={(v) => v && onChange({ unit: v })}>
        <SelectTrigger className="w-full h-9! text-[13px] border-gray-200 px-3">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {UNIT_OPTIONS.map((u) => (
            <SelectItem key={u} value={u} className="text-[13px]">
              {u}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <button
        type="button"
        onClick={onRemove}
        className="justify-self-center p-1 rounded-md text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
        aria-label="Remove"
      >
        <X size={13} />
      </button>
    </div>
  );
}

// ─── Sheet ────────────────────────────────────────────────────────────────────

export function PlanSettingsSheet() {
  const [open, setOpen] = useState(false);
  const [currency, setCurrency] = useState<string | null>("inr");
  const [margin, setMargin] = useState("30");
  const marginNum = parseFloat(margin);
  const marginValid = !isNaN(marginNum) && marginNum >= 0 && marginNum <= 100;

  const [deliverables, setDeliverables] = useState<ActiveDeliverable[]>(DEFAULT_DELIVERABLES);
  const counter = useRef(100);
  const { setAllowedLines } = usePlanScope();

  useEffect(() => {
    setAllowedLines(
      buildAllowedLinesFromRows(
        deliverables.map((d) => ({ typeId: d.typeId, label: d.label, unit: d.unit }))
      )
    );
  }, [deliverables, setAllowedLines]);

  const addDeliverable = (
    type: DeliverableType | { id: string; label: string; color: string; platform: string; defaultUnit: string; group: "standard" | "addon" }
  ) => {
    counter.current += 1;
    setDeliverables((prev) => [
      ...prev,
      {
        instanceId: `d${counter.current}`,
        typeId: type.id,
        label: type.label,
        qty: "1",
        unit: type.defaultUnit,
      },
    ]);
  };

  const updateDeliverable = (id: string, patch: Partial<ActiveDeliverable>) => {
    setDeliverables((prev) => prev.map((d) => (d.instanceId === id ? { ...d, ...patch } : d)));
  };

  const removeDeliverable = (id: string) => {
    setDeliverables((prev) => prev.filter((d) => d.instanceId !== id));
  };

  const selectedCurrency = CURRENCIES.find((c) => c.value === currency);

  const handleConfirm = () => {
    if (!marginValid) return;
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-gray-200 text-[13px] text-gray-700 bg-white hover:bg-gray-50 transition-colors font-medium"
      >
        <Settings size={13} className="text-gray-500" />
        Plan Settings
        <ChevronDown size={11} className="text-gray-400" />
      </button>

      <SheetContent
        side="right"
        showCloseButton={false}
        className="p-0 flex flex-col gap-0 border-l border-gray-100 w-full! sm:max-w-[500px]!"
      >
        <div className="flex items-start justify-between px-6 pt-5 pb-4 shrink-0">
          <div>
            <h2 className="text-[15px] font-bold text-gray-900 tracking-tight">Plan Settings</h2>
            <p className="text-[12px] text-gray-400 mt-0.5 leading-relaxed max-w-[420px]">
              Define the default pricing rules and plan scope. Specific durations and individual rates
              can be refined in the Quote Matrix.
            </p>
          </div>
          <SheetClose
            render={
              <button
                type="button"
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0 mt-0.5"
                aria-label="Close"
              />
            }
          >
            <X size={15} />
          </SheetClose>
        </div>

        <Separator />

        <ScrollArea className="flex-1 min-h-0">
          <div className="px-6 py-5 space-y-7">
            <section className="space-y-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                CLIENT QUOTE SETTING
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-gray-600 font-medium">Proposal Currency</Label>
                  <Select value={currency} onValueChange={(v) => setCurrency(v)}>
                    <SelectTrigger className="w-full h-9! text-[13px] border-gray-200">
                      <SelectValue>
                        {selectedCurrency && (
                          <span className="flex items-center gap-1.5">
                            <span className="text-gray-900 font-medium">{selectedCurrency.symbol}</span>
                            <span className="text-gray-600">{selectedCurrency.label}</span>
                          </span>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c.value} value={c.value} className="text-[13px]">
                          <span className="flex items-center gap-2">
                            <span className="w-6 text-gray-500 font-medium">{c.symbol}</span>
                            <span>{c.label}</span>
                            <span className="text-gray-400 text-[11px]">{c.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[12px] text-gray-600 font-medium">Margin %</Label>
                  <div className="relative">
                    <Input
                      value={margin}
                      onChange={(e) => setMargin(e.target.value)}
                      className={cn(
                        "h-9 text-[13px] pr-7 tabular-nums",
                        !marginValid && margin !== "" && "border-red-400 focus:border-red-400"
                      )}
                      placeholder="0"
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[12px] text-gray-400 pointer-events-none font-medium">
                      %
                    </span>
                  </div>
                  {!marginValid && margin !== "" && (
                    <p className="text-[11px] text-red-500">Enter a value between 0 and 100.</p>
                  )}
                </div>
              </div>
            </section>

            <Separator />

            <section className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-[13px] font-semibold text-gray-900">Plan Scope</h3>
                  {deliverables.length > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-gray-100 text-gray-600 text-[10px] font-semibold tabular-nums">
                      {deliverables.length}
                    </span>
                  )}
                </div>
                <ScopeAddPopover
                  existingTypeIds={deliverables.map((d) => d.typeId)}
                  onAdd={addDeliverable}
                  triggerVariant="dashed"
                />
              </div>

              {deliverables.length > 0 ? (
                <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                  <div className="grid grid-cols-[minmax(140px,1fr)_72px_104px_24px] gap-3 items-center px-4 py-2.5 bg-gray-50/70 border-b border-gray-100">
                    <span className="text-[10.5px] font-semibold uppercase tracking-wider text-gray-500 pl-[18px]">
                      Deliverable
                    </span>
                    <span className="text-center text-[10.5px] font-semibold uppercase tracking-wider text-gray-500">
                      Qty
                    </span>
                    <span className="text-[10.5px] font-semibold uppercase tracking-wider text-gray-500">Unit</span>
                    <span aria-hidden />
                  </div>
                  <div className="divide-y divide-gray-50">
                    {deliverables.map((d) => (
                      <DeliverableRow
                        key={d.instanceId}
                        item={d}
                        onChange={(patch) => updateDeliverable(d.instanceId, patch)}
                        onRemove={() => removeDeliverable(d.instanceId)}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center">
                  <p className="text-[13px] text-gray-500 font-medium">No scope items yet</p>
                  <p className="text-[12px] text-gray-400 mt-1">Use Add Scope to define the plan.</p>
                </div>
              )}
            </section>
          </div>
        </ScrollArea>

        <Separator />

        <div className="shrink-0 flex items-center justify-between gap-3 px-6 py-4 bg-white">
          <SheetClose
            render={
              <Button
                variant="outline"
                className="h-9 flex-1 text-[13px] border-gray-200 text-gray-700"
              />
            }
          >
            Cancel
          </SheetClose>
          <Button
            onClick={handleConfirm}
            disabled={!marginValid}
            className="h-9 flex-1 text-[13px] text-white disabled:opacity-50"
            style={{ backgroundColor: "#023E8A" }}
          >
            Confirm Settings
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
