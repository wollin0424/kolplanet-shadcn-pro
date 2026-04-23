"use client";

import { useState, useRef } from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import {
  Settings,
  ChevronDown,
  X,
  Plus,
  Check,
  Info,
} from "lucide-react";

// ─── Catalogue of deliverable types ──────────────────────────────────────────

type DeliverableType = {
  id: string;
  label: string;
  platform: string;
  color: string;
  defaultUnit: string;
};

const DELIVERABLE_CATALOGUE: DeliverableType[] = [
  { id: "ig-reel",     label: "IG Reel",                platform: "Instagram", color: "#E1306C", defaultUnit: "Qty" },
  { id: "ig-story",    label: "IG Story",               platform: "Instagram", color: "#833AB4", defaultUnit: "Qty" },
  { id: "ig-post",     label: "IG Static Post",         platform: "Instagram", color: "#F77737", defaultUnit: "Qty" },
  { id: "ig-live",     label: "IG Live",                platform: "Instagram", color: "#FCAF45", defaultUnit: "Hours" },
  { id: "ig-content",  label: "Content Usage (Digital)",platform: "Instagram", color: "#6366f1", defaultUnit: "Days" },
  { id: "tt-video",    label: "TikTok Video",           platform: "TikTok",   color: "#010101", defaultUnit: "Qty" },
  { id: "tt-live",     label: "TikTok Live",            platform: "TikTok",   color: "#69C9D0", defaultUnit: "Hours" },
  { id: "yt-video",    label: "YouTube Video",          platform: "YouTube",  color: "#FF0000", defaultUnit: "Qty" },
  { id: "yt-shorts",   label: "YouTube Shorts",         platform: "YouTube",  color: "#FF4500", defaultUnit: "Qty" },
  { id: "fb-post",     label: "Facebook Post",          platform: "Facebook", color: "#1877F2", defaultUnit: "Qty" },
  { id: "fb-reel",     label: "Facebook Reel",          platform: "Facebook", color: "#1877F2", defaultUnit: "Qty" },
];

const UNIT_OPTIONS = ["Qty", "Hours", "Days", "Posts", "Videos", "Stories", "Months"];

