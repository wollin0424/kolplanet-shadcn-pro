"use client";

import { useMemo, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Copy, Upload } from "lucide-react";

type Tab = "Collaboration Details" | "KOL Information";

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors",
        active
          ? "bg-brand text-white"
          : "text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-100"
      )}
    >
      {children}
    </button>
  );
}

function OptionPills({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex items-center rounded-full pl-0 pr-3 py-1.5 text-[12px] font-medium transition-colors",
              active
                ? "bg-transparent text-brand"
                : "bg-transparent text-gray-600 hover:bg-gray-50"
            )}
          >
            <span
              className={cn(
                "mr-2 h-4 w-4 shrink-0 rounded-full border flex items-center justify-center",
                active ? "border-brand bg-white" : "border-gray-300 bg-white"
              )}
            >
              {active ? (
                <span className="h-2 w-2 rounded-full bg-brand" />
              ) : null}
            </span>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function SectionTitle({
  title,
  right,
}: {
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-[12px] font-semibold text-gray-800">{title}</h3>
      {right}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[12px] font-medium text-gray-700">{children}</div>;
}

function SubtleCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] p-4">
      {children}
    </div>
  );
}

function UploadCard({ label, hint }: { label: string; hint: string }) {
  return (
    <button
      type="button"
      className="w-full text-left rounded-xl border border-gray-100 bg-gradient-to-r from-amber-50/40 to-white p-4 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-start gap-3">
        <span className="w-9 h-9 rounded-lg bg-white border border-amber-100 flex items-center justify-center text-amber-700">
          <Upload size={16} />
        </span>
        <div className="min-w-0">
          <div className="text-[12px] font-semibold text-amber-700">{label}</div>
          <div className="mt-1 text-[11px] text-gray-500 leading-relaxed">{hint}</div>
        </div>
      </div>
    </button>
  );
}

