"use client";

import { useState } from "react";
import { FileUploadZone } from "@/components/FileUploadZone";
import { InfluencerAvatar } from "@/components/InfluencerAvatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FORM_FIELD_RADIUS } from "@/lib/formControls";
import { getScriptBriefH5Data } from "@/lib/scriptBriefH5Mock";
import { cn } from "@/lib/utils";

const IDENTITY_OPTIONS = [
  "A (Individual)",
  "B (Individual / Manager)",
  "C (Company)",
] as const;

const H5_CONTRACT_PAGE_BG =
  "linear-gradient(106.55deg, rgb(248, 250, 252) 0%, rgb(239, 246, 255) 50%, rgb(238, 242, 255) 100%)";

const H5_CONTRACT_HERO_BG =
  "linear-gradient(90deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.2) 100%), linear-gradient(115.07deg, rgb(30, 64, 175) 0%, rgb(30, 78, 216) 49.3%, rgb(59, 130, 246) 98.6%)";

const STEPS = [
  { number: "01", label: "Identity & Contact" },
  { number: "02", label: "Bank Details" },
  { number: "03", label: "Shipping Info" },
] as const;

function h5FieldClass(className?: string) {
  return cn(
    "border border-gray-200 bg-white text-[14px] shadow-none placeholder:text-gray-400 focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/15",
    FORM_FIELD_RADIUS,
    className
  );
}

function h5SelectTriggerClass(className?: string) {
  return cn(
    h5FieldClass("h-10 w-full min-w-0 justify-between px-3"),
    "!h-10 py-0 data-[size=default]:!h-10",
    className
  );
}

function H5RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[13px] font-normal leading-snug text-gray-600">
      {children}
      <span className="ml-0.5 text-red-500">*</span>
    </div>
  );
}

function H5OptionalLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[13px] font-normal leading-snug text-gray-600">{children}</div>;
}

function H5FieldGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("space-y-2.5", className)}>{children}</div>;
}

function H5SectionCard({
  title,
  description,
  headerAction,
  children,
}: {
  title: string;
  description?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)] sm:p-5">
      <header className="border-b border-gray-100 pb-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="min-w-0 flex-1 text-[16px] font-semibold leading-snug text-gray-900">
            {title}
          </h2>
          {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
        </div>
        {description ? (
          <p className="mt-1.5 text-[12px] leading-relaxed text-gray-500">{description}</p>
        ) : null}
      </header>
      <div className="mt-5 space-y-6">{children}</div>
    </section>
  );
}

