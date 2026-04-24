"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Search, Trash2 } from "lucide-react";
import { CURRENCIES, UNIT_OPTIONS, type DeliverableType } from "@/lib/deliverableCatalog";
import { ScopeAddPopover } from "./ScopeAddPopover";

// ─── Types ────────────────────────────────────────────────────────────────────

type ScopeRow = {
  instanceId: string;
  typeId: string;
  label: string;
  color: string;
  platform: string;
  influencerRate: string;
  qty: string;
  unit: string;
};

// Item | Tax | Qty | Rate | Cost | Sugg. | Delete
const SCOPE_COL = "grid-cols-[minmax(140px,1.8fr)_52px_60px_minmax(80px,1fr)_minmax(80px,1fr)_minmax(80px,1fr)_36px] gap-x-3";

const MOCK_RATES: Record<string, string> = {
  usd: "1 USD = Rp 16,503.44 · 1 USD = ₹ 83.25",
  inr: "1 INR = Rp 198.47 · 1 USD = ₹ 83.25",
  sgd: "1 SGD = Rp 12,301.22 · 1 SGD = ₹ 61.80",
  myr: "1 MYR = Rp 3,519.00 · 1 USD = ₹ 83.25",
  idr: "1 USD = Rp 16,503.44",
  thb: "1 THB = Rp 455.30 · 1 THB = ₹ 2.41",
  php: "1 PHP = Rp 286.20 · 1 PHP = ₹ 1.52",
  vnd: "1 USD = ₫ 24,850.00",
};

function symFor(code: string) {
  return CURRENCIES.find((c) => c.value === code)?.symbol ?? code.toUpperCase();
}

// ─── Scope item row ───────────────────────────────────────────────────────────

