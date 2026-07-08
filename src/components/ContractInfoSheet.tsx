"use client";

import { useEffect, useMemo, useState } from "react";
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
import { InfluencerAvatar } from "@/components/InfluencerAvatar";
import { formInputClass, formTextareaClass } from "@/lib/formControls";
import { cn } from "@/lib/utils";
import { FileUploadZone } from "@/components/FileUploadZone";
import { Copy, ExternalLink, Info, X } from "@/lib/icons";

type Tab = "Collaboration Details" | "KOL Information" | "Todo";

function ContractInfoTabButton({
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
        "inline-flex h-9 shrink-0 items-center border-b-2 px-2.5 text-[12px] font-medium leading-none transition-colors",
        active
          ? "border-brand text-gray-900"
          : "border-transparent text-gray-500 hover:text-gray-800"
      )}
    >
      {children}
    </button>
  );
}

function ContractH5LinkBar({ h5KolId }: { h5KolId: string }) {
  const path = `/h5/kol-info/${encodeURIComponent(h5KolId)}?view=contract`;

  const handleCopy = async () => {
    const copyValue =
      typeof window !== "undefined" ? `${window.location.origin}${path}` : path;
    try {
      await navigator.clipboard.writeText(copyValue);
    } catch {
      // Clipboard may be unavailable outside secure context.
    }
  };

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <span className="text-[11px] text-gray-500">H5 Link:</span>
      <a
        href={path}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex size-7 items-center justify-center rounded-md text-brand transition-colors hover:bg-brand-50"
        aria-label="Open H5 contract page"
      >
        <ExternalLink size={14} strokeWidth={2} />
      </a>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1 text-[11px] text-gray-500 transition-colors hover:text-gray-700"
      >
        <Copy size={12} />
        Copy
      </button>
    </div>
  );
}

function SectionTitle({
  title,
  description,
  right,
}: {
  title: string;
  description?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="border-b border-gray-100 pb-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="min-w-0 text-[14px] font-semibold tracking-tight text-gray-900">{title}</h3>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      {description ? (
        <p className="mt-1.5 text-[12px] leading-relaxed text-gray-500">{description}</p>
      ) : null}
    </div>
  );
}

function FieldLabel({
  children,
  hint,
  required = false,
}: {
  children: React.ReactNode;
  hint?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <div className="text-[13px] font-medium leading-snug text-gray-800">
        {children}
        {required ? <span className="ml-0.5 text-red-500">*</span> : null}
      </div>
      {hint ? <p className="text-[11px] leading-relaxed text-gray-400">{hint}</p> : null}
    </div>
  );
}

function SectionFieldGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4 border-b border-gray-100 py-6 first:pt-0 last:border-b-0 last:pb-0">
      {children}
    </div>
  );
}

function ChoiceFieldGroup({ children }: { children: React.ReactNode }) {
  return <SectionFieldGroup>{children}</SectionFieldGroup>;
}

function FormFieldGroup({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2">{children}</div>;
}

function RadioChipGroup({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-x-8 gap-y-4 pt-1">
      {options.map((option) => {
        const selected = value === option;
        return (
          <label
            key={option}
            className="inline-flex min-h-[22px] cursor-pointer items-center gap-2.5"
          >
            <span
              className={cn(
                "inline-flex size-3.5 shrink-0 items-center justify-center rounded-full border",
                selected ? "border-brand bg-brand" : "border-gray-300 bg-white"
              )}
            >
              {selected ? <span className="size-1.5 rounded-full bg-white" /> : null}
            </span>
            <input
              type="radio"
              name={`contract-radio-${options.join("-")}`}
              value={option}
              checked={selected}
              onChange={() => onChange(option)}
              className="sr-only"
            />
            <span className="text-[13px] text-gray-700">{option}</span>
          </label>
        );
      })}
    </div>
  );
}

function SubtleCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={cn(
        "rounded-xl border border-gray-100 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]",
        className
      )}
    >
      {children}
    </section>
  );
}