function H5IdentityTypeField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-3.5">
      <H5RequiredLabel>Identity Type</H5RequiredLabel>
      <div className="space-y-2.5">
        {IDENTITY_OPTIONS.map((option) => {
          const active = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border px-3.5 py-3 text-left transition-colors",
                active
                  ? "border-brand bg-brand-50/40"
                  : "border-gray-200 bg-gray-50/70 hover:border-gray-300"
              )}
            >
              <span
                className={cn(
                  "inline-flex size-4 shrink-0 items-center justify-center rounded-full border bg-white",
                  active ? "border-brand" : "border-gray-300"
                )}
              >
                {active ? <span className="size-2 rounded-full bg-brand" /> : null}
              </span>
              <span className="text-[13px] font-normal text-gray-800">{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function H5StepIndicator() {
  return (
    <div className="relative grid grid-cols-3 gap-2 py-2">
      <div
        className="pointer-events-none absolute left-[calc(16.67%+10px)] right-[calc(16.67%+10px)] top-[20px] h-px bg-slate-200"
        aria-hidden
      />
      {STEPS.map((step, index) => {
        const active = index === 0;
        return (
          <div key={step.number} className="relative z-10 flex flex-col items-center gap-1.5 text-center">
            <span
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-full text-[14px] font-medium",
                active
                  ? "bg-brand text-white shadow-[0_6px_16px_rgba(42,102,232,0.24)]"
                  : "border border-black/5 bg-[#ededed] text-[#808080]"
              )}
            >
              {step.number}
            </span>
            <span
              className={cn(
                "text-[11px] font-medium leading-snug sm:text-[12px]",
                active ? "text-slate-900" : "text-slate-400"
              )}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function H5CheckboxRow({
  checked,
  onCheckedChange,
  children,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3.5 py-3 text-[13px] text-gray-700">
      <Checkbox checked={checked} onCheckedChange={(v) => onCheckedChange(Boolean(v))} />
      <span className="pt-0.5 leading-relaxed">{children}</span>
    </label>
  );
}

export function H5ContractProfileView({ kolId }: { kolId: string }) {
  const data = getScriptBriefH5Data(kolId);

  const [identityType, setIdentityType] = useState<string>(IDENTITY_OPTIONS[0]);
  const [contractEntity, setContractEntity] = useState("dr. Hario Sakti, SpPD-KGEH");
  const [govId, setGovId] = useState("");
  const [resCountry, setResCountry] = useState("");
  const [resCity, setResCity] = useState("");
  const [resZip, setResZip] = useState("");
  const [resStreet, setResStreet] = useState("");
  const [sameAsShipping, setSameAsShipping] = useState(false);
  const [sameAsRecipientPhone, setSameAsRecipientPhone] = useState(false);
  const [phoneCode, setPhoneCode] = useState("+62");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [beneficiaryBank, setBeneficiaryBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [swiftCode, setSwiftCode] = useState("");
  const [bankAddress, setBankAddress] = useState("");
  const [recipientName, setRecipientName] = useState("dr. Hario Sakti, SpPD-KGEH");
  const [recipientPhoneCode, setRecipientPhoneCode] = useState("+62");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [shipCountry, setShipCountry] = useState("");
  const [shipCity, setShipCity] = useState("");
  const [shipZip, setShipZip] = useState("");
  const [shipStreet, setShipStreet] = useState("");
  const [idPassportFile, setIdPassportFile] = useState<File | null>(null);
  const [bankRecordFile, setBankRecordFile] = useState<File | null>(null);

  const handleIdPassportUpload = (file: File | null) => {
    setIdPassportFile(file);
    if (!file) return;
    setContractEntity((value) => value || "dr. Hario Sakti, SpPD-KGEH");
    setGovId((value) => value || "3175012345678901");
  };

  const handleBankRecordUpload = (file: File | null) => {
    setBankRecordFile(file);
    if (!file) return;
    setBeneficiaryName((value) => value || "dr. Hario Sakti, SpPD-KGEH");
    setBeneficiaryBank((value) => value || "Bank Central Asia");
    setAccountNumber((value) => value || "1234567890");
    setSwiftCode((value) => value || "CENAIDJA");
  };

  const documentAccept = ".pdf,.png,.jpg,.jpeg";
  const documentExtensions = [".pdf", ".png", ".jpg", ".jpeg"];

  return (
    <div className="min-h-dvh" style={{ backgroundImage: H5_CONTRACT_PAGE_BG }}>
      <div className="space-y-5 px-4 py-4 pb-36">
        <section
          className="relative overflow-hidden rounded-[24px] p-5 text-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)]"
          style={{ backgroundImage: H5_CONTRACT_HERO_BG }}
        >
          <div className="pointer-events-none absolute -bottom-10 -right-10 size-40 rounded-full bg-white/10 blur-[32px]" />
          <h1 className="text-[24px] font-semibold leading-tight tracking-tight">
            Complete Your Contract Profile
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-white/80">
            Review each section carefully to make sure your contract and payment details are
            accurate.
          </p>
          <div className="mt-5">
            <div className="flex items-start gap-3">
              <InfluencerAvatar
                src={data.influencer.avatar}
                alt={data.influencer.name}
                platform="Instagram"
                size="lg"
                fallback={data.influencer.handle.slice(1, 3).toUpperCase()}
                avatarClassName="border-0 after:hidden ring-2 ring-white/25"
              />
              <div className="min-w-0 flex-1">
                <p
                  className="line-clamp-2 text-[15px] font-semibold leading-snug"
                  title={data.influencer.name}
                >
                  {data.influencer.name}
                </p>
                <p
                  className="mt-1 line-clamp-2 text-[12px] leading-snug text-white/65"
                  title={data.influencer.handle}
                >
                  {data.influencer.handle}
                </p>
              </div>
            </div>
            <div className="mt-4 border-t border-white/15 pt-4">
              <p className="text-[10px] font-medium uppercase tracking-wide text-white/70">
                Campaign
              </p>
              <p
                className="mt-1 line-clamp-2 text-[13px] font-semibold leading-snug"
                title={data.campaignTitle}
              >
                {data.campaignTitle}
              </p>
            </div>
          </div>
        </section>

        <H5StepIndicator />

        <H5SectionCard
          title="Section 1: Identity & Contact"
          description="Optionally upload an ID or passport (PDF, PNG, JPG) — AI can auto-fill the fields below to save time."
          headerAction={
            <FileUploadZone
              optional
              compact
              compactPart="header-action"
              title="ID/Passport"
              hint="PDF, PNG, JPG"
              accept={documentAccept}
              acceptedExtensions={documentExtensions}
              file={idPassportFile}
              onFileChange={handleIdPassportUpload}
              variant="brand"
            />
          }
        >
          <FileUploadZone
            optional
            compact
            compactPart="preview"
            title="ID/Passport"
            hint="PDF, PNG, JPG"
            accept={documentAccept}
            acceptedExtensions={documentExtensions}
            file={idPassportFile}
            onFileChange={handleIdPassportUpload}
            variant="brand"
          />
          <H5IdentityTypeField value={identityType} onChange={setIdentityType} />
          <H5FieldGroup>
            <H5RequiredLabel>Contracting Entity (Legal Name)</H5RequiredLabel>
            <Input
              value={contractEntity}
              onChange={(e) => setContractEntity(e.target.value)}
              className={h5FieldClass("h-10 px-3")}
            />
          </H5FieldGroup>
          <H5FieldGroup>
            <H5RequiredLabel>Gov ID Number</H5RequiredLabel>
            <Input
              value={govId}
              onChange={(e) => setGovId(e.target.value)}
              placeholder="Enter Gov ID Number"
              className={h5FieldClass("h-10 px-3")}
            />
          </H5FieldGroup>
          <H5FieldGroup className="space-y-3">
            <H5RequiredLabel>Residing Address</H5RequiredLabel>
            <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2">
              <div className="min-w-0">
                <Select value={resCountry} onValueChange={(v) => setResCountry(v ?? "")}>
                  <SelectTrigger className={h5SelectTriggerClass()}>
                    <SelectValue placeholder="Country / Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ID">Indonesia</SelectItem>
                    <SelectItem value="SG">Singapore</SelectItem>
                    <SelectItem value="MY">Malaysia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input
                value={resCity}
                onChange={(e) => setResCity(e.target.value)}
                placeholder="City"
                className={h5FieldClass("h-10 px-3")}
              />
            </div>
            <Input
              value={resZip}
              onChange={(e) => setResZip(e.target.value)}
              placeholder="Zip / Postal Code"
              className={h5FieldClass("h-10 px-3")}
            />
            <Textarea
              value={resStreet}
              onChange={(e) => setResStreet(e.target.value)}
              placeholder="Street Address"
              className={h5FieldClass("min-h-[88px] px-3 py-2.5")}
            />
            <H5CheckboxRow checked={sameAsShipping} onCheckedChange={setSameAsShipping}>
              Same as Shipping Address
            </H5CheckboxRow>
          </H5FieldGroup>
          <H5FieldGroup className="space-y-3">
            <H5RequiredLabel>Phone Number</H5RequiredLabel>
            <div className="grid grid-cols-[96px_1fr] items-stretch gap-3">
              <div className="min-w-0">
                <Select value={phoneCode} onValueChange={(v) => setPhoneCode(v ?? "+62")}>
                  <SelectTrigger className={h5SelectTriggerClass()}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+62">+62</SelectItem>
                    <SelectItem value="+65">+65</SelectItem>
                    <SelectItem value="+60">+60</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number"
                className={h5FieldClass("h-10 px-3")}
              />
            </div>
            <H5CheckboxRow
              checked={sameAsRecipientPhone}
              onCheckedChange={setSameAsRecipientPhone}
            >
              Same as Recipient Phone for sample delivery
            </H5CheckboxRow>
          </H5FieldGroup>
        </H5SectionCard>

        <H5SectionCard
          title="Section 2: Payment Details"
          description="These fields are used for your payment profile and contract payout instructions. Optionally upload a bank record (PDF, PNG, JPG) — AI can auto-fill the fields below to save time."
          headerAction={
            <FileUploadZone
              optional
              compact
              compactPart="header-action"
              title="Bank Record"
              hint="PDF, PNG, JPG"
              accept={documentAccept}
              acceptedExtensions={documentExtensions}
              file={bankRecordFile}
              onFileChange={handleBankRecordUpload}
              variant="amber"
            />
          }
        >
          <FileUploadZone
            optional
            compact
            compactPart="preview"
            title="Bank Record"
            hint="PDF, PNG, JPG"
            accept={documentAccept}
            acceptedExtensions={documentExtensions}
            file={bankRecordFile}
            onFileChange={handleBankRecordUpload}
            variant="amber"
          />
          <H5FieldGroup>
            <H5RequiredLabel>Beneficiary Name</H5RequiredLabel>
            <Input
              value={beneficiaryName}
              onChange={(e) => setBeneficiaryName(e.target.value)}
              className={h5FieldClass("h-10 px-3")}
            />
          </H5FieldGroup>
          <H5FieldGroup>
            <H5RequiredLabel>Beneficiary Bank</H5RequiredLabel>
            <Input
              value={beneficiaryBank}
              onChange={(e) => setBeneficiaryBank(e.target.value)}
              placeholder="Select Bank"
              className={h5FieldClass("h-10 px-3")}
            />
          </H5FieldGroup>
          <H5FieldGroup>
            <H5RequiredLabel>Account Number</H5RequiredLabel>
            <Input
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Enter Account Number"
              className={h5FieldClass("h-10 px-3")}
            />
          </H5FieldGroup>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <H5FieldGroup>
              <H5OptionalLabel>IFSC Code</H5OptionalLabel>
              <Input
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
                placeholder="Enter IFSC Code"
                className={h5FieldClass("h-10 px-3")}
              />
            </H5FieldGroup>
            <H5FieldGroup>
              <H5RequiredLabel>SWIFT Code</H5RequiredLabel>
              <Input
                value={swiftCode}
                onChange={(e) => setSwiftCode(e.target.value)}
                placeholder="Enter SWIFT Code"
                className={h5FieldClass("h-10 px-3")}
              />
            </H5FieldGroup>
          </div>
          <H5FieldGroup>
            <H5OptionalLabel>Bank Address</H5OptionalLabel>
            <Textarea
              value={bankAddress}
              onChange={(e) => setBankAddress(e.target.value)}
              placeholder="Enter Bank Address"
              className={h5FieldClass("min-h-[88px] px-3 py-2.5")}
            />
          </H5FieldGroup>
        </H5SectionCard>

        <H5SectionCard
          title="Section 3: Shipping Info"
          description="This is the recipient and delivery address used for sample logistics."
        >
          <H5FieldGroup>
            <H5RequiredLabel>Recipient Name</H5RequiredLabel>
            <Input
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className={h5FieldClass("h-10 px-3")}
            />
          </H5FieldGroup>
          <H5FieldGroup>
            <H5RequiredLabel>Recipient Phone</H5RequiredLabel>
            <div className="grid grid-cols-[96px_1fr] items-stretch gap-3">
              <div className="min-w-0">
                <Select
                  value={recipientPhoneCode}
                  onValueChange={(v) => setRecipientPhoneCode(v ?? "+62")}
                >
                  <SelectTrigger className={h5SelectTriggerClass()}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+62">+62</SelectItem>
                    <SelectItem value="+65">+65</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                placeholder="Enter phone number"
                className={h5FieldClass("h-10 px-3")}
              />
            </div>
          </H5FieldGroup>
          <H5FieldGroup className="space-y-3">
            <H5RequiredLabel>Shipping Address</H5RequiredLabel>
            <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2">
              <div className="min-w-0">
                <Select value={shipCountry} onValueChange={(v) => setShipCountry(v ?? "")}>
                  <SelectTrigger className={h5SelectTriggerClass()}>
                    <SelectValue placeholder="Country / Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ID">Indonesia</SelectItem>
                    <SelectItem value="SG">Singapore</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input
                value={shipCity}
                onChange={(e) => setShipCity(e.target.value)}
                placeholder="City"
                className={h5FieldClass("h-10 px-3")}
              />
            </div>
            <Input
              value={shipZip}
              onChange={(e) => setShipZip(e.target.value)}
              placeholder="Zip / Postal Code"
              className={h5FieldClass("h-10 px-3")}
            />
            <Textarea
              value={shipStreet}
              onChange={(e) => setShipStreet(e.target.value)}
              placeholder="Street Address"
              className={h5FieldClass("min-h-[88px] px-3 py-2.5")}
            />
          </H5FieldGroup>
        </H5SectionCard>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center">
        <div className="pointer-events-auto w-full max-w-[480px] border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur-md">
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="brand"
              className="h-11 w-full rounded-lg text-[14px] font-medium shadow-[0_4px_12px_rgba(42,102,232,0.24)]"
            >
              Submit Profile
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full rounded-lg border border-gray-200 bg-white text-[14px] font-medium text-gray-700"
            >
              Save Draft
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
