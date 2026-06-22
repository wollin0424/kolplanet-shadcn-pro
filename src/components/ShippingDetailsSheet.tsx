"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollFade } from "@/components/ScrollFade";
import { formInputClass, formTextareaClass } from "@/lib/formControls";
import { cn } from "@/lib/utils";

export type ShippingAddress = {
  recipientName: string;
  recipientPhone: string;
  countryRegion: string;
  city: string;
  zipPostalCode: string;
  streetAddress: string;
};

export type ShippingFulfillment = {
  useContractDefault: boolean;
  address: ShippingAddress;
  courier: string;
  trackingId: string;
  goodsContent: string;
};

const COURIER_OPTIONS = ["SF Express", "DHL Express", "FedEx", "J&T Express", "Ninja Van"];

const COUNTRY_OPTIONS = [
  "Indonesia",
  "Malaysia",
  "Singapore",
  "Philippines",
  "Taiwan",
  "Thailand",
  "United States",
];

const disabledFieldClass =
  "disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:opacity-100";

function FieldLabel({
  children,
  muted = false,
}: {
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <label
      className={cn(
        "text-[12px] font-medium",
        muted ? "text-gray-400" : "text-gray-700"
      )}
    >
      {children}
    </label>
  );
}

/** One field = one card (matches Contract Snapshot prototype). */
function SnapshotField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] border border-[#e2e8f0] bg-[var(--hub-snapshot-field-bg)] px-4 py-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <p className="text-[10px] font-semibold tracking-[0.08em] text-[#94a3b8] uppercase">
        {label}
      </p>
      <p className="mt-2 text-[15px] leading-snug font-normal text-[#1f2937]">{value || "—"}</p>
    </div>
  );
}

function ContractSnapshotPanel({ contractShipping }: { contractShipping: ShippingAddress }) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h3 className="text-[15px] font-semibold text-gray-900">Contract Snapshot</h3>
        <p className="mt-1.5 text-[12px] leading-relaxed text-gray-500">
          Read-only shipping details from Contract / KOL Info for verification only.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <SnapshotField label="Recipient Name" value={contractShipping.recipientName} />
        <SnapshotField label="Recipient Phone" value={contractShipping.recipientPhone} />
        <SnapshotField label="Country / Region" value={contractShipping.countryRegion} />
        <SnapshotField label="City" value={contractShipping.city} />
        <SnapshotField label="Zip / Postal Code" value={contractShipping.zipPostalCode} />
        <SnapshotField label="Street Address" value={contractShipping.streetAddress} />
      </div>
    </section>
  );
}