function ScopeItemRow({
  row,
  taxPct,
  proposalSymbol,
  influencerSymbol,
  onChange,
  onRemove,
}: {
  row: ScopeRow;
  taxPct: number;
  proposalSymbol: string;
  influencerSymbol: string;
  onChange: (patch: Partial<ScopeRow>) => void;
  onRemove: () => void;
}) {
  const rate = parseFloat(row.influencerRate) || 0;
  const qty = parseFloat(row.qty) || 0;
  const cost = rate * qty;
  const sugg = cost * (1 + taxPct / 100);

  return (
    <div className={cn("group grid items-center py-2.5 px-4 hover:bg-gray-50/60 transition-colors", SCOPE_COL)}>
      <div className="flex items-center gap-2 min-w-0">
        <span className="w-1.5 h-7 rounded-full shrink-0" style={{ backgroundColor: row.color }} />
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-gray-800 truncate">{row.label}</div>
          <div className="text-[11px] text-gray-400">{row.platform}</div>
        </div>
      </div>

      <span className="text-[12px] text-gray-500 tabular-nums text-center">
        {taxPct > 0 ? `${taxPct}%` : "—"}
      </span>

      <Input
        type="number"
        min="1"
        value={row.qty}
        onChange={(e) => onChange({ qty: e.target.value })}
        className="h-8 text-[12.5px] text-center tabular-nums border-gray-200 px-1.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />

      <div className="relative">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 pointer-events-none select-none">
          {influencerSymbol}
        </span>
        <Input
          type="number"
          min="0"
          value={row.influencerRate}
          onChange={(e) => onChange({ influencerRate: e.target.value })}
          className="h-8 text-[12.5px] tabular-nums border-gray-200 pl-7 pr-1.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>

      <span className="text-[12.5px] text-gray-700 tabular-nums truncate">
        {influencerSymbol} {cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>

      <span className="text-[12.5px] text-gray-700 tabular-nums truncate">
        {proposalSymbol} {sugg.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>

      <button
        type="button"
        onClick={onRemove}
        className="h-8 w-8 flex items-center justify-center rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        aria-label="Remove"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

// ─── Main dialog ──────────────────────────────────────────────────────────────

export function QuotesMatrixDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [influencerCurrency, setInfluencerCurrency] = useState<string>("idr");
  const [influencerTax, setInfluencerTax] = useState("0");
  const [proposalCurrency, setProposalCurrency] = useState<string>("inr");
  const [margin, setMargin] = useState("30");
  const [scopeRows, setScopeRows] = useState<ScopeRow[]>([]);
  const [finalInfluencerCost, setFinalInfluencerCost] = useState("0");
  const [finalClientPrice, setFinalClientPrice] = useState("0");

  function addScope(type: DeliverableType | { id: string; label: string; color: string; platform: string; defaultUnit: string; group: "standard" | "addon" }) {
    setScopeRows((prev) => [
      ...prev,
      {
        instanceId: `${type.id}-${Date.now()}`,
        typeId: type.id,
        label: type.label,
        color: type.color,
        platform: type.platform,
        influencerRate: "0",
        qty: "1",
        unit: type.defaultUnit,
      },
    ]);
  }

  function updateRow(instanceId: string, patch: Partial<ScopeRow>) {
    setScopeRows((prev) => prev.map((r) => (r.instanceId === instanceId ? { ...r, ...patch } : r)));
  }

  function removeRow(instanceId: string) {
    setScopeRows((prev) => prev.filter((r) => r.instanceId !== instanceId));
  }

  const existingTypeIds = scopeRows.map((r) => r.typeId);
  const taxPct = parseFloat(influencerTax) || 0;
  const marginPct = parseFloat(margin) || 0;

  const itemsGross = useMemo(
    () => scopeRows.reduce((s, r) => s + (parseFloat(r.influencerRate) || 0) * (parseFloat(r.qty) || 0), 0),
    [scopeRows]
  );
  const itemsTax = itemsGross * (taxPct / 100);
  const itemsNet = itemsGross + itemsTax;
  const targetQuote = itemsNet * (1 + marginPct / 100);

  const influencerSym = symFor(influencerCurrency);
  const proposalSym = symFor(proposalCurrency);
  const finalInfluencerVal = parseFloat(finalInfluencerCost) || 0;
  const finalClientVal = parseFloat(finalClientPrice) || 0;
  const savings = finalInfluencerVal - itemsGross;
  const actualMargin = finalClientVal > 0 ? ((finalClientVal - finalInfluencerVal) / finalClientVal) * 100 : 0;
  const adjustment = finalClientVal - targetQuote;
  const exchangeHint = MOCK_RATES[influencerCurrency] ?? "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl! max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <DialogTitle className="text-[17px] font-semibold text-gray-900">Quotes Matrix</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Top form */}
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[12px] text-gray-500">Influencer Currency</Label>
              <Select value={influencerCurrency} onValueChange={(v) => v && setInfluencerCurrency(v)}>
                <SelectTrigger className="h-9! text-[13px] border-gray-200 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.value} value={c.value} className="text-[13px]">
                      {c.label} — {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[12px] text-gray-500">Influencer Tax</Label>
              <div className="relative">
                <Input
                  value={influencerTax}
                  onChange={(e) => setInfluencerTax(e.target.value)}
                  type="number" min="0" max="100"
                  className="h-9 text-[13px] pr-8 border-gray-200 tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-gray-400 pointer-events-none">%</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[12px] text-gray-500">Proposal Currency</Label>
              <Select value={proposalCurrency} onValueChange={(v) => v && setProposalCurrency(v)}>
                <SelectTrigger className="h-9! text-[13px] border-gray-200 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.value} value={c.value} className="text-[13px]">
                      {c.label} ({c.symbol}) — {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[12px] text-gray-500">Margin</Label>
              <div className="relative">
                <Input
                  value={margin}
                  onChange={(e) => setMargin(e.target.value)}
                  type="number" min="0" max="100"
                  className="h-9 text-[13px] pr-8 border-gray-200 tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-gray-400 pointer-events-none">%</span>
              </div>
              <p className="text-[11px] text-gray-400">Applies to all Suggested Client Prices.</p>
            </div>
          </div>

          {exchangeHint && (
            <p className="text-[12px] text-gray-400 -mt-2">{exchangeHint}</p>
          )}

          {/* Plan Scope card */}
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/60">
              <span className="text-[13px] font-semibold text-gray-800">Plan Scope</span>
              {scopeRows.length > 0 && (
                <ScopeAddPopover existingTypeIds={existingTypeIds} onAdd={addScope} />
              )}
            </div>

            {scopeRows.length > 0 && (
              <div className={cn("grid items-center px-4 py-2 bg-gray-50/40 border-b border-gray-100 text-[11px] font-semibold uppercase tracking-wide text-gray-400", SCOPE_COL)}>
                <span>Item</span>
                <span className="text-center">Tax</span>
                <span className="text-center">Qty</span>
                <span>Rate</span>
                <span>Cost</span>
                <span>Sugg. Price</span>
                <span />
              </div>
            )}

            {scopeRows.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Search size={18} className="text-gray-400" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-[13px] font-medium text-gray-700">No scope in this matrix yet</p>
                  <p className="text-[12px] text-gray-400">
                    Use <span className="font-medium">Add Scope</span> above. Items already in the list
                    <br />are disabled in the picker.
                  </p>
                </div>
                <ScopeAddPopover existingTypeIds={existingTypeIds} onAdd={addScope} />
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {scopeRows.map((row) => (
                  <ScopeItemRow
                    key={row.instanceId}
                    row={row}
                    taxPct={taxPct}
                    proposalSymbol={proposalSym}
                    influencerSymbol={influencerSym}
                    onChange={(patch) => updateRow(row.instanceId, patch)}
                    onRemove={() => removeRow(row.instanceId)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Bottom accounting */}
          <div className="grid grid-cols-2 gap-4">
            {/* Influencer Package Deal */}
            <div className="rounded-xl bg-emerald-50/60 p-4 space-y-4">
              <p className="text-[13px] font-semibold text-gray-800">Influencer Package Deal</p>
              <div className="space-y-1.5">
                <Label className="text-[12px] text-gray-500">Final Influencer Cost</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12.5px] text-gray-500 pointer-events-none select-none">{influencerSym}</span>
                  <Input
                    value={finalInfluencerCost}
                    onChange={(e) => setFinalInfluencerCost(e.target.value)}
                    type="number" min="0"
                    className="h-10 text-[13px] tabular-nums pl-9 border-gray-200 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <p className="text-[11px] text-gray-400">Enter the final package price negotiated with the influencer.</p>
              </div>
              <div className="space-y-2 text-[12.5px]">
                <div className="flex justify-between text-gray-600">
                  <span>Items Total Cost (Gross)</span>
                  <span className="tabular-nums">{influencerSym} {itemsGross.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Items Total Cost (Net)</span>
                  <span className="tabular-nums">{influencerSym} {itemsNet.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Total Influencer Tax</span>
                  <span className="tabular-nums">{influencerSym} {itemsTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-gray-700">Savings</span>
                  <span className={cn("tabular-nums", savings < 0 ? "text-red-500" : "text-emerald-600")}>
                    {savings < 0 ? "-" : ""}{influencerSym} {Math.abs(savings).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quote to Client */}
            <div className="rounded-xl bg-blue-50/40 p-4 space-y-4">
              <p className="text-[13px] font-semibold text-gray-800">Quote to Client</p>
              <div className="space-y-1.5">
                <Label className="text-[12px] text-gray-500">Final Client Price (Net)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12.5px] text-gray-500 pointer-events-none select-none">{proposalSym}</span>
                  <Input
                    value={finalClientPrice}
                    onChange={(e) => setFinalClientPrice(e.target.value)}
                    type="number" min="0"
                    className="h-10 text-[13px] tabular-nums pl-9 border-gray-200 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <p className="text-[11px] text-gray-400">Enter the final net price proposed to the client.</p>
              </div>
              <div className="space-y-2 text-[12.5px]">
                <div className="flex justify-between text-gray-600">
                  <span>Final Influencer Cost</span>
                  <span className="tabular-nums">{influencerSym} {finalInfluencerVal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Target Quote (Standard)</span>
                  <span className="tabular-nums">{proposalSym} {targetQuote.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-gray-700">Actual Margin</span>
                  <span className={cn("tabular-nums", actualMargin < 0 ? "text-orange-500" : "text-emerald-600")}>
                    {actualMargin.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-gray-700">Adjustment</span>
                  <span className={cn("tabular-nums", adjustment < 0 ? "text-orange-500" : adjustment > 0 ? "text-brand" : "text-gray-600")}>
                    {proposalSym} {adjustment.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-white">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="px-5">Cancel</Button>
          <Button onClick={() => onOpenChange(false)} className="px-5 text-white" style={{ backgroundColor: "#023E8A" }}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