export default function ContractInfoSheet({
  open,
  onOpenChange,
  influencerHandle = "@instagram ins",
  influencerName = "Amelia Stones",
  h5KolId = "1",
  initialTab = "Collaboration Details",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  influencerHandle?: string;
  influencerName?: string;
  h5KolId?: string;
  initialTab?: Tab;
}) {
  const [tab, setTab] = useState<Tab>(initialTab);

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
  const [idPassportFile, setIdPassportFile] = useState<File | null>(null);
  const [bankRecordFile, setBankRecordFile] = useState<File | null>(null);

  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [beneficiaryBank, setBeneficiaryBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [swiftCode, setSwiftCode] = useState("");
  const [bankAddress, setBankAddress] = useState("");

  const [recipientName, setRecipientName] = useState("");
  const [recipientCountryCode, setRecipientCountryCode] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [shipCountry, setShipCountry] = useState("");
  const [shipCity, setShipCity] = useState("");
  const [shipZip, setShipZip] = useState("");
  const [shipStreet, setShipStreet] = useState("");

  const headerHandle = useMemo(() => influencerHandle, [influencerHandle]);

  useEffect(() => {
    if (!open) return;
    setTab(initialTab);
  }, [initialTab, open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex h-full w-full flex-col gap-0 border-l border-gray-100 bg-[#f8f9fb] p-0 data-[side=right]:max-w-[600px] data-[side=right]:sm:max-w-[600px]"
      >
        <SheetHeader className="shrink-0 flex-row items-center justify-between gap-3 border-b border-gray-100 bg-white px-6 py-5 text-left">
          <SheetTitle className="text-[18px] font-semibold text-gray-900">Contract Info</SheetTitle>
          <SheetClose
            render={
              <button
                type="button"
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close"
              />
            }
          >
            <X size={16} strokeWidth={2} />
          </SheetClose>
        </SheetHeader>

        <div className="shrink-0 border-b border-gray-100 bg-white px-6 pb-0 pt-4">
          <div className="flex items-center gap-3 min-w-0">
            <InfluencerAvatar
              alt={influencerName}
              platform="Instagram"
              size="md"
              fallback={headerHandle.slice(1, 3).toUpperCase()}
              fallbackClassName="bg-violet-100 text-violet-700"
            />
            <div className="min-w-0">
              <div className="text-[13px] font-semibold text-gray-900 truncate">{headerHandle}</div>
              <div className="text-[11px] text-gray-500 truncate">{influencerName}</div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4 border-b border-gray-100">
            <ContractInfoTabButton
              active={tab === "Collaboration Details"}
              onClick={() => setTab("Collaboration Details")}
            >
              Collaboration Details
            </ContractInfoTabButton>
            <ContractInfoTabButton
              active={tab === "KOL Information"}
              onClick={() => setTab("KOL Information")}
            >
              KOL Information
            </ContractInfoTabButton>
            <ContractInfoTabButton active={tab === "Todo"} onClick={() => setTab("Todo")}>
              Todo
            </ContractInfoTabButton>
          </div>
        </div>

        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-4 p-4">
          {tab === "Collaboration Details" ? (
            <>
              <div className="text-[12px] leading-relaxed text-gray-500">
                Commercial terms are final and displayed as read-only on the creator’s portal.
              </div>

              <SubtleCard>
                <SectionTitle title="Commercials" />
                <div className="mt-5 space-y-0">
                  <ChoiceFieldGroup>
                    <FieldLabel required>Total Amount</FieldLabel>
                    <div className="flex items-center gap-2">
                      <Select value={currency} onValueChange={(v) => setCurrency(v ?? "USD")}>
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
                        className={formInputClass("h-9 flex-1 text-[13px]")}
                      />
                    </div>
                  </ChoiceFieldGroup>

                  <ChoiceFieldGroup>
                    <FieldLabel
                      required
                      hint="Define the split between upfront payment and final balance."
                    >
                      Payment Method
                    </FieldLabel>
                    <RadioChipGroup
                      value={paymentMethod}
                      onChange={setPaymentMethod}
                      options={[
                        "100% Postpaid",
                        "30% Advance",
                        "50% Advance",
                        "70% Advance",
                        "100% Advance",
                      ]}
                    />
                  </ChoiceFieldGroup>

                  <ChoiceFieldGroup>
                    <FieldLabel
                      required
                      hint="Number of days to settle the final payment after content goes live."
                    >
                      Payment Term
                    </FieldLabel>
                    <RadioChipGroup
                      value={paymentTerm}
                      onChange={setPaymentTerm}
                      options={["60 Days", "45 Days", "30 Days", "15 Days", "7 Days"]}
                    />
                  </ChoiceFieldGroup>
                </div>
              </SubtleCard>

              <SubtleCard>
                <SectionTitle title="Deliverables" />
                <div className="mt-5 space-y-2">
                  <FieldLabel required>Deliverables Details</FieldLabel>
                  <Textarea
                    value={deliverables}
                    onChange={(e) => setDeliverables(e.target.value)}
                    className={formTextareaClass("text-[13px]")}
                  />
                </div>
              </SubtleCard>

              <SubtleCard>
                <SectionTitle title="Add-ons & Rights" />
                <div className="mt-5 space-y-0">
                  <ChoiceFieldGroup>
                    <FieldLabel hint="Permissions to license and reuse the content on brand’s official channels (social media, website, ads).">
                      Content Usage
                    </FieldLabel>
                    <RadioChipGroup
                      value={contentUsage}
                      onChange={setContentUsage}
                      options={[
                        "0 Days",
                        "30 Days",
                        "60 Days",
                        "90 Days",
                        "180 Days",
                        "1 Year",
                        "Permanent",
                      ]}
                    />
                  </ChoiceFieldGroup>

                  <ChoiceFieldGroup>
                    <FieldLabel>Post Retention</FieldLabel>
                    <RadioChipGroup
                      value={postRetention}
                      onChange={setPostRetention}
                      options={["30 Days", "90 Days", "180 Days", "Permanent"]}
                    />
                  </ChoiceFieldGroup>

                  <ChoiceFieldGroup>
                    <FieldLabel hint="Granting brand access to promote the post via platform ad tools.">
                      Post Boosting
                    </FieldLabel>
                    <RadioChipGroup
                      value={postBoosting}
                      onChange={setPostBoosting}
                      options={[
                        "0 Days",
                        "30 Days",
                        "60 Days",
                        "90 Days",
                        "180 Days",
                        "1 Year",
                        "Permanent",
                      ]}
                    />
                  </ChoiceFieldGroup>

                  <SectionFieldGroup>
                    <div className="flex items-start justify-between gap-4">
                      <FieldLabel>Competitor Exclusivity</FieldLabel>
                      <Switch checked={competitorExcl} onCheckedChange={setCompetitorExcl} />
                    </div>
                    {competitorExcl ? (
                      <Textarea
                        value={competitorExclList}
                        onChange={(e) => setCompetitorExclList(e.target.value)}
                        placeholder="Enter exclusion list..."
                        rows={3}
                        className={formTextareaClass("min-h-[96px] resize-none text-[13px]")}
                      />
                    ) : null}
                  </SectionFieldGroup>

                  <ChoiceFieldGroup>
                    <FieldLabel>Collab Post</FieldLabel>
                    <RadioChipGroup
                      value={collabPost}
                      onChange={setCollabPost}
                      options={["Required", "Not Required"]}
                    />
                  </ChoiceFieldGroup>

                  <SectionFieldGroup>
                    <div className="flex items-start justify-between gap-4">
                      <FieldLabel>Onsite/Event</FieldLabel>
                      <Switch checked={onsiteEvent} onCheckedChange={setOnsiteEvent} />
                    </div>
                    {onsiteEvent ? (
                      <Textarea
                        value={onsiteEventDetails}
                        onChange={(e) => setOnsiteEventDetails(e.target.value)}
                        placeholder="Time, Location, And Duration"
                        rows={3}
                        className={formTextareaClass("min-h-[96px] resize-none text-[13px]")}
                      />
                    ) : null}
                  </SectionFieldGroup>

                  <ChoiceFieldGroup>
                    <FieldLabel>Cross Posting (Mirroring)</FieldLabel>
                    <RadioChipGroup
                      value={crossPosting}
                      onChange={setCrossPosting}
                      options={["Required", "Not Required"]}
                    />
                  </ChoiceFieldGroup>

                  <ChoiceFieldGroup>
                    <FieldLabel>Link in Bio</FieldLabel>
                    <RadioChipGroup
                      value={linkInBio}
                      onChange={setLinkInBio}
                      options={["Required", "Not Required"]}
                    />
                  </ChoiceFieldGroup>
                </div>
              </SubtleCard>
            </>
          ) : tab === "KOL Information" ? (
            <>
              {/* KOL Information tab */}
              <div className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-[0_1px_3px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-2 text-[12px] leading-relaxed text-gray-500">
                  <Info size={14} className="mt-0.5 shrink-0 text-gray-400" strokeWidth={2} />
                  <span>Creator-submitted data with master override enabled.</span>
                </div>
                <ContractH5LinkBar h5KolId={h5KolId} />
              </div>

              <SubtleCard>
                <SectionTitle
                  title="Section 1: Identity & Contact"
                  description="Provide your identity details for the contract. To save time, use the auto-fill feature to instantly extract this info from an official document (ID, passport, or business license)."
                  right={
                    <FileUploadZone
                      optional
                      compact
                      compactPart="header-action"
                      title="ID/Passport"
                      headerActionLabel="Auto-fill"
                      hint="PDF, PNG, JPG"
                      accept=".pdf,.png,.jpg,.jpeg"
                      acceptedExtensions={[".pdf", ".png", ".jpg", ".jpeg"]}
                      file={idPassportFile}
                      onFileChange={setIdPassportFile}
                      variant="brand"
                    />
                  }
                />

                <div className="mt-5 space-y-5">
                  <FileUploadZone
                    optional
                    compact
                    compactPart="preview"
                    title="ID/Passport"
                    hint="PDF, PNG, JPG"
                    accept=".pdf,.png,.jpg,.jpeg"
                    acceptedExtensions={[".pdf", ".png", ".jpg", ".jpeg"]}
                    file={idPassportFile}
                    onFileChange={setIdPassportFile}
                    variant="brand"
                  />
                  <FormFieldGroup>
                    <FieldLabel required>Identity Type</FieldLabel>
                    <Select value={identityType} onValueChange={(v) => setIdentityType(v ?? "A (Individual)")}>
                      <SelectTrigger className="h-9 w-full border-gray-200 bg-white text-[12px]">
                        <SelectValue placeholder="Select Identity Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A (Individual)">A (Individual)</SelectItem>
                        <SelectItem value="B (Individual / Manager)">B (Individual / Manager)</SelectItem>
                        <SelectItem value="C (Company)">C (Company)</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormFieldGroup>

                  <FormFieldGroup>
                    <FieldLabel required>Contract Entity (Legal Name)</FieldLabel>
                    <Input
                      value={contractEntity}
                      onChange={(e) => setContractEntity(e.target.value)}
                      placeholder="Enter Legal Name"
                      className={formInputClass("h-9 text-[13px]")}
                    />
                  </FormFieldGroup>

                  <FormFieldGroup>
                    <FieldLabel required>Gov ID Number</FieldLabel>
                    <Input
                      value={govId}
                      onChange={(e) => setGovId(e.target.value)}
                      placeholder="Enter Gov ID Number"
                      className={formInputClass("h-9 text-[13px]")}
                    />
                  </FormFieldGroup>

                  <FormFieldGroup>
                    <FieldLabel required>Residing Address</FieldLabel>
                    <div className="space-y-3">
                      <Select value={resCountry} onValueChange={(v) => setResCountry(v ?? "")}>
                        <SelectTrigger className="h-9 w-full border-gray-200 bg-white text-[12px]">
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
                        className={formInputClass("h-9 text-[13px]")}
                      />
                      <Input
                        value={resZip}
                        onChange={(e) => setResZip(e.target.value)}
                        placeholder="Zip / Postal Code"
                        className={formInputClass("h-9 text-[13px]")}
                      />
                      <Textarea
                        value={resStreet}
                        onChange={(e) => setResStreet(e.target.value)}
                        placeholder="Street Address"
                        className={formTextareaClass("text-[13px]")}
                      />
                    </div>
                    <label className="flex items-center gap-2 text-[12px] text-gray-600">
                      <Checkbox
                        checked={sameAsShipping}
                        onCheckedChange={(v) => setSameAsShipping(Boolean(v))}
                      />
                      Same as Shipping Address
                    </label>
                  </FormFieldGroup>

                  <FormFieldGroup>
                    <FieldLabel required>Phone Number</FieldLabel>
                    <div className="grid grid-cols-[160px_1fr] gap-3">
                      <Select value={phoneCountryCode} onValueChange={(v) => setPhoneCountryCode(v ?? "")}>
                        <SelectTrigger className="h-9 w-full border-gray-200 bg-white text-[12px]">
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
                        className={formInputClass("h-9 text-[13px]")}
                      />
                    </div>
                    <label className="flex items-center gap-2 text-[12px] text-gray-600">
                      <Checkbox
                        checked={sameAsRecipientPhone}
                        onCheckedChange={(v) => setSameAsRecipientPhone(Boolean(v))}
                      />
                      Same As Recipient Phone For Sample Delivery
                    </label>
                  </FormFieldGroup>
                </div>
              </SubtleCard>

              <SubtleCard>
                <SectionTitle
                  title="Section 2: Payment Details"
                  description="Provide your payment details for contract payouts. To save time, use the auto-fill feature to instantly extract this info from a bank document (passbook, statement, or cancelled cheque)."
                  right={
                    <FileUploadZone
                      optional
                      compact
                      compactPart="header-action"
                      title="Bank Record"
                      headerActionLabel="Auto-fill"
                      hint="PDF, PNG, JPG"
                      accept=".pdf,.png,.jpg,.jpeg"
                      acceptedExtensions={[".pdf", ".png", ".jpg", ".jpeg"]}
                      file={bankRecordFile}
                      onFileChange={setBankRecordFile}
                      variant="amber"
                    />
                  }
                />

                <div className="mt-5 space-y-5">
                  <FileUploadZone
                    optional
                    compact
                    compactPart="preview"
                    title="Bank Record"
                    hint="PDF, PNG, JPG"
                    accept=".pdf,.png,.jpg,.jpeg"
                    acceptedExtensions={[".pdf", ".png", ".jpg", ".jpeg"]}
                    file={bankRecordFile}
                    onFileChange={setBankRecordFile}
                    variant="amber"
                  />
                  <FormFieldGroup>
                    <FieldLabel required>Beneficiary Name</FieldLabel>
                    <Input
                      value={beneficiaryName}
                      onChange={(e) => setBeneficiaryName(e.target.value)}
                      placeholder="Beneficiary Name"
                      className={formInputClass("h-9 text-[13px]")}
                    />
                  </FormFieldGroup>

                  <FormFieldGroup>
                    <FieldLabel required>Beneficiary Bank</FieldLabel>
                    <Input
                      value={beneficiaryBank}
                      onChange={(e) => setBeneficiaryBank(e.target.value)}
                      placeholder="Select Bank"
                      className={formInputClass("h-9 text-[13px]")}
                    />
                  </FormFieldGroup>

                  <FormFieldGroup>
                    <FieldLabel required>Account Number</FieldLabel>
                    <Input
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Enter Account Number"
                      className={formInputClass("h-9 text-[13px]")}
                    />
                  </FormFieldGroup>

                  <FormFieldGroup>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <FieldLabel>IFSC Code</FieldLabel>
                        <Input
                          value={ifscCode}
                          onChange={(e) => setIfscCode(e.target.value)}
                          placeholder="Enter IFSC Code"
                          className={formInputClass("h-9 text-[13px]")}
                        />
                      </div>
                      <div className="space-y-2">
                        <FieldLabel required>SWIFT Code</FieldLabel>
                        <Input
                          value={swiftCode}
                          onChange={(e) => setSwiftCode(e.target.value)}
                          placeholder="Enter SWIFT Code"
                          className={formInputClass("h-9 text-[13px]")}
                        />
                      </div>
                    </div>
                  </FormFieldGroup>

                  <FormFieldGroup>
                    <FieldLabel>Bank Address</FieldLabel>
                    <Input
                      value={bankAddress}
                      onChange={(e) => setBankAddress(e.target.value)}
                      placeholder="Enter Bank Address"
                      className={formInputClass("h-9 text-[13px]")}
                    />
                  </FormFieldGroup>
                </div>
              </SubtleCard>

              <SubtleCard>
                <SectionTitle title="Section 3: Shipping Address" />
                <div className="mt-5 space-y-5">
                  <FormFieldGroup>
                    <FieldLabel required>Recipient Name</FieldLabel>
                    <Input
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Recipient Name"
                      className={formInputClass("h-9 text-[13px]")}
                    />
                  </FormFieldGroup>

                  <FormFieldGroup>
                    <FieldLabel required>Recipient Phone</FieldLabel>
                    <div className="grid grid-cols-[160px_1fr] gap-3">
                      <Select value={recipientCountryCode} onValueChange={(v) => setRecipientCountryCode(v ?? "")}>
                        <SelectTrigger className="h-9 w-full border-gray-200 bg-white text-[12px]">
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
                        className={formInputClass("h-9 text-[13px]")}
                      />
                    </div>
                  </FormFieldGroup>

                  <FormFieldGroup>
                    <FieldLabel required>Country/Region</FieldLabel>
                    <Select value={shipCountry} onValueChange={(v) => setShipCountry(v ?? "")}>
                      <SelectTrigger className="h-9 w-full border-gray-200 bg-white text-[12px]">
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
                  </FormFieldGroup>

                  <FormFieldGroup>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <FieldLabel required>City</FieldLabel>
                        <Input
                          value={shipCity}
                          onChange={(e) => setShipCity(e.target.value)}
                          placeholder="City"
                          className={formInputClass("h-9 text-[13px]")}
                        />
                      </div>
                      <div className="space-y-2">
                        <FieldLabel required>Zip / Postal Code</FieldLabel>
                        <Input
                          value={shipZip}
                          onChange={(e) => setShipZip(e.target.value)}
                          placeholder="Zip / Postal Code"
                          className={formInputClass("h-9 text-[13px]")}
                        />
                      </div>
                    </div>
                  </FormFieldGroup>

                  <FormFieldGroup>
                    <FieldLabel required>Street Address</FieldLabel>
                    <Textarea
                      value={shipStreet}
                      onChange={(e) => setShipStreet(e.target.value)}
                      placeholder="Street Address"
                      className={formTextareaClass("text-[13px]")}
                    />
                  </FormFieldGroup>
                </div>
              </SubtleCard>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-12 text-center">
              <p className="text-[13px] font-medium text-gray-700">No pending tasks</p>
              <p className="mt-1 text-[12px] leading-relaxed text-gray-500">
                Contract-related todos for this creator will appear here.
              </p>
            </div>
          )}
          </div>
        </div>

        <SheetFooter className="shrink-0 flex-row justify-end gap-3 border-t border-gray-100 bg-white px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-lg border-gray-200 px-4 text-[13px] text-gray-600"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="brand"
            className="h-9 rounded-lg px-5 text-[13px]"
            onClick={() => onOpenChange(false)}
          >
            Save
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