export default function ContractInfoSheet({
  open,
  onOpenChange,
  influencerHandle = "@instagram ins",
  influencerName = "Amelia Stones",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  influencerHandle?: string;
  influencerName?: string;
}) {
  const [tab, setTab] = useState<Tab>("Collaboration Details");

  const countryOptions = useMemo(
    () => [
      { value: "SG", label: "Singapore" },
      { value: "MY", label: "Malaysia" },
      { value: "ID", label: "Indonesia" },
      { value: "TH", label: "Thailand" },
      { value: "PH", label: "Philippines" },
      { value: "VN", label: "Vietnam" },
      { value: "IN", label: "India" },
      { value: "CN", label: "China" },
      { value: "HK", label: "Hong Kong" },
      { value: "TW", label: "Taiwan" },
      { value: "JP", label: "Japan" },
      { value: "KR", label: "South Korea" },
      { value: "AE", label: "United Arab Emirates" },
      { value: "GB", label: "United Kingdom" },
      { value: "US", label: "United States" },
    ],
    []
  );
  const phoneCodeOptions = useMemo(
    () => [
      { value: "+65", label: "+65" },
      { value: "+60", label: "+60" },
      { value: "+62", label: "+62" },
      { value: "+66", label: "+66" },
      { value: "+63", label: "+63" },
      { value: "+84", label: "+84" },
      { value: "+91", label: "+91" },
      { value: "+86", label: "+86" },
      { value: "+81", label: "+81" },
      { value: "+82", label: "+82" },
      { value: "+971", label: "+971" },
      { value: "+44", label: "+44" },
      { value: "+1", label: "+1" },
    ],
    []
  );

  // Collaboration Details
  const [currency, setCurrency] = useState("USD");
  const [totalAmount, setTotalAmount] = useState("80,000");
  const [paymentMethod, setPaymentMethod] = useState("50% Advance");
  const [paymentTerm, setPaymentTerm] = useState("60 Days");
  const [deliverables, setDeliverables] = useState("Example: IG Reel *1, Story *1");

  // Add-ons & Rights
  const [contentUsage, setContentUsage] = useState("60 Days");
  const [postRetention, setPostRetention] = useState("Permanent");
  const [postBoosting, setPostBoosting] = useState("30 Days");
  const [competitorExcl, setCompetitorExcl] = useState(false);
  const [competitorExclList, setCompetitorExclList] = useState("");
  const [collabPost, setCollabPost] = useState("Not Required");
  const [onsiteEvent, setOnsiteEvent] = useState(false);
  const [onsiteEventDetails, setOnsiteEventDetails] = useState("");
  const [crossPosting, setCrossPosting] = useState("Not Required");
  const [linkInBio, setLinkInBio] = useState("Not Required");

  // KOL Information
  const [identityType, setIdentityType] = useState("A (Individual)");
  const [contractEntity, setContractEntity] = useState("");
  const [govId, setGovId] = useState("");
  const [resCountry, setResCountry] = useState("");
  const [resCity, setResCity] = useState("");
  const [resZip, setResZip] = useState("");
  const [resStreet, setResStreet] = useState("");
  const [sameAsShipping, setSameAsShipping] = useState(false);
  const [phoneCountryCode, setPhoneCountryCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [sameAsRecipientPhone, setSameAsRecipientPhone] = useState(false);

  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [beneficiaryBank, setBeneficiaryBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [swiftCode, setSwiftCode] = useState("");
  const [bankAddress, setBankAddress] = useState("");

  const [recipientName, setRecipientName] = useState("");
  const [recipientCountryCode, setRecipientCountryCode] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [shipCountry, setShipCountry] = useState("");
  const [shipCity, setShipCity] = useState("");
  const [shipZip, setShipZip] = useState("");
  const [shipStreet, setShipStreet] = useState("");

  const aiFastFillEnabled = true;

  const headerHandle = useMemo(() => influencerHandle, [influencerHandle]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="p-0 gap-0 data-[side=right]:w-[680px] data-[side=right]:max-w-[90vw] data-[side=right]:sm:max-w-[90vw]"
      >
        {/* Header */}
        <div className="px-7 py-5 border-b border-gray-100 bg-white">
          <div className="text-[16px] font-semibold text-gray-900 tracking-tight">
            Contract Info
          </div>

          <div className="mt-3 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="w-9 h-9">
                <AvatarImage src="" />
                <AvatarFallback className="text-[10px] font-semibold bg-violet-100 text-violet-700">
                  {headerHandle.slice(1, 3).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="text-[13px] font-semibold text-gray-900 truncate">
                    {headerHandle}
                  </div>
                  <span className="inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand border border-brand-100">
                    IG
                  </span>
                </div>
                <div className="text-[11px] text-gray-500 truncate">
                  {influencerName}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2" />
          </div>

          {/* Tabs */}
          <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gray-50 border border-gray-100 p-1">
            <TabButton
              active={tab === "Collaboration Details"}
              onClick={() => setTab("Collaboration Details")}
            >
              Collaboration Details
            </TabButton>
            <TabButton active={tab === "KOL Information"} onClick={() => setTab("KOL Information")}>
              KOL Information
            </TabButton>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-7 py-7 space-y-7 bg-gray-50/30">
          {tab === "Collaboration Details" ? (
            <>
              <div className="text-[12px] text-gray-500">
                Commercial terms are final and displayed as read-only on the creator’s portal.
              </div>

              <SubtleCard>
                <SectionTitle title="Commercials" />
                <div className="mt-5 space-y-5">
                  <div className="space-y-2">
                    <FieldLabel>Total Amount *</FieldLabel>
                    <div className="flex items-center gap-2">
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger className="h-9 w-[110px] border-gray-200 bg-white text-[12px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="SGD">SGD</SelectItem>
                          <SelectItem value="MYR">MYR</SelectItem>
                          <SelectItem value="IDR">IDR</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        value={totalAmount}
                        onChange={(e) => setTotalAmount(e.target.value)}
                        className="h-9 border-gray-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <FieldLabel>Payment Method *</FieldLabel>
                    <div className="text-[11px] text-gray-500">
                      Define the split between upfront payment and final balance.
                    </div>
                    <OptionPills
                      value={paymentMethod}
                      onChange={setPaymentMethod}
                      options={[
                        { value: "100% Postpaid", label: "100% Postpaid" },
                        { value: "30% Advance", label: "30% Advance" },
                        { value: "50% Advance", label: "50% Advance" },
                        { value: "70% Advance", label: "70% Advance" },
                        { value: "100% Advance", label: "100% Advance" },
                      ]}
                    />
                  </div>

                  <div className="space-y-2">
                    <FieldLabel>Payment Term *</FieldLabel>
                    <div className="text-[11px] text-gray-500">
                      Number of days to settle the final payment after content goes live.
                    </div>
                    <OptionPills
                      value={paymentTerm}
                      onChange={setPaymentTerm}
                      options={[
                        { value: "60 Days", label: "60 Days" },
                        { value: "45 Days", label: "45 Days" },
                        { value: "30 Days", label: "30 Days" },
                        { value: "15 Days", label: "15 Days" },
                        { value: "7 Days", label: "7 Days" },
                      ]}
                    />
                  </div>
                </div>
              </SubtleCard>

              <SubtleCard>
                <SectionTitle title="Deliverables" />
                <div className="mt-4 space-y-2">
                  <FieldLabel>Deliverables Details *</FieldLabel>
                  <Textarea
                    value={deliverables}
                    onChange={(e) => setDeliverables(e.target.value)}
                    className="border-gray-200"
                  />
                </div>
              </SubtleCard>

              <SubtleCard>
                <SectionTitle title="Add-ons & Rights" />
                <div className="mt-5 space-y-5">
                  <div className="space-y-2">
                    <FieldLabel>Content Usage</FieldLabel>
                    <div className="text-[11px] text-gray-500">
                      Permissions to license and reuse the content on brand’s official channels (social media, website, ads).
                    </div>
                    <OptionPills
                      value={contentUsage}
                      onChange={setContentUsage}
                      options={[
                        { value: "0 Days", label: "0 Days" },
                        { value: "30 Days", label: "30 Days" },
                        { value: "60 Days", label: "60 Days" },
                        { value: "90 Days", label: "90 Days" },
                        { value: "180 Days", label: "180 Days" },
                        { value: "1 Year", label: "1 Year" },
                        { value: "Permanent", label: "Permanent" },
                      ]}
                    />
                  </div>

                  <div className="space-y-2">
                    <FieldLabel>Post Retention</FieldLabel>
                    <OptionPills
                      value={postRetention}
                      onChange={setPostRetention}
                      options={[
                        { value: "30 Days", label: "30 Days" },
                        { value: "90 Days", label: "90 Days" },
                        { value: "180 Days", label: "180 Days" },
                        { value: "Permanent", label: "Permanent" },
                      ]}
                    />
                  </div>

                  <div className="space-y-2">
                    <FieldLabel>Post Boosting</FieldLabel>
                    <div className="text-[11px] text-gray-500">
                      Granting brand access to promote the post via platform ad tools.
                    </div>
                    <OptionPills
                      value={postBoosting}
                      onChange={setPostBoosting}
                      options={[
                        { value: "0 Days", label: "0 Days" },
                        { value: "30 Days", label: "30 Days" },
                        { value: "60 Days", label: "60 Days" },
                        { value: "90 Days", label: "90 Days" },
                        { value: "180 Days", label: "180 Days" },
                        { value: "1 Year", label: "1 Year" },
                        { value: "Permanent", label: "Permanent" },
                      ]}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <FieldLabel>Competitor Exclusivity</FieldLabel>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        {competitorExcl ? "Enabled" : "Disabled"}
                      </div>
                    </div>
                    <Switch checked={competitorExcl} onCheckedChange={setCompetitorExcl} />
                  </div>
                  {competitorExcl ? (
                    <Textarea
                      value={competitorExclList}
                      onChange={(e) => setCompetitorExclList(e.target.value)}
                      placeholder="Exclusion List"
                      className="border-gray-200"
                    />
                  ) : null}

                  <div className="space-y-2">
                    <FieldLabel>Collab Post</FieldLabel>
                    <OptionPills
                      value={collabPost}
                      onChange={setCollabPost}
                      options={[
                        { value: "Required", label: "Required" },
                        { value: "Not Required", label: "Not Required" },
                      ]}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <FieldLabel>Onsite/Event</FieldLabel>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        {onsiteEvent ? "Enabled" : "Disabled"}
                      </div>
                    </div>
                    <Switch checked={onsiteEvent} onCheckedChange={setOnsiteEvent} />
                  </div>
                  {onsiteEvent ? (
                    <Textarea
                      value={onsiteEventDetails}
                      onChange={(e) => setOnsiteEventDetails(e.target.value)}
                      placeholder="Time, Location, And Duration"
                      className="border-gray-200"
                    />
                  ) : null}

                  <div className="space-y-2">
                    <FieldLabel>Cross Posting (Mirroring)</FieldLabel>
                    <OptionPills
                      value={crossPosting}
                      onChange={setCrossPosting}
                      options={[
                        { value: "Required", label: "Required" },
                        { value: "Not Required", label: "Not Required" },
                      ]}
                    />
                  </div>

                  <div className="space-y-2">
                    <FieldLabel>Link in Bio</FieldLabel>
                    <OptionPills
                      value={linkInBio}
                      onChange={setLinkInBio}
                      options={[
                        { value: "Required", label: "Required" },
                        { value: "Not Required", label: "Not Required" },
                      ]}
                    />
                  </div>
                </div>
              </SubtleCard>
            </>
          ) : (
            <>
              {/* KOL Information tab */}
              <div className="flex items-center justify-between gap-4">
                <div className="text-[11px] text-gray-500">
                  Creator-submitted data with master override enabled.
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-500">
                    HS Link:{" "}
                    <a className="text-brand underline underline-offset-2" href="#">
                      /hs/kol-info-1
                    </a>
                  </span>
                  <button className="text-[11px] text-gray-500 hover:text-gray-700 inline-flex items-center gap-1">
                    <Copy size={12} />
                    Copy
                  </button>
                </div>
              </div>

              <SubtleCard>
                <SectionTitle
                  title="Section 1: Identity & Contact"
                  right={
                    aiFastFillEnabled ? (
                      <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
                        ⚡ AI Fast Fill Enabled
                      </span>
                    ) : null
                  }
                />

                <div className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <FieldLabel>Identity Type *</FieldLabel>
                    <Select value={identityType} onValueChange={setIdentityType}>
                      <SelectTrigger className="h-9 border-gray-200 bg-white text-[12px]">
                        <SelectValue placeholder="Select Identity Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A (Individual)">A (Individual)</SelectItem>
                        <SelectItem value="B (Individual / Manager)">B (Individual / Manager)</SelectItem>
                        <SelectItem value="C (Company)">C (Company)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-brand-50/35 p-4">
                    <div className="flex items-start gap-3">
                      <span className="w-9 h-9 rounded-lg bg-white border border-brand-100 flex items-center justify-center text-brand">
                        <Upload size={16} />
                      </span>
                      <div className="min-w-0">
                        <div className="text-[12px] font-semibold text-brand">
                          Upload ID/Passport
                        </div>
                        <div className="mt-1 text-[11px] text-gray-500 leading-relaxed">
                          PDF, PNG, JPG. Passport, National ID, Tax ID/VQ2, PAN, Aadhaar.
                          <br />
                          AI will auto-fill: Legal Name, GOV ID Number, and Address.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <FieldLabel>Contract Entity (Legal Name) *</FieldLabel>
                    <Input
                      value={contractEntity}
                      onChange={(e) => setContractEntity(e.target.value)}
                      placeholder="Enter Legal Name"
                      className="h-9 border-gray-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <FieldLabel>Gov ID Number *</FieldLabel>
                    <Input
                      value={govId}
                      onChange={(e) => setGovId(e.target.value)}
                      placeholder="Enter Gov ID Number"
                      className="h-9 border-gray-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <FieldLabel>Residing Address *</FieldLabel>
                    <div className="space-y-3">
                      <Select value={resCountry} onValueChange={setResCountry}>
                        <SelectTrigger className="h-9 border-gray-200 bg-white text-[12px]">
                          <SelectValue placeholder="Country/Region" />
                        </SelectTrigger>
                        <SelectContent>
                          {countryOptions.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        value={resCity}
                        onChange={(e) => setResCity(e.target.value)}
                        placeholder="City"
                        className="h-9 border-gray-200"
                      />
                      <Input
                        value={resZip}
                        onChange={(e) => setResZip(e.target.value)}
                        placeholder="Zip / Postal Code"
                        className="h-9 border-gray-200"
                      />
                      <Textarea
                        value={resStreet}
                        onChange={(e) => setResStreet(e.target.value)}
                        placeholder="Street Address"
                        className="border-gray-200"
                      />
                    </div>
                    <label className="flex items-center gap-2 text-[12px] text-gray-600">
                      <Checkbox
                        checked={sameAsShipping}
                        onCheckedChange={(v) => setSameAsShipping(Boolean(v))}
                      />
                      Same as Shipping Address
                    </label>
                  </div>

                  <div className="space-y-2">
                    <FieldLabel>Phone Number *</FieldLabel>
                    <div className="grid grid-cols-[160px_1fr] gap-3">
                      <Select value={phoneCountryCode} onValueChange={setPhoneCountryCode}>
                        <SelectTrigger className="h-9 border-gray-200 bg-white text-[12px]">
                          <SelectValue placeholder="Country Code" />
                        </SelectTrigger>
                        <SelectContent>
                          {phoneCodeOptions.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Enter Phone Number"
                        className="h-9 border-gray-200"
                      />
                    </div>
                    <label className="flex items-center gap-2 text-[12px] text-gray-600">
                      <Checkbox
                        checked={sameAsRecipientPhone}
                        onCheckedChange={(v) => setSameAsRecipientPhone(Boolean(v))}
                      />
                      Same As Recipient Phone For Sample Delivery
                    </label>
                  </div>
                </div>
              </SubtleCard>

              <SubtleCard>
                <SectionTitle
                  title="Section 2: Payment Details"
                  right={
                    aiFastFillEnabled ? (
                      <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
                        ⚡ AI Fast Fill Enabled
                      </span>
                    ) : null
                  }
                />

                <div className="mt-4 space-y-4">
                  <UploadCard
                    label="Upload Bank Record"
                    hint="PDF, PNG, JPG. Bank passbook, statement, or cancelled cheque. AI will auto-fill: Beneficiary Name, Bank Name, Account Number, and IFSC/SWIFT Code."
                  />

                  <div className="space-y-2">
                    <FieldLabel>Beneficiary Name *</FieldLabel>
                    <Input
                      value={beneficiaryName}
                      onChange={(e) => setBeneficiaryName(e.target.value)}
                      placeholder="Beneficiary Name"
                      className="h-9 border-gray-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <FieldLabel>Beneficiary Bank *</FieldLabel>
                    <Input
                      value={beneficiaryBank}
                      onChange={(e) => setBeneficiaryBank(e.target.value)}
                      placeholder="Select Bank"
                      className="h-9 border-gray-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <FieldLabel>Account Number *</FieldLabel>
                    <Input
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Enter Account Number"
                      className="h-9 border-gray-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <FieldLabel>SWIFT Code *</FieldLabel>
                    <Input
                      value={swiftCode}
                      onChange={(e) => setSwiftCode(e.target.value)}
                      placeholder="Enter SWIFT Code"
                      className="h-9 border-gray-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <FieldLabel>Bank Address</FieldLabel>
                    <Input
                      value={bankAddress}
                      onChange={(e) => setBankAddress(e.target.value)}
                      placeholder="Enter Bank Address"
                      className="h-9 border-gray-200"
                    />
                  </div>
                </div>
              </SubtleCard>

              <SubtleCard>
                <SectionTitle title="Section 3: Shipping Address" />
                <div className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <FieldLabel>Recipient Name *</FieldLabel>
                    <Input
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Recipient Name"
                      className="h-9 border-gray-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <FieldLabel>Recipient Phone *</FieldLabel>
                    <div className="grid grid-cols-[160px_1fr] gap-3">
                      <Select value={recipientCountryCode} onValueChange={setRecipientCountryCode}>
                        <SelectTrigger className="h-9 border-gray-200 bg-white text-[12px]">
                          <SelectValue placeholder="Country Code" />
                        </SelectTrigger>
                        <SelectContent>
                          {phoneCodeOptions.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        value={recipientPhone}
                        onChange={(e) => setRecipientPhone(e.target.value)}
                        placeholder="Recipient Phone"
                        className="h-9 border-gray-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <FieldLabel>Country/Region *</FieldLabel>
                    <Select value={shipCountry} onValueChange={setShipCountry}>
                      <SelectTrigger className="h-9 border-gray-200 bg-white text-[12px]">
                        <SelectValue placeholder="Select Country/Region" />
                      </SelectTrigger>
                      <SelectContent>
                        {countryOptions.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <FieldLabel>City *</FieldLabel>
                      <Input
                        value={shipCity}
                        onChange={(e) => setShipCity(e.target.value)}
                        placeholder="City"
                        className="h-9 border-gray-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel>Zip / Postal Code *</FieldLabel>
                      <Input
                        value={shipZip}
                        onChange={(e) => setShipZip(e.target.value)}
                        placeholder="Zip / Postal Code"
                        className="h-9 border-gray-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <FieldLabel>Street Address *</FieldLabel>
                    <Textarea
                      value={shipStreet}
                      onChange={(e) => setShipStreet(e.target.value)}
                      placeholder="Street Address"
                      className="border-gray-200"
                    />
                  </div>
                </div>
              </SubtleCard>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-7 py-4 bg-white">
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              className="h-9 border-gray-200 text-gray-700"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              className="h-9 text-white"
              style={{ backgroundColor: "#023E8A" }}
              onClick={() => onOpenChange(false)}
            >
              Save
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