const CURRENCIES = [
  { value: "inr", label: "INR", symbol: "₹", name: "Indian Rupee" },
  { value: "usd", label: "USD", symbol: "$", name: "US Dollar" },
  { value: "sgd", label: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { value: "myr", label: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
  { value: "idr", label: "IDR", symbol: "Rp", name: "Indonesian Rupiah" },
  { value: "thb", label: "THB", symbol: "฿", name: "Thai Baht" },
];

// ─── Active deliverable (instance in this plan) ───────────────────────────────

type ActiveDeliverable = {
  instanceId: string;
  typeId: string;
  label: string;
  color: string;
  platform: string;
  qty: string;
  unit: string;
};

const DEFAULT_DELIVERABLES: ActiveDeliverable[] = [
  { instanceId: "d1", typeId: "ig-reel",    label: "IG Reel",                color: "#E1306C", platform: "Instagram", qty: "1",  unit: "Qty" },
  { instanceId: "d2", typeId: "ig-story",   label: "IG Story",               color: "#833AB4", platform: "Instagram", qty: "1",  unit: "Qty" },
  { instanceId: "d3", typeId: "ig-live",    label: "IG Live",                color: "#FCAF45", platform: "Instagram", qty: "2",  unit: "Hours" },
  { instanceId: "d4", typeId: "ig-content", label: "Content Usage (Digital)",color: "#6366f1", platform: "Instagram", qty: "30", unit: "Days" },
];

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
  return (
    <div className="group grid grid-cols-[minmax(140px,1fr)_72px_104px_24px] gap-3 items-center py-2.5 px-4">
      {/* Col 1 — color bar + label */}
      <div className="flex items-center gap-2.5 min-w-0">
        <span
          className="w-1.5 h-8 rounded-full shrink-0"
          style={{ backgroundColor: item.color }}
        />
        <div className="min-w-0 leading-tight">
          <div className="text-[13px] font-medium text-gray-800 truncate">
            {item.label}
          </div>
          <div className="text-[11px] text-gray-400 truncate">
            {item.platform}
          </div>
        </div>
      </div>

      {/* Col 2 — Qty */}
      <Input
        value={item.qty}
        onChange={(e) => onChange({ qty: e.target.value })}
        className="w-full h-9 text-[13px] text-center tabular-nums border-gray-200 px-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        type="number"
        min="1"
      />

      {/* Col 3 — Unit */}
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

      {/* Col 4 — Remove */}
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

// ─── Add Deliverable picker ───────────────────────────────────────────────────

function AddDeliverablePicker({
  existingTypeIds,
  onAdd,
}: {
  existingTypeIds: string[];
  onAdd: (type: DeliverableType) => void;
}) {
  const [open, setOpen] = useState(false);

  const grouped = DELIVERABLE_CATALOGUE.reduce<Record<string, DeliverableType[]>>(
    (acc, t) => {
      acc[t.platform] = acc[t.platform] ?? [];
      acc[t.platform].push(t);
      return acc;
    },
    {}
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-dashed border-gray-300 text-[12.5px] text-gray-500 hover:border-brand hover:text-brand hover:bg-brand-50 transition-colors font-medium"
      >
        <Plus size={12} />
        Add Deliverable
      </PopoverTrigger>
      <PopoverContent align="start" side="bottom" sideOffset={6} className="w-[260px] p-0">
        <Command>
          <CommandInput placeholder="Search deliverables…" />
          <CommandList className="max-h-[260px]">
            <CommandEmpty>No results found.</CommandEmpty>
            {Object.entries(grouped).map(([platform, types]) => (
              <CommandGroup key={platform} heading={platform}>
                {types.map((t) => {
                  const already = existingTypeIds.includes(t.id);
                  return (
                    <CommandItem
                      key={t.id}
                      value={t.label}
                      disabled={already}
                      onSelect={() => {
                        if (!already) {
                          onAdd(t);
                          setOpen(false);
                        }
                      }}
                      className="flex items-center gap-2"
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: t.color }}
                      />
                      <span className={cn("flex-1 text-[13px]", already && "text-gray-400")}>
                        {t.label}
                      </span>
                      {already && <Check size={12} className="text-gray-400" />}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ─── Sheet ────────────────────────────────────────────────────────────────────

export function PlanSettingsSheet() {
  const [open, setOpen] = useState(false);

  // Quote settings
  const [currency, setCurrency] = useState<string | null>("inr");
  const [margin, setMargin] = useState("30");
  const marginNum = parseFloat(margin);
  const marginValid = !isNaN(marginNum) && marginNum >= 0 && marginNum <= 100;

  // Deliverables
  const [deliverables, setDeliverables] = useState<ActiveDeliverable[]>(DEFAULT_DELIVERABLES);
  const counter = useRef(100);

  const addDeliverable = (type: DeliverableType) => {
    counter.current += 1;
    setDeliverables((prev) => [
      ...prev,
      {
        instanceId: `d${counter.current}`,
        typeId: type.id,
        label: type.label,
        color: type.color,
        platform: type.platform,
        qty: "1",
        unit: type.defaultUnit,
      },
    ]);
  };

  const updateDeliverable = (id: string, patch: Partial<ActiveDeliverable>) => {
    setDeliverables((prev) =>
      prev.map((d) => (d.instanceId === id ? { ...d, ...patch } : d))
    );
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
      {/* Trigger */}
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
        className="p-0 flex flex-col gap-0 border-l border-gray-100 w-full! sm:max-w-[640px]!"
      >
        {/* ── Header ── */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 shrink-0">
          <div>
            <h2 className="text-[15px] font-bold text-gray-900 tracking-tight">
              Plan Settings
            </h2>
            <p className="text-[12px] text-gray-400 mt-0.5 leading-relaxed">
              Configure default pricing and deliverable scope for this plan.
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

        {/* ── Scrollable body ── */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="px-6 py-5 space-y-7">

            {/* ── Section: Quote Settings ── */}
            <section className="space-y-4">
              <div className="space-y-0.5">
                <h3 className="text-[13px] font-semibold text-gray-900">
                  Quote Settings
                </h3>
                <p className="text-[12px] text-gray-400">
                  Baseline pricing rules for every quote in this plan.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Proposal Currency */}
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-gray-600 font-medium">
                    Proposal Currency
                  </Label>
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

                {/* Margin % */}
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-gray-600 font-medium flex items-center gap-1">
                    Agency Margin
                    <span
                      title="The percentage added on top of the influencer's quoted rate to form the client-facing price."
                      className="text-gray-400 cursor-help"
                    >
                      <Info size={11} />
                    </span>
                  </Label>
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

              {/* Live preview pill */}
              {marginValid && margin !== "" && selectedCurrency && (
                <div className="flex items-center gap-2 rounded-lg bg-brand-50 border border-brand-100 px-3 py-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
                  <span className="text-[12px] text-brand">
                    A ₹10,000 quote becomes{" "}
                    <strong>
                      {selectedCurrency.symbol}
                      {(10000 * (1 + parseFloat(margin) / 100)).toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}
                    </strong>{" "}
                    after {margin}% margin.
                  </span>
                </div>
              )}
            </section>

            <Separator />

            {/* ── Section: Deliverables ── */}
            <section className="space-y-3">
              <div className="flex items-end justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[13px] font-semibold text-gray-900">
                      Deliverables
                    </h3>
                    {deliverables.length > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-gray-100 text-gray-600 text-[10px] font-semibold tabular-nums">
                        {deliverables.length}
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-gray-400">
                    Content types included in this plan.
                  </p>
                </div>
              </div>

              {deliverables.length > 0 ? (
                <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                  {/* Table header — uses the same grid as rows below */}
                  <div className="grid grid-cols-[minmax(140px,1fr)_72px_104px_24px] gap-3 items-center px-4 py-2.5 bg-gray-50/70 border-b border-gray-100">
                    <span className="text-[10.5px] font-semibold uppercase tracking-wider text-gray-500 pl-[18px] truncate">
                      Deliverable
                    </span>
                    <span className="text-center text-[10.5px] font-semibold uppercase tracking-wider text-gray-500 truncate">
                      Qty
                    </span>
                    <span className="text-[10.5px] font-semibold uppercase tracking-wider text-gray-500 truncate">
                      Unit
                    </span>
                    <span aria-hidden />
                  </div>

                  {/* Rows */}
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
                  <p className="text-[13px] text-gray-500 font-medium">No deliverables yet</p>
                  <p className="text-[12px] text-gray-400 mt-1">Add one below to define the scope.</p>
                </div>
              )}

              {/* Add button */}
              <AddDeliverablePicker
                existingTypeIds={deliverables.map((d) => d.typeId)}
                onAdd={addDeliverable}
              />
            </section>
          </div>
        </ScrollArea>

        <Separator />

        {/* ── Footer ── */}
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