function FulfillmentDetailsPanel({
  useContractDefault,
  onUseContractDefaultChange,
  address,
  onAddressChange,
  courier,
  onCourierChange,
  trackingId,
  onTrackingIdChange,
  goodsContent,
  onGoodsContentChange,
}: {
  useContractDefault: boolean;
  onUseContractDefaultChange: (checked: boolean) => void;
  address: ShippingAddress;
  onAddressChange: (patch: Partial<ShippingAddress>) => void;
  courier: string;
  onCourierChange: (value: string) => void;
  trackingId: string;
  onTrackingIdChange: (value: string) => void;
  goodsContent: string;
  onGoodsContentChange: (value: string) => void;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h3 className="text-[15px] font-semibold text-gray-900">Fulfillment Details</h3>
        <p className="mt-1.5 text-[12px] leading-relaxed text-gray-500">
          Update shipping address and logistics execution for this influencer.
        </p>
      </div>

      <label className="flex cursor-pointer items-center gap-2">
        <Checkbox
          checked={useContractDefault}
          onCheckedChange={(checked) => onUseContractDefaultChange(checked === true)}
        />
        <span className="text-[13px] text-gray-700">Use contract default address</span>
      </label>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <FieldLabel muted={useContractDefault}>Recipient Name</FieldLabel>
          <Input
            value={address.recipientName}
            onChange={(e) => onAddressChange({ recipientName: e.target.value })}
            disabled={useContractDefault}
            className={cn(formInputClass("h-9 text-[13px]"), disabledFieldClass)}
          />
        </div>
        <div className="space-y-1.5">
          <FieldLabel muted={useContractDefault}>Recipient Phone</FieldLabel>
          <Input
            value={address.recipientPhone}
            onChange={(e) => onAddressChange({ recipientPhone: e.target.value })}
            disabled={useContractDefault}
            className={cn(formInputClass("h-9 text-[13px]"), disabledFieldClass)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <FieldLabel muted={useContractDefault}>Country / Region</FieldLabel>
            <Select
              value={address.countryRegion}
              disabled={useContractDefault}
              onValueChange={(v) => onAddressChange({ countryRegion: v ?? "" })}
            >
              <SelectTrigger
                className={cn("w-full", formInputClass("h-9 text-[13px]"), disabledFieldClass)}
              >
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRY_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <FieldLabel muted={useContractDefault}>City</FieldLabel>
            <Input
              value={address.city}
              onChange={(e) => onAddressChange({ city: e.target.value })}
              disabled={useContractDefault}
              className={cn(formInputClass("h-9 text-[13px]"), disabledFieldClass)}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <FieldLabel muted={useContractDefault}>Zip / Postal Code</FieldLabel>
          <Input
            value={address.zipPostalCode}
            onChange={(e) => onAddressChange({ zipPostalCode: e.target.value })}
            disabled={useContractDefault}
            className={cn(formInputClass("h-9 text-[13px]"), disabledFieldClass)}
          />
        </div>
        <div className="space-y-1.5">
          <FieldLabel muted={useContractDefault}>Street Address</FieldLabel>
          <Textarea
            value={address.streetAddress}
            onChange={(e) => onAddressChange({ streetAddress: e.target.value })}
            disabled={useContractDefault}
            rows={3}
            className={cn(formTextareaClass("min-h-[72px] resize-none text-[13px]"), disabledFieldClass)}
          />
        </div>
      </div>

      <div className="space-y-3 border-t border-gray-200/80 pt-4">
        <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
          Logistics execution
        </p>
        <div className="space-y-1.5">
          <FieldLabel>Courier</FieldLabel>
          <Select value={courier} onValueChange={(v) => onCourierChange(v ?? "")}>
            <SelectTrigger className={cn("w-full", formInputClass("h-9 text-[13px]"))}>
              <SelectValue placeholder="Select courier" />
            </SelectTrigger>
            <SelectContent>
              {COURIER_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <FieldLabel>Tracking ID</FieldLabel>
          <Input
            value={trackingId}
            onChange={(e) => onTrackingIdChange(e.target.value)}
            className={formInputClass("h-9 text-[13px]")}
          />
        </div>
        <div className="space-y-1.5">
          <FieldLabel>Goods Content</FieldLabel>
          <Textarea
            value={goodsContent}
            onChange={(e) => onGoodsContentChange(e.target.value)}
            rows={4}
            className={formTextareaClass("min-h-[96px] resize-none text-[13px]")}
          />
        </div>
      </div>
    </section>
  );
}

export default function ShippingDetailsSheet({
  open,
  onOpenChange,
  influencerName,
  contractShipping,
  initialFulfillment,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  influencerName: string;
  contractShipping: ShippingAddress;
  initialFulfillment?: Partial<ShippingFulfillment>;
  onSave?: (fulfillment: ShippingFulfillment) => void;
}) {
  const editorKey = open
    ? `${influencerName}:${initialFulfillment?.trackingId ?? "new"}:${contractShipping.streetAddress}`
    : "closed";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full gap-0 bg-white p-0 data-[side=right]:w-full data-[side=right]:max-w-[800px] data-[side=right]:sm:max-w-[800px]"
      >
        <SheetHeader className="shrink-0 gap-1.5 border-b border-gray-100 bg-white px-6 py-5 text-left">
          <SheetTitle className="text-[18px] font-semibold text-gray-900">
            Shipping Details
          </SheetTitle>
          <SheetDescription className="text-[13px] leading-relaxed text-gray-500">
            Review contract shipping info and update logistics fulfillment details for{" "}
            <span className="font-medium text-gray-700">{influencerName}</span>.
          </SheetDescription>
        </SheetHeader>

        {open ? (
          <ShippingDetailsEditor
            key={editorKey}
            contractShipping={contractShipping}
            initialFulfillment={initialFulfillment}
            influencerName={influencerName}
            onSave={onSave}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function ShippingDetailsEditor({
  contractShipping,
  initialFulfillment,
  influencerName,
  onSave,
  onClose,
}: {
  contractShipping: ShippingAddress;
  initialFulfillment?: Partial<ShippingFulfillment>;
  influencerName: string;
  onSave?: (fulfillment: ShippingFulfillment) => void;
  onClose: () => void;
}) {
  const useDefault = initialFulfillment?.useContractDefault ?? true;
  const [useContractDefault, setUseContractDefault] = useState(useDefault);
  const [address, setAddress] = useState<ShippingAddress>(() =>
    useDefault
      ? { ...contractShipping }
      : (initialFulfillment?.address ?? { ...contractShipping })
  );
  const [courier, setCourier] = useState(initialFulfillment?.courier ?? "");
  const [trackingId, setTrackingId] = useState(initialFulfillment?.trackingId ?? "");
  const [goodsContent, setGoodsContent] = useState(initialFulfillment?.goodsContent ?? "");

  const handleUseContractDefaultChange = (checked: boolean) => {
    setUseContractDefault(checked);
    if (checked) {
      setAddress({ ...contractShipping });
    }
  };

  const updateAddress = (patch: Partial<ShippingAddress>) => {
    if (useContractDefault) return;
    setAddress((prev) => ({ ...prev, ...patch }));
  };

  const handleSave = () => {
    onSave?.({
      useContractDefault,
      address,
      courier,
      trackingId,
      goodsContent,
    });
    console.log("Save shipping details:", {
      influencerName,
      useContractDefault,
      address,
      courier,
      trackingId,
      goodsContent,
    });
    onClose();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <ScrollFade className="min-h-0 flex-1 overflow-y-auto bg-[var(--hub-snapshot-bg)] px-6 py-6 lg:border-r lg:border-[#e2e8f0]">
          <ContractSnapshotPanel contractShipping={contractShipping} />
        </ScrollFade>
        <ScrollFade className="min-h-0 flex-1 overflow-y-auto bg-white px-6 py-6">
          <FulfillmentDetailsPanel
            useContractDefault={useContractDefault}
            onUseContractDefaultChange={handleUseContractDefaultChange}
            address={address}
            onAddressChange={updateAddress}
            courier={courier}
            onCourierChange={setCourier}
            trackingId={trackingId}
            onTrackingIdChange={setTrackingId}
            goodsContent={goodsContent}
            onGoodsContentChange={setGoodsContent}
          />
        </ScrollFade>
      </div>

      <SheetFooter className="shrink-0 flex-row justify-end gap-3 border-t border-gray-100 bg-white px-6 py-4">
        <Button
          type="button"
          variant="outline"
          className="h-9 min-w-[88px] border-gray-200 text-[13px] text-gray-700"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="brand"
          className="h-9 min-w-[88px] text-[13px]"
          onClick={handleSave}
        >
          Save
        </Button>
      </SheetFooter>
    </div>
  );
}
